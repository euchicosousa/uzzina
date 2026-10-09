-- Keep trigger bodies and bindings intact; browsers do not call these as RPCs.
BEGIN;

ALTER FUNCTION public.handle_actions_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at() SET search_path = '';

-- Fresh staging has no retired Auth function; never recreate it.
DO $$ BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.handle_actions_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

COMMIT;
