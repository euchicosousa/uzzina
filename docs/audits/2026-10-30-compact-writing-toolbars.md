# Compact writing toolbars — 2026-10-30

## Authorized scope and implementation

Owner authorized ticket17 after local commit4540ef6 for13/18. This agent held the sole checkout write slot; ticket12 remained read-only. Existing external title and documentation changes were preserved. No commit, push, SQL, production/provider mutation or paid AI call was performed.

Applied diagnosing-bugs (real failing regressions before correction) and writing-for-agents (AGENTS contract update). Essential now passes compactToolbar using the existing compact panel state or useShortWritingPanel on its actual scroll region. This matches Instagram's existing policy: panel width below640px, or writing-region width below752px and height below480px; the short mode exits when the region reaches560px. Normal desktop keeps the full toolbar. Hysteresis prevents repeated changes near the boundary; changing toolbar mode does not recreate the editor.

Ticket13 already sizes ActionDrawerPanel from the visible viewport height/offset. ResizeObserver therefore observes the actual reduced writing region when the software keyboard changes only visualViewport. No duplicate viewport logic, new toolbar implementation, content contract, persistence or model was added. Existing RichTextEditor command/menu/history/link/table logic is reused unchanged. Comments describing the old layout-only measurement were updated to the current integration.

## Red/green evidence

- Before the fix, `bun test tests/drawer-component.test.tsx -t 'Essential uses|Essential follows'`:0 pass/2 fail; real Essential toolbar lacked Mais formatação at390px and in a short672px region.
- The integrated real-app/CSS browser script was run before the fix. At390px, the toolbar was81px high and its commands occupied two rows (button tops347/383px). At672px the full toolbar happened to fit one45px row but still omitted the requested compact/More-formatting policy. Existing ticket13 reachability checks stayed green, separating this visual policy defect from the already corrected clipped editor.
- The minimal correction only connects Essential to the existing compactToolbar flag and shared measurement. Both new consumer tests turned green. At390px the real toolbar became45px high, one row, with every button inside its bounds.
- `scripts/check-drawer-scroll-browser.cjs` now verifies toolbar mode/geometry within the existing controlled full-app harness. It exercises Essential and Instagram independently at390px portrait,672px landscape, simulated keyboard220px/top90 and1440px desktop, including empty/long content and two side-by-side desktop panels. Essential's More-formatting menu applies Tachado to the retained selection, returns focus and supports undo/redo. The original ticket13 typing, final-line caret, viewport/pinch, background-lock, nested-popover, two-action and session-reset checks remain included.

## Verification

- Browser integration:94 assertions passed in Chromium with controlled HTTP/session/data. Real CSS, app route, RichTextEditor and consumers were used; every external request was controlled or blocked. No actual Supabase/provider access.
- `bun test tests/drawer-component.test.tsx tests/rich-text-editor-keyboard.test.tsx`:100 pass,0 fail,565 expectations. Existing RichTextEditor keyboard tests cover all15 commands across toolbar/menu, selection, history, disabled execution, Alt+Shift+F10, Alt+Shift+F9 contextual scope, arrows and Tab-to-text. New Essential tests cover phone/short-panel policy, keyboard-sized resize/hysteresis and retained editor identity.
- `bun run format`, `bun run lint`, `bun run typecheck` and `bun run build` passed. Lint retains only the preexisting informational useTemplate finding in font-loading.test.ts; build retains its existing large-chunk advisory. Diff whitespace and local references checked.
- Temporary operational logs live under `/tmp/uzzina-drawer-scroll/toolbar-*.log`. The server used127.0.0.1:5189 and its own cache, without API middleware or route generation. The isolated server was stopped after verification; the owner's5176 server/cache were untouched. The browser checker rejects5176 and non-loopback URLs.

## Limits and final state

This is local prepared code. Chromium with a simulated visual viewport does not certify native Safari/iPhone, real keyboard/chrome transitions, hardware keyboard or published production behavior. No physical device was available. Owner acceptance remains pending for those cases. No production publication was attempted.
