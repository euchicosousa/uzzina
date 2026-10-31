# Local portal authentication origin — 2026-10-31

## Scope and result

Owner requested diagnosis and a ticket for the reported multi-account portal login failure, then clarified that published access works and the failure is local. The confirmed reproduction is the localhost-origin branch: the local API returns403 before account lookup because APP_ORIGIN is the canonical `http://127.0.0.1:5176`. The API's strict origin comparison is working as coded; local navigation through its localhost alias creates a different browser origin. The login page collapses this403 into its generic failure message.

A canonical-origin request reaches normal field validation. This is not a successful-login claim: no credentialed login, password migration, session insertion, session revocation or account mutation was performed. If valid credentials also fail from the canonical address, that additional path still needs its actual response captured. Published functionality is owner-reported, not independently exercised here.

## Feedback loop and minimization

The live server already listening on5176 was used without restarting it. No production URL or authenticated request was used. Both private env files were inspected only for APP_ORIGIN and booleans indicating required configuration presence; secrets were neither printed nor copied. Local APP_ORIGIN is the loopback canonical URL; the publication copy uses `https://uzzina.cnvt.com.br`.

`python3 /tmp/uzzina-dash-diagnosis/probe.py` returned an intentional assertion failure: the two aliases did not reach the same login guard. Anonymous verify returned401 with “Sessão não fornecida.” on both, while empty login returned400 on127.0.0.1 and403 onlocalhost. This established a red-capable real HTTP loop without account credentials.

After that reproduction, ranked hypotheses were origin mismatch, hostname resolution differences, and local adapter/configuration unavailability. `python3 /tmp/uzzina-dash-diagnosis/isolate-origin.py` minimized the distinction by crossing Host and Origin twice, keeping method/path/body constant. All8 predictions passed in0.12s:

| Request hostname | Origin | Result, in both repetitions |
| --- | --- | --- |
|127.0.0.1 |http://127.0.0.1:5176 |400 — E-mail e senha são obrigatórios. |
|localhost |http://127.0.0.1:5176 |400 — E-mail e senha são obrigatórios. |
|127.0.0.1 |http://localhost:5176 |403 — Origem da requisição não autorizada. |
|localhost |http://localhost:5176 |403 — Origem da requisição não autorizada. |

Hostname resolution and adapter availability do not explain this403 branch: the same hostname reaches normal validation with the canonical Origin. Configuration presence is also sufficient to reach that guard, rather than returning the configuration503. Cookie/database/account behavior after valid login was not tested and is not ruled out generally.

A portable minimal pair uses the real local API and intentionally omits credentials:

```sh
curl --silent --show-error --include http://127.0.0.1:5176/api/dash-auth -H 'Content-Type: application/json' -H 'Origin: http://127.0.0.1:5176' --data '{"action":"login"}'
curl --silent --show-error --include http://127.0.0.1:5176/api/dash-auth -H 'Content-Type: application/json' -H 'Origin: http://localhost:5176' --data '{"action":"login"}'
```

Expected current results are400 and403 respectively. These requests stop before the clients query/session write. They must not be changed into real-account fixture writes against production.

## Source confirmation

- [dash-auth](../../api/dash-auth.ts:28) reads APP_ORIGIN; its origin rejection at line48 precedes client lookup and credential comparison.
- [validateRequestOrigin](../../server/dash-session.ts:93) requires exact comparison whenever APP_ORIGIN exists; the unconfigured development-loopback fallback is not reached.
- [local middleware](../../server/dev-api.ts) loads the same handler. Its configured env comes from the existing Vite local API plugin; no alternate Supabase authentication flow exists here.
- [portal request](../../app/services/portal-http.ts) propagates403 as PortalHttpError; [login UI](../../app/routes/dash/login.tsx:45) maps it to the generic failure branch.
- The launcher's documented canonical host is127.0.0.1; the active server accepts both loopback request hostnames. Listening on additional interfaces does not authorize their browser origins.

## Handoff and limits

