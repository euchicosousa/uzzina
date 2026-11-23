-- Prepared locally only. This migration is not applied to Supabase production.
-- Stores server-managed Composio account references and one-time OAuth attempts.
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE public.partner_instagram_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  connected_account_id text NOT NULL UNIQUE,
  composio_user_id text NOT NULL,
  profile_username text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'attention', 'revoked', 'superseded')),
  is_current boolean NOT NULL DEFAULT false,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX partner_instagram_connections_one_current_per_partner
  ON public.partner_instagram_connections (partner_id)
  WHERE is_current;
CREATE INDEX partner_instagram_connections_partner_history_idx
  ON public.partner_instagram_connections (partner_id, connected_at DESC);

COMMENT ON TABLE public.partner_instagram_connections IS
  'Composio connected-account references for Instagram partners; OAuth credentials remain with Composio.';

ALTER TABLE public.partner_instagram_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.partner_instagram_connections
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.partner_instagram_connections TO service_role;

CREATE TABLE public.partner_instagram_connection_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  started_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state_hash text NOT NULL,
  connected_account_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT partner_instagram_attempt_state_hash_check
    CHECK (state_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX partner_instagram_attempts_partner_status_idx
  ON public.partner_instagram_connection_attempts (partner_id, status, expires_at);
CREATE INDEX partner_instagram_attempts_initiator_idx
  ON public.partner_instagram_connection_attempts (started_by, created_at DESC);
CREATE UNIQUE INDEX partner_instagram_attempts_one_pending_per_partner
  ON public.partner_instagram_connection_attempts (partner_id)
  WHERE status = 'pending';

COMMENT ON TABLE public.partner_instagram_connection_attempts IS
  'One-time, admin-initiated OAuth attempts bound to a partner and Composio connection ID.';

ALTER TABLE public.partner_instagram_connection_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.partner_instagram_connection_attempts
  FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.partner_instagram_connection_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.save_partner_instagram_connection(
  p_partner_id uuid,
  p_connected_account_id text,
  p_composio_user_id text,
  p_profile_username text
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
    status,
    is_current,
    connected_at,
    updated_at
  ) VALUES (
    p_partner_id,
    p_connected_account_id,
    p_composio_user_id,
    p_profile_username,
    'active',
    true,
    now(),
    now()
  )
  ON CONFLICT (connected_account_id) DO UPDATE
  SET composio_user_id = EXCLUDED.composio_user_id,
      profile_username = EXCLUDED.profile_username,
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

REVOKE ALL ON FUNCTION public.save_partner_instagram_connection(uuid, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_partner_instagram_connection(uuid, text, text, text)
  TO service_role;

COMMIT;
