BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.partners
  ADD COLUMN planning_instructions text;

COMMENT ON COLUMN public.partners.planning_instructions IS
  'Optional reusable social planning instructions for this brand. Null means no saved instructions. Existing partner access policies apply.';

COMMIT;
