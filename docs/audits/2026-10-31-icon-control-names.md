# K03 — accessible names for icon controls

Authorized as item 2 of the previous priority list on 31/10/2026. Scope comes from [K03 in the completed keyboard inventory](2026-10-29-keyboard-focus-inventory.md#k03--p2--comandos-de-ícone-sem-nome-acessível).

## Implementation

- Team login and password recovery expose “Mostrar senha” / “Ocultar senha” according to the current action.
- AppBar names its home link, partner selector, partner filter, selection activation/exit and search. The filter retains its native pressed state.
- Header logo names its destination and retains the existing navigation guard.
- Shared CalendarToolbar names its date picker and actual navigation interval: one day or the configured number of days. A 30-day jump is not described as a calendar month. The picker name retains the visible month/year when shown.
- Portal calendar names previous/next week or month according to its current view.

Changes are localized to accessible-name attributes on existing consumers. No new controls, visual styles, focus order, event handlers, authentication behavior or shared Prism defaults.

## Verification

`tests/icon-control-names.test.tsx` mounts the real routes/components, with authentication controlled at the external client boundary and data queries disabled. Before implementation: 0 pass / 11 fail for absent names. After implementation: 11 pass, covering password state/value and no accidental submit, keyboard activation, date intervals, portal callbacks, filter pressed state, Escape/focus return and guarded logo navigation.

Combined with Today navigation, Header menu, calendar height/Home height and Prism calendar tests: 28 pass / 0 fail. Format, lint, typecheck and production build passed. Existing lint informational notice and large-chunk build warning remain.

These are local component tests and a production build, not a screen-reader/device acceptance or published deployment verification. No real authentication, database writes, SQL, environment changes, server restart, commit, push or deploy. K04/K05 and other work remain separate.

## Commit requested — 31/10

Owner requested the local commit after the checks above passed. Implementation, regression and status records are included together; diff and references checked, with no further functional changes or repeated suites. No push/deploy or new acceptance inferred.
