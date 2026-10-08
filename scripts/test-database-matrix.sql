-- ==============================================================================
-- UZZINA: Script de Teste e Validação da Matriz de Autorização RLS
-- Data: 2026-10-06
-- Ticket 07: Autorizações reproduzíveis no banco
-- ==============================================================================
-- INSTRUÇÃO: Executar exclusivamente em BANCO DE TESTE descartável.
-- Este script cria fixtures temporárias em transação e testa cada permissão/negação.
-- Toda a operação executa ROLLBACK ao final para não deixar resíduos.
-- ==============================================================================

BEGIN;

-- 1. Criação de identidades de teste temporárias
DO $$
DECLARE
    v_admin_uid UUID := '11111111-1111-4111-a111-111111111111';
    v_collab_a_uid UUID := '22222222-2222-4222-a222-222222222222';
    v_collab_b_uid UUID := '33333333-3333-4333-a333-333333333333';
    v_inactive_uid UUID := '44444444-4444-4444-a444-444444444444';
    v_action_a_id UUID := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
    v_action_b_id UUID := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
BEGIN
    INSERT INTO auth.users (id, aud, role, email) VALUES
      (v_admin_uid, 'authenticated', 'authenticated', 'admin@test.invalid'),
      (v_collab_a_uid, 'authenticated', 'authenticated', 'a@test.invalid'),
      (v_collab_b_uid, 'authenticated', 'authenticated', 'b@test.invalid'),
      (v_inactive_uid, 'authenticated', 'authenticated', 'inactive@test.invalid');
    -- Inserção de pessoas de teste
    INSERT INTO public.people (id, user_id, name, surname, initials, short, admin, visible, areas)
    VALUES 
        (gen_random_uuid(), v_admin_uid, 'Admin', 'Teste', 'AT', 'Admin', true, true, ARRAY['all']),
        (gen_random_uuid(), v_collab_a_uid, 'Collab', 'A', 'CA', 'CollabA', false, true, ARRAY['design']),
        (gen_random_uuid(), v_collab_b_uid, 'Collab', 'B', 'CB', 'CollabB', false, true, ARRAY['copy']),
        (gen_random_uuid(), v_inactive_uid, 'Inactive', 'User', 'IU', 'Inactive', false, false, ARRAY['all']);

    -- Inserção de parceiros de teste
    INSERT INTO public.partners (id, title, slug, short, users_ids, archived, colors)
    VALUES 
        (gen_random_uuid(), 'Partner Test A', 'partner-test-a', 'PTA', ARRAY[v_collab_a_uid, v_admin_uid], false, ARRAY['#000000','#ffffff']),
        (gen_random_uuid(), 'Partner Test B', 'partner-test-b', 'PTB', ARRAY[v_collab_b_uid, v_admin_uid], false, ARRAY['#000000','#ffffff']);

    -- Inserção de ações de teste
    INSERT INTO public.actions (id, title, category, phase, priority, color, time, date, partners, responsibles, archived, user_id, created_at, updated_at)
    VALUES 
        (v_action_a_id, 'Action A1 (Collab A)', 'post', 'do', 'medium', '#000', 0, '2026-10-06 10:00:00+00', ARRAY['partner-test-a'], ARRAY[v_collab_a_uid], false, v_collab_a_uid, NOW(), NOW()),
        (v_action_b_id, 'Action B1 (Collab B)', 'reels', 'do', 'high', '#fff', 0, '2026-10-06 11:00:00+00', ARRAY['partner-test-b'], ARRAY[v_collab_b_uid], false, v_collab_b_uid, NOW(), NOW());
END $$;

