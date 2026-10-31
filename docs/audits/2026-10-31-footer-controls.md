# Action footer button frames — 2026-10-31

Owner authorized ticket16 in the five-fix queue. The existing controlled-browser regression failed before correction at390px/light: Partners94×68px, Phase/Category/Color68×68px with square corners, versus Sprint/Duplicate/Archive48×48px with Prism rounded frame. A separate real ComboboxTrigger regression found that legacy `disabled` was not mapped to React Aria: no disabled attribute and still in Tab order.

## Implementation and consumer boundary

Existing `form-footer` now composes `buttonVariants({variant: "ghost", size: "icon"})`:48px height/minimum width, existing Prism corners/border/focus/hover/pressed states, width allowed to grow with meaningful avatar/text content. No new button family or trigger variant. Partners already uses this variant. Footer Category opts into the existing prop; Phase exposes an optional existing variant for its single selector, keeping its previous default. Color and large Sprint use the same frame; Sprint's redundant local button styling is removed. Legacy `disabled` and React Aria `isDisabled` are combined without overriding an explicit true.

Inventory: form-inline lg/sm remains available for single Category/Phase gallery examples; filters in ViewOptions and global search keep their existing variant/allowAll contracts; form-link remains unchanged. Existing gallery Category form-footer example now describes the standard ghost frame. No variant was removed. Multiple partner avatars retain natural width. Save, archive/duplicate behavior, selected values and callback timing are unchanged. FooterStrip scrolling/fades/focus-reveal code is unchanged.

## Verification

- `bun test tests/combobox-trigger.test.tsx tests/combobox-shift.test.tsx`:34pass/40 expectations. Disabled trigger is natively disabled and skipped by Tab; existing partners/responsibles/sprint/phase/category ordinary and Shift+click/Enter behavior passes.
- Focused real drawer suite:27pass/218 expectations, covering compact strip/save separation, draft/archive/pending states, edge fades, keyboard-reveal versus pointer focus, local Tab sequence, real popovers, writing/viewport layout, media integration and Create-to-tabs progression. No repeated full drawer suite in this subtask.
- `scripts/check-footer-controls-browser.cjs`: controlled real ActionFormFooter and CSS fixture at390×844,844×390 and1600×900, light/dark. Geometry matches Prism48px, multiple avatars remain, partner Shift selection and phase updates emit expected patches, disabled does not activate, compact strip overflows with fade/save outside, and one footer's state does not update the other. Empty partner and pointer cancellation are checked separately. All27 browser groups passed.

The fixture controls update/save boundaries and blocks external requests; it is not a real Supabase persistence/authorization test. The two-footer case is a geometry/state fixture, not a new full two-mounted-action browser matrix; existing drawer tests retain that contract. Native Safari/iPhone touch behavior remains unverified. Global format/lint/typecheck/build are left to the coordinator. No models/schema, SQL, commit, push or deploy. Isolated5187 stopped on handoff; owner's5176/cache unchanged. Logs outside Git: `/tmp/uzzina-footer-red.log`, `/tmp/uzzina-footer-green.log`, `/tmp/uzzina-footer-drawer.log`.
