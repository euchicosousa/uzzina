BEGIN;
SET LOCAL lock_timeout = '5s';

ALTER TABLE public.celebrations
  ADD COLUMN is_holiday boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.celebrations.is_holiday IS
  'Whether this celebration is classified as a holiday. Existing entries default to false; no classification is inferred.';

COMMIT;
