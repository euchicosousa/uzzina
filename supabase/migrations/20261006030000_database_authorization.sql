-- ==============================================================================
-- Migration: Autorizações Canônicas e Políticas RLS Estritas no Banco de Dados
-- Data: 2026-10-06
-- Ticket 07: Autorizações reproduzíveis no banco
-- ==============================================================================

-- 1. Habilitar RLS em todas as tabelas públicas
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;

-- 2. Revogar acesso direto da role 'anon' a dados privados e tabelas internas
REVOKE ALL ON TABLE public.actions FROM anon;
REVOKE ALL ON TABLE public.partners FROM anon;
REVOKE ALL ON TABLE public.clients FROM anon;
REVOKE ALL ON TABLE public.people FROM anon;
REVOKE ALL ON TABLE public.action_comments FROM anon;
REVOKE ALL ON TABLE public.dash_sessions FROM anon, authenticated;
REVOKE ALL ON TABLE public.review_links FROM anon, authenticated;

-- 3. Funções auxiliares de checagem de privilégio (SECURITY DEFINER com search_path fixo)
CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.people
        WHERE (user_id = auth.uid()::text OR user_id = auth.uid()::uuid::text)
          AND visible = true
    );
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.people
        WHERE (user_id = auth.uid()::text OR user_id = auth.uid()::uuid::text)
          AND visible = true
          AND admin = true
    );
$$;

-- Restringe execução das funções auxiliares
REVOKE ALL ON FUNCTION public.is_active_member() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_member() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated, service_role;

-- 4. Políticas para a tabela PEOPLE
DROP POLICY IF EXISTS "people_select_active_members" ON public.people;
CREATE POLICY "people_select_active_members"
ON public.people
FOR SELECT
TO authenticated
USING (public.is_active_member());

DROP POLICY IF EXISTS "people_insert_admin_only" ON public.people;
CREATE POLICY "people_insert_admin_only"
ON public.people
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "people_update_self_or_admin" ON public.people;
CREATE POLICY "people_update_self_or_admin"
ON public.people
FOR UPDATE
TO authenticated
USING (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (user_id = auth.uid()::text OR user_id = auth.uid()::uuid::text)
    )
)
WITH CHECK (
    -- Admin pode atualizar livremente
    public.is_active_admin()
    -- Colaborador só atualiza a si mesmo e NÃO pode se auto-promover para admin nem trocar user_id
    OR (
        public.is_active_member()
        AND (user_id = auth.uid()::text OR user_id = auth.uid()::uuid::text)
        AND admin = false
    )
);

DROP POLICY IF EXISTS "people_delete_admin_only" ON public.people;
CREATE POLICY "people_delete_admin_only"
ON public.people
FOR DELETE
TO authenticated
USING (public.is_active_admin());

-- 5. Políticas para a tabela PARTNERS
DROP POLICY IF EXISTS "partners_select_policy" ON public.partners;
CREATE POLICY "partners_select_policy"
ON public.partners
FOR SELECT
TO authenticated
USING (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (
            users_ids @> ARRAY[auth.uid()::text]
            OR users_ids @> ARRAY[auth.uid()::uuid::text]
        )
    )
);

DROP POLICY IF EXISTS "partners_write_admin_only" ON public.partners;
CREATE POLICY "partners_write_admin_only"
ON public.partners
FOR ALL
TO authenticated
USING (public.is_active_admin())
WITH CHECK (public.is_active_admin());

-- 6. Políticas para a tabela CLIENTS (Acesso via SDK reservado a administradores)
DROP POLICY IF EXISTS "clients_admin_all" ON public.clients;
CREATE POLICY "clients_admin_all"
ON public.clients
FOR ALL
TO authenticated
USING (public.is_active_admin())
WITH CHECK (public.is_active_admin());

-- 7. Políticas para a tabela ACTIONS
DROP POLICY IF EXISTS "actions_select_policy" ON public.actions;
CREATE POLICY "actions_select_policy"
ON public.actions
FOR SELECT
TO authenticated
USING (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (
            responsibles @> ARRAY[auth.uid()::text]
            OR responsibles @> ARRAY[auth.uid()::uuid::text]
            OR sprints @> ARRAY[auth.uid()::text]
            OR sprints @> ARRAY[auth.uid()::uuid::text]
        )
    )
);

DROP POLICY IF EXISTS "actions_insert_policy" ON public.actions;
CREATE POLICY "actions_insert_policy"
ON public.actions
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (
            responsibles @> ARRAY[auth.uid()::text]
            OR responsibles @> ARRAY[auth.uid()::uuid::text]
        )
    )
);

