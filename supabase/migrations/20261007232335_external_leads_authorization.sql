-- Deploy the external lead API before this migration in production.
-- Requires the authorization helpers from 20261006030000_database_authorization.sql.
-- Public creation/editing now goes through the lead application's server API.
DO $$ DECLARE policy RECORD; columns TEXT; BEGIN
  IF to_regprocedure('public.is_active_member()') IS NULL THEN
    RAISE EXCEPTION 'Apply compatible member authorization before leads hardening';
  END IF;
  FOR policy IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='leads'
  LOOP EXECUTE format('DROP POLICY %I ON public.leads', policy.policyname); END LOOP;
  SELECT string_agg(format('%I', column_name), ',') INTO columns
    FROM information_schema.columns WHERE table_schema='public' AND table_name='leads';
  EXECUTE format('REVOKE SELECT (%s), INSERT (%s), UPDATE (%s), REFERENCES (%s) ON public.leads FROM PUBLIC, anon, authenticated', columns, columns, columns, columns);
END $$;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.leads FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO service_role;
-- Preserve the existing team-wide read screen; visitors and inactive members cannot read.
CREATE POLICY leads_select_active_members ON public.leads FOR SELECT TO authenticated
  USING ((SELECT public.is_active_member()));
