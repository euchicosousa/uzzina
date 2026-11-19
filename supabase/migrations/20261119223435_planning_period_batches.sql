BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.planning_theme_requests
  ADD COLUMN progress jsonb,
  ADD COLUMN batch_started_at timestamptz,
  ADD CONSTRAINT planning_theme_requests_progress_is_array
    CHECK (progress IS NULL OR jsonb_typeof(progress) = 'array');

CREATE OR REPLACE FUNCTION public.complete_planning_theme_request(p_id uuid, p_user_id uuid)
RETURNS public.social_plans
LANGUAGE plpgsql SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  operation public.planning_theme_requests;
  proposal public.social_plans;
BEGIN
  SELECT * INTO operation
    FROM public.planning_theme_requests
    WHERE id = p_id AND user_id = p_user_id
    FOR UPDATE;

  IF NOT FOUND OR operation.state NOT IN ('ready', 'completed') THEN
    RAISE EXCEPTION 'PLANNING_RESULT_UNAVAILABLE' USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1 FROM public.people
    WHERE user_id = p_user_id AND admin = true AND visible = true
    FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLANNING_ADMIN_REQUIRED' USING ERRCODE = '42501';
  END IF;
  PERFORM 1 FROM public.partners
    WHERE slug = operation.partner_slug AND archived = false
    FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLANNING_PARTNER_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  IF operation.state = 'completed' THEN
    SELECT * INTO proposal FROM public.social_plans
      WHERE id = operation.proposal_id
        AND partner_slug = operation.partner_slug
        AND user_id = operation.user_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'PLANNING_PROPOSAL_UNAVAILABLE' USING ERRCODE = 'P0002';
    END IF;
    RETURN proposal;
  END IF;

  INSERT INTO public.social_plans (id, user_id, partner_slug, mode, input, suggestions)
    VALUES (operation.proposal_id, operation.user_id, operation.partner_slug,
            CASE WHEN operation.input ->> 'planningMode' = 'period'
              THEN 'period' ELSE 'theme' END,
            operation.input - 'editorialSource', operation.suggestions)
    RETURNING * INTO proposal;

  UPDATE public.planning_theme_requests
    SET state = 'completed', suggestions = NULL, progress = NULL
    WHERE id = operation.id;

  RETURN proposal;
END;
$$;

COMMIT;