DROP POLICY IF EXISTS "actions_update_policy" ON public.actions;
CREATE POLICY "actions_update_policy"
ON public.actions
FOR UPDATE
TO authenticated
USING (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (
            responsibles @> ARRAY[auth.uid()::text]
            OR responsibles @> ARRAY[auth.uid()::uuid::text]
        )
    )
)
WITH CHECK (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (
            responsibles @> ARRAY[auth.uid()::text]
            OR responsibles @> ARRAY[auth.uid()::uuid::text]
        )
    )
);

DROP POLICY IF EXISTS "actions_delete_policy" ON public.actions;
CREATE POLICY "actions_delete_policy"
ON public.actions
FOR DELETE
TO authenticated
USING (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (
            responsibles @> ARRAY[auth.uid()::text]
            OR responsibles @> ARRAY[auth.uid()::uuid::text]
        )
    )
);

-- 8. Políticas para a tabela ACTION_COMMENTS
DROP POLICY IF EXISTS "comments_select_policy" ON public.action_comments;
CREATE POLICY "comments_select_policy"
ON public.action_comments
FOR SELECT
TO authenticated
USING (public.is_active_member());

DROP POLICY IF EXISTS "comments_insert_policy" ON public.action_comments;
CREATE POLICY "comments_insert_policy"
ON public.action_comments
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_active_member()
    AND (author_id = auth.uid()::text OR author_id = auth.uid()::uuid::text)
);

DROP POLICY IF EXISTS "comments_update_policy" ON public.action_comments;
CREATE POLICY "comments_update_policy"
ON public.action_comments
FOR UPDATE
TO authenticated
USING (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (author_id = auth.uid()::text OR author_id = auth.uid()::uuid::text)
    )
)
WITH CHECK (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (author_id = auth.uid()::text OR author_id = auth.uid()::uuid::text)
    )
);

DROP POLICY IF EXISTS "comments_delete_policy" ON public.action_comments;
CREATE POLICY "comments_delete_policy"
ON public.action_comments
FOR DELETE
TO authenticated
USING (
    public.is_active_admin()
    OR (
        public.is_active_member()
        AND (author_id = auth.uid()::text OR author_id = auth.uid()::uuid::text)
    )
);

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
    WHERE (user_id = v_auth_uid::text OR user_id = v_auth_uid::uuid::text)
      AND visible = true
    LIMIT 1;

    IF v_is_admin IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: usuário inativo ou não autorizado.';
    END IF;

    IF p_user_id IS NOT NULL AND p_user_id != v_auth_uid AND v_is_admin = false THEN
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
              users_ids @> ARRAY[v_auth_uid::text]
              OR users_ids @> ARRAY[v_auth_uid::uuid::text]
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
          OR a.responsibles @> ARRAY[v_auth_uid::text]
          OR a.responsibles @> ARRAY[v_auth_uid::uuid::text]
          OR a.sprints @> ARRAY[v_auth_uid::text]
          OR a.sprints @> ARRAY[v_auth_uid::uuid::text]
      )
      AND a.partners && v_allowed_partner_slugs
      AND (
          (a.date >= p_start_date AND a.date <= p_end_date)
          OR (a.phase != 'done' AND a.date <= p_today_end)
      )
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
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_uid UUID;
    v_person RECORD;
    v_partners JSON;
    v_is_admin BOOLEAN;
BEGIN
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Acesso negado: chamada não autenticada.';
    END IF;

    SELECT * INTO v_person
    FROM public.people
    WHERE (user_id = v_auth_uid::text OR user_id = v_auth_uid::uuid::text)
      AND visible = true
    LIMIT 1;

    IF v_person IS NULL THEN
        RAISE EXCEPTION 'Usuário inativo ou não cadastrado.';
    END IF;

    v_is_admin := (v_person.admin = true);

    IF p_user_id IS NOT NULL AND p_user_id != v_auth_uid AND v_is_admin = false THEN
        RAISE EXCEPTION 'Acesso negado: identidade solicitada não corresponde à sessão autenticada.';
    END IF;

    -- Carrega parceiros autorizados
    IF v_is_admin = true THEN
        SELECT json_agg(row_to_json(p)) INTO v_partners
        FROM (
            SELECT *
            FROM public.partners
            ORDER BY title ASC
        ) p;
    ELSE
        SELECT json_agg(row_to_json(p)) INTO v_partners
        FROM (
            SELECT *
            FROM public.partners
            WHERE users_ids @> ARRAY[v_auth_uid::text]
               OR users_ids @> ARRAY[v_auth_uid::uuid::text]
            ORDER BY title ASC
        ) p;
    END IF;

    RETURN json_build_object(
        'person', row_to_json(v_person),
        'partners', COALESCE(v_partners, '[]'::json)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_app_bootstrap(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_app_bootstrap(UUID) TO authenticated, service_role;
