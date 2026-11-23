-- GREATEST and LEAST are SQL special expressions, not pg_catalog functions.
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
