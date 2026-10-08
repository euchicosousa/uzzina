-- Prepared for a disposable Supabase database; inspect production before deployment.
-- Replace policies for these tables as a set: permissive legacy policies would otherwise widen access.
DO $$ DECLARE policy RECORD; BEGIN
  FOR policy IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY(ARRAY['actions','partners','clients','people','action_comments','dash_sessions','review_links'])
  LOOP EXECUTE format('DROP POLICY %I ON %I.%I', policy.policyname, policy.schemaname, policy.tablename); END LOOP;
END $$;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.actions FROM anon;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.partners FROM anon;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.clients FROM anon;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.people FROM anon;
ALTER TABLE public.action_comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.action_comments FROM anon;
ALTER TABLE public.dash_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.dash_sessions FROM anon;
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.review_links FROM anon;
REVOKE ALL ON TABLE public.clients, public.dash_sessions, public.review_links FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.actions, public.partners, public.action_comments TO authenticated;
REVOKE UPDATE ON public.people FROM PUBLIC, authenticated;
GRANT SELECT, INSERT, DELETE ON public.people TO authenticated;
DO $$ DECLARE columns TEXT; BEGIN
 SELECT string_agg(format('%I', column_name), ',') INTO columns FROM information_schema.columns WHERE table_schema='public' AND table_name='people';
 EXECUTE format('REVOKE UPDATE (%s) ON public.people FROM PUBLIC, anon, authenticated', columns);
END $$;
GRANT UPDATE (name, surname, initials, short, image, preferences) ON public.people TO authenticated;

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
REVOKE ALL ON FUNCTION public.is_active_member(), public.is_active_admin(), public.can_access_action(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_member(), public.is_active_admin(), public.can_access_action(UUID) TO authenticated, service_role;

CREATE POLICY people_select_active_members ON public.people FOR SELECT TO authenticated USING(public.is_active_member());
CREATE POLICY people_insert_admin_only ON public.people FOR INSERT TO authenticated WITH CHECK(public.is_active_admin());
CREATE POLICY people_update_self_or_admin ON public.people FOR UPDATE TO authenticated
  USING(public.is_active_admin() OR (public.is_active_member() AND user_id::text = auth.uid()::text))
  WITH CHECK(public.is_active_admin() OR (public.is_active_member() AND user_id::text = auth.uid()::text AND admin = false));
CREATE POLICY people_delete_admin_only ON public.people FOR DELETE TO authenticated USING(public.is_active_admin());
CREATE POLICY partners_select_policy ON public.partners FOR SELECT TO authenticated
  USING(public.is_active_admin() OR (public.is_active_member() AND archived = false AND users_ids::text[] @> ARRAY[auth.uid()::text]));
CREATE POLICY partners_write_admin_only ON public.partners FOR ALL TO authenticated USING(public.is_active_admin()) WITH CHECK(public.is_active_admin());
CREATE POLICY actions_select_policy ON public.actions FOR SELECT TO authenticated USING(public.can_access_action(id));
CREATE POLICY actions_insert_policy ON public.actions FOR INSERT TO authenticated WITH CHECK(
  public.is_active_admin() OR (public.is_active_member() AND responsibles::text[] @> ARRAY[auth.uid()::text]
    AND EXISTS(SELECT 1 FROM public.partners p WHERE p.archived = false AND p.slug = ANY(actions.partners) AND p.users_ids::text[] @> ARRAY[auth.uid()::text])));
CREATE POLICY actions_update_policy ON public.actions FOR UPDATE TO authenticated USING(public.can_access_action(id)) WITH CHECK(
  public.is_active_admin() OR (public.is_active_member() AND responsibles::text[] @> ARRAY[auth.uid()::text]
    AND EXISTS(SELECT 1 FROM public.partners p WHERE p.archived = false AND p.slug = ANY(actions.partners) AND p.users_ids::text[] @> ARRAY[auth.uid()::text])));
CREATE POLICY actions_delete_policy ON public.actions FOR DELETE TO authenticated USING(public.can_access_action(id));
CREATE POLICY comments_select_policy ON public.action_comments FOR SELECT TO authenticated USING(public.can_access_action(action_id));
CREATE POLICY comments_insert_policy ON public.action_comments FOR INSERT TO authenticated WITH CHECK(public.can_access_action(action_id) AND author_id::text = auth.uid()::text);
CREATE POLICY comments_update_policy ON public.action_comments FOR UPDATE TO authenticated
  USING(public.can_access_action(action_id) AND (public.is_active_admin() OR author_id::text = auth.uid()::text))
  WITH CHECK(public.can_access_action(action_id) AND (public.is_active_admin() OR author_id::text = auth.uid()::text));
CREATE POLICY comments_delete_policy ON public.action_comments FOR DELETE TO authenticated USING(public.can_access_action(action_id) AND (public.is_active_admin() OR author_id::text = auth.uid()::text));

-- Admin changes to protected fields go through an authenticated RPC, not broad UPDATE grants.
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
REVOKE ALL ON FUNCTION public.admin_update_person(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_person(UUID, JSONB) TO authenticated;

-- Retire private legacy overload permissions; grant only the canonical signatures below.
DO $$ DECLARE fn RECORD; BEGIN
 FOR fn IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname IN ('get_home_actions','get_app_bootstrap')
 LOOP EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.signature); END LOOP;
END $$;
-- 9. RPC Canônica: get_home_actions com derivação segura de identidade e search_path fixo
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

-- Permissões na RPC get_home_actions
REVOKE ALL ON FUNCTION public.get_home_actions(UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_home_actions(UUID, TIMESTAMPTZ, TIMESTAMPTZ, TIMESTAMPTZ, TEXT[]) TO authenticated, service_role;

-- 10. RPC Canônica: get_app_bootstrap com derivação segura de identidade e search_path fixo
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

REVOKE ALL ON FUNCTION public.get_app_bootstrap(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_app_bootstrap(UUID) TO authenticated, service_role;
