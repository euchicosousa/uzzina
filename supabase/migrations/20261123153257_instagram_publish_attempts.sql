-- Applied to production project dfepmjcozszswocwvdpq on 2026-11-23
-- and recorded as migration 20261123153257.
BEGIN;
CREATE TABLE public.instagram_publish_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  started_by uuid NOT NULL,
  profile_username text NOT NULL,
  format text NOT NULL CHECK (format IN ('feed', 'video', 'reel', 'stories')),
  files jsonb NOT NULL,
  caption text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'uncertain', 'partial')),
  phase text NOT NULL DEFAULT 'preparing' CHECK (phase IN ('preparing', 'sending', 'finished')),
  current_container_id text,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- A worker crash must leave the action blocked, rather than enable a duplicate.
CREATE UNIQUE INDEX instagram_publish_one_unresolved_per_action_partner
  ON public.instagram_publish_attempts(action_id, partner_id)
  WHERE status IN ('pending', 'uncertain', 'partial');
CREATE INDEX instagram_publish_action_partner_history
  ON public.instagram_publish_attempts(action_id, partner_id, created_at DESC);
ALTER TABLE public.instagram_publish_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.instagram_publish_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.instagram_publish_attempts TO service_role;
COMMIT;
