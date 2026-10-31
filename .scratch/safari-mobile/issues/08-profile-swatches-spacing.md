# 08: Show profile palette swatches and balance text-control spacing

**Status:** completed — colors accepted previously; spacing owner-approved through14 and section tabs through15 on2026-10-31. No remaining implementation/acceptance item in this scope; publication remains separate.
**Original proposal:** item 8, explicitly approved in the latest owner feedback.
**Priority:** normal.
**Blocked by:** none for palette functionality; finalize visual spacing after ticket 10 establishes actual font metrics.

## Evidence and entry points

IMG_9850.jpg, IMG_9851.jpg, IMG_9852.jpg and IMG_9853.jpg. The profile palette options show names without the color examples available in HeaderMenu. Personal/preferences tabs and the “Inativo” control have disproportionately small horizontal padding.

Inspect app/routes/app/profile.tsx, HeaderMenu in app/components/layout/Header.tsx, app/lib/palettes.ts and the actual Prism toggle-group/switch primitives used by these controls.

## Acceptance

- [ ] Show a palette swatch beside each named accent option on mobile and desktop, using the existing palette data and header presentation as the reference, without duplicating divergent color definitions.
- [ ] Preserve accessible option names and selection state; color alone is not the selection indicator. Handle Padrão/Energy/custom using their existing meanings rather than fabricated static colors.
- [ ] Keep profile preview, account manual save, custom theme draft and header automatic persistence semantics unchanged.
- [ ] Review horizontal versus vertical padding in the profile section tabs, theme/palette/view choices and active/inactive controls. Fix the disproportionate “Inativo” appearance.
- [ ] Determine whether the fault is local styles, font metrics or a shared variant before editing a primitive. Avoid indiscriminately increasing every icon button or every control in the app.
- [ ] Verify representative shared consumers in /ui if a shared variant changes. Labels, swatches and icons fit without clipped text or unintended horizontal page scroll.
- [ ] Retain touch targets, focus indication, React Aria keyboard behavior and mobile section validation/reveal.
- [ ] Preserve independent scrolling, header save button and AppBarSpacer layout on profile.

## Verification

Use real profile controls and controlled account responses for select/preview/save/reload behavior. Inspect selected/unselected and long-label spacing at phone/desktop widths, light/dark/system and after loading the intended font. Follow ../README.md. No new theme persistence mechanism or global design redesign.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.
