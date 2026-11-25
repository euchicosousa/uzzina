-- Let create_instagram_schedule_batch accept every supported action format
-- and keep the caption (Stories always store an empty one).
-- Apply only after the application changes have been reviewed and coordinated.
BEGIN;

-- The existing CHECK (format <> 'stories' OR caption = '') never blocked feed
-- formats and still guards Stories, so it stays; only the RPC changes.
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
  IF p_format NOT IN ('feed', 'video', 'reel', 'stories') THEN
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
    p_profile_username, p_format, p_files, CASE WHEN p_format = 'stories' THEN '' ELSE coalesce(p_caption, '') END, p_timezone
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

COMMIT;
