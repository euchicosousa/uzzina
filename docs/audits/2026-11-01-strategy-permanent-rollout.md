# Permanent strategy execution — 01/11/2026

The owner explicitly requested permanent new behavior and completion of configuration/publication here. `UZZINA_DURABLE_STRATEGIES` and `VITE_DURABLE_STRATEGIES` were removed. Strategy generation always uses durable server acceptance; there is no browser-owned generation/persistence fallback. The actual database, independent secret, worker heartbeat, authorization, canonical version and quota checks remain. Optional `UZZINA_STRATEGY_ACCEPTING=false` is a maintenance drain, not a normal activation prerequisite.

## Code verification

Real tests without activation flags failed before the change: two API/worker cases and one hook case. After implementation:19 API tests,38 AI/durable/coordinator tests and98 real drawer tests passed (155 total distinct pertinent tests). Legacy strategy test fixtures were migrated to controlled durable HTTP responses rather than test-only production switches. Other AI intents retain their existing contract. Format/lint/typecheck/build and9 Vercel/native-Node serverless checks passed; existing informational lint/chunk warning remains. Earlier44 native PostgreSQL authorization/concurrency assertions cover the unchanged private operation SQL.

## Configuration prepared

The structure migration was already applied as `20261101140254`. A new independent cryptographic worker secret was configured in Vercel Production and Supabase Vault under the existing documented name. Its value was never displayed/versioned; temporary private transport files were deleted after both stores were configured. No activation flag was added to the environment.

pg_cron1.6.4 and pg_net0.20.4 were installed; `wake_strategy_worker()` is invoker/empty search_path and not executable by browser roles. Remote migration `20261101154221` installed the named30s cron job **inactive** in the same transaction. Job owner is postgres. No worker wakeup was scheduled against the old deployment.

Deployment inputs were inspected: no local environment or private secret files included. Existing external style-analysis documents remain separate work and are not implemented by this rollout.

## Publication and scheduled verification

Completed: Production Ready `dpl_4NiCX2REw75oXxCXEJ5HT1G47mZW` (`https://uzzina-pk3qf5pvw-agenciacnvt.vercel.app`), code commit `c27d0a0`, promoted to `https://uzzina.cnvt.com.br`. GET worker405 and anonymous operations401 on the public domain. A Vault-generated signature invoked the protected staged worker through Vercel CLI bypass: HTTP200/processed=false, updating the real heartbeat without calling the model. After promotion, the actual30s cron job was activated. Runs at16:12:17 and16:12:47 UTC succeeded; corresponding pg_net HTTP responses200/no timeout and real last_worker_at16:12:48 UTC, readiness=true, operations0. Only status/timing metadata was inspected. The [manifest](../../supabase/rollouts/strategy-operations-manifest.json) records observed state. Owner normal use can separately confirm a chosen real generation; no production fixture/paid generation was performed by verification.

### Signed transport and platform boundary

pg_net's request/response tables have platform-managed PUBLIC object privileges, while net is not exposed through the Data API and browser roles are NOLOGIN ([official permissions](https://supabase.com/docs/guides/database/extensions/pg_net#permissions)). A REVOKE attempt in migration `20261101155241` had no effective ACL change because tables are owned by supabase_admin; no privileged-role/default workaround was attempted. To keep the raw worker key out of transport queues, migration `20261101155807` replaced wakeup headers with HMAC-SHA256 over timestamp/UUID/method/path. Worker validates60s skew and constant-time signature; raw Bearer, malformed, expired and tampered requests are rejected. Signatures have bounded validity, not a one-use guarantee; persisted leases remain work-idempotency authority.48 worker/API tests passed after two real red cases; other38 hook/coordinator and98 drawer tests remain applicable (184 pertinent cases), plus format/lint/types/build and9 serverless checks.

Automatic review rejected dropping/recreating pg_net into another extension schema because of possible shared-object impact. That optional move was not executed; the default installation remains with its advisory. A raw internal-response inspection was also rejected; the safe status/timestamp-only verification above succeeded. These do not block the signed worker or require exposing payloads/secrets. Initial unsigned staged candidate `dpl_GuQcTSaUcheMRVFsvrjvBPEaSsfu` was superseded before promotion; no raw key was ever enqueued. The transient CLI protection bypass is separate from worker authentication, and no bypass value was displayed.

## Delivery records

K04/K05 commit `3b4d2a4`; durable/permanent strategies commit `b530300`; signed-wakeup hardening `c27d0a0`. No Git push was performed; the owner authorized publication here and Vercel CLI deployed the verified checkout. Other-agent style-analysis files remain outside these code commits. The remaining ticket list is [maintained separately](2026-11-01-open-tickets.md).
