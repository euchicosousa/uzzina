# 01: Keep dialogs and searchable selectors reachable above the mobile keyboard

**Status:** implemented-owner-accepted — owner reported OK on iPhone on 2026-10-30 for the exercised overlay scope; not published. Drawer background/landscape follow-up is tracked separately.
**Original proposal:** item 1. **Priority:** high.
**Blocked by:** none.

## Problem and evidence

Owner screenshots IMG_9848.PNG and IMG_9855.PNG show search results and the celebration calendar covered by the iPhone keyboard. The owner reports the same behavior in partner/phase selectors. This is not accepted as an unavoidable platform limitation.

## Deliverable

Adapt search, dialogs and searchable selectors to the currently visible viewport. Keep margins, usable scrolling and reachable controls through focus, keyboard opening/closing, Safari toolbar movement and orientation changes. Inspect existing React Aria behavior before adding shared viewport handling; avoid applying overlapping compensation twice.

## Acceptance

- [ ] Inventory the actual consumers: global search, its partner filter, drawer partner/phase/category/responsible/sprint selectors where searchable, celebration dialog and strategy dialog. Record which need changes and which already work.
- [ ] Measure visible height and vertical offset when needed, with a fallback; do not infer the keyboard solely from a fixed height or assume dvh alone solves it.
- [ ] Center dialogs when they fit; when taller than the available space, keep an outer margin and scrollable content. Inputs, results and final controls remain reachable.
- [ ] Anchor popovers to their triggers, adjusting position/height to available space; do not force anchored selectors to the center.
- [ ] Keep minimum side margins on all dialogs, including strategies; consumer width classes must not override the mobile viewport limit.
- [ ] Preserve focus, selection, typed query and current month across viewport changes; restore geometry after keyboard dismissal without jumps or leftover blank regions.
- [ ] Preserve React Aria dismissal/focus, nested overlays, search reset, session isolation and existing drawer keyboard contracts. Do not disable zoom or add global keyboard traps.
- [ ] Cover small phones, iPhone 15 Pro Max, portrait/landscape, iPad with/without hardware keyboard and desktop Safari. Desktop and two-panel layouts remain usable.

## Verification

Reproduce on the real components with controlled HTTP and test viewport resize/offset and overlay lifecycle at the necessary boundary. Device validation must include reaching the last result and footer with the keyboard open. Desktop emulation alone does not certify iOS Safari. Follow the shared execution requirements in ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.
