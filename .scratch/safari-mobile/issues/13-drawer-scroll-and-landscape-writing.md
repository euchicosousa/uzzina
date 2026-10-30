# 13: Keep drawer writing reachable and prevent background scrolling on iPhone

**Status:** implemented, committed locally as4540ef6 and owner-confirmed on2026-10-30 for the reported iPhone flows. No push or deploy.
**Priority:** high — blocks writing in landscape.
**Blocked by:** none. Coordinate ticket17 toolbar height; do not wait for the general style review.

## Problem and evidence

Owner cannot reach/type the Essential description in landscape and reports scrolling the page behind the open drawer. Evidence: `UZZINA 4.png`, `IMG_9910.PNG`, `UZZINA 7.png`; [diagnosis](../../../docs/audits/2026-10-30-drawer-scroll-landscape-writing.md). Still screenshots do not distinguish background scroll from visual viewport movement. Fixed panel, independent app scroller and nested clipped Essential containers are inspection targets, not a closed causal diagnosis.

## Delivery and acceptance

- [x] Reproduce with real drawer/editor components; measure document, app, panel and editor scroll positions, panel bounds and visualViewport height/offset. Separate background scroll, viewport pan and clipped content.
- [ ] Essential description is reachable and editable in portrait/landscape, keyboard open/closed and Safari bars expanded/collapsed, including phone-width and672px panels. Reach the caret and final lines with a deliberate scroll region, not by scrolling the background.
- [ ] Prevent gestures from moving the underlying app while any action is open; preserve/restore its exact position after the last action closes. Closing one of two actions must not unlock early.
- [ ] Preserve editor/panel scrolling, selection, pinch zoom, nested popover/dialog scrolling and upload. Avoid blanket touchmove prevention or global focus containment.
- [ ] Keep tabs, close and save reachable; preserve local edits, details expansion state, both action identities, leave guards and existing keyboard/focus contracts across rotation/resize.
- [x] Integrate the real visible height/offset if measurements require it; do not treat screen width or dvh alone as proof that the keyboard is accommodated. Do not silently assume a single root cause for both symptoms.
- [x] Add failing regressions at real layout/scroll boundaries before fixing. Test cleanup on close/reset/unmount and repeated/nested overlays. Record actual Safari/iPhone results separately from simulated viewport checks.

## Boundary and verification

Follow README verification rules and run relevant tests/format/lint/typecheck/build when implementing. Controlled data only; no production fixtures or new persistence. Ticket01/02 owner acceptance remains valid for reported earlier scopes; this is the new functional follow-up. No implementation, server restart, commit, push or deploy authorized merely by preparing this file.

## Implementation and evidence — 2026-10-30

Subsequent owner feedback: "13 confirmado." Accepted for the exercised device scenarios; the implementation-time limits below remain historical evidence, not a requirement to repeat the accepted flows. No additional automated/device execution is implied by this status update.

Owner explicitly authorized execution step1/ticket13. [Operation report](../../../docs/audits/2026-10-30-drawer-scroll-landscape-writing.md) records red/green evidence and limits.

- Real app/Essential/Tiptap browser loop failed before correction at844×390: description wrapper height0 with hidden overflow; editor bounds377–532px were clipped below the usable tab area. A one-variable layout probe made text reachable while leaving the viewport and scroll-lock assertions failing.
- Essential now scrolls title/metadata/description deliberately, preserving metadata height and the editor minimum. Existing toolbar policy is unchanged (ticket17 remains separate).
- Drawer follows visible viewport height/offset. Dashboard locks both the document (existing React Aria implementation, shared with nested overlays) and its independent app scroll region for the lifetime of any open action; final close/reset/unmount restores styles and both app offsets.
- Browser regression passed portrait390px, landscape672px panel, simulated keyboard/bar resize/pan, long-text final caret/typing, stable editor identity across rotation, pinch geometry, real nested popover, native Chromium touch gesture, two-action close lifetime and session reset. Optional simulated iPhone platform also passed React Aria's iOS branch.
- 90 relevant tests passed (new scroll-lock tests, real drawer/focus/editor suite and visible-viewport overlays). Format/lint/typecheck/build passed; existing informational lint message and build chunk warning remain.

The automated boundary checks and Chromium gesture do **not** reproduce or certify native Safari's background-scroll engine. Actual iPhone portrait/landscape with keyboard and expanded/collapsed bars, selection/pinch and upload remains owner verification; no physical device was available. Earlier owner acceptance is preserved. No production/database/provider mutation, SQL or owner-server restart; isolated no-API Vite used port5189 and its own temporary cache, then stopped.
