-- UZZINA release 2026-10-08. Production project dfepmjcozszswocwvdpq.
-- Generated from the audited migrations; no database reset or data deletion.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '120s';
-- PHASE 1: run before deploying the new app. Existing browser writes remain available.
-- SOURCE: 20261006000000_dash_sessions.sql
-- Migration: Criar tabela dash_sessions para sessões opacas do portal de clientes (/dash)
-- Data: 2026-10-06
-- Ticket 02: Login e retomada só com sessão válida

CREATE TABLE IF NOT EXISTS public.dash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_dash_sessions_token_hash ON public.dash_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_dash_sessions_client_id ON public.dash_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_dash_sessions_expires_revoked ON public.dash_sessions(expires_at, revoked_at);

-- Habilitar RLS estrito
ALTER TABLE public.dash_sessions ENABLE ROW LEVEL SECURITY;

-- Revogar todo acesso direto de anon e authenticated.
-- Apenas service_role no backend tem permissão para ler/gravar na tabela.
REVOKE ALL ON TABLE public.dash_sessions FROM anon, authenticated;


-- SOURCE: 20261006005000_auth_trigger_compatibility.sql
-- The admin form creates Auth credentials first, then inserts complete people data.
-- Retire only the verified legacy trigger writing to the absent profiles table.
DO $$
DECLARE v_definition TEXT;
BEGIN
  SELECT pg_get_functiondef(t.tgfoid) INTO v_definition
  FROM pg_trigger t
  WHERE t.tgrelid = 'auth.users'::regclass AND t.tgname = 'on_auth_user_created' AND NOT t.tgisinternal;
  IF v_definition IS NOT NULL AND to_regclass('public.profiles') IS NULL THEN
    IF v_definition NOT LIKE '%INSERT INTO public.profiles%' THEN
      RAISE EXCEPTION 'Unknown auth user trigger; inspect before applying';
    END IF;
    DROP TRIGGER on_auth_user_created ON auth.users;
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;


-- SOURCE: 20261006010000_review_links.sql
-- Migration: Criar tabela review_links para links seguros de revisão de conteúdo (/dash/review/$slug)
-- Data: 2026-10-06
-- Ticket 05: Compartilhar revisão só por link limitado

CREATE TABLE IF NOT EXISTS public.review_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    partner_slug TEXT NOT NULL,
    action_ids UUID[] NOT NULL,
    created_by UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_review_links_token_hash ON public.review_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_review_links_partner_slug ON public.review_links(partner_slug);
CREATE INDEX IF NOT EXISTS idx_review_links_created_by ON public.review_links(created_by);
CREATE INDEX IF NOT EXISTS idx_review_links_expires_revoked ON public.review_links(expires_at, revoked_at);

-- Habilitar RLS estrito
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;

-- Revogar todo acesso direto de anon e authenticated.
-- Apenas service_role no backend tem permissão para ler/gravar na tabela.
REVOKE ALL ON TABLE public.review_links FROM anon, authenticated;


-- SOURCE: 20261006020000_client_accounts.sql
-- Migration: Funções transacionais para gestão de contas e revogação de sessões do portal (/dash)
-- Data: 2026-10-06
-- Ticket 06: Administrador cria contas e revoga sessões

