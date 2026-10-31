# Shared panel tabs — 2026-10-31

Owner authorized ticket15 after accepting and committing14/19 (`53508d2`). The global logo/menu Header correction follows the owner's clarification; [alignment report](2026-10-30-today-header-alignment.md). This delivery is local and uncommitted, separate from the existing external inline-title work.

## Inventory and implementation

| Consumer | Shared pattern |
| --- | --- |
| Profile personal/preferences | Actual mobile tabs; both form sections mounted, selected section accessible; desktop exposes both as independent regions. |
| Action drawer primary/secondary | Existing independent forms remain mounted; side-by-side at1600px, tabs below; selection and action identity preserved. |
| Action Essencial/Instagram/Observações | Shared selection underline and2px top keyboard-focus border; explicit local Tab stops, arrows and close/save/Escape contracts preserved. |
| Instagram Conteúdo/Legenda | Same tab frame, existing editor/media/writing layout retained. |
| Portal mobile Calendário/Feed | Shared actual tabs/panels; desktop sidebar and separate portal authentication retained. |

Preference values, Today visualizations and calendar periods remain value selectors. AppBar/routes and Help anchors remain navigation. The /ui top-level section navigation keeps its gallery-specific presentation; the new PrismTabs section demonstrates the actual shared primitive, disabled state, arrows, mounted draft and focus/selection distinction. No new component library.

The primitive uses the existing React Aria tab collection/state, CVA and tokens. Forced-mounted inactive panels are hidden/inert; always-visible regions remain interactive. Panels isolate inherited tab contexts so nested action/Instagram tabs form independent collections. Selected panels are labelled by their tab without self-referential aria-labelledby. Action footer menus remain outside the tab collection to preserve their own menu state. Action view tabs suppress only the TabList's Tab interception, leaving native Tab traversal and the existing local drawer focus manager in control.

## Regressions and verification

Before implementation the real Profile test failed because section navigation was a radiogroup, not a tablist. The Header menu suite passes3 tests; the final five primitive/Profile tests pass, including arrow navigation, disabled-tab skipping, exact accessible panel naming, nested collections, interactive side-by-side regions and draft retention. The actual drawer suite passes86 tests/492 expectations: local keyboard loop, save/close guards, outer tabs, independent actions, focus and compact writing controls.

Controlled HTTP with real routes/CSS:

- Chromium71 and WebKit71 layout/state assertions:320/390/430px, landscape844px, desktop1440px,200% text, accepted Today/Home spacing, Header geometry, Profile resize/draft retention/native invalid-field reveal and one explicitly mocked complete save.
- Drawer94 Chromium checks: scroll lock/restoration, viewport/rotation/pinch, inner editor scrolling, toolbar modes and nested overlays.
- Portal14 Chromium groups: login and calendar/feed at390/1023/1024/1440px, one/two partners and resize. Only existing mobile button-role selectors changed to tab-role selectors.
- Prism gallery at390/1440px, light/dark: arrows, disabled-tab skipping, preserved draft, exact tab/panel relation, square underline presentation, keyboard focus and44px targets. All four width/theme combinations pass in Chromium and WebKit.

The text200% WebKit layout check records the same two baseline transient ResizeObserver notifications documented in14; no recurrence after stabilization. No broad error suppression or hook change. Format/lint/typecheck/build pass; lint retains its preexisting informational useTemplate suggestion and build its large-chunk notice.

## Remaining boundaries

Owner must validate the appearance and native touch/keyboard behavior on iPhone. HTTP responses and viewport changes were controlled; tests do not certify real Supabase authorization, provider operations, native Safari chrome or production publication. No SQL, real data mutation, paid generation, push or deploy. Ticket16 footer simplification and the general style audit remain separate and unstarted. The subagent began15 but reached its usage limit; the coordinator completed implementation and verification with one checkout writer at a time. No measured token-saving claim. Isolated verification server5191 stopped; owner server5176 untouched.

## Commit preparation — 2026-10-31

Owner authorized committing completed work. Fresh checks found an unsupported `exact` option in the tab-panel test query; replaced it with an anchored accessible-name regular expression, preserving the exact-name assertion. The two primitive tests pass again and typecheck passes. Format/lint/build and117 pertinent tests (112 drawer/panels/Header +5 primitive/Profile) passed in this round; the previously recorded controlled browser results remain unchanged. Physical-device acceptance and publication remain pending.

## Owner acceptance — 2026-10-31

Owner confirmed ticket15 passed the device checks and authorized closing/committing its acceptance. Implementation remains in `566cbbe`; portal was already accepted. No new execution or publication is inferred.
