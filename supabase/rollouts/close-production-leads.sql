-- Manual, isolated rollout after the public lead API has passed HTTPS tests.
-- Run the complete transaction in the CURRENT production project's SQL Editor.
-- Does not change people policies, create helpers, or delete lead records.
-- Reads membership through the existing people SELECT/RLS contract.
-- Never run the entire audit migration package just to apply this file.
BEGIN;

DO $$ DECLARE policy RECORD; columns TEXT; BEGIN
  IF to_regclass('public.leads') IS NULL OR to_regclass('public.people') IS NULL THEN
    RAISE EXCEPTION 'Required leads/people tables are absent';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='people' AND column_name='user_id' AND data_type='uuid')
     OR NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='people' AND column_name='visible' AND data_type='boolean') THEN
    RAISE EXCEPTION 'Unexpected membership columns; stop rollout';
  END IF;
  IF NOT has_table_privilege('authenticated', 'public.people', 'SELECT') THEN
    RAISE EXCEPTION 'Team membership read access is missing; stop rollout';
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
CREATE POLICY leads_select_active_members ON public.leads FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.people member
    WHERE member.user_id = (SELECT auth.uid()) AND member.visible = true
  ));

COMMIT;
