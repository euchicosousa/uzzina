# Drawer scroll and landscape writing — 2026-10-30

## Authorized scope and state

Owner authorized execution step1/ticket13. One checkout writer at a time: ticket18's agent returned the write slot before this work began. Existing uncommitted title, mobile documentation and media-badge changes were preserved. This change is local source only; no commit, push, deploy, SQL, production/provider mutation or paid AI request. Root agent owns CURRENT and queue consolidation.

Applied diagnosing-bugs for reproduction/probes/regression and writing-for-agents for the concise AGENTS contract update. Ticket17's toolbar policy remains outside this implementation.

## Reproduction and diagnosis

The permanent `scripts/check-drawer-scroll-browser.cjs` runs the real app route, drawer, Essential and Tiptap. Only HTTP/session/data boundaries are controlled. Every external request is fulfilled from controlled data or blocked. It requires a loopback test server and rejects port5176. The execution used isolated Vite at127.0.0.1:5189, with `/tmp/uzzina-drawer-scroll/cache`, without API middleware or route generation. The owner's LAN/dev server5176 and its cache were untouched. The isolated server was stopped after verification.

The initial command was the script with PLAYWRIGHT_MODULE pointing to the installed external Playwright and PLAYWRIGHT_EXECUTABLE pointing to the existing Chromium headless executable. Logs are temporary operational artifacts under `/tmp/uzzina-drawer-scroll/` (`red.log`, `probe.log`, `browser-expanded.log`, `browser-ios-path.log`, `tests.log`, format/lint/typecheck/build logs).

Before the fix,844×390 produced:

| Measurement/assertion | Result |
| --- | --- |
| Panel width/height |672×326px, top64 |
| Editor bounds |top377, bottom532px |
| Description wrapper |height0, overflow hidden |
| Deliberate scroll reveals a point that can receive typing |FAIL |
| Independent app scroll-region lock contract |FAIL: overflow auto |
| Simulated keyboard visible bounds220px/top90 |FAIL: panel stayed top64/height326 |
| Chromium backdrop wheel preserves app position360 |PASS even before the fix |

Ranked hypotheses were shared before probes: flex shrink/clipped minimum editor; fixed layout bounds ignoring visual viewport; missing document/app scroll isolation. A temporary page-only probe changed only Essential overflow and child shrink/minimum sizes: the description hit-test became green, while app-lock and viewport assertions stayed red. This isolates the clipping cause from the other two boundaries.

The native Safari background gesture was **not** reproduced by Chromium. Its unlocked app scroller was an actual missing contract, and the new document/app lock is covered at its real integration boundary. A CSS overflow assertion is not presented as proof of Safari gesture behavior.

## Prepared implementation

- Essential has one explicit outer scroll region for title, metadata and description when they exceed available height. Title/metadata retain their size; the description keeps its200px minimum rather than shrinking its clipping wrapper to0. Long text retains its editor scroll region. Navigation/close and footer/save remain outside this scroll area. Existing Essential formatting toolbar remains unchanged.
- ActionDrawerPanel follows the existing useVisibleViewport height and vertical offset. It respects the64px header when visible and preserves the last unzoomed geometry during pinch, matching existing overlay behavior.
- Dashboard's useActionDrawerScrollLock shares React Aria usePreventScroll with nested overlays, using its existing iOS touch/selection/pinch handling. It also locks the independent app scroll region, preserving inline overflow values/priorities and vertical/horizontal offsets. The lock depends on whether any action remains open, so closing one of two does not release it. Final close, session reset and unmount clean it up.
- AGENTS documents these operating contracts. No schema, persistence, model, API or new business flow was added.

## Verification

- Permanent browser script:56 assertions passed in normal Chromium;56 passed with an explicitly simulated iPhone platform to exercise React Aria's iOS branch. This remains Chromium, not WebKit or a physical device.
- Real editor typing and final-line caret geometry passed with an80-line description, landscape672px panel, portrait390px,1024px viewport with672px panel, keyboard height/offset simulation, rotation, unchanged editor identity/title, visible navigation/close/save, stable pinch geometry, real partner popover, Chromium CDP touch gesture on backdrop, two mounted actions, individual/final close and session reset.
- At simulated landscape keyboard220px/top90, the final-line caret was top196/bottom217 within the scroll region147–241px. The app remained at scrollTop360 throughout.
- `bun test tests/action-drawer-scroll-lock.test.tsx tests/drawer-component.test.tsx tests/visible-viewport-overlays.test.tsx`:90 pass,0 fail,513 expectations. Includes existing keyboard/focus, compact state, upload-widget, Instagram and two-action contracts. New lock tests cover both app offsets, inline style priority, document styles/position, repeated/nested owners, reset and unmount.
- `bun run format`, `bun run lint`, `bun run typecheck`, `bun run build`:passed. Final lint has the preexisting informational useTemplate message in font-loading.test.ts; build has the existing large-chunk advisory. No new lint warning remains.
- Diff whitespace/references checked. No extra broad suite or production verification is implied.

## Remaining verification

Physical iPhone Safari acceptance remains: portrait/landscape with software keyboard, expanded/collapsed Safari bars, real selection handles/pinch, actual upload and background boundary gestures. Automated visual viewport values and simulated iPhone platform do not certify those browser/device behaviors. The owner can test the prepared code through the existing local/LAN setup. No production publication was attempted.
