-- Keep a Reel's prepared container between scheduler invocations.
ALTER TABLE public.instagram_scheduled_publications
  DROP CONSTRAINT instagram_scheduled_publications_status_check,
  ADD CONSTRAINT instagram_scheduled_publications_status_check CHECK (
    status IN ('scheduled', 'preparing', 'processing', 'published', 'failed', 'uncertain', 'partial', 'cancelled')
  );

CREATE OR REPLACE FUNCTION public.claim_instagram_scheduled_publications(
  p_limit integer,
  p_resume_preparing boolean
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
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('uzzina:instagram-scheduler-claim')::bigint
  );

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
    WHERE (
        (p.status = 'scheduled' AND p.scheduled_at <= pg_catalog.clock_timestamp())
        OR (
          p_resume_preparing
          AND p.status = 'preparing'
          AND pg_catalog.date_trunc('minute', p.updated_at)
            < pg_catalog.date_trunc('minute', pg_catalog.statement_timestamp())
        )
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.instagram_publish_attempts AS a
        WHERE a.action_id = b.action_id
          AND a.partner_id = b.partner_id
          AND a.status IN ('pending', 'uncertain', 'partial')
          AND a.id IS DISTINCT FROM p.attempt_id
      )
    ORDER BY (p.status = 'preparing') DESC, p.scheduled_at, p.id
    FOR UPDATE OF p SKIP LOCKED
    LIMIT greatest(1, least(p_limit, 5))
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

REVOKE ALL ON FUNCTION public.claim_instagram_scheduled_publications(integer, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_instagram_scheduled_publications(integer, boolean)
  TO service_role;

-- Older workers can continue to claim new work during rollout.
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.claim_instagram_scheduled_publications(p_limit, false);
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
      AND (
        p_status IN ('published', 'failed', 'uncertain', 'partial')
        OR (
          p_status = 'preparing'
          AND p_results = '[]'::jsonb
          AND (attempt_id IS NULL OR attempt_id = p_attempt_id)
          AND EXISTS (
            SELECT 1
            FROM public.instagram_publish_attempts AS a
            JOIN public.instagram_schedule_batches AS b ON b.id = instagram_scheduled_publications.batch_id
            WHERE a.id = p_attempt_id
              AND b.format = 'reel'
              AND a.format = b.format
              AND a.action_id = b.action_id
              AND a.partner_id = b.partner_id
              AND a.status = 'pending'
              AND a.phase = 'preparing'
              AND a.current_container_id IS NOT NULL
              AND a.results = '[]'::jsonb
          )
        )
      )
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM changed);
$$;
