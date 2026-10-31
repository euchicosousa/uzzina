# 01: Normalize the local portal entry to its configured origin

**Status:** implemented, verified and committed locally on2026-10-31 after owner authorization. Real-credential/device acceptance remains separate; no push/deploy.
**Priority:** P2 — local development portal access blocked through localhost; published portal works according to owner. Not a confirmed production outage.
**Blocked by:** none for the reproduced origin failure. A credentialed failure at the canonical address, if separately reported, requires its own response evidence before expanding scope.

## Outcome

Opening the portal locally through a supported loopback alias leads to the configured canonical local address before entering credentials. The login then uses one origin for the form, API and HttpOnly cookie, with the existing credential/session flow. Preserve exact origin validation and the working published portal.

## Evidence and confirmed cause

[Diagnosis and exact HTTP reproduction](../../../docs/audits/2026-10-31-dash-local-origin-diagnosis.md). Local APP_ORIGIN is `http://127.0.0.1:5176`; requests with Origin `http://localhost:5176` receive403 “Origem da requisição não autorizada.” before account lookup. Origin127.0.0.1 reaches400 “E-mail e senha são obrigatórios.” for the same intentionally empty login. Crossing request Host/Origin twice confirmed that status follows Origin, not DNS or the request hostname. Anonymous verify reached401 on both. No valid login or actual cookie lifecycle was certified.

The UI maps403 to a generic login error, obscuring the local-address mismatch. Multiple accounts encounter the same gate because it runs before credential comparison. Current configuration/CSRF behavior is intentional; fix local entry consistency, not account permissions or password hashes.

## Bounded implementation direction

Prefer a local-adapter canonicalization for GET document requests to `/dash` and `/dash/login`, before SPA/form mounting. Resolve the trusted target from configured APP_ORIGIN, restrict this behavior to the local runtime and validated loopback aliases on the same configured port, and preserve path/query. Published handlers retain exact Origin enforcement. Keep public review links and unrelated routes unchanged unless a demonstrated dependency requires including them.

No blanket localhost allowlist, wildcard origin, arbitrary Host-derived redirect, production guard relaxation, credentials forwarding between origins, new auth provider or new account/session model. Do not silently redirect a local request to a production domain. LAN/phone addresses are not automatically authorized by binding the server to all interfaces; a separately requested LAN setup needs an explicit configured origin.

## Acceptance

- [x] Add a real HTTP/browser regression first: local portal document entry through localhost is canonicalized before the login form sends a request; it preserves the intended portal path/query and settles without a redirect loop.
- [x] Canonical127.0.0.1 entry remains direct. If a supported canonical loopback configuration uses localhost instead, behavior follows that explicit configuration rather than a hardcoded address.
- [x] Preserve strict API guards: direct POSTs with an unknown/missing origin or wrong port still fail; localhost POST is not silently accepted merely because it resolves to loopback. A canonical empty login reaches normal400 validation, and cookie-less verify returns401.
- [x] The local-only behavior cannot activate in deployed Vercel handlers. Published login/logout retain exact configured-origin comparison and existing cookie security.
- [x] With controlled account/database boundaries, valid login sets the existing HttpOnly cookie and verify resumes the correct account; invalid credentials remain distinguishable. No alias change mixes cookies/cache with another account.
- [x] Any remaining origin failure gets an actionable, safe explanation or canonical-entry guidance rather than being presented as a credential failure. Limit messaging changes to the demonstrated local problem; do not expose private configuration or refactor all portal errors.
- [x] Preserve team Supabase Auth, public review tokens, multiple partner scope, session revocation and authorization. No changes to client credentials, database grants, RLS or production envs.
- [x] Reuse the existing launcher/local API adapter and tests. Keep owner's5176 server/cache untouched; use a temporary isolated cache/port for automated regressions and never forward successful fixture logins to production.
- [x] Run pertinent tests, format/lint/typecheck/build and the7 packaged serverless checks if server/API imports are touched. Record controlled runtime, real credentialed/device validation and publication separately.

## Execution and handoff

Inspect CURRENT/Git and only this ticket's dependencies. The primary files are `server/dev-api.ts`, the existing Vite local plugin/launcher, `api/dash-auth.ts`, `server/dash-session.ts`, and the login error branch. Choose the smallest implementation that satisfies the stated entry behavior; prove its local-runtime boundary before changing shared guards. Any uncertainty about local runtime detection must be resolved against the actual launcher, not inferred from Vite mode alone.

The initial authorization covered diagnosis/ticket preparation; the owner subsequently authorized implementation and emphasized that normal team login works and only local portal login is affected. No manual server restart, env change, real-account login, migration, commit, push or deploy has been performed. The former visual portal ticket remains closed and is not reopened by this separate local access issue.

## Implementation and verification — 2026-10-31

`server/dev-api.ts` redirects supported local HTML document entries to the validated APP_ORIGIN with307/no-store before SPA mounting. Same-port loopback aliases only; path/query retained, no redirect on canonical entry, no normalization with VERCEL, unknown hosts, nonlocal/invalid configured targets, API/POST, team routes or public review. Strict API origin validation and published authentication are unchanged. A403 login response now gives safe address guidance;401/503 behavior remains distinct.

Real HTTP regression:4 failing redirect cases before correction,25 passing afterward, including the canonical and reverse-alias configuration, paths outside scope, Vercel boundary and actual handler guard responses. Existing authentication/session suite38pass; portal-client/content suite10pass. Actual built frontend plus real adapter passed6 browser groups: normal team form/address preserved; two controlled portal accounts; canonical request origin; HttpOnly cookie/reload/logout;401/403/503 presentation. External APIs are intercepted and the test server asserts that no backend loader ran. Live local anonymous GETs on5176 passed10 entry checks without changing the running process.

Format/lint/typecheck/build and7 packaged serverless checks passed. Existing informational font-test lint and large chunks remain. New tests use isolated ephemeral ports; browser server closes automatically. See [diagnosis and implementation report](../../../docs/audits/2026-10-31-dash-local-origin-diagnosis.md#correction-authorized-and-prepared).
