# Media manager controls — 2026-10-31

Authorized as the second of five bounded fixes. Existing K02 diagnosis reused; the new permanent browser regression failed before the change at390px/light: individual removal was hidden without hover (`false !== true`). Real ContentReorderDialog, application CSS, controlled fixture and external requests blocked; no Cloudinary upload or database mutation.

## Implementation

Removal, drag handle and order number are always visible. Buttons have contextual Portuguese names,32px targets and keyboard focus indicators; handles retain the existing pointer/keyboard sensors and use `touch-none`. Narrow layouts use three columns so the two top controls do not overlap; desktop retains four. Number remains separate at the bottom. Existing occurrence IDs preserve identical URLs as distinct items.

Removing an item focuses the next removal button, or previous at the end; removing the final item/clearing focuses Adicionar. Existing callback applies each change immediately; Concluir still closes. Reordering keeps callback effects outside the state updater and checks both occurrence indices. Keyboard drag temporarily disables the modal's Escape dismissal: Escape cancels the drag, later ordinary Escape closes normally. External closure resets the drag flag. No new upload/persistence flow.

## Verification

- `scripts/check-media-controls-browser.cjs`:29 Chromium groups passed at390/1440px in light/dark, with real CSS: controls/number visible without hover,32px targets/no overlap, keyboard reorder/cancel, mouse drag with output-order assertion, Enter/Space removal, duplicate URL occurrences, touch-tap removal, next/previous/Add focus and ordinary Escape/opener restoration. The harness waits for sensor activation and post-cancel transition before the mouse drag. The upload widget is a fixture stub; no external request is sent.
- `bun test tests/drawer-component.test.tsx -t 'media removal keeps'`:1pass/10 expectations. The real drawer removes only the selected duplicate occurrence, emits the resulting media through its existing save path, reopens the manager with the remaining files, and saves empty media after final removal. The preview elsewhere emitted an existing React duplicate-URL key warning during the duplicate fixture; no data/order assertion failed. That preview identity warning is outside the manager control change and is not claimed fixed.
- Title correction separately verified28 scenarios; see its existing report. Global format/lint/typecheck/build are left to the coordinator for the integrated tree. No claim of new whole-app checks in this subtask.

Browser: Chromium with controlled responses; touch removal simulated. Native iPhone/Safari chrome, physical touch dragging, real provider/bank authorization and paid generation not certified. Existing drawer tests cover independent mounted forms; this focused new integration does not claim a new two-action media-reopen matrix. No schema/models, SQL, commits, push or deploy. Isolated5187 stopped; owner's5176/cache unchanged. Temporary logs: `/tmp/uzzina-media-red.log`, `/tmp/uzzina-media-green.log`.
