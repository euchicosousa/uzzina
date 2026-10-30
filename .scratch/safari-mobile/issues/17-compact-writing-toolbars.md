# 17: Keep constrained writing toolbars on one row across Essential and Instagram

**Status:** implemented locally and owner-approved ("17 ok") on2026-10-30 for the reported device scenarios; local commit authorized by owner; no push/deploy.
**Priority:** normal; coordinate with the high-priority landscape writing fix13.
**Blocked by:** none for Essential toolbar work. Final keyboard/landscape reachability requires integration with13.

## Evidence and delivery

`UZZINA 6.png` shows the Essential description's full toolbar wrapping. Only Instagram currently passes compactToolbar={writingLayout}; Essential uses default false. Extend the existing compact/More-formatting behavior to constrained Essential writing and ensure a consistent policy across the two editors. Do not report the screenshot as a reproduced Instagram toolbar failure.

## Acceptance

- [x] Define constrained mode using the actual panel width/available writing height, including landscape and keyboard, rather than assuming mobile portrait alone.
- [x] Toolbar stays one row, with secondary commands reachable in the existing Mais formatação pattern. No wrapped or clipped command row, and no lost formatting capability.
- [x] Preserve selection/caret on menu use, editor history, links/tables, enable/disable states and all command execution. Keep keyboard toolbar access (Alt+Shift+F10/F9, arrows, Tab-to-text) and contextual toolbar scope.
- [x] Verify Essential and Instagram independently, empty/long text, keyboard/rotation and two panels; normal desktop mode remains usable.
- [x] Integrate with13 so reducing toolbar height does not conceal a remaining unreachable editor. A one-row screenshot alone is not functional reachability acceptance.
- [x] Exercise real RichTextEditor/consumers in regressions for changed behavior; run README checks and declare actual Safari/device coverage.

## Boundary

No prompt/content/persistence changes or new toolbar implementation alongside the existing one. Coordinate with03 but preserve its original scope/history. No implementation, commit or deploy in registration.

## Implementation and verification — 2026-10-30

Owner explicitly authorized ticket17 after committing13/18. Essential now passes the existing compactToolbar flag using its real compact-panel state or the same useShortWritingPanel measurement already used by Instagram. No alternative toolbar or viewport tracker was added. The parent panel's ticket13 bounds already follow the visible viewport, so keyboard/bar changes resize the measured writing region even when the layout viewport stays fixed. Hysteresis and the existing editor instance are preserved.

Before the correction, two real Essential consumer tests failed for missing Mais formatação; the real app/CSS browser regression measured81px/two command rows at390px, with controls at vertical positions347/383px. After the correction it measured45px/one row, with all secondary commands in the existing menu. Landscape672px, simulated keyboard220px/top90 and normal desktop were verified independently for Essential and Instagram. The integrated ticket13 writing/caret/scroll lifecycle checks still pass.

[Operation report](../../../docs/audits/2026-10-30-compact-writing-toolbars.md) records test counts, commands and limits. 100 pertinent tests and94 integrated browser assertions passed; format/lint/typecheck/build passed. Checkbox completion above refers to automated real-component/layout coverage. Physical Safari/iPhone, software-keyboard/chrome behavior and hardware keyboard remain owner acceptance; no device certification is implied.

## Subsequent owner acceptance

Owner reported "17 ok" after implementation and then authorized a local commit. This accepts the exercised scenarios; it does not imply new automated or device coverage beyond the reported checks.
