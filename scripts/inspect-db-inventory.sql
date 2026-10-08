-- UZZINA: current database inventory, step 1 only.
-- Read-only catalog query. No business rows, writes, or migrations.
-- Run the complete file in the Supabase SQL Editor of the current app project.
-- Export the single result row (inventory) as JSON or CSV.
SELECT jsonb_pretty(jsonb_build_object(
  'collected_at', now(),
  'postgres_version', current_setting('server_version'),
  'schema_usage', (
    SELECT jsonb_agg(jsonb_build_object(
      'role', r.rolname,
      'public_usage', has_schema_privilege(r.oid, 'public', 'USAGE'),
      'public_create', has_schema_privilege(r.oid, 'public', 'CREATE')
    ) ORDER BY r.rolname)
    FROM pg_roles r WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
  ),
  'relations', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', c.relname, 'kind', c.relkind,
      'owner', pg_get_userbyid(c.relowner),
      'rls_enabled', c.relrowsecurity, 'rls_forced', c.relforcerowsecurity,
      'options', c.reloptions, 'acl', c.relacl::text,
      'view_definition', CASE WHEN c.relkind IN ('v', 'm') THEN pg_get_viewdef(c.oid, true) ELSE NULL END
    ) ORDER BY c.relname)
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'S')
  ),
  'columns', (
    SELECT jsonb_agg(to_jsonb(x) ORDER BY x.table_name, x.ordinal_position)
    FROM (
      SELECT table_name, column_name, ordinal_position, data_type,
        udt_schema, udt_name, is_nullable, column_default,
        is_identity, identity_generation, is_generated, generation_expression
      FROM information_schema.columns WHERE table_schema = 'public'
    ) x
  ),
  'enums', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', t.typname, 'label', e.enumlabel, 'order', e.enumsortorder
    ) ORDER BY t.typname, e.enumsortorder)
    FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_enum e ON e.enumtypid = t.oid WHERE n.nspname = 'public'
  ),
  'constraints', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', c.relname, 'name', k.conname, 'type', k.contype,
      'validated', k.convalidated,
      'definition', pg_get_constraintdef(k.oid, true)
    ) ORDER BY c.relname, k.conname)
    FROM pg_constraint k JOIN pg_class c ON c.oid = k.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
  ),
  'indexes', (
    SELECT jsonb_agg(to_jsonb(x) ORDER BY x.tablename, x.indexname)
    FROM (SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public') x
  ),
  'policies', (
    SELECT jsonb_agg(to_jsonb(x) ORDER BY x.tablename, x.policyname)
    FROM (
      SELECT tablename, policyname, permissive, roles, cmd,
        qual AS using_expression, with_check AS check_expression
      FROM pg_policies WHERE schemaname = 'public'
    ) x
  ),
  'table_grants', (
    SELECT jsonb_agg(to_jsonb(x) ORDER BY x.table_name, x.grantee, x.privilege_type)
    FROM (
      SELECT table_name, grantee, privilege_type, is_grantable
      FROM information_schema.table_privileges WHERE table_schema = 'public'
    ) x
  ),
  'column_grants', (
    SELECT jsonb_agg(to_jsonb(x) ORDER BY x.table_name, x.column_name, x.grantee, x.privilege_type)
    FROM (
      SELECT table_name, column_name, grantee, privilege_type, is_grantable
      FROM information_schema.column_privileges WHERE table_schema = 'public'
    ) x
  ),
  'functions', (
    SELECT jsonb_agg(jsonb_build_object(
      'schema', n.nspname, 'name', p.proname,
      'arguments', pg_get_function_identity_arguments(p.oid),
      'result', pg_get_function_result(p.oid),
      'security_definer', p.prosecdef, 'settings', p.proconfig,
      'owner', pg_get_userbyid(p.proowner), 'acl', p.proacl::text,
      'definition', pg_get_functiondef(p.oid),
      'execute_roles', (
        SELECT jsonb_agg(jsonb_build_object(
          'role', r.rolname, 'allowed', has_function_privilege(r.oid, p.oid, 'EXECUTE')
        ) ORDER BY r.rolname)
        FROM pg_roles r WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
      )
    ) ORDER BY n.nspname, p.proname, p.oid)
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.prokind IN ('f', 'p')
      AND (n.nspname = 'public' OR p.oid IN (
        SELECT t.tgfoid FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace tn ON tn.oid = c.relnamespace
        WHERE tn.nspname IN ('public', 'auth') AND NOT t.tgisinternal
      ))
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d
        WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid AND d.deptype = 'e'
      )
  ),
  'triggers', (
    SELECT jsonb_agg(jsonb_build_object(
      'schema', n.nspname, 'table', c.relname,
      'name', t.tgname, 'enabled', t.tgenabled,
      'definition', pg_get_triggerdef(t.oid, true)
    ) ORDER BY n.nspname, c.relname, t.tgname)
    FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('public', 'auth') AND NOT t.tgisinternal
  ),
  'default_privileges', (
    SELECT jsonb_agg(jsonb_build_object(
      'owner', pg_get_userbyid(d.defaclrole), 'schema', n.nspname,
      'object_type', d.defaclobjtype, 'acl', d.defaclacl::text
    ) ORDER BY d.defaclrole, d.defaclnamespace, d.defaclobjtype)
    FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
    WHERE d.defaclnamespace = 0 OR n.nspname = 'public'
  ),
  'migration_history_present', to_regclass('supabase_migrations.schema_migrations') IS NOT NULL
)) AS inventory;