[One correction ticket](../../.scratch/dash-local-auth/issues/01-canonical-local-origin.md) was created. Preferred bounded approach: normalize local document navigation to the configured canonical loopback origin before the form submits, within the local adapter, retaining strict API validation. The implementation must prove the navigation behavior and keep publication, unknown origins and other ports protected. The temporary immediate workaround is opening `http://127.0.0.1:5176/dash/login` to avoid this specific origin rejection.

No application/config/env change, new server, cache cleanup, credentialed login, database query/mutation, provider call, paid generation, SQL, build, commit, push or deployment. Production account data was not inspected. Existing unrelated documentation edits were preserved. Temporary sanitized results: `/tmp/uzzina-dash-diagnosis/http-results.json` and `origin-matrix.json`. The diagnosis artifacts remain outside the checkout; the command pair above reproduces the result without them.

## Correction authorized and prepared

Owner then authorized implementation, emphasizing that the normal team application login works and only local portal access fails. The difference was preserved: the team login uses Supabase Auth directly; the portal uses its own server endpoint and exact origin guard. No team-auth implementation was changed.

The existing local adapter now handles only HTML GET document entry at `/dash` and `/dash/login` (including trailing slash), redirecting the alternate loopback host to validated APP_ORIGIN on the same port. It preserves path/query and uses307/no-store. The canonical entry passes through directly. The behavior is disabled with VERCEL and does not cover production destinations, LAN/unknown hosts, wrong ports, unrelated pages, public review or API/POST requests. Direct localhost API login still receives403 when127.0.0.1 is canonical; document navigation fixes the browser origin before the form sends. No cookie/token is forwarded across origins by the adapter.

The login page also distinguishes403 with safe address guidance. Existing invalid-credentials401 and service503 messages remain. No private origin/configuration values are exposed through an added endpoint or response body.

### Executed verification

- `bun test tests/local-portal-origin.test.ts`: initial21pass/4fail, then25pass/0fail/60 expectations. Real Node HTTP plus the actual local middleware and real auth-handler guards; database constructor is controlled and no account query is possible in these empty-login/cookie-less probes. Covers reverse canonical config, preserved team/review routes, unsafe destination/Host rejection, Vercel boundary, direct alias POST403, canonical empty login400, anonymous verify401 and GET405.
- `bun test tests/entrega2.test.ts`:38pass/0fail/110 expectations for existing contracts, including valid/invalid login, cookie/session, revocation and errors with controlled database accounts.
- `bun test tests/portal-client.test.ts tests/content-portal.test.tsx`:10pass/0fail/14 expectations.
- After building, `bun scripts/check-local-portal-browser.cjs` (Playwright/Chromium runtime supplied by env) passed6 groups against the real static build and actual adapter on an ephemeral loopback port. It verified the unchanged `/login` address/form on localhost, portal normalization and query preservation, two fictitious portal accounts in sequence, cookie jar HttpOnly/domain/path, reload/resume/logout and401/403/503 UI. All portal API responses were controlled; unexpected backend loads are asserted zero. A valid team or portal credential was not submitted to a real provider.
- Live local server5176:10 anonymous document GETs passed across localhost/127.0.0.1 for `/login`, `/app`, `/dash`, `/dash/login` and a review path. Only localhost portal entries returned307 to configured127.0.0.1; all other entries stayed200 without a Location header. This checks entry routing, not authenticated account content. The original node process20881 remained listening; no manual restart or cache cleanup was performed.
- `bun run format`, `bun run lint`, `bun run typecheck`, `bun run build` and `bun run test:serverless` passed (7 packaged native-Node guards). Only the preexisting font-test informational lint and build chunk notices remain. Diff/references checked.

No env, account, permission, database model/schema, SQL or published handler changes. Production behavior is covered by unchanged strict guards and packaged checks; published/device login was not rerun. Source is local, without commit/push/deploy. Refresh/open the local portal document to use normalization; an already-mounted alias form is not silently moved by this server-side document rule. Temporary logs are `/tmp/uzzina-local-portal-*.log`.

## Local commit — 2026-10-31

Owner requested the local commit after implementation. Verified source, tests, diagnosis/ticket and contracts are committed together; no additional functional change or repeated suite in this commit-only round. Real-credential acceptance and deployment remain separate. Diff and references checked; no push, env or database change.
