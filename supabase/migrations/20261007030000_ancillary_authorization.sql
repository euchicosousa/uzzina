-- Completes catalog findings for the exported PostgreSQL15 baseline.
-- Leads DML/policies intentionally remain pending: external form uses direct insert/update.
BEGIN;
DO $$ DECLARE target TEXT; BEGIN
 FOREACH target IN ARRAY ARRAY['actions','people','partners','clients','action_comments','notifications','celebrations','leads'] LOOP
  EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM PUBLIC, anon, authenticated',target);
 END LOOP;
END $$;
-- Defaults for application objects created by their observed owner, postgres.
-- Platform-owned supabase_admin defaults need a separate permission/ownership review.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

DO $$ DECLARE policy RECORD; BEGIN
 FOR policy IN SELECT tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('notifications','celebrations') LOOP
  EXECUTE format('DROP POLICY %I ON public.%I',policy.policyname,policy.tablename);
 END LOOP;
END $$;
ALTER TABLE public.celebrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.celebrations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.celebrations TO authenticated;
CREATE POLICY celebrations_read_members ON public.celebrations FOR SELECT TO authenticated USING(public.is_active_member());
CREATE POLICY celebrations_manage_admin ON public.celebrations FOR ALL TO authenticated USING(public.is_active_admin()) WITH CHECK(public.is_active_admin());

-- A sender may notify only an actual mention in their own team comment, to a
-- visible member authorized for this action. Never trust recipient IDs alone.
CREATE OR REPLACE FUNCTION public.can_notify_mention(p_comment_id UUID,p_action_id UUID,p_recipient_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT public.is_active_member() AND public.can_access_action(p_action_id) AND EXISTS(
  SELECT 1 FROM public.action_comments c
  JOIN public.actions a ON a.id=c.action_id
  JOIN public.people recipient ON recipient.user_id=p_recipient_id AND recipient.visible=true
  WHERE c.id=p_comment_id AND c.action_id=p_action_id AND c.is_user=true
   AND c.author_id=auth.uid()::text AND p_recipient_id<>auth.uid()
   AND c.mentions @> ARRAY[p_recipient_id]
   AND (recipient.admin=true OR (
    a.responsibles @> ARRAY[p_recipient_id] AND EXISTS(
     SELECT 1 FROM public.partners p WHERE p.slug=ANY(a.partners) AND p.archived=false AND p.users_ids @> ARRAY[p_recipient_id]
    )
   ))
 );
$$;
REVOKE ALL ON FUNCTION public.can_notify_mention(UUID,UUID,UUID) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_notify_mention(UUID,UUID,UUID) TO authenticated;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notifications FROM PUBLIC, anon, authenticated;
-- Remove any legacy per-column UPDATE grants before allowing read_at only.
DO $$ DECLARE columns TEXT; BEGIN
 SELECT string_agg(format('%I',column_name),',') INTO columns FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications';
 EXECUTE format('REVOKE UPDATE (%s) ON public.notifications FROM PUBLIC, anon, authenticated',columns);
END $$;
GRANT SELECT, INSERT ON public.notifications TO authenticated;
GRANT UPDATE(read_at) ON public.notifications TO authenticated;
CREATE POLICY notifications_read_recipient ON public.notifications FOR SELECT TO authenticated
 USING(public.is_active_member() AND recipient_id=auth.uid() AND public.can_access_action(action_id));
CREATE POLICY notifications_mark_recipient ON public.notifications FOR UPDATE TO authenticated
 USING(public.is_active_member() AND recipient_id=auth.uid() AND public.can_access_action(action_id))
 WITH CHECK(public.is_active_member() AND recipient_id=auth.uid() AND public.can_access_action(action_id));
CREATE POLICY notifications_insert_mention ON public.notifications FOR INSERT TO authenticated
 WITH CHECK(type='mention' AND read_at IS NULL AND public.can_notify_mention(comment_id,action_id,recipient_id));
COMMIT;
