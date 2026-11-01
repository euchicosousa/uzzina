# Durable strategies — permanent follow-up

Owner authorized permanent behavior and completion on01/11. Runtime activation flags and browser-owned strategy generation were removed; [permanent rollout record](2026-11-01-strategy-permanent-rollout.md) is authoritative. Earlier staged-activation details below are historical.

# Durable strategy generation — ticket09

Started31/10/2026; implementation and local verification completed01/11/2026. Authorized as item3 after K04 and07. **Code is prepared and the structure migration was applied in production on01/11; executor activation is pending.** [Rollout manifest](../../supabase/rollouts/strategy-operations-manifest.json) defines the deployment, scheduler and environment prerequisites. The [activation follow-up](2026-11-01-strategy-activation.md) supersedes the original prepared-only state: migration applied, with no extension, secret, schedule or deployment changed.

## Implementation

`strategy_operations` is a private Postgres outbox recording operation/requester/action identity, canonical editorial source, state, result, quota reservation and leases. `strategy_runtime` records worker readiness. Browser roles have no table or RPC access; authenticated API endpoints derive the actor from Supabase Auth and check active membership. Service-only invoker RPCs authorize the current action and the first active partner in that requester's operational scope. Supplied IDs or copied editorial context never authorize work.

The frontend saves/creates through the existing coordinator before accepting a job, requiring canonical ID/version and resolved edits/conflicts. Acceptance locks and checks the version; repeated identities return the same operation. A worker claims one lease, reserves quota transactionally once, awaits the unchanged strategy prompt/provider contract, stores all five validated results, then attempts a narrow strategies-only action write. No automatic selection or title/content change. Quota/RPC errors do not permit a provider call. Provider timeout/restart ambiguity becomes uncertain, without automatic regeneration; a retained result can retry persistence without another generation or quota reservation.

Finalization rechecks access, source and newer intent. Changed editorial inputs, selection or newer generation produce explicit recovery rather than overwrite. Late results remain retained even when a newer operation is active/completed. Deletion cascades private operations. Unrelated action fields remain intact.

The hook observes status only for its active foreground action, bounded to150 reads per observation with manual refresh. Mount/session guards discard stale callbacks. Accepted work can outlive the drawer/page; unrelated unsaved edits, pending saves and other AI operations retain their guards. Completion invalidates lists, without reopening dialogs or replacing form snapshots. New options remain read-only until explicit canonical comparison/adoption; recovery after source changes requires deliberate confirmation. Ambiguous HTTP acceptance retains identity; explicit retry refreshes the saved version without duplicate generation.

## Activation and execution lifecycle

Default frontend flag is off, preserving07. Explicitly enabling it never falls back to browser generation on unavailable capability or failed acceptance. Server readiness requires configuration and a recent worker heartbeat. `UZZINA_STRATEGY_ACCEPTING=false` pauses new jobs while status, worker and retained-result recovery remain available for draining.

The [scheduler](../../supabase/rollouts/strategy-operations-scheduler.sql) is separate from the incremental migration: pg_cron/pg_net wake a strictly authenticated Vercel worker every30s using a distinct Vault/environment secret. One awaited provider request has90s timeout/no SDK retries, a150s lease,120s HTTP wakeup timeout and180s configured Vercel duration. Actual plan/runtime support, Ready deployment, extension grants and scheduled wakeups still require rollout verification. A detached promise or browser callback is not the recovery mechanism.

Read-only production catalog inspection during preparation observed PostgreSQL17.11, Vault0.3.1 and pgcrypto1.3 installed; pg_cron1.6.4/pg_net0.20.4 available but not installed. This supersedes the historical production15 assumption; no upgrade was performed by this task. No secret values were read or printed. Local SQL tests use native PostgreSQL17.0, without Supabase runtime extensions.

## Verification and limits

- Real hook regression before integration:1 failing test for missing durable dispatch/guard release → passing after integration.
- Final targeted API/worker/hook/AI run:46 pass across3 files (17 operation tests,13 durable hook tests,16 existing action AI tests). Covers canonical save failure, actor binding, availability without fallback, duplicate/ambiguous acceptance, version correction, recovery review, inactive/session reads and independent provider/persistence failures.
- Existing AI API/hook cohort:69 pass. Full real drawer suite after09 integration:99 pass with15s per-test timeout, including five durable scenarios for canonical preview/selection and leave guards.07's earlier full suite had93 pass plus its final discard regression; these cohorts overlap and are not additive distinct-test counts.
- Permanent `scripts/check-strategy-database.cjs` applied the actual incremental migration to a disposable native PostgreSQL17 database:44 authorization/grants/idempotency/quota/lease/persistence/recovery assertions, including six concurrent claimers and two-connection races. Fake fixtures only; isolated database removed and server stopped.
- Format, lint, typecheck, production build and native Node/Vercel package checks passed:9 serverless PASS, including both new endpoints. Existing lint informational notice and chunk-size warning remain.

Tests exercise real implementation with controlled Auth/database/provider boundaries; no paid generation, production login/write, SQL rollout, environment modification, habitual server restart/cache clearing, commit, push or deploy. They do not certify GoTrue/PostgREST, pg_cron/pg_net/Vault wakeups, actual Vercel timeout support, physical devices or production completion. Remote activation and owner acceptance remain open; the manifest supplies the concrete sequence and drain-first rollback.
