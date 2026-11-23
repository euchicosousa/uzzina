-- Applied to production project dfepmjcozszswocwvdpq on 2026-11-23
-- and recorded remotely as migration 20261123190136.
BEGIN;

-- Create a batch and all of its date occurrences atomically. The API performs
-- the user/action/connection checks before calling this service-only RPC.
CREATE OR REPLACE FUNCTION public.create_instagram_schedule_batch(
  p_action_id uuid,
  p_partner_id uuid,
  p_created_by uuid,
  p_connected_account_id text,
  p_profile_username text,
  p_format text,
  p_files jsonb,
  p_caption text,
  p_timezone text,
  p_scheduled_at timestamptz[]
)
RETURNS SETOF public.instagram_scheduled_publications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_batch_id uuid;
BEGIN
  IF p_format <> 'stories' THEN
    RAISE EXCEPTION 'UNSUPPORTED_FORMAT';
  END IF;
  IF cardinality(p_scheduled_at) NOT BETWEEN 1 AND 10
     OR EXISTS (
       SELECT 1 FROM unnest(p_scheduled_at) AS item
       WHERE item IS NULL OR item <= pg_catalog.clock_timestamp()
     )
     OR (SELECT count(DISTINCT item) FROM unnest(p_scheduled_at) AS item)
       <> cardinality(p_scheduled_at) THEN
    RAISE EXCEPTION 'INVALID_SCHEDULE_DATES';
  END IF;

  INSERT INTO public.instagram_schedule_batches (
    action_id, partner_id, created_by, connected_account_id,
    profile_username, format, files, caption, timezone
  ) VALUES (
    p_action_id, p_partner_id, p_created_by, p_connected_account_id,
    p_profile_username, p_format, p_files, '', p_timezone
  ) RETURNING id INTO v_batch_id;

  RETURN QUERY
  INSERT INTO public.instagram_scheduled_publications (
    batch_id, ordinal, scheduled_at
  )
  SELECT v_batch_id, row_number() OVER (ORDER BY item), item
  FROM unnest(p_scheduled_at) AS item
  ORDER BY item
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.create_instagram_schedule_batch(
  uuid, uuid, uuid, text, text, text, jsonb, text, text, timestamptz[]
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_instagram_schedule_batch(
  uuid, uuid, uuid, text, text, text, jsonb, text, text, timestamptz[]
) TO service_role;

-- A stale processing claim is marked uncertain rather than retried: Meta may
-- already have accepted the publish request before the worker timed out.
CREATE OR REPLACE FUNCTION public.claim_instagram_scheduled_publications(
  p_limit integer DEFAULT 1
)
RETURNS TABLE (
  publication_id uuid,
  claim_token uuid,
  batch_id uuid,
  ordinal smallint,
  scheduled_at timestamptz,
  action_id uuid,
  partner_id uuid,
  created_by uuid,
  connected_account_id text,
  profile_username text,
  format text,
  files jsonb,
  caption text,
  timezone text,
  attempt_id uuid,
  results jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.instagram_publish_attempts AS a
  SET status = 'uncertain',
      phase = 'sending',
      detail = 'O executor parou após reservar a publicação. Confira o Instagram antes de tentar novamente.',
      updated_at = pg_catalog.clock_timestamp()
  FROM public.instagram_scheduled_publications AS p
  WHERE p.status = 'processing'
    AND p.claimed_at < pg_catalog.clock_timestamp() - interval '5 minutes'
    AND p.attempt_id = a.id
    AND a.status IN ('pending', 'uncertain');

  UPDATE public.instagram_scheduled_publications AS p
  SET status = 'uncertain',
      detail = 'O executor parou após reservar a publicação. Confira o Instagram antes de tentar novamente.',
      claim_token = NULL,
      claimed_at = NULL,
      updated_at = pg_catalog.clock_timestamp()
  WHERE p.status = 'processing'
    AND p.claimed_at < pg_catalog.clock_timestamp() - interval '5 minutes';

  -- Keep only one Composio publication request active across all partners.
  -- Cron invocations that overlap the current worker safely claim nothing.
  IF EXISTS (
    SELECT 1
    FROM public.instagram_scheduled_publications AS p
    WHERE p.status = 'processing'
      AND p.claimed_at >= pg_catalog.clock_timestamp() - interval '5 minutes'
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH picked AS (
    SELECT p.id
    FROM public.instagram_scheduled_publications AS p
    JOIN public.instagram_schedule_batches AS b ON b.id = p.batch_id
    WHERE p.status = 'scheduled'
      AND p.scheduled_at <= pg_catalog.clock_timestamp()
      AND NOT EXISTS (
        SELECT 1
        FROM public.instagram_publish_attempts AS a
        WHERE a.action_id = b.action_id
          AND a.partner_id = b.partner_id
          AND a.status IN ('pending', 'uncertain', 'partial')
      )
    ORDER BY p.scheduled_at, p.id
    FOR UPDATE SKIP LOCKED
    LIMIT pg_catalog.greatest(1, pg_catalog.least(p_limit, 5))
  ), claimed AS (
    UPDATE public.instagram_scheduled_publications AS p
    SET status = 'processing',
        claim_token = gen_random_uuid(),
        claimed_at = pg_catalog.clock_timestamp(),
        updated_at = pg_catalog.clock_timestamp()
    FROM picked
    WHERE p.id = picked.id
    RETURNING p.*
  )
  SELECT c.id, c.claim_token, b.id, c.ordinal, c.scheduled_at,
         b.action_id, b.partner_id, b.created_by, b.connected_account_id,
         b.profile_username, b.format, b.files, b.caption, b.timezone,
         c.attempt_id, c.results
  FROM claimed AS c
  JOIN public.instagram_schedule_batches AS b ON b.id = c.batch_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.finish_instagram_scheduled_publication(
  p_publication_id uuid,
  p_claim_token uuid,
  p_status text,
  p_attempt_id uuid,
  p_results jsonb,
  p_detail text DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH changed AS (
    UPDATE public.instagram_scheduled_publications
    SET status = p_status,
        attempt_id = p_attempt_id,
        results = p_results,
        detail = p_detail,
        claim_token = NULL,
        claimed_at = NULL,
        updated_at = pg_catalog.clock_timestamp()
    WHERE id = p_publication_id
      AND claim_token = p_claim_token
      AND status = 'processing'
      AND p_status IN ('published', 'failed', 'uncertain', 'partial')
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM changed);
$$;

REVOKE ALL ON FUNCTION public.claim_instagram_scheduled_publications(integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_instagram_scheduled_publications(integer)
  TO service_role;
REVOKE ALL ON FUNCTION public.finish_instagram_scheduled_publication(
  uuid, uuid, text, uuid, jsonb, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_instagram_scheduled_publication(
  uuid, uuid, text, uuid, jsonb, text
) TO service_role;

COMMIT;