-- One timestamp owner, real updates and stale-version compare-and-swap.
DO $$ DECLARE first_version TIMESTAMP; second_version TIMESTAMP; rows_changed INTEGER; BEGIN
 IF (SELECT count(*) FROM pg_trigger WHERE tgrelid='public.actions'::regclass AND NOT tgisinternal AND tgname IN ('trg_actions_updated_at','handle_updated_at_actions')) <> 1 THEN
  RAISE EXCEPTION 'Timestamp trigger was not reconciled';
 END IF;
 SELECT updated_at INTO first_version FROM public.actions WHERE id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
 UPDATE public.actions SET phase='doing',updated_at='2000-01-01' WHERE id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' AND updated_at=first_version
 RETURNING updated_at INTO second_version;
 IF second_version IS NULL OR second_version <= first_version THEN RAISE EXCEPTION 'Timestamp did not advance'; END IF;
 UPDATE public.actions SET phase='finished' WHERE id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' AND updated_at=first_version;
 GET DIAGNOSTICS rows_changed = ROW_COUNT;
 IF rows_changed <> 0 THEN RAISE EXCEPTION 'Stale version overwrote action'; END IF;
 UPDATE public.actions SET phase='do' WHERE id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' AND updated_at=second_version
 RETURNING updated_at INTO first_version;
 IF first_version <= second_version THEN RAISE EXCEPTION 'Second update was not monotonic'; END IF;
 IF (SELECT date FROM public.actions WHERE id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa') <> '2026-10-06 10:00:00'::timestamp THEN
  RAISE EXCEPTION 'Execution date changed during timestamp migration';
 END IF;
 RAISE NOTICE 'PASS: single timestamp trigger, server version, monotonicity and stale CAS';
END $$;

INSERT INTO public.action_comments (action_id, author_id, author_name, content, is_internal, is_user)
VALUES ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', '33333333-3333-4333-a333-333333333333', 'Collab B', 'Private B note', true, true);

-- 2. TESTE: Anon não lê ações nem parceiros
SET LOCAL ROLE anon;
-- Each table must independently reject anonymous SELECT; one exception cannot skip the next check.
DO $$ BEGIN
  PERFORM 1 FROM public.actions;
  RAISE EXCEPTION 'anon unexpectedly has SELECT on actions';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'SUCESSO: anon bloqueado de actions.';
END $$;
DO $$ BEGIN
  PERFORM 1 FROM public.partners;
  RAISE EXCEPTION 'anon unexpectedly has SELECT on partners';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'SUCESSO: anon bloqueado de partners.';
END $$;

-- 3. TESTE: Membro A enxerga apenas Ação A1 e não Ação B1
SET LOCAL ROLE authenticated;
-- Simula JWT claim de auth.uid() para Collab A
SET LOCAL "request.jwt.claim.sub" = '22222222-2222-4222-a222-222222222222';
DO $$
DECLARE
    v_count INTEGER;
    v_has_b BOOLEAN;
BEGIN
    SELECT count(*) INTO v_count FROM public.actions;
    SELECT EXISTS (SELECT 1 FROM public.actions WHERE id = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb') INTO v_has_b;

    IF v_has_b THEN
        RAISE EXCEPTION 'FALHA DE ISOLAMENTO: Colaborador A conseguiu ler Ação B1 de outro responsável!';
    END IF;

    IF v_count = 0 THEN
        RAISE EXCEPTION 'FALHA: Colaborador A deveria enxergar sua própria ação A1!';
    END IF;

    RAISE NOTICE 'SUCESSO: Colaborador A enxerga apenas suas ações autorizadas.';
END $$;

-- Member A cannot read or write B's action/notes, even with a forged ID.
DO $$ DECLARE changed INTEGER; BEGIN
  IF EXISTS(SELECT 1 FROM public.action_comments WHERE action_id='bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb') THEN RAISE EXCEPTION 'Private B note leaked'; END IF;
  UPDATE public.actions SET title='Forbidden' WHERE id='bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 0 THEN RAISE EXCEPTION 'Member A changed B'; END IF;
  BEGIN
    INSERT INTO public.action_comments(action_id, author_id, author_name, content, is_user)
      VALUES('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','22222222-2222-4222-a222-222222222222','Collab A','Forbidden note',true);
    RAISE EXCEPTION 'Member A inserted note on B';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.get_app_bootstrap('33333333-3333-4333-a333-333333333333');
    RAISE EXCEPTION 'Forged bootstrap identity accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Acesso negado: identidade%' THEN RAISE; END IF;
  END;
END $$;

-- 4. TESTE: Membro A não consegue se auto-promover a Admin na tabela people
-- Real browser creation/duplication requests require INSERT RETURNING under RLS.
DO $$ DECLARE created public.actions; duplicated public.actions; BEGIN
  INSERT INTO public.actions(title, category, phase, priority, date, partners, responsibles, user_id, created_at, updated_at)
    VALUES('Member returning test','post','do','medium','2026-10-08 13:00:00',ARRAY['partner-test-a'],
      ARRAY['22222222-2222-4222-a222-222222222222']::uuid[],'22222222-2222-4222-a222-222222222222',NOW(),NOW())
    RETURNING * INTO created;
  IF created.id IS NULL OR created.updated_at IS NULL THEN RAISE EXCEPTION 'Creation did not return canonical row'; END IF;
  INSERT INTO public.actions(title, category, phase, priority, date, partners, responsibles, user_id, created_at, updated_at)
    SELECT title || ' (Copy)', category, phase, priority, date, partners, responsibles, user_id, NOW(), NOW()
    FROM public.actions WHERE id=created.id RETURNING * INTO duplicated;
  IF duplicated.id IS NULL OR duplicated.id=created.id OR duplicated.date<>created.date THEN
    RAISE EXCEPTION 'Duplication did not preserve the execution date and return a new row';
  END IF;
  -- Both invalid partner scope and missing responsibility must remain denied.
  BEGIN
    INSERT INTO public.actions(title, category, phase, priority, date, partners, responsibles, created_at, updated_at)
      VALUES('Forbidden partner','post','do','medium',NOW(),ARRAY['partner-test-b'],
        ARRAY['22222222-2222-4222-a222-222222222222']::uuid[],NOW(),NOW()) RETURNING * INTO created;
    RAISE EXCEPTION 'Creation outside partner scope was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.actions(title, category, phase, priority, date, partners, responsibles, created_at, updated_at)
      VALUES('Missing responsibility','post','do','medium',NOW(),ARRAY['partner-test-a'],
        ARRAY['33333333-3333-4333-a333-333333333333']::uuid[],NOW(),NOW()) RETURNING * INTO created;
    RAISE EXCEPTION 'Creation without responsibility was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RAISE NOTICE 'PASS: member creation and duplication with RETURNING, scope negatives';
END $$;

DO $$
BEGIN
    UPDATE public.people
    SET admin = true
    WHERE user_id = '22222222-2222-4222-a222-222222222222';

    -- Se o UPDATE não falhar pela policy WITH CHECK, verifica se o valor realmente não mudou
    IF EXISTS (SELECT 1 FROM public.people WHERE user_id = '22222222-2222-4222-a222-222222222222' AND admin = true) THEN
        RAISE EXCEPTION 'FALHA CRÍTICA: Colaborador A conseguiu se promover para admin!';
    END IF;
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE 'SUCESSO: Auto-promoção a admin bloqueada por violação de política RLS.';
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'SUCESSO: Auto-promoção a admin bloqueada por privilégio insuficiente.';
END $$;

-- 5. TESTE: Membro Inativo não consegue consultar dados
SET LOCAL "request.jwt.claim.sub" = '44444444-4444-4444-a444-444444444444';
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM public.actions;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FALHA: Usuário inativo conseguiu ler dados!';
    END IF;
    RAISE NOTICE 'SUCESSO: Usuário inativo recusado pelas políticas.';
END $$;
DO $$ DECLARE created public.actions; BEGIN
  BEGIN
    INSERT INTO public.actions(title, category, phase, priority, date, partners, responsibles, created_at, updated_at)
      VALUES('Inactive creation','post','do','medium',NOW(),ARRAY['partner-test-a'],
        ARRAY['44444444-4444-4444-a444-444444444444']::uuid[],NOW(),NOW()) RETURNING * INTO created;
    RAISE EXCEPTION 'Inactive member created an action';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

-- 6. TESTE: Administrador enxerga ações de todos os parceiros
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-4111-a111-111111111111';
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM public.actions;
    IF v_count < 2 THEN
        RAISE EXCEPTION 'FALHA: Administrador deveria enxergar todas as ações de parceiros ativos!';
    END IF;
    RAISE NOTICE 'SUCESSO: Administrador autorizado para todos os parceiros ativos.';
END $$;

-- Ticket 14: single-connection quota checks; migration must be installed first.
DO $$ DECLARE created public.actions; BEGIN
  INSERT INTO public.actions(title, category, phase, priority, date, partners, responsibles, created_at, updated_at)
    VALUES('Admin returning test','post','do','medium',NOW(),ARRAY['partner-test-b'],
      ARRAY['33333333-3333-4333-a333-333333333333']::uuid[],NOW(),NOW()) RETURNING * INTO created;
  IF created.id IS NULL OR created.updated_at IS NULL THEN RAISE EXCEPTION 'Admin creation did not return canonical row'; END IF;
  RAISE NOTICE 'PASS: admin creation with RETURNING for another responsible';
END $$;

RESET ROLE;
DO $$
DECLARE
  v_user uuid := '11111111-1111-4111-a111-111111111111';
BEGIN
  IF has_function_privilege('authenticated', 'public.consume_ai_usage(uuid,integer)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.consume_ai_usage(uuid,integer)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: browser roles can consume arbitrary member quotas';
  END IF;
  IF NOT public.consume_ai_usage(v_user, 1) THEN RAISE EXCEPTION 'FAIL: first attempt rejected'; END IF;
  IF public.consume_ai_usage(v_user, 1) THEN RAISE EXCEPTION 'FAIL: exhausted quota accepted'; END IF;
  IF NOT public.consume_ai_usage('22222222-2222-4222-a222-222222222222', 1) THEN
    RAISE EXCEPTION 'FAIL: quotas are not isolated by member';
  END IF;
  BEGIN
    PERFORM public.consume_ai_usage('44444444-4444-4444-a444-444444444444', 1);
    RAISE EXCEPTION 'FAIL: inactive member accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  RAISE NOTICE 'PASS: quota permissions, exhaustion, member isolation and inactive member';
END $$;

-- Ticket15: requires preferences_merge; physical evidence only after execution.
RESET ROLE;
UPDATE public.people SET preferences = '{"futureKey":"preserve","theme":"light"}'::jsonb WHERE user_id::text = '22222222-2222-4222-a222-222222222222';
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '22222222-2222-4222-a222-222222222222';
DO $$ DECLARE result JSONB; BEGIN
  PERFORM public.update_my_preferences('{"theme":"dark"}'::jsonb);
  result := public.update_my_preferences('{"themeColorIndex":2}'::jsonb);
  IF result ->> 'theme' <> 'dark' OR result ->> 'themeColorIndex' <> '2' OR result ->> 'futureKey' <> 'preserve' THEN
    RAISE EXCEPTION 'FAIL: preference merge lost fields';
  END IF;
  IF has_column_privilege('authenticated','public.people','preferences','UPDATE') OR
     has_function_privilege('anon','public.update_my_preferences(jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: preference grants are too broad';
  END IF;
  BEGIN
    PERFORM public.update_my_preferences('{"admin":true}'::jsonb);
    RAISE EXCEPTION 'FAIL: arbitrary preference keys accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.update_my_preferences('{"theme":null}'::jsonb);
    RAISE EXCEPTION 'FAIL: invalid preference type accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
END $$;
SET LOCAL "request.jwt.claim.sub" = '44444444-4444-4444-a444-444444444444';
DO $$ BEGIN
  BEGIN
    PERFORM public.update_my_preferences('{"theme":"dark"}'::jsonb);
    RAISE EXCEPTION 'FAIL: inactive member updated preferences';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

-- Catalog regressions: grants, calendar administration, and mention confidentiality.
RESET ROLE;
DO $$ DECLARE target TEXT; BEGIN
 FOREACH target IN ARRAY ARRAY['actions','people','partners','clients','action_comments','notifications','celebrations','leads'] LOOP
  IF has_table_privilege('anon','public.'||target,'TRUNCATE') OR has_table_privilege('authenticated','public.'||target,'TRUNCATE') THEN
   RAISE EXCEPTION 'Browser role can truncate %', target;
  END IF;
 END LOOP;
END $$;
CREATE TABLE public.audit_default_probe(id UUID);
DO $$ BEGIN
 IF has_table_privilege('anon','public.audit_default_probe','SELECT') OR has_table_privilege('authenticated','public.audit_default_probe','UPDATE') THEN
  RAISE EXCEPTION 'New tables inherit broad browser grants';
 END IF;
END $$;
INSERT INTO public.celebrations(title,date) VALUES('Test celebration','2026-10-07');
UPDATE public.partners SET users_ids = users_ids || '33333333-3333-4333-a333-333333333333'::uuid WHERE slug='partner-test-a';
UPDATE public.actions SET responsibles = responsibles || '33333333-3333-4333-a333-333333333333'::uuid WHERE id='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '22222222-2222-4222-a222-222222222222';
DO $$ BEGIN
 BEGIN
  INSERT INTO public.celebrations(title,date) VALUES('Forbidden celebration','2026-10-07');
  RAISE EXCEPTION 'Member created administrative calendar data';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
INSERT INTO public.action_comments(id,action_id,author_id,author_name,content,is_user,mentions)
 VALUES('cccccccc-cccc-4ccc-accc-cccccccccccc','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','22222222-2222-4222-a222-222222222222','Collab A','Hello B',true,ARRAY['33333333-3333-4333-a333-333333333333'::uuid]);
INSERT INTO public.notifications(id,recipient_id,comment_id,action_id,type,author_name,action_title,comment_excerpt)
 VALUES('dddddddd-dddd-4ddd-addd-dddddddddddd','33333333-3333-4333-a333-333333333333','cccccccc-cccc-4ccc-accc-cccccccccccc','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','mention','Collab A','Action A1 (Collab A)','Hello B');
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.notifications) THEN RAISE EXCEPTION 'Sender can read another recipient notification'; END IF;
 BEGIN
  INSERT INTO public.notifications(recipient_id,comment_id,action_id,type)
   VALUES('11111111-1111-4111-a111-111111111111','cccccccc-cccc-4ccc-accc-cccccccccccc','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','mention');
  RAISE EXCEPTION 'Unmentioned recipient accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SET LOCAL "request.jwt.claim.sub" = '33333333-3333-4333-a333-333333333333';
DO $$ BEGIN
 IF (SELECT count(*) FROM public.notifications) <> 1 THEN RAISE EXCEPTION 'Recipient cannot read own mention'; END IF;
 BEGIN
  INSERT INTO public.notifications(recipient_id,comment_id,action_id,type)
   VALUES('33333333-3333-4333-a333-333333333333','cccccccc-cccc-4ccc-accc-cccccccccccc','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','mention');
  RAISE EXCEPTION 'Other member forged sender';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.notifications SET recipient_id='11111111-1111-4111-a111-111111111111';
  RAISE EXCEPTION 'Recipient can reassign notification';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE public.notifications SET read_at=now() WHERE id='dddddddd-dddd-4ddd-addd-dddddddddddd';
 IF NOT EXISTS(SELECT 1 FROM public.notifications WHERE read_at IS NOT NULL) THEN RAISE EXCEPTION 'Recipient cannot mark own notification read'; END IF;
END $$;
SET LOCAL "request.jwt.claim.sub" = '44444444-4444-4444-a444-444444444444';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.notifications) OR EXISTS(SELECT 1 FROM public.celebrations) THEN RAISE EXCEPTION 'Inactive member can read ancillary data'; END IF;
END $$;
RESET ROLE;
DO $$ BEGIN RAISE NOTICE 'PASS: minimal grants, defaults, admin calendar and authorized recipient mentions'; END $$;

-- Limpeza garantida
ROLLBACK;
-- The client runner prints completion only after ROLLBACK succeeds.

-- CONCURRENCY (ticket14): requires two real connections, not this rollback fixture.
-- In a disposable database, use one committed active member :member_id.
-- Setup as owner: DELETE FROM public.ai_usage WHERE user_id = :'member_id'::uuid;
-- Connection A: BEGIN; SELECT public.consume_ai_usage(:'member_id'::uuid, 1); -- true
-- Keep A open. Connection B: SELECT public.consume_ai_usage(:'member_id'::uuid, 1);
-- B must wait. Commit A; B must return false. Stored attempts must remain 1.
-- Repeat on another day/member to check reset/isolation; remove only the test fixture.
-- Executed locally by scripts/check-db-concurrency.py; production/Supabase integration remains pending.

-- Ticket15 concurrent merge (executed locally by check-db-concurrency.py): in two authenticated connections of the
-- same disposable member, A BEGIN/update theme and keep open; B update palette;
-- B waits for A COMMIT and must return both fields plus existing unknown keys.
-- auth.uid() is derived from each connection; p_patch cannot specify an owner.
