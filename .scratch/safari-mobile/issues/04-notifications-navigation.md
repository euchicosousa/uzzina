# 04: Close notification overlays and honor action guards before page navigation

**Status:** implemented-owner-accepted — owner reported OK on iPhone on 2026-10-30 for exercised notification/navigation flows; not published.
**Original proposal:** item 4. **Priority:** high.
**Blocked by:** none.

## Evidence

IMG_9856.PNG. Header.handleNotificationClick fetches an action and opens the primary drawer without explicitly closing the notification popover. “Ver todas as notificações” links to its page without coordinating closure of the open actions.

## Expected behavior

- [ ] Clicking a notification dismisses its popover and opens/focuses the requested action using existing primary-action behavior; mark-read and inaccessible-action feedback remain correct.
- [ ] Slow or failed detail loading never leaves the notification popover covering the action or silently presents stale content.
- [ ] “Ver todas” dismisses the popover, requests closeAllActions and navigates only after both action guards allow closure.
- [ ] If a guard blocks or requires resolution, keep the current route and editing state accessible. Never discard an unsaved form to force navigation.
- [ ] Inventory in-app page navigation paths, including header/menu, logo, AppBar, search commands and relevant page links. Apply the existing guarded-navigation pattern where a page change would remain hidden under open action drawers.
- [ ] Preserve intentional action opening/focusing without a page change, including primary/secondary and Shift behavior. Do not close drawers on every URL/search change: date/filters/lead selection may be local page state.
- [ ] Retain browser Back/Forward semantics; document how existing route-level guards interact rather than adding an unconditional route-change cleanup.
- [ ] Validate identity/generation for asynchronous action loads so an old notification response cannot reopen a drawer after logout or newer navigation.
- [ ] Both mobile and desktop show the destination visibly after allowed navigation, with no leftover notification overlay.

## Verification

Real Header and action-panel behavior: notification success/failure/delay, repeated clicks, “Ver todas” with zero/one/two panels, clean/dirty/saving/AI-processing states, cancelled guard and session reset during fetch. Controlled HTTP only; no production fixture writes. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.
