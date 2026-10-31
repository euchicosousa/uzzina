# 16: Use existing app button frames throughout the action footer

**Status:** implemented locally on2026-10-31 — existing Prism button frames reused; focused tests/browser verification recorded in the [report](../../../docs/audits/2026-10-31-footer-controls.md). Physical-device acceptance/publication pending.
**Priority:** normal.
**Blocked by:** none; coordinate ticket13 scroll behavior and the general style inventory.

## Problem and delivery

`UZZINA 3.png` shows custom left-hand selector frames beside standard secondary buttons. Partner form-footer uses px6/py5.5; form-inline uses p6; duplicate/archive use PrismButton ghost/icon. Replace this footer's bespoke trigger framing with existing app button geometry. Preserve meaningful avatar, phase, category and color contents, and primary save emphasis.

## Acceptance

- [ ] Align secondary trigger/button heights, widths, padding, icon footprint, radius and hover/pressed/focus/disabled states through existing PrismButton variants; do not add a new bespoke button family.
- [ ] Preserve partner/phase/category/color/sprint values, accessible names, popovers and multi-selection/Shift behavior. Standardize frame/interaction rather than forcing every value into an identical glyph.
- [ ] Preserve duplicate/archive confirmations/actions, canonical saves, pending states and existing save primary styling.
- [ ] Keep all compact commands in one scrolling strip with correct edge fades, fixed icon-only save, keyboard-reveal and no command activation caused by dragging.
- [ ] Verify desktop, portrait/landscape and two-panel layouts, and meaningful empty/selected/disabled states. No accidental tab-order or touch-target regression.
- [ ] Audit shared ComboboxTrigger consumers before changing/removing variants; limit removal to proven unused variants. Update /ui examples if shared props/variants change.
- [ ] Add regressions for changed real trigger/keyboard/strip behavior and run README checks. Record geometry/visual checks as such.

## Boundary

Follow-up to accepted ticket02 compact behavior, not its reopening. Do not redesign selector contents, persistence or every button in the app. General style analysis considers wider consolidation. No implementation, commit or publication in this registration.
