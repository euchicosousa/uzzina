# K04 — accessible field names

Owner authorized implementation as item1 of the updated execution list on31/10/2026. Scope: [K04 of the completed keyboard inventory](2026-10-29-keyboard-focus-inventory.md#k04--p2--campos-sem-associação-com-sua-finalidade).

## Result

- Celebration creation field exposes “Nome do feriado/data”, preserving its existing placeholder, disabled state and form behavior.
- Shared observation textarea exposes “Observação”, including the portal consumer; placeholder, audience and Ctrl/Cmd+Enter sending remain unchanged.
- Partner administration Contexto and Tom de Voz labels name the actual Tiptap editable textboxes through `aria-labelledby`. Optional editor `id` and `aria-labelledby` props reach the editable element; named editors expose multiline textbox semantics. Clicking each existing label focuses its own editor. Hidden form inputs retain their names/values without duplicating editor IDs.
- Leads search already exposed “Buscar leads” in the current checkout. Its real route tests verify named keyboard input/filter behavior; no redundant source change.

No visual styles, toolbar order, editor key/identity, authentication, models, routes or schema changed. Other RichTextEditor consumers retain their existing configuration unless they provide the optional attributes.

## Verification

Real route/component regression in `tests/field-accessible-names.test.tsx`:0pass/3fail before the fix (missing accessible names) →3pass after. Checks cover editable roles/names, actual label-click focus, unique IDs, hidden form names and values, keyboard typing and sending, and contenteditable identity/text across state updates caused by blur. Queries are disabled and the external Supabase boundary refuses accidental access; no test input reaches production.

Combined with existing editor keyboard, Leads responsive and celebrations scrolling suites:30pass/0fail. Format, lint, typecheck and production build passed; existing lint informational notice and large-chunk warning remain.

Local component testing and build do not certify a physical screen reader/device or production deployment. No real login, provider call, SQL/database write, environment change, active server restart/cache clearing, commit, push or deploy. Root coordination owns CURRENT/TODO and the remaining07/09/K05 sequence.
