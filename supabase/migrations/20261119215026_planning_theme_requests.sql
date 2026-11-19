BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.planning_theme_requests (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_slug text NOT NULL REFERENCES public.partners(slug) ON DELETE CASCADE,
  proposal_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  input jsonb NOT NULL,
  state text NOT NULL DEFAULT 'running'
    CHECK (state IN ('running', 'ready', 'completed', 'failed')),
  suggestions jsonb,
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((state = 'ready') = (suggestions IS NOT NULL)),
  CHECK ((state = 'failed') = (failure_code IS NOT NULL))
);

CREATE INDEX planning_theme_requests_user_idx
  ON public.planning_theme_requests (user_id);
CREATE INDEX planning_theme_requests_partner_idx
  ON public.planning_theme_requests (partner_slug);

ALTER TABLE public.planning_theme_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.planning_theme_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.planning_theme_requests TO service_role;

CREATE FUNCTION public.complete_planning_theme_request(p_id uuid, p_user_id uuid)
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
            'theme', operation.input, operation.suggestions)
    RETURNING * INTO proposal;

  UPDATE public.planning_theme_requests
    SET state = 'completed', suggestions = NULL
    WHERE id = operation.id;

  RETURN proposal;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_planning_theme_request(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_planning_theme_request(uuid, uuid)
  TO service_role;

COMMIT;
