-- Default Instagram posting times per partner: one for the feed (static post,
-- carousel and reel) and one for Stories. Existing partners get the defaults.
-- Writes stay limited to admins by the existing partners_write_admin_only policy.
BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.partners
  ADD COLUMN instagram_feed_time time NOT NULL DEFAULT '17:00',
  ADD COLUMN instagram_stories_time time NOT NULL DEFAULT '08:00';

COMMENT ON COLUMN public.partners.instagram_feed_time IS
  'Default posting time for feed publications (post, carousel, reel).';
COMMENT ON COLUMN public.partners.instagram_stories_time IS
  'Default posting time for Stories.';

COMMIT;