-- 1. Troca transacional de senha com revogação imediata de sessões ativas
CREATE OR REPLACE FUNCTION public.admin_update_client_password(
    p_client_id UUID,
    p_password_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualiza o hash da senha do cliente
    UPDATE public.clients
    SET password_hash = p_password_hash
    WHERE id = p_client_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Client not found';
    END IF;

    -- Revoga todas as sessões ativas daquele cliente de forma atômica
    UPDATE public.dash_sessions
    SET revoked_at = now()
    WHERE client_id = p_client_id
      AND revoked_at IS NULL;
END;
$$;

-- 2. Desativação transacional de cliente com revogação imediata de sessões ativas
CREATE OR REPLACE FUNCTION public.admin_deactivate_client(
    p_client_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Desativa o cliente
    UPDATE public.clients
    SET active = false
    WHERE id = p_client_id;

    -- Revoga todas as sessões ativas do cliente de forma atômica
    UPDATE public.dash_sessions
    SET revoked_at = now()
    WHERE client_id = p_client_id
      AND revoked_at IS NULL;
END;
$$;

-- 3. Migração condicional de hash legado para bcrypt durante login bem-sucedido
-- Retorna o número de linhas atualizadas (1 se migrado, 0 se houve alteração concorrente)
CREATE OR REPLACE FUNCTION public.client_migrate_legacy_password(
    p_client_id UUID,
    p_legacy_hash TEXT,
    p_new_hash TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE public.clients
    SET password_hash = p_new_hash
    WHERE id = p_client_id
      AND password_hash = p_legacy_hash;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated;
END;
$$;

-- Restrição de privilégios: apenas o backend privilegiado (service_role) pode invocar essas funções
REVOKE ALL ON FUNCTION public.admin_update_client_password(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_client_password(UUID, TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.admin_deactivate_client(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_deactivate_client(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.client_migrate_legacy_password(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.client_migrate_legacy_password(UUID, TEXT, TEXT) TO service_role;

-- A single transaction updates the account and revokes sessions together.
CREATE OR REPLACE FUNCTION public.admin_update_client_account(
  p_client_id UUID, p_changes JSONB, p_password_hash TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_client public.clients%ROWTYPE;
BEGIN
  SELECT * INTO v_client FROM public.clients WHERE id = p_client_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'Client not found'; END IF;
  IF p_changes ? 'partners' AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(p_changes->'partners') selected(slug)
    WHERE NOT EXISTS (SELECT 1 FROM public.partners p WHERE p.slug = selected.slug AND p.archived = false)
  ) THEN RAISE EXCEPTION 'Invalid partner'; END IF;
  UPDATE public.clients SET
    name = CASE WHEN p_changes ? 'name' THEN p_changes->>'name' ELSE name END,
    email = CASE WHEN p_changes ? 'email' THEN p_changes->>'email' ELSE email END,
    image = CASE WHEN p_changes ? 'image' THEN p_changes->>'image' ELSE image END,
    active = CASE WHEN p_changes ? 'active' THEN (p_changes->>'active')::BOOLEAN ELSE active END,
    partners = CASE WHEN p_changes ? 'partners' THEN ARRAY(SELECT jsonb_array_elements_text(p_changes->'partners')) ELSE partners END,
    password_hash = COALESCE(p_password_hash, password_hash)
  WHERE id = p_client_id RETURNING * INTO v_client;
  IF p_password_hash IS NOT NULL OR p_changes->>'active' = 'false' THEN
    UPDATE public.dash_sessions SET revoked_at = now() WHERE client_id = p_client_id AND revoked_at IS NULL;
  END IF;
  RETURN to_jsonb(v_client) - 'password_hash';
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_client_account(UUID, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_client_account(UUID, JSONB, TEXT) TO service_role;


-- SOURCE: 20261006040000_action_concurrency.sql
-- Migration: 20261006040000_action_concurrency.sql
-- Descrição: Controle canônico de concorrência e timestamp para a tabela actions.
-- Ticket 08: Atualizar ação com conflito explícito.

-- Reconcile the exact moddatetime trigger observed in the exported baseline.
DO $$ DECLARE v_definition TEXT; BEGIN
 SELECT pg_get_triggerdef(oid) INTO v_definition FROM pg_trigger
 WHERE tgrelid='public.actions'::regclass AND tgname='handle_updated_at_actions' AND NOT tgisinternal;
 IF v_definition IS NOT NULL THEN
   IF v_definition NOT LIKE '%moddatetime(''updated_at'')%' THEN
     RAISE EXCEPTION 'Unknown legacy actions timestamp trigger; inspect before applying';
   END IF;
   DROP TRIGGER handle_updated_at_actions ON public.actions;
 END IF;
 IF EXISTS(SELECT 1 FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
   WHERE t.tgrelid='public.actions'::regclass AND NOT t.tgisinternal
     AND t.tgname <> 'trg_actions_updated_at'
     AND (pg_get_functiondef(p.oid) ~* 'NEW[.]updated_at[[:space:]]*(:=|=)' OR p.proname='moddatetime')) THEN
   RAISE EXCEPTION 'Inspect existing actions timestamp trigger before applying concurrency migration';
 END IF;
 IF (SELECT atttypid FROM pg_attribute WHERE attrelid='public.actions'::regclass AND attname='updated_at') <> 'timestamp'::regtype THEN
   RAISE EXCEPTION 'Expected exported timestamp without time zone contract';
 END IF;
END $$;

-- 1. Preencher updated_at NULL de registros legados com base em created_at ou now()
UPDATE public.actions
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- 2. Garantir default canônico de servidor e restrição NOT NULL para updated_at
ALTER TABLE public.actions
  ALTER COLUMN updated_at SET DEFAULT (CLOCK_TIMESTAMP() AT TIME ZONE 'UTC'),
  ALTER COLUMN updated_at SET NOT NULL;

-- 3. Função canônica de atualização de timestamp com garantia de monotonicidade
CREATE OR REPLACE FUNCTION public.handle_actions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = GREATEST(
    CLOCK_TIMESTAMP() AT TIME ZONE 'UTC',
    COALESCE(OLD.updated_at, '-infinity'::TIMESTAMP) + INTERVAL '1 microsecond'
  );
  RETURN NEW;
END;
$$;

-- 4. Trigger BEFORE UPDATE na tabela actions
DROP TRIGGER IF EXISTS trg_actions_updated_at ON public.actions;
CREATE TRIGGER trg_actions_updated_at
BEFORE UPDATE ON public.actions
FOR EACH ROW
EXECUTE FUNCTION public.handle_actions_updated_at();


-- SOURCE: 20261007010000_ai_usage.sql
-- Ticket 14: UTC daily attempt quota, consumed before calling the provider.
CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_day date NOT NULL,
  attempts integer NOT NULL CHECK (attempts BETWEEN 1 AND 10000),
  PRIMARY KEY (user_id, usage_day)
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_usage FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_ai_usage(p_user_id uuid, p_limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
  v_day date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
BEGIN
  IF p_user_id IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 10000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid quota arguments';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.people WHERE user_id = p_user_id AND visible IS TRUE) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Inactive member';
  END IF;
  INSERT INTO public.ai_usage (user_id, usage_day, attempts)
  VALUES (p_user_id, v_day, 1)
  ON CONFLICT (user_id, usage_day) DO UPDATE
    SET attempts = public.ai_usage.attempts + 1
    WHERE public.ai_usage.attempts < p_limit
  RETURNING attempts INTO v_count;
  RETURN v_count IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_usage(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_usage(uuid, integer) TO service_role;


CREATE OR REPLACE FUNCTION public.is_active_member() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.people WHERE user_id::text = auth.uid()::text AND visible = true);
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.people WHERE user_id::text = auth.uid()::text AND visible = true AND admin = true);
$$;

CREATE OR REPLACE FUNCTION public.can_access_action(p_action_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.actions a WHERE a.id = p_action_id AND (
    public.is_active_admin() OR (public.is_active_member() AND a.responsibles::text[] @> ARRAY[auth.uid()::text]
      AND EXISTS(SELECT 1 FROM public.partners p WHERE p.archived = false AND p.slug = ANY(a.partners) AND p.users_ids::text[] @> ARRAY[auth.uid()::text]))
  ));
$$;

CREATE OR REPLACE FUNCTION public.admin_update_person(p_user_id UUID, p_changes JSONB) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
  UPDATE public.people SET
    name = p_changes->>'name', surname = p_changes->>'surname', email = p_changes->>'email',
    initials = p_changes->>'initials', short = p_changes->>'short', image = p_changes->>'image',
    admin = (p_changes->>'admin')::BOOLEAN, visible = (p_changes->>'visible')::BOOLEAN,
    areas = ARRAY(SELECT jsonb_array_elements_text(p_changes->'areas'))
  WHERE user_id::text = p_user_id::text;
  IF NOT FOUND THEN RAISE EXCEPTION 'Person not found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_home_actions(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ,
    p_today_end TIMESTAMPTZ,
    p_partner_slugs TEXT[] DEFAULT NULL
)
RETURNS SETOF public.actions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_uid UUID;
    v_is_admin BOOLEAN;
    v_allowed_partner_slugs TEXT[];
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: chamada não autenticada.';
    END IF;

    -- Se parâmetro de compatibilidade p_user_id for fornecido e divergente de auth.uid(),
    -- apenas administradores têm permissão para inspecionar trabalho de terceiros.
    SELECT admin INTO v_is_admin
    FROM public.people
    WHERE (user_id::text = v_auth_uid::text OR user_id::text = v_auth_uid::uuid::text)
      AND visible = true
    LIMIT 1;

    IF v_is_admin IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: usuário inativo ou não autorizado.';
    END IF;

    IF p_user_id IS NOT NULL AND p_user_id != v_auth_uid THEN
        RAISE EXCEPTION 'Acesso negado: identidade solicitada não corresponde à sessão autenticada.';
    END IF;

    -- Slugs operacionais permitidos para o usuário (não arquivados)
    IF v_is_admin = true THEN
        SELECT array_agg(slug) INTO v_allowed_partner_slugs
        FROM public.partners
        WHERE archived = false;
    ELSE
        SELECT array_agg(slug) INTO v_allowed_partner_slugs
        FROM public.partners
        WHERE archived = false
          AND (
              users_ids::text[] @> ARRAY[v_auth_uid::text]
              OR users_ids::text[] @> ARRAY[v_auth_uid::uuid::text]
          );
    END IF;

    IF v_allowed_partner_slugs IS NULL THEN
        RETURN;
    END IF;

    -- p_partner_slugs fornecido pelo cliente apenas restringe, nunca amplia
    IF p_partner_slugs IS NOT NULL THEN
        SELECT array_agg(elem) INTO v_allowed_partner_slugs
        FROM unnest(v_allowed_partner_slugs) elem
        WHERE elem = ANY(p_partner_slugs);

        IF v_allowed_partner_slugs IS NULL THEN
            RETURN;
        END IF;
    END IF;

    RETURN QUERY
    SELECT a.*
    FROM public.actions a
    WHERE (a.archived = false OR a.archived IS NULL)
      AND (
          v_is_admin = true
          OR a.responsibles::text[] @> ARRAY[v_auth_uid::text]
          OR a.responsibles::text[] @> ARRAY[v_auth_uid::uuid::text]
      )
      AND a.partners && v_allowed_partner_slugs
      AND a.date >= p_start_date AND a.date <= p_end_date
    ORDER BY a.date ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_bootstrap(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_uid UUID;
    v_person RECORD;
    v_partners JSONB;
    v_is_admin BOOLEAN;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: chamada não autenticada.';
    END IF;

    SELECT * INTO v_person
    FROM public.people
    WHERE (user_id::text = v_auth_uid::text OR user_id::text = v_auth_uid::uuid::text)
      AND visible = true
    LIMIT 1;

    IF v_person IS NULL THEN
        RAISE EXCEPTION 'Usuário inativo ou não cadastrado.';
    END IF;

    v_is_admin := (v_person.admin = true);

    IF p_user_id IS NOT NULL AND p_user_id != v_auth_uid THEN
        RAISE EXCEPTION 'Acesso negado: identidade solicitada não corresponde à sessão autenticada.';
    END IF;

    -- Carrega parceiros autorizados
    IF v_is_admin = true THEN
        SELECT jsonb_agg(to_jsonb(p)) INTO v_partners
        FROM (
            SELECT *
            FROM public.partners
            WHERE archived = false
            ORDER BY title ASC
        ) p;
    ELSE
        SELECT jsonb_agg(to_jsonb(p)) INTO v_partners
        FROM (
            SELECT *
            FROM public.partners
            WHERE archived = false AND users_ids::text[] @> ARRAY[v_auth_uid::text]
            ORDER BY title ASC
        ) p;
    END IF;

    RETURN jsonb_build_object(
        'person', to_jsonb(v_person),
        'partners', COALESCE(v_partners, '[]'::jsonb)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_my_preferences(p_patch JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_key TEXT;
  v_value JSONB;
  v_mode TEXT;
  v_color TEXT;
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF p_patch IS NULL OR jsonb_typeof(p_patch) <> 'object' OR octet_length(p_patch::text) > 16384 THEN
    RAISE EXCEPTION 'Invalid preference patch' USING ERRCODE = '22023';
  END IF;
  FOR v_key, v_value IN SELECT * FROM jsonb_each(p_patch) LOOP
    CASE v_key
      WHEN 'theme' THEN
        IF jsonb_typeof(v_value) <> 'string' OR v_value #>> '{}' NOT IN ('light','dark','system') THEN
          RAISE EXCEPTION 'Invalid theme' USING ERRCODE = '22023';
        END IF;
      WHEN 'themeColorIndex' THEN
        IF jsonb_typeof(v_value) <> 'number' THEN RAISE EXCEPTION 'Invalid palette' USING ERRCODE = '22023'; END IF;
        IF (v_value::text)::numeric <> trunc((v_value::text)::numeric) OR (v_value::text)::numeric NOT BETWEEN -1 AND 11 THEN
          RAISE EXCEPTION 'Invalid palette' USING ERRCODE = '22023';
        END IF;
      WHEN 'followPartnerColor', 'showInstagramSidebar' THEN
        IF jsonb_typeof(v_value) <> 'boolean' THEN RAISE EXCEPTION 'Invalid preference flag' USING ERRCODE = '22023'; END IF;
      WHEN 'defaultViewVariant' THEN
        IF jsonb_typeof(v_value) <> 'string' OR v_value #>> '{}' NOT IN ('line','block','content') THEN
          RAISE EXCEPTION 'Invalid view' USING ERRCODE = '22023';
        END IF;
      WHEN 'customTheme' THEN
        IF v_value <> 'null'::jsonb THEN
          IF jsonb_typeof(v_value) <> 'object' THEN RAISE EXCEPTION 'Invalid custom theme' USING ERRCODE = '22023'; END IF;
          IF (SELECT count(*) FROM jsonb_object_keys(v_value)) <> 2 OR NOT v_value ?& ARRAY['light','dark'] THEN
            RAISE EXCEPTION 'Invalid custom theme' USING ERRCODE = '22023';
          END IF;
          FOREACH v_mode IN ARRAY ARRAY['light','dark'] LOOP
            IF jsonb_typeof(v_value -> v_mode) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid custom colors' USING ERRCODE = '22023'; END IF;
            IF (SELECT count(*) FROM jsonb_object_keys(v_value -> v_mode)) <> 4 THEN RAISE EXCEPTION 'Invalid custom colors' USING ERRCODE = '22023'; END IF;
            FOREACH v_color IN ARRAY ARRAY['primaryHex','primaryFgHex','bgHex','fgHex'] LOOP
              IF jsonb_typeof(v_value -> v_mode -> v_color) IS DISTINCT FROM 'string' OR
                 (v_value -> v_mode ->> v_color) !~ '^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$' THEN
                RAISE EXCEPTION 'Invalid custom color' USING ERRCODE = '22023';
              END IF;
            END LOOP;
          END LOOP;
        END IF;
      ELSE RAISE EXCEPTION 'Unknown preference key' USING ERRCODE = '22023';
    END CASE;
  END LOOP;
  UPDATE public.people
    SET preferences = (CASE WHEN jsonb_typeof(preferences::jsonb) = 'object' THEN preferences::jsonb ELSE '{}'::jsonb END) || p_patch
    WHERE user_id::text = v_user_id::text AND visible = true
    RETURNING preferences::jsonb INTO v_result;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active member required' USING ERRCODE = '42501'; END IF;
  RETURN v_result;
END;
$$;
REVOKE ALL ON FUNCTION public.is_active_member(), public.is_active_admin(), public.can_access_action(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_member(), public.is_active_admin(), public.can_access_action(UUID) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.admin_update_person(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_person(UUID, JSONB) TO authenticated;
REVOKE ALL ON FUNCTION public.get_home_actions(UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_home_actions(UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT[]) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_app_bootstrap(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_app_bootstrap(UUID) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.update_my_preferences(JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_preferences(JSONB) TO authenticated;
REVOKE ALL ON public.dash_sessions, public.review_links, public.ai_usage FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dash_sessions, public.review_links, public.ai_usage TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
