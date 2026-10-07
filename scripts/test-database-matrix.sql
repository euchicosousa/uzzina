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
    -- Inserção de pessoas de teste
    INSERT INTO public.people (id, user_id, name, surname, initials, short, admin, visible, areas)
    VALUES 
        (gen_random_uuid(), v_admin_uid::text, 'Admin', 'Teste', 'AT', 'Admin', true, true, ARRAY['all']),
        (gen_random_uuid(), v_collab_a_uid::text, 'Collab', 'A', 'CA', 'CollabA', false, true, ARRAY['design']),
        (gen_random_uuid(), v_collab_b_uid::text, 'Collab', 'B', 'CB', 'CollabB', false, true, ARRAY['copy']),
        (gen_random_uuid(), v_inactive_uid::text, 'Inactive', 'User', 'IU', 'Inactive', false, false, ARRAY['all']);

    -- Inserção de parceiros de teste
    INSERT INTO public.partners (id, title, slug, short, users_ids, archived)
    VALUES 
        (gen_random_uuid(), 'Partner Test A', 'partner-test-a', 'PTA', ARRAY[v_collab_a_uid::text, v_admin_uid::text], false),
        (gen_random_uuid(), 'Partner Test B', 'partner-test-b', 'PTB', ARRAY[v_collab_b_uid::text, v_admin_uid::text], false);

    -- Inserção de ações de teste
    INSERT INTO public.actions (id, title, category, phase, priority, color, time, date, partners, responsibles, archived, user_id)
    VALUES 
        (v_action_a_id, 'Action A1 (Collab A)', 'post', 'todo', 'medium', '#000', 0, '2026-10-06 10:00:00+00', ARRAY['partner-test-a'], ARRAY[v_collab_a_uid::text], false, v_collab_a_uid::text),
        (v_action_b_id, 'Action B1 (Collab B)', 'reels', 'todo', 'high', '#fff', 0, '2026-10-06 11:00:00+00', ARRAY['partner-test-b'], ARRAY[v_collab_b_uid::text], false, v_collab_b_uid::text);
END $$;

-- 2. TESTE: Anon não lê ações nem parceiros
SET LOCAL ROLE anon;
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count(*) INTO v_count FROM public.actions;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FALHA DE SEGURANÇA: anon conseguiu ler ações privadas (% linhas)', v_count;
    END IF;

    SELECT count(*) INTO v_count FROM public.partners;
    IF v_count > 0 THEN
        RAISE EXCEPTION 'FALHA DE SEGURANÇA: anon conseguiu ler parceiros privados (% linhas)', v_count;
    END IF;
    RAISE NOTICE 'SUCESSO: anon bloqueado de tabelas privadas.';
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

-- 4. TESTE: Membro A não consegue se auto-promover a Admin na tabela people
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

-- Limpeza garantida
ROLLBACK;
RAISE NOTICE 'Matriz de autorização concluída com sucesso (ROLLBACK executado).';
