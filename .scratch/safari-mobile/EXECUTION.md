# Correction execution order — 2026-10-30

Latest result —2026-10-31:14/19 accepted and committed as `53508d2`. Owner clarified top alignment means global logo/menu Header; initial Today-heading interpretation withdrawn, accepted page spacing preserved. Header correction and15 shared Prism tabs implemented locally, tests/checks passed; owner-device acceptance and commit pending.16/general style audit remain unstarted. [Integrated report](../../docs/audits/2026-10-31-shared-tabs.md). Earlier status paragraphs are historical.

Owner requested an execution list with mixed-model subagents after registering the tickets. This document schedules work; no agent, correction or general audit has started from writing it. Scope is Safari12–18 and the general style analysis. Other backlog tickets, including strategies07/09, partner identity, portal and inline-title changes, retain their own status and are not silently added to this queue.

## Selective execution — 2026-10-30

Latest authorized sequence: fix the dates-page double scroll (new19) before14. Both implemented and locally verified with sequential Sol writers; no commit/publication.19 follows natural mobile flow and desktop-only independent columns.14 delivers full-date ellipsis and bounded mobile spacing without implementing15/16 or the general style analysis. See the [current index/results](README.md#execution-result--steps1-and7).12/17 already committed as `ceafc6f`;13/18 as `4540ef6`. Device acceptance for19/14 remains pending; do not continue15 automatically.

Latest follow-up: owner confirmed13/18/17.12 resumed and finished the source sizing correction with normal/enlarged text (up to200%) and real Today/browser verification; it awaits owner-device acceptance. No new commit (17/12 still local), push or deploy. This supersedes the partial12 state recorded below. Remaining planned implementation starts with14, subject to authorization; no general style analysis was executed.

Latest state:13/18 committed as `4540ef6` at the owner's request;17 then implemented locally,12 partially implemented with a proven enlarged-text overflow correction.17/12 not committed or published. Physical calendar screenshot remains unverified; do not mark12 fully complete. [Reports/current results](README.md#execution-result--steps1-and7) supersede the earlier initial status below. General style analysis and14–16 remain unstarted; do not continue them automatically from this schedule.

After this schedule was written, owner authorized only steps1 and7. Ticket13 (Sol/high) and18 (Luna/high) are now implemented locally;13 physical Safari acceptance remains pending,18 is a cosmetic source removal without new browser certification. Luna held the write slot first while Sol investigated read-only; Sol then held it for13. Coordinator reviewed and consolidated. No general style inventory or other queue implementation started. Required code checks passed; see the [index/result](README.md#execution-result--steps1-and7) and [ticket13 report](../../docs/audits/2026-10-30-drawer-scroll-landscape-writing.md). No commit/push/deploy.

## Parallel read-only work from the beginning

One GPT-6 Luna agent inventories existing controls/variants/consumers and nested spacing for the [general style analysis](../visual-consistency/issues/01-app-style-analysis-and-simplification.md). Give it only the relevant instructions/files and bounded surface groups; return concise evidence with file references, not a copy of this chat. No source edits, generated repository files or independent agent delegation.

The coordinator uses that inventory for the required visual/runtime comparisons and consolidates the proposed role-to-component mapping. A static inventory alone does not complete the style-analysis ticket. Finish the applicable style recommendations before broad cosmetic edits in14–16; do not block functional13/17/12 on this audit. Unresolved broader design choices remain proposals, rather than being guessed or silently implemented.

## Sequential implementation queue

| Order | Ticket | Suggested executor | Completion checkpoint |
| --- | --- | --- | --- |
| 1 | [13 — Drawer scrolling and landscape writing](../archive/resolved-tickets.md#safari-mobile-issues-13-drawer-scroll-and-landscape-writing) | GPT-6.1 Sol, high reasoning | Reproduce the actual symptoms, restore reachable description/caret and correct background scrolling; preserve one/two actions, nested overlays and edits. |
| 2 | [17 — Compact writing toolbars](../archive/resolved-tickets.md#safari-mobile-issues-17-compact-writing-toolbars) | GPT-6.1 Sol | Apply the existing single-row/More-formatting pattern to constrained Essential and verify Instagram independently; recheck landscape reachability with13. |
| 3 | [12 — Date-picker width](../archive/resolved-tickets.md#safari-mobile-issues-12-compact-date-picker-width) | GPT-6.1 Sol | Seven columns and all caption controls visible without unnecessary horizontal scrolling; real geometry regression and affected calendar consumers verified. |
| 4 | [14 — Mobile spacing and Today heading](../archive/resolved-tickets.md#safari-mobile-issues-14-mobile-spacing-and-today-heading) | GPT-6.1 Sol | Use the audit's applicable spacing guidance; full date with truncation, less wasted mobile space and preserved desktop/layout behavior. |
| 5 | [15 — Shared tabs](../archive/resolved-tickets.md#safari-mobile-issues-15-shared-tabs-and-profile-sections) | GPT-6.1 Sol | Shared navigation-tab pattern distinct from preference pills; mounted values and focus/keyboard contracts preserved; /ui updated if a shared primitive is introduced. |
| 6 | [16 — Action footer button frames](issues/16-unify-action-footer-buttons.md) | GPT-6.1 Sol | Reuse existing Prism button geometry, preserve meaningful value contents, primary save hierarchy, scrolling and popover behavior. |
| 7 | [18 — Redundant media badge](../archive/resolved-tickets.md#safari-mobile-issues-18-remove-redundant-media-type-badge) | GPT-6 Luna, coordinator review | Remove informational badge without remounting upload or changing media management; no extra style family. |
| 8 | Integrated review and owner validation | Coordinator; one bounded reviewer only if a concrete risk warrants it | Complete applicable checks, verify affected desktop/mobile flows, return a concise iPhone validation checklist and record remaining limits. |

17 moves immediately after13 because toolbar height directly affects the writing area. That supersedes the earlier rough ordering that put toolbars after cosmetic work. The code-level checkpoint of13 is not final physical-device acceptance; revalidate both together.

## Coordination, verification and usage discipline

- A single executor writes in the checkout at a time, including report/test/generated files and format/build commands that may write. Read-only inventory can run concurrently; pause it if a changing shared component would make its evidence stale.
- At most one writer plus one read-only helper initially; available capacity is not a reason to create more agents. Model assignments are suggestions for execution, not spawned agents or a measured cost guarantee.
- Hand over only after inspecting the diff and pertinent verification. Reuse one agent for related follow-ups when context is still relevant; avoid duplicate full audits and routine independent review of tiny edits.
- The coordinator reviews output, resolves dependencies and updates CURRENT; it does not repeat every delegated investigation. Use a stronger model for ambiguous defects, bounded Luna tasks for repeatable inventory/simple changes, and escalate only on concrete uncertainty.
- Before edits, inspect current Git state, preserve external work and read relevant ticket dependencies. Do not mix the pending inline-title correction into these tickets.
- Each functional fix needs a failing regression in the real implementation; run pertinent tests, format/lint/typecheck and build as required. Complete required checks per delivery, then avoid repeating them without new changes or concerns. Documentation-only analysis needs reference/diff checks, not text-mirroring tests.
- Controlled HTTP/data only for automated checks; localhost uses production data. Do not restart the owner's server, change production data or make paid AI calls for fixtures. Record real iPhone validation separately from simulated viewport/browser results.
- Publish nothing automatically from this execution list. Keep prepared code, tests, owner acceptance, commits/push and a verified Ready deployment as distinct statuses.
