# 15: Unify panel tabs and distinguish them from preference pills

**Status:** implemented locally on 2026-10-31 after owner authorization; final verification recorded in the report, physical-device acceptance/publication pending.
**Priority:** normal.
**Blocked by:** none for inventory. Agree the bounded shared presentation during execution before extending it to unrelated consumers.

## Problem and delivery

Profile uses PrismToggleGroup for both section navigation and preference choices (`UZZINA 2.png`). Deliver a shared panel-tab pattern using the existing React Aria/Prism stack, visually distinguishable from preference pills. Prism currently has no exported Tabs primitive; existing drawer tabs already use React Aria. Inspect existing implementations rather than importing another UI stack by default.

## Acceptance

- [x] Inventory actual tab consumers and distinguish tabs, routes, toggles and value selectors. Record which tab consumers adopt the shared pattern and any concrete justified exceptions.
- [x] Use a consistent tab frame, spacing, active indicator and focus/selection states (underline/divider direction from the agreed analysis). Keep preference pills as value choices.
- [x] Profile mobile navigation uses real tab/panel relationships, accessible names, arrow-key navigation and correct focus order; both sections remain mounted and edits survive switching.
- [x] Native invalid-field handling reveals the personal section before focusing; preserve the single form, external save button and scroll/AppBar reservations.
- [x] Adapt existing actual tabs without breaking the drawer's local Tab loop, active action identity, two-panel behavior, focus border, close/Escape semantics or mounted forms. Do not replace navigation links with tabs solely for visual similarity.
- [x] A new shared primitive belongs in Prism, is exported and demonstrated in /ui, using React Aria, existing tokens and conventions. Reuse existing buttons where appropriate; no parallel shadcn stack without a demonstrated missing capability.
- [x] Verify keyboard/focus on the composed component and real consumers, light/dark, mobile/desktop and increased text size. Add real functional regressions for behavior changed; follow README checks.

## Boundary

Resolves the section-navigation remainder of08. Cross-app visual review tracks further styling decisions separately. No redesign of values/preferences or existing save behavior. Creation of this ticket is not implementation, commit or publication.

## Implementation

Shared Prism tabs replace Profile section pills and unify action panels, action views, Instagram text sections and mobile portal views. Value selectors remain radios. Mounted forms, manual save, native validation, drawer keyboard loop and independent action identity are preserved. Primitive exported and demonstrated in /ui. Inventory, justified navigation exceptions, real regressions and verification limits: [report](../../../docs/audits/2026-10-31-shared-tabs.md). No new library, database change, push or deploy.
