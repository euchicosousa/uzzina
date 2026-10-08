-- INSERT RETURNING must authorize the proposed row without re-reading actions.
-- Preserve the existing admin/member, responsibility and active partner scope.
BEGIN;

ALTER POLICY actions_select_policy ON public.actions
  USING (
    public.is_active_admin()
    OR (
      public.is_active_member()
      AND responsibles::text[] @> ARRAY[auth.uid()::text]
      AND EXISTS (
        SELECT 1 FROM public.partners p
        WHERE p.archived = false
          AND p.slug = ANY(actions.partners)
          AND p.users_ids::text[] @> ARRAY[auth.uid()::text]
      )
    )
  );

COMMIT;
