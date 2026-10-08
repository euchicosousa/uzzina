-- The admin form creates Auth credentials first, then inserts complete people data.
-- Retire only the verified legacy trigger writing to the absent profiles table.
DO $$
DECLARE v_definition TEXT;
BEGIN
  SELECT pg_get_functiondef(t.tgfoid) INTO v_definition
  FROM pg_trigger t
  WHERE t.tgrelid = 'auth.users'::regclass AND t.tgname = 'on_auth_user_created' AND NOT t.tgisinternal;
  IF v_definition IS NOT NULL AND to_regclass('public.profiles') IS NULL THEN
    IF v_definition NOT LIKE '%INSERT INTO public.profiles%' THEN
      RAISE EXCEPTION 'Unknown auth user trigger; inspect before applying';
    END IF;
    DROP TRIGGER on_auth_user_created ON auth.users;
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
