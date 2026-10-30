# 07: Open the strategy dialog immediately and show generation progress

**Status:** ready-for-agent — ticket preparation authorized 2026-10-29; implementation not started.
**Original proposal:** approved presentation from item 9. **Priority:** normal.
**Blocked by:** none for presentation; final viewport/margin acceptance integrates ticket 01. Coordinate operation state with ticket 09.

## Current behavior verified by source inspection

useActionAI calls /api/ai, parses its output, applies strategies locally, opens the dialog, then awaits updateAction to persist through the action save coordinator. The endpoint returns generated content; this flow is not a durable background job that saves strategies independently of the browser.

ActionFormDrawer.prepareLeave explicitly blocks action closure while aiProcessingRef is active. isPending includes AI processing but does not prove every field is disabled. Do not describe the entire application as locked.

## Approved deliverable

- [ ] Open the strategy dialog on generation initiation, showing “Criando estratégias…” (and appropriate regeneration wording) before the response arrives.
- [ ] Model generating, saving, confirmed and failure states truthfully. Generated options appearing locally are not proof of database persistence.
- [ ] Do not let selection/use commands race against a pending strategy write. Keep prior strategies intact if regeneration fails and prevent duplicate generation requests.
- [ ] Show generation errors in the dialog and allow deliberate retry after failure. If generation succeeded but saving failed, preserve generated results and offer the existing safe save/recovery path without charging a new generation merely to retry persistence.
- [ ] Closing the strategy modal does not cancel the request. Retain a visible/reopenable progress indication in its action; a completed request must not unexpectedly reopen a modal the user dismissed.
- [ ] Until ticket09 establishes durable server acceptance, preserve the current action leave guard while generation/persistence is pending. After that integration, allow accepted strategy work to continue independently while retaining guards for unrelated unsaved edits and other pending operations. A browser callback alone does not durably finish work.
- [ ] Apply results only to the originating action/session generation. Preserve the independent other panel, conflict/version controls and local edits.
- [ ] Maintain minimum mobile margins, reachable content and accessible loading/error announcements; use ticket 01's viewport behavior.
- [ ] Keep current prompts, five-strategy contract, quota, server authorization and automatic strategy persistence unchanged.

## Scope and subsequently authorized extension

The owner subsequently authorized [ticket09](09-durable-strategy-generation.md), covering closure of the action/page while strategy work completes and persists. This presentation ticket does not itself add queues, jobs, SQL or background persistence; the temporary guard restriction is superseded only after ticket09's server-owned lifecycle is proven. No implementation starts merely from preparing either ticket.

## Verification

Real AI hook/dialog/coordinator with controlled responses: delayed generation, regeneration, generation failure, save failure/conflict, modal closed/reopened before completion, repeated activation, session reset and two panels. No real paid AI calls are necessary for these checks. Follow ../README.md.
