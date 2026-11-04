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

-- 2. Grants
REVOKE ALL ON TABLE public.social_plans FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_plans TO authenticated;
GRANT ALL ON TABLE public.social_plans TO service_role;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_social_plans_partner_slug ON public.social_plans(partner_slug);
CREATE INDEX IF NOT EXISTS idx_social_plans_user_id ON public.social_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_social_plans_updated_at ON public.social_plans(updated_at DESC);

-- 4. Partner authorization helper for RLS
CREATE OR REPLACE FUNCTION public.can_access_partner(p_partner_slug text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    public.is_active_admin()
    OR (
      public.is_active_member()
      AND EXISTS (
        SELECT 1 FROM public.partners p
        WHERE p.slug = p_partner_slug
          AND p.archived = false
          AND p.users_ids @> ARRAY[auth.uid()]
      )
    )
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_partner(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_partner(text) TO authenticated, service_role;

-- 5. Row Level Security policies
ALTER TABLE public.social_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_plans_select_policy ON public.social_plans;
DROP POLICY IF EXISTS social_plans_insert_policy ON public.social_plans;
DROP POLICY IF EXISTS social_plans_update_policy ON public.social_plans;
DROP POLICY IF EXISTS social_plans_delete_policy ON public.social_plans;

-- Read: Active admins or active members authorized to the partner
CREATE POLICY social_plans_select_policy ON public.social_plans
  FOR SELECT
  TO authenticated
  USING (
    public.can_access_partner(partner_slug)
  );

-- Insert: Must be the authenticated user and authorized to the partner
CREATE POLICY social_plans_insert_policy ON public.social_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_access_partner(partner_slug)
  );

-- Update: Author or admin can update; cannot alter ownership or move to unauthorized partner
CREATE POLICY social_plans_update_policy ON public.social_plans
  FOR UPDATE
  TO authenticated
  USING (
    public.is_active_admin()
    OR (public.is_active_member() AND user_id = auth.uid() AND public.can_access_partner(partner_slug))
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_access_partner(partner_slug)
  );

-- Delete: Author or admin can delete
CREATE POLICY social_plans_delete_policy ON public.social_plans
  FOR DELETE
  TO authenticated
  USING (
    public.is_active_admin()
    OR (public.is_active_member() AND user_id = auth.uid())
  );

-- 6. Trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS trg_touch_social_plans_updated_at ON public.social_plans;
CREATE TRIGGER trg_touch_social_plans_updated_at
  BEFORE UPDATE ON public.social_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 7. Compare-And-Swap (CAS) versioned update function for atomic updates
CREATE OR REPLACE FUNCTION public.update_social_plan_versioned(
  p_id uuid,
  p_expected_version integer,
  p_mode text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_input jsonb DEFAULT NULL,
  p_suggestions jsonb DEFAULT NULL
) RETURNS public.social_plans
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan public.social_plans;
BEGIN
  -- Verify plan exists
  SELECT * INTO v_plan FROM public.social_plans WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLAN_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  -- Verify access according to RLS permissions
  IF NOT (
    public.is_active_admin()
    OR (
      public.is_active_member()
      AND v_plan.user_id = auth.uid()
      AND public.can_access_partner(v_plan.partner_slug)
    )
  ) THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  -- Version verification (Compare-And-Swap)
  IF v_plan.version <> p_expected_version THEN
    RAISE EXCEPTION 'VERSION_CONFLICT: current version is %', v_plan.version
      USING ERRCODE = 'P0001', HINT = v_plan.version::text;
  END IF;

  -- Atomic update with incremented version
  UPDATE public.social_plans
  SET
    mode = COALESCE(p_mode, v_plan.mode),
    status = COALESCE(p_status, v_plan.status),
    input = COALESCE(p_input, v_plan.input),
    suggestions = COALESCE(p_suggestions, v_plan.suggestions),
    version = v_plan.version + 1,
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_plan;

  RETURN v_plan;
END;
$$;

REVOKE ALL ON FUNCTION public.update_social_plan_versioned(uuid, integer, text, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_social_plan_versioned(uuid, integer, text, text, jsonb, jsonb) TO authenticated, service_role;

COMMENT ON TABLE public.social_plans IS 'Social media planning proposals with RLS, versioning and compare-and-swap update support.';

COMMIT;
