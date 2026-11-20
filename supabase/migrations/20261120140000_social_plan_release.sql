-- T09 follow-up: release a finalized suggestion so it can be approved and finalized again.
-- PREPARED ONLY: not applied anywhere. Applying it in production needs the owner's explicit authorization.
--
-- Why a function: social_plan_action_links is immutable for the app (no UPDATE/DELETE grant),
-- so a deleted or old action is never recreated by accident. Releasing is the one deliberate
-- way back, done by an active admin for one suggestion at a time.
-- * SECURITY DEFINER with the same checks finalize_social_plan gets from RLS: active admin
--   (D1), proposal visible, partner not archived. search_path is empty.
-- * Removes only the link of the chosen suggestion; the action itself is not touched.
-- * The suggestion stays "approved" without created_action_id; the proposal goes back to
--   "draft" because there is now an approved suggestion without an action.
-- * Same optimistic version check as the other proposal writes.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE FUNCTION public.release_social_plan_suggestion(
  p_plan_id uuid,
  p_suggestion_id text,
  p_expected_version integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_actor uuid := (SELECT auth.uid());
  v_plan public.social_plans;
  v_suggestions jsonb;
BEGIN
  IF v_actor IS NULL OR NOT (SELECT public.is_active_admin()) THEN
    RAISE EXCEPTION 'PLANNING_ADMIN_REQUIRED' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_plan FROM public.social_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLANNING_PROPOSAL_UNAVAILABLE' USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1 FROM public.partners
    WHERE slug = v_plan.partner_slug AND archived = false;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLANNING_PARTNER_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  IF v_plan.version <> p_expected_version THEN
    RAISE EXCEPTION 'VERSION_CONFLICT: current version is %', v_plan.version
      USING ERRCODE = 'P0001', HINT = v_plan.version::text;
  END IF;

  DELETE FROM public.social_plan_action_links
    WHERE plan_id = v_plan.id AND suggestion_id = p_suggestion_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLANNING_NOT_FINALIZED' USING ERRCODE = '22023';
  END IF;

  SELECT coalesce(jsonb_agg(
      CASE WHEN s.value ->> 'id' = p_suggestion_id
        THEN (s.value - 'created_action_id') || jsonb_build_object('status', 'approved')
        ELSE s.value END
      ORDER BY s.ordinality), '[]'::jsonb)
    INTO v_suggestions
    FROM jsonb_array_elements(v_plan.suggestions) WITH ORDINALITY AS s;

  UPDATE public.social_plans AS plan
  SET suggestions = v_suggestions, status = 'draft', version = plan.version + 1
  WHERE plan.id = v_plan.id
  RETURNING plan.* INTO v_plan;

  RETURN jsonb_build_object(
    'plan', to_jsonb(v_plan) || jsonb_build_object('suggestions', v_suggestions)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.release_social_plan_suggestion(uuid, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_social_plan_suggestion(uuid, text, integer) TO authenticated, service_role;

COMMIT;

-- ROLLBACK PLAN:
-- DROP FUNCTION IF EXISTS public.release_social_plan_suggestion(uuid, text, integer);
