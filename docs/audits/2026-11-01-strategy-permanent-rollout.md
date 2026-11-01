# Permanent strategy execution — 01/11/2026

The owner explicitly requested permanent new behavior and completion of configuration/publication here. `UZZINA_DURABLE_STRATEGIES` and `VITE_DURABLE_STRATEGIES` were removed. Strategy generation always uses durable server acceptance; there is no browser-owned generation/persistence fallback. The actual database, independent secret, worker heartbeat, authorization, canonical version and quota checks remain. Optional `UZZINA_STRATEGY_ACCEPTING=false` is a maintenance drain, not a normal activation prerequisite.

## Code verification

Real tests without activation flags failed before the change: two API/worker cases and one hook case. After implementation:19 API tests,38 AI/durable/coordinator tests and98 real drawer tests passed (155 total distinct pertinent tests). Legacy strategy test fixtures were migrated to controlled durable HTTP responses rather than test-only production switches. Other AI intents retain their existing contract. Format/lint/typecheck/build and9 Vercel/native-Node serverless checks passed; existing informational lint/chunk warning remains. Earlier44 native PostgreSQL authorization/concurrency assertions cover the unchanged private operation SQL.

## Configuration prepared

The structure migration was already applied as `20261101140254`. A new independent cryptographic worker secret was configured in Vercel Production and Supabase Vault under the existing documented name. Its value was never displayed/versioned; temporary private transport files were deleted after both stores were configured. No activation flag was added to the environment.

pg_cron1.6.4 and pg_net0.20.4 were installed; `wake_strategy_worker()` is invoker/empty search_path and not executable by browser roles. Remote migration `20261101154221` installed the named30s cron job **inactive** in the same transaction. Job owner is postgres. No worker wakeup was scheduled against the old deployment.

Deployment inputs were inspected: no local environment or private secret files included. Existing external style-analysis documents remain separate work and are not implemented by this rollout.

## Publication and scheduled verification

Pending at preparation time: create a Production deployment without domain promotion, verify Ready and an authenticated empty-queue worker response through pg_net/Vault, promote it, activate the named cron job and verify an actual scheduled HTTP response/heartbeat. The [manifest](../../supabase/rollouts/strategy-operations-manifest.json) records the final observed deployment and scheduler state. No real action fixture or paid generation is required for the empty-queue runtime check; owner acceptance of a real chosen generation remains distinct.
