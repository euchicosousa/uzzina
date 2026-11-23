-- Applied to production project dfepmjcozszswocwvdpq on 2026-11-23
-- and recorded as migration 20261123153317. Application and worker
-- authorization are not part of this migration.
BEGIN;

-- One batch holds the exact content confirmed for up to ten independent dates.
CREATE TABLE public.instagram_schedule_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  created_by uuid NOT NULL,
  connected_account_id text NOT NULL CHECK (length(connected_account_id) BETWEEN 1 AND 255),
  profile_username text NOT NULL CHECK (length(profile_username) BETWEEN 1 AND 31),
  format text NOT NULL CHECK (format IN ('feed', 'video', 'reel', 'stories')),
  files jsonb NOT NULL CHECK (
    CASE WHEN jsonb_typeof(files) = 'array'
      THEN jsonb_array_length(files) BETWEEN 1 AND 20
      ELSE false END
  ),
  caption text NOT NULL DEFAULT '' CHECK (char_length(caption) <= 2200),
  timezone text NOT NULL CHECK (length(timezone) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (format <> 'stories' OR caption = '')
);

-- Ordinal and the unique batch key bound each batch to ten occurrences.
CREATE TABLE public.instagram_scheduled_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.instagram_schedule_batches(id) ON DELETE RESTRICT,
  ordinal smallint NOT NULL CHECK (ordinal BETWEEN 1 AND 10),
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'processing', 'published', 'failed', 'uncertain', 'partial', 'cancelled'
  )),
  claim_token uuid,
  claimed_at timestamptz,
  attempt_id uuid,
  results jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(results) = 'array'),
  detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (batch_id, ordinal),
  UNIQUE (batch_id, scheduled_at),
  CHECK (scheduled_at > created_at),
  CHECK ((claim_token IS NULL) = (claimed_at IS NULL))
);

CREATE INDEX instagram_scheduled_publications_due
  ON public.instagram_scheduled_publications (scheduled_at, id)
  WHERE status = 'scheduled';
CREATE INDEX instagram_schedule_batches_action_partner
  ON public.instagram_schedule_batches (action_id, partner_id, created_at DESC);

ALTER TABLE public.instagram_schedule_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_scheduled_publications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.instagram_schedule_batches FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.instagram_scheduled_publications FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.instagram_schedule_batches TO service_role;
GRANT ALL ON public.instagram_scheduled_publications TO service_role;

COMMIT;
