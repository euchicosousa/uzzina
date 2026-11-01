# Ticket09 — activation record (historical steps superseded)

The owner subsequently authorized permanent behavior and full activation here. Activation flags have been removed; do not follow the old flag steps below. See the [permanent rollout record](2026-11-01-strategy-permanent-rollout.md) and [current manifest](../../supabase/rollouts/strategy-operations-manifest.json). Matching worker secret and inactive scheduler are configured; publication/activation is being completed.

## Original activation preparation

## Already completed

The owner authorized applying SQL or supplying the concrete remaining steps. The production target was confirmed from the existing manifest and read-only catalog: project `dfepmjcozszswocwvdpq` (`bussola`), PostgreSQL17.11.0.003. Neither private09 table nor any of the11 new functions existed. Only the incremental migration was applied through the connected Supabase tool, remote version `20261101140254`. No bulk push/repair, existing application table/function change, account/action fixture or paid generation.

[Verification artifact](../../supabase/rollouts/strategy-operations-production-verification.json): both tables have RLS and no browser privileges;11 invoker functions have empty search paths and service-only EXECUTE. Actual anonymous HTTP table/RPC calls returned401/42501; service readiness and unknown-identity scope returned200/false. Operations count0. A combined SET ROLE/DO probe returned an internal connector error; it is not counted as a passed role simulation. No signed-in real-user matrix was performed.

Security advisors gained only the two expected informational RLS-without-policy entries for private service-only tables. Existing warnings were preserved; no policy was added to expose these tables. [Supabase linter explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

The current published deployment `dpl_H2foQzWHoNYFCwHnx3Qwx1GHUkQr` is Ready, but predates the new09 worker endpoints. Anonymous GET confirmed404 JSON for both new endpoints. No new deployment, secret, environment, extension or scheduler was changed in this step. SQL alone does not activate durable generation.

## Remaining steps, in order

1. In Vercel → UZZINA → Settings → Environment Variables → **Production**, add `UZZINA_DURABLE_STRATEGIES=true`, a new random independent `STRATEGY_WORKER_SECRET` of at least32 characters, and `VITE_DURABLE_STRATEGIES=false`. Existing OpenAI/Supabase configuration is already present. Keep the generated secret private; do not send it in chat or use a Supabase key.
2. In this project's Supabase Vault, create a secret named `uzzina_strategy_worker_secret` with exactly that same value. The dashboard can create it, or this SQL can be run privately with the real value substituted:

   ```sql
   select vault.create_secret(
     'REPLACE_WITH_THE_SAME_WORKER_SECRET',
     'uzzina_strategy_worker_secret',
     'UZZINA strategy worker'
   );
   ```

3. Publish the prepared code and wait for **Ready**. Confirm the deployment includes `/api/strategy-worker` and `/api/strategy-operations` and supports the configured180s worker budget. Do not enable the frontend yet.
4. Only after the worker is published and the matching secret is configured, run [the scheduler SQL](../../supabase/rollouts/strategy-operations-scheduler.sql) against this same project. It enables pg_cron/pg_net and installs the authenticated30s wakeup. This is separate from the migration already applied. [Official Cron quickstart](https://supabase.com/docs/guides/cron/quickstart).
5. Verify an actual successful worker wakeup and a fresh heartbeat (`select public.strategy_ready();` must return `true`). With no pending operation, this check calls no paid model. Then change Production `VITE_DURABLE_STRATEGIES=true` and redeploy. Server flags/secret must remain configured.
6. Validate with an owner-chosen real action: start generation, wait for acceptance, close/reopen the action and verify all five saved options. This final test is a real paid generation, unlike the empty-queue heartbeat check.

The scheduler SQL contains no secret value; it reads the named Vault secret at runtime. Do not rerun the already-applied structure migration. Missing configuration/readiness in enabled mode must remain an explicit failure, with no fallback generation. Rollback/draining instructions remain in the [manifest](../../supabase/rollouts/strategy-operations-manifest.json).
