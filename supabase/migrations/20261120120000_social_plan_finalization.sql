-- T09: convert the approved suggestions of a planning proposal into actions in one transaction.
-- PREPARED ONLY: not applied anywhere. Applying it in production needs the owner's explicit authorization.
--
-- Guarantees:
-- * One action per approved suggestion, at most once: social_plan_action_links has
--   PRIMARY KEY (plan_id, suggestion_id). The link is written in the same transaction as
--   the action and survives the action's deletion (no FK to actions), so a deleted or
--   inaccessible action is never recreated.
-- * All or nothing: the RPC runs inside the caller's transaction; any failure rolls back
--   every action, link and proposal change of the call.
-- * Concurrency: the proposal row is locked (FOR UPDATE) before eligibility is read, so a
--   second call waits and then sees the links of the first one.
-- * Retry / lost response / old tab: when every approved suggestion already has a link the
--   call writes nothing and returns the canonical proposal and its links. A stale version
--   is a conflict only while there is still something to convert.
-- * Authority comes from the database: actor = auth.uid() (active admin, D1), partner and
--   suggestions are read from the stored proposal; the caller sends only id and version.
-- * Dates (D5): every converted suggestion must have a valid scheduled_date, otherwise the
--   whole call is rejected. Hour follows "Nova ação": 11:00 in America/Sao_Paulo; when the
--   date is today there and it is 11:00 or later, now + 10 minutes.
-- * "finalized" means: finalized at least once and no approved suggestion is left without
--   an action. Pending suggestions stay pending; approving them later and finalizing
--   again converts only the new ones.
BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. Durable idempotency key: one action per suggestion of a proposal.
CREATE TABLE public.social_plan_action_links (
  plan_id uuid NOT NULL REFERENCES public.social_plans(id) ON DELETE CASCADE,
  suggestion_id text NOT NULL CHECK (char_length(suggestion_id) BETWEEN 1 AND 200),
  -- No foreign key on purpose: deleting the action keeps the link, so it is never recreated.
  action_id uuid NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_id, suggestion_id)
);

COMMENT ON TABLE public.social_plan_action_links IS
  'Planning suggestion -> created action. Primary key prevents a second action for the same suggestion; kept when the action is deleted.';

ALTER TABLE public.social_plan_action_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.social_plan_action_links FROM PUBLIC, anon, authenticated;
-- No UPDATE/DELETE for the app: links are immutable and only go away with their proposal.
GRANT SELECT, INSERT ON TABLE public.social_plan_action_links TO authenticated;
GRANT ALL ON TABLE public.social_plan_action_links TO service_role;

-- The subquery inherits the social_plans policies (active admin, operational partner).
CREATE POLICY social_plan_action_links_select ON public.social_plan_action_links
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.social_plans AS plan
    WHERE plan.id = social_plan_action_links.plan_id
  ));

CREATE POLICY social_plan_action_links_insert ON public.social_plan_action_links
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND (SELECT public.is_active_admin())
    AND EXISTS (
      SELECT 1 FROM public.social_plans AS plan
      WHERE plan.id = social_plan_action_links.plan_id
    )
  );

