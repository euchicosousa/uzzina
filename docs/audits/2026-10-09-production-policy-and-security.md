# Production action policy and function security — 2026-10-09

## Result

Production project `dfepmjcozszswocwvdpq` still had the old action SELECT predicate `can_access_action(id)`. The existing migration `20261008164615_action_row_read_authorization.sql` was applied in a guarded transaction and verified through a separate read-only connection at `2026-10-09T09:53:54.463828+00:00`. SELECT now authorizes the proposed row directly using active membership, responsibility and active partner membership, with the existing administrator branch. INSERT, UPDATE and DELETE policies were preserved.

Production has no `supabase_migrations.schema_migrations` table. The remote version is therefore recorded as null, with source hash and before/after evidence; no history repair or full migration push was performed. See [action manifest](../../supabase/rollouts/action-read-fix-manifest.json) and [catalog evidence](../../supabase/rollouts/action-read-fix-production-verification.json).

The Supabase MCP connection denied project access. The already configured PostgreSQL operations connection provided catalog access; the locally authenticated Supabase CLI provided the official security advisors. Credentials were not printed or copied into tracked files.

## Trigger hardening applied

New migration [restrict_trigger_function_access](../../supabase/migrations/20261009095619_restrict_trigger_function_access.sql) sets an empty `search_path` and revokes direct EXECUTE from PUBLIC, anon and authenticated for:

- `public.handle_actions_updated_at()`;
- `public.handle_new_user()`;
- `public.update_updated_at()`.

Function bodies, ownership, security mode and trigger bindings remain intact. The retired Auth function is hardened only if present; fresh staging does not need it recreated. The final idempotent source was applied again in production, with its exact hash recorded in the evidence. The old Auth trigger remains detached; it was not recreated. Before applying, production function-definition hashes were checked against the inspected versions. After committing, six actual direct calls under anon/authenticated failed with insufficient privilege in a read-only transaction. The action and lead timestamp triggers remain bound to their original tables.

Official security advisors decreased from 14 to 10: both mutable-search-path warnings and both browser-execution warnings for `handle_actions_updated_at` were removed. Trigger-returning functions cannot run as ordinary SQL functions; the revoked grants were unnecessary exposure, not evidence of an observed data breach. Before/after snapshots and verification are in [security evidence](../../supabase/rollouts/trigger-function-hardening-production-verification.json).

## Remaining authenticated SECURITY DEFINER notices

Eight notices remain intentionally. Their production definitions and grants were inspected. They are unavailable to anon; public schemas do not grant CREATE to browser roles; each has a fixed search_path.

| Function | Authorization retained |
|---|---|
| `admin_update_person` | Requires active administrator before updating protected fields. |
| `is_active_admin`, `is_active_member` | Derive identity from `auth.uid()` and return membership booleans. Used by RLS. |
| `can_access_action` | Active membership, responsibility and partner scope, or active administrator. Used by RLS. |
| `can_notify_mention` | Active sender, authorized action/comment, recipient and mention scope. |
| `get_app_bootstrap` | Session identity, active member and rejection of forged identity; scoped active partners. |
| `get_home_actions` | Session identity and active membership; rejects forged identity and intersects partner scope. |
| `update_my_preferences` | Own active identity, validated patch, atomic merge preserving other keys. |

Changing these to SECURITY INVOKER or revoking authenticated execution merely to remove warnings would break their current authorization contract. Administrative account/password functions and AI quota remain executable only by server/owner roles, not browser roles. [Supabase advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

## Platform defaults

All 11 public application tables are owned by `postgres`, have RLS enabled and deny anonymous table privileges. Application defaults for `postgres` exclude browser grants; the global default EXECUTE grant to PUBLIC is revoked. The local matrix also creates a new table and checks its effective default privileges.

`supabase_admin` still has broad defaults for future objects in `public`: tables, sequences and functions grant browser privileges. These do not override the existing `postgres` object grants. The operations role is not a member of `supabase_admin` and cannot alter its defaults. This is a residual platform ownership issue, not evidence of current anonymous access to the application tables.

Keep creating application objects under `postgres`, with explicit grants and RLS. If removing platform defaults is required, request a supported procedure from Supabase support. Do not attempt role escalation or modify Auth/Storage/extension ownership. Platform extension functions were inventoried, but not independently certified or modified. [PostgreSQL default privilege rules](https://www.postgresql.org/docs/15/sql-alterdefaultprivileges.html), [Supabase managed roles](https://supabase.com/docs/guides/database/postgres/roles-superuser), [platform permissions](https://supabase.com/docs/guides/platform/permissions).

## Remaining platform actions

1. **PostgreSQL update:** advisor reports outstanding security patches for `supabase-postgres-15.1.1.44`; SQL reports PostgreSQL 15.1. Plan a fresh backup, target-version compatibility check and maintenance window. Upgrading takes the project offline. `pgjwt` is installed and requires review if moving to PostgreSQL 17. No upgrade, extension removal or restart was performed. [Upgrade procedure](https://supabase.com/docs/guides/platform/upgrading).
2. **Leaked password protection:** disabled according to the official advisor. Supabase documents availability on Pro and higher plans. The subscription/eligibility was not verified and no paid-plan change or Auth configuration change was performed. [Password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
3. **Staging parity:** the trigger-hardening migration was tested in disposable PostgreSQL 15.1 and applied to production only. Its staging application is blocked by CLI access returning 403 for that project; the action SELECT fix was already recorded as applied to staging in the previous rollout.

## Verification and limits

- Local PostgreSQL 15.1: old production action predicate reproduced INSERT RETURNING failure; existing fix passed creation/duplication and denial cases.
- New trigger permission regression failed before hardening and passed after it. The final migration also passed locally with the retired Auth function absent. Tests exercise actual authenticated action updates and server lead updates, including timestamp triggers.
- Complete baseline plus all 12 migrations, authorization matrix, two-connection concurrency and fixture cleanup passed in a disposable database. Auth is a minimal local test adapter, not GoTrue.
- 309 unit tests / 927 assertions, format, lint, typecheck and build passed. Existing bundle-size warning remains.
- Production: guarded DDL transactions, persisted catalog verification, six real permission-denial calls and official security advisors before/after. No business rows were written by this task.
- No authenticated production browser workflow, deployment or push was performed. No serverless code or dependency changed, so its packaging check was not repeated.
