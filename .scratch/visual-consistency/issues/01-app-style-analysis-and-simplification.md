# 01: Analyze app-wide style inconsistencies and propose a smaller visual vocabulary

**Status:** prepared — owner explicitly requested a thorough general style-analysis ticket on 2026-10-30; analysis not executed, no redesign implementation authorized by this registration.
**Priority:** normal — informs consolidation; does not block functional fixes.
**Blocked by:** none. Reuse existing audits, /ui and the current mobile feedback; do not repeat completed keyboard review as if no evidence exists.

## Problem and intended outcome

Owner reports a visual "Frankenstein": many button styles and inconsistent spacing/frames for equivalent jobs. Deliver an evidence-backed, app-wide analysis and concrete simplification proposal using UZZINA's existing design system. Identify which differences are accidental, which represent a useful role and which break layout/interaction. The result must let the owner choose a coherent, smaller set of patterns and a finite correction sequence, not produce another competing visual system.

## Coverage

- [ ] Inventory actual routes/surfaces and shared consumers: login/recovery, header/AppBar/search, Home, Today, partner calendars/feed, action drawer (all tabs/one or two actions), Profile, notifications, Leads, help, administration, public portal/review and /ui. Record unavailable role/token/device cases; do not call untested screens defective.
- [ ] Inspect buttons/links/icon triggers, comboboxes/selects, tabs versus pills/toggles, editor toolbars, badges, inputs, menus/popovers/dialogs, cards, headings/dividers and page/container spacing.
- [ ] Compare desktop/mobile, portrait/landscape, light/dark, relevant selected/focused/hovered/pressed/disabled/loading/error states with the shipped font. Distinguish sampled runtime evidence, static source findings and owner reports.
- [ ] Inventory code patterns/variants/local class overrides and their consumers, especially PrismButton, ComboboxTrigger form-inline/form-footer/filter, toggle groups, custom tab renderers and nested padding. An automated class count is supporting evidence, not a visual verdict.

## Required analysis

- [ ] Provide a comparison matrix: semantic role, screen/component, current primitive/variant, size/padding/radius/typography/border, interaction states, evidence, visible or functional impact, recommended existing pattern and known exceptions. Group by user job, not only by file or class.
- [ ] Separate accidental duplicates from meaningful hierarchy: primary save/submit, secondary command, destructive action, navigation, selector, tab, toggle/value choice. Simplification must not erase these distinctions or make every control look equally important.
- [ ] Identify styles causing real clipping, overflow, lost writing space or indistinguishable navigation, versus merely inconsistent appearance. Validate suspected functional defects with a reproducible real-component path before claiming causes.
- [ ] Propose the smallest viable role-to-component mapping, anchored in existing Prism/React Aria buttons/tokens/palettes. For each pattern specify allowed variants/sizes/states, when to use it and which duplicate custom frame can be retired.
- [ ] Recommend a small responsive spacing policy: page gutters, section gaps, fields/toolbar spacing and control dimensions; account for accumulated nested padding and usable area. Preserve comfortable touch and keyboard targets. Do not prescribe a single padding value for all surfaces.
- [ ] Include concrete side-by-side examples or bounded before/after mockups for representative duplicates, including the footer, profile tabs/pills and Today mobile header. Label proposals as proposals; do not edit production components to simulate approval.
- [ ] Preserve UZZINA identity: OKLCH themes/palettes, current font, primary hierarchy and established behavior. Do not import a replacement design system, new theme, parallel button family or universal wrapper without a demonstrated need.

## Deliverables and decision boundary

- [ ] A report in docs/audits with coverage/evidence, ranked findings, pattern mapping, concrete examples and a short list of unresolved style decisions. Explain why each proposed simplification improves consistency or useful space.
- [ ] A finite implementation sequence grouped by usable behavior/surface; each proposed ticket includes consumers, dependency, removal/reuse plan, regression/visual acceptance, risk and relative effort. Prefer eliminating duplicate variants over layering new overrides.
- [ ] Link existing tickets instead of duplicating them: Safari12 calendar,13 scrolling/writing,14 spacing/heading,15 tabs,16 footer,17 toolbar,18 media badge; today-focus and media-controls tickets retain their functional scope. New audit findings become proposals, not automatic implementation.
- [ ] Classify recommendations as reuse now, consolidate with named consumer migration, keep as justified exception, or needs owner decision. Nothing is marked deprecated/removed until a safe consumer migration is actually implemented.
- [ ] Define a practical future review checklist and /ui examples for accepted patterns, so new local exceptions require a concrete reason. Keep it small; do not generate exhaustive speculative tokens or architecture.

## Verification and execution limits

Analysis is read-only except its report/documentation. Use controlled HTTP/data for visual samples; do not mutate production accounts/actions, generate paid AI content or change SQL just for an audit. Preserve existing edits and the owner's running server; one checkout writer. Localhost uses production data. Check references/diff for this documentation; runtime tests/build belong to actual corrections. Record source prepared, test/browser evidence, physical Safari and deployed Ready independently.

Only ticket preparation is requested now. Later analysis should inspect/reproduce rather than assume this ticket's targets are all broken. The output is a reviewed simplification direction and actionable proposals; it is not authority for a broad redesign, library migration, global CSS rewrite, new routes, feature changes, automatic commits or publication.