-- 2. Finalization. SECURITY INVOKER: the caller's grants and the RLS of social_plans,
-- actions and links apply to every read and write, as in update_social_plan_versioned.
CREATE FUNCTION public.finalize_social_plan(
  p_plan_id uuid,
  p_expected_version integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_actor uuid := (SELECT auth.uid());
  v_plan public.social_plans;
  v_now_local timestamp := now() AT TIME ZONE 'America/Sao_Paulo';
  v_now_utc timestamp := now() AT TIME ZONE 'UTC';
  v_item record;
  v_ids text[] := ARRAY[]::text[];
  v_id text;
  v_title text;
  v_format text;
  v_category text;
  v_minutes smallint;
  v_day date;
  v_action_date timestamp;
  v_briefing text;
  v_objective text;
  v_action_id uuid;
  v_approved integer := 0;
  v_created jsonb := '[]'::jsonb;
  v_links jsonb;
  v_suggestions jsonb;
BEGIN
  IF v_actor IS NULL OR NOT (SELECT public.is_active_admin()) THEN
    RAISE EXCEPTION 'PLANNING_ADMIN_REQUIRED' USING ERRCODE = '42501';
  END IF;

  -- RLS hides proposals of archived partners, so they are reported as unavailable.
  SELECT * INTO v_plan FROM public.social_plans WHERE id = p_plan_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLANNING_PROPOSAL_UNAVAILABLE' USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1 FROM public.partners
    WHERE slug = v_plan.partner_slug AND archived = false;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PLANNING_PARTNER_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  IF jsonb_typeof(v_plan.suggestions) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'PLANNING_SUGGESTION_INVALID' USING ERRCODE = '22023';
  END IF;

  -- Validate every approved suggestion that still has no action before writing anything.
  FOR v_item IN
    SELECT s.value AS suggestion, s.ordinality
    FROM jsonb_array_elements(v_plan.suggestions) WITH ORDINALITY AS s
    WHERE s.value ->> 'status' = 'approved'
    ORDER BY s.ordinality
  LOOP
    v_approved := v_approved + 1;
    v_id := v_item.suggestion ->> 'id';
    IF v_id IS NULL OR char_length(v_id) NOT BETWEEN 1 AND 200 THEN
      RAISE EXCEPTION 'PLANNING_SUGGESTION_INVALID' USING ERRCODE = '22023',
        DETAIL = format('position %s', v_item.ordinality);
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.social_plan_action_links AS link
      WHERE link.plan_id = v_plan.id AND link.suggestion_id = v_id
    ) THEN
      CONTINUE;
    END IF;
    IF v_id = ANY (v_ids) THEN
      RAISE EXCEPTION 'PLANNING_SUGGESTION_INVALID' USING ERRCODE = '22023',
        DETAIL = format('duplicate id %s', v_id);
    END IF;
    IF btrim(coalesce(v_item.suggestion ->> 'title', '')) = ''
      OR coalesce(v_item.suggestion ->> 'format', '') NOT IN ('static', 'carousel', 'reels')
    THEN
      RAISE EXCEPTION 'PLANNING_SUGGESTION_INVALID' USING ERRCODE = '22023',
        DETAIL = v_id;
    END IF;
    v_day := NULL;
    IF coalesce(v_item.suggestion ->> 'scheduled_date', '') ~ '^\d{4}-\d{2}-\d{2}$' THEN
      BEGIN
        v_day := (v_item.suggestion ->> 'scheduled_date')::date;
      EXCEPTION WHEN others THEN
        v_day := NULL;
      END;
    END IF;
    IF v_day IS NULL THEN
      RAISE EXCEPTION 'PLANNING_SUGGESTION_UNDATED' USING ERRCODE = '22023',
        DETAIL = v_id;
    END IF;
    v_ids := v_ids || v_id;
  END LOOP;

  IF v_approved = 0 THEN
    RAISE EXCEPTION 'PLANNING_NOTHING_APPROVED' USING ERRCODE = '22023';
  END IF;

  -- With nothing left to convert (retry, lost response, old tab or the second of two
  -- concurrent calls) every write is skipped and the canonical state is returned.
  IF cardinality(v_ids) > 0 THEN
    IF v_plan.version <> p_expected_version THEN
      RAISE EXCEPTION 'VERSION_CONFLICT: current version is %', v_plan.version
        USING ERRCODE = 'P0001', HINT = v_plan.version::text;
    END IF;

    FOR v_item IN
      SELECT s.value AS suggestion
      FROM jsonb_array_elements(v_plan.suggestions) WITH ORDINALITY AS s
      WHERE s.value ->> 'status' = 'approved' AND s.value ->> 'id' = ANY (v_ids)
      ORDER BY s.ordinality
    LOOP
      v_id := v_item.suggestion ->> 'id';
      v_title := btrim(v_item.suggestion ->> 'title');
      v_format := v_item.suggestion ->> 'format';
      -- Category and its default duration (CATEGORIES in app/lib/CONSTANTS.ts).
      v_category := CASE v_format WHEN 'reels' THEN 'reels' WHEN 'carousel' THEN 'carousel' ELSE 'post' END;
      v_minutes := CASE v_category WHEN 'reels' THEN 40 WHEN 'carousel' THEN 50 ELSE 30 END;
      v_day := (v_item.suggestion ->> 'scheduled_date')::date;
      v_action_date := CASE
        WHEN v_day = v_now_local::date AND extract(hour FROM v_now_local) >= 11
          THEN date_trunc('second', v_now_local + interval '10 minutes')
        ELSE v_day + time '11:00'
      END;
      v_briefing := coalesce(v_item.suggestion ->> 'briefing', '');
      v_objective := btrim(coalesce(v_item.suggestion ->> 'objective', ''));

      INSERT INTO public.actions (
        title, description, content_description, date, category, time, priority, phase,
        partners, responsibles, user_id, color, topic_id, archived, created_at, updated_at
      ) VALUES (
        v_title,
        CASE WHEN v_objective = '' THEN v_briefing
          ELSE v_briefing || E'\n\nObjetivo: ' || v_objective END,
        v_briefing,
        v_action_date,
        v_category,
        v_minutes,
        'medium',
        'do',
        ARRAY[v_plan.partner_slug],
        ARRAY[v_actor],
        v_actor,
        '#999999',
        NULL,
        false,
        v_now_utc,
        v_now_utc
      ) RETURNING id INTO v_action_id;

      INSERT INTO public.social_plan_action_links (plan_id, suggestion_id, action_id, created_by)
        VALUES (v_plan.id, v_id, v_action_id, v_actor);

      v_created := v_created || jsonb_build_object('suggestion_id', v_id, 'action_id', v_action_id);
    END LOOP;
  END IF;

  -- Each linked suggestion carries its canonical created_action_id.
  SELECT coalesce(jsonb_agg(
      CASE WHEN link.action_id IS NULL THEN s.value - 'created_action_id'
        ELSE s.value || jsonb_build_object('created_action_id', link.action_id::text) END
      ORDER BY s.ordinality), '[]'::jsonb),
    coalesce(jsonb_agg(jsonb_build_object(
      'suggestion_id', link.suggestion_id, 'action_id', link.action_id)
      ORDER BY s.ordinality) FILTER (WHERE link.action_id IS NOT NULL), '[]'::jsonb)
    INTO v_suggestions, v_links
    FROM jsonb_array_elements(v_plan.suggestions) WITH ORDINALITY AS s
    LEFT JOIN public.social_plan_action_links AS link
      ON link.plan_id = v_plan.id AND link.suggestion_id = s.value ->> 'id';

  IF cardinality(v_ids) > 0 THEN
    UPDATE public.social_plans AS plan
    SET suggestions = v_suggestions, status = 'finalized', version = plan.version + 1
    WHERE plan.id = v_plan.id
    RETURNING plan.* INTO v_plan;
  END IF;

  RETURN jsonb_build_object(
    'plan', to_jsonb(v_plan) || jsonb_build_object('suggestions', v_suggestions),
    'created', v_created,
    'links', v_links
  );
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_social_plan(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalize_social_plan(uuid, integer) TO authenticated, service_role;

COMMIT;

-- ROLLBACK PLAN (only before any proposal is finalized with this RPC; links are the idempotency record):
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.finalize_social_plan(uuid, integer);
-- DROP TABLE IF EXISTS public.social_plan_action_links;
-- COMMIT;
