BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. Table structure
CREATE TABLE IF NOT EXISTS public.social_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL REFERENCES public.partners(slug) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('theme', 'period')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Data API grants. RLS further limits authenticated access to active admins.
REVOKE ALL ON TABLE public.social_plans FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.social_plans TO authenticated;
GRANT UPDATE (mode, status, input, suggestions, version) ON public.social_plans TO authenticated;
GRANT ALL ON TABLE public.social_plans TO service_role;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_social_plans_partner_slug ON public.social_plans(partner_slug);
CREATE INDEX IF NOT EXISTS idx_social_plans_user_id ON public.social_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_social_plans_updated_at ON public.social_plans(updated_at DESC);

-- 4. Scope planning to active administrators and operational partners.
ALTER TABLE public.social_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_plans_select_policy ON public.social_plans;
DROP POLICY IF EXISTS social_plans_insert_policy ON public.social_plans;
DROP POLICY IF EXISTS social_plans_update_policy ON public.social_plans;
DROP POLICY IF EXISTS social_plans_delete_policy ON public.social_plans;
DROP POLICY IF EXISTS social_plans_admin_scope ON public.social_plans;

CREATE POLICY social_plans_admin_scope ON public.social_plans
  AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (
    (SELECT public.is_active_admin())
    AND EXISTS (
      SELECT 1 FROM public.partners AS partner
      WHERE partner.slug = social_plans.partner_slug AND partner.archived = false
    )
  );

CREATE POLICY social_plans_select_policy ON public.social_plans
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY social_plans_insert_policy ON public.social_plans
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY social_plans_update_policy ON public.social_plans
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY social_plans_delete_policy ON public.social_plans
  FOR DELETE TO authenticated
  USING (true);

-- 5. Track the server time of the last update.
DROP TRIGGER IF EXISTS trg_touch_social_plans_updated_at ON public.social_plans;
CREATE TRIGGER trg_touch_social_plans_updated_at
  BEFORE UPDATE ON public.social_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 6. Use the caller's permissions and compare the version in the update itself.
CREATE OR REPLACE FUNCTION public.update_social_plan_versioned(
  p_id uuid,
  p_expected_version integer,
  p_mode text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_input jsonb DEFAULT NULL,
  p_suggestions jsonb DEFAULT NULL
) RETURNS public.social_plans
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_plan public.social_plans;
  v_current_version integer;
BEGIN
  IF NOT (SELECT public.is_active_admin()) THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  UPDATE public.social_plans AS plan
  SET
    mode = COALESCE(p_mode, plan.mode),
    status = COALESCE(p_status, plan.status),
    input = COALESCE(p_input, plan.input),
    suggestions = COALESCE(p_suggestions, plan.suggestions),
    version = plan.version + 1
  WHERE plan.id = p_id AND plan.version = p_expected_version
  RETURNING plan.* INTO v_plan;

  IF FOUND THEN
    RETURN v_plan;
  END IF;

  SELECT version INTO v_current_version FROM public.social_plans WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLAN_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  RAISE EXCEPTION 'VERSION_CONFLICT: current version is %', v_current_version
    USING ERRCODE = 'P0001', HINT = v_current_version::text;
END;
$$;

REVOKE ALL ON FUNCTION public.update_social_plan_versioned(uuid, integer, text, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_social_plan_versioned(uuid, integer, text, text, jsonb, jsonb) TO authenticated, service_role;

COMMENT ON TABLE public.social_plans IS 'Social media planning proposals with RLS, versioning and compare-and-swap update support.';

COMMIT;
