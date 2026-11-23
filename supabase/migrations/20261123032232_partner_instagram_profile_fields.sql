-- Store only the public profile fields returned by Instagram's Graph API.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.partner_instagram_connections
  ADD COLUMN profile_name text,
  ADD COLUMN biography text,
  ADD COLUMN website text,
  ADD COLUMN profile_picture_url text,
  ADD COLUMN media_count integer,
  ADD CONSTRAINT partner_instagram_connections_media_count_check
    CHECK (media_count IS NULL OR media_count >= 0);

COMMENT ON COLUMN public.partner_instagram_connections.profile_picture_url IS
  'Public Instagram profile image URL; image bytes are not copied into UZZINA.';

CREATE FUNCTION public.save_partner_instagram_connection(
  p_partner_id uuid,
  p_connected_account_id text,
  p_composio_user_id text,
  p_profile_username text,
  p_profile_name text,
  p_biography text,
  p_website text,
  p_profile_picture_url text,
  p_media_count integer
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_saved_count integer;
BEGIN
  IF p_connected_account_id IS NULL OR p_connected_account_id = ''
    OR p_composio_user_id IS NULL OR p_composio_user_id = ''
    OR p_profile_username IS NULL OR p_profile_username = ''
    OR p_profile_name IS NOT NULL AND length(p_profile_name) > 255
    OR p_biography IS NOT NULL AND length(p_biography) > 2200
    OR p_website IS NOT NULL AND length(p_website) > 2048
    OR p_profile_picture_url IS NOT NULL AND (
      length(p_profile_picture_url) > 4096
      OR p_profile_picture_url !~ '^https://'
    )
    OR p_media_count IS NOT NULL AND p_media_count < 0
  THEN
    RAISE EXCEPTION 'INVALID_INSTAGRAM_CONNECTION' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.partners AS p
  WHERE p.id = p_partner_id
    AND p.archived IS NOT TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PARTNER_NOT_FOUND_OR_ARCHIVED' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.partner_instagram_connections AS previous
  SET is_current = false,
      status = 'superseded',
      updated_at = now()
  WHERE previous.partner_id = p_partner_id
    AND previous.is_current
    AND previous.connected_account_id <> p_connected_account_id;

  INSERT INTO public.partner_instagram_connections AS existing (
    partner_id,
    connected_account_id,
    composio_user_id,
    profile_username,
    profile_name,
    biography,
    website,
    profile_picture_url,
    media_count,
    status,
    is_current,
    connected_at,
    updated_at
  ) VALUES (
    p_partner_id,
    p_connected_account_id,
    p_composio_user_id,
    p_profile_username,
    p_profile_name,
    p_biography,
    p_website,
    p_profile_picture_url,
    p_media_count,
    'active',
    true,
    now(),
    now()
  )
  ON CONFLICT (connected_account_id) DO UPDATE
  SET composio_user_id = EXCLUDED.composio_user_id,
      profile_username = EXCLUDED.profile_username,
      profile_name = EXCLUDED.profile_name,
      biography = EXCLUDED.biography,
      website = EXCLUDED.website,
      profile_picture_url = EXCLUDED.profile_picture_url,
      media_count = EXCLUDED.media_count,
      status = 'active',
      is_current = true,
      updated_at = now()
  WHERE existing.partner_id = EXCLUDED.partner_id
    AND existing.composio_user_id = EXCLUDED.composio_user_id;

  GET DIAGNOSTICS v_saved_count = ROW_COUNT;
  IF v_saved_count <> 1 THEN
    RAISE EXCEPTION 'INSTAGRAM_CONNECTION_OWNERSHIP_MISMATCH' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.save_partner_instagram_connection(
  uuid, text, text, text, text, text, text, text, integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_partner_instagram_connection(
  uuid, text, text, text, text, text, text, text, integer
) TO service_role;

COMMIT;
