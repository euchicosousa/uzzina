# Safari/mobile follow-up — approved tickets and open decisions

Latest result —2026-10-31:14/19 accepted and committed as `53508d2`. Owner clarified top alignment means global logo/menu Header; initial Today-heading interpretation withdrawn, accepted page spacing preserved. Header correction and15 shared Prism tabs implemented locally, tests/checks passed; local commit authorized on2026-10-31; owner-device acceptance/publication pending.16/general style audit remain unstarted. [Integrated report](../../docs/audits/2026-10-31-shared-tabs.md). Earlier status paragraphs are historical.

Prepared 2026-10-29 from the owner's Safari feedback and subsequent approval. Tickets are local planning artifacts, not external issues or implementation authorization. Existing external working-tree changes must be preserved.

## Approved ticket scope

| Ticket | Original item | Delivery |
| --- | --- | --- |
| [01](issues/01-visible-viewport-overlays.md) | 1 | Visible viewport, keyboard and overlay reachability |
| [02](issues/02-mobile-action-drawer.md) | 2 | Icon-only metadata summary and complete scrolling mobile footer |
| [03](issues/03-mobile-instagram-editor.md) | 3 | Media states, adaptive writing space and compact toolbar |
| [04](issues/04-notifications-navigation.md) | 4 | Notification dismissal and guarded page navigation |
| [05](issues/05-responsive-leads.md) | 6 | Mobile list/detail navigation for leads |
| [06](issues/06-today-responsive-heading.md) | 7 | Responsive selected-date heading |
| [07](issues/07-strategy-dialog-progress.md) | 9 | Immediate dialog, honest progress and modal dismissal |
| [08](issues/08-profile-swatches-spacing.md) | 8 | Profile palette swatches and balanced control spacing |
| [09](issues/09-durable-strategy-generation.md) | 9 extension | Server-owned generation and persistence independent of the drawer |
| [10](issues/10-load-brand-font.md) | New font report | Restore missing web-font loading and verify actual rendering |
| [11](issues/11-compare-version-on-reopen.md) | 5 | Immediately editable opening and explicit comparison of a newer version |
| [12](issues/12-compact-date-picker-width.md) | 2026-10-30 follow-up | Fit date-picker width and cells without unnecessary horizontal scrolling |
| [13](issues/13-drawer-scroll-and-landscape-writing.md) | 2026-10-30 follow-up | Reach landscape writing and prevent background scrolling |
| [14](issues/14-mobile-spacing-and-today-heading.md) | 2026-10-30 follow-up | Reduce mobile spacing and truncate the complete Today date |
| [15](issues/15-shared-tabs-and-profile-sections.md) | 2026-10-30 follow-up | Shared tabs distinct from preference pills |
| [16](issues/16-unify-action-footer-buttons.md) | 2026-10-30 follow-up | Existing app button frames across the action footer |
| [17](issues/17-compact-writing-toolbars.md) | 2026-10-30 follow-up | Single-row constrained writing toolbars across both editors |
| [18](issues/18-remove-redundant-media-type-badge.md) | 2026-10-30 follow-up | Remove the redundant detected-media-type badge |
| [19](issues/19-celebrations-responsive-scroll.md) | 2026-10-30 dates-page screenshot | Single mobile page scroll; independent columns only in side-by-side desktop |

## Correction tickets registered — 2026-10-30

### Execution result — steps1 and7

Latest execution: user authorized19 from `UZZINA 8.png`, then14. Both are implemented locally without commit/publication.19 removes mobile nested/right-list scrolling and full-height gaps while retaining desktop columns/current-month positioning; [report](../../docs/audits/2026-10-30-celebrations-responsive-scroll.md).14 uses full-date truncation and reduces local mobile spacing in Today/HomeToday/Profile with desktop and form behavior preserved; [report](../../docs/audits/2026-10-30-mobile-spacing-today-heading.md). Required tests/browser/code checks passed; physical acceptance remains pending.12/17 are already committed as `ceafc6f`,13/18 as `4540ef6`.15/16/general style analysis remain unstarted.

Latest owner feedback:13 confirmed,18 OK,17 OK. Those scopes are owner-accepted;13/18 remain committed as4540ef6,17 uncommitted.12 resumed on request and is now implemented/verified: bounded32–40px cells, seven-cell width and wrapping caption/natural selector height preserve enlarged text. WebKit45 geometry cases, Chromium15 and actual Today/WebKit15 passed plus behavior checks and required code checks; [updated evidence](../../docs/audits/2026-10-30-calendar-picker-width.md).12 awaits owner-device acceptance, rather than remaining partially implemented solely because a physical device is unavailable. Original normal-text screenshot cause was not established. No new commit/publication or implementation of14–16/general audit.

Subsequent owner authorization:13/18 committed locally as `4540ef6`, no push/deploy.17 then implemented by Sol (100 pertinent tests,94 browser assertions, code checks passed);12 received a bounded local robustness correction (Chromium/WebKit30 geometry cases each plus behavior checks and required code checks passed).17/12 remain uncommitted.12 is partial: original normal-text screenshot not reproduced even on controlled real Today/WebKit; physical acceptance still pending. See [toolbar report](../../docs/audits/2026-10-30-compact-writing-toolbars.md) and [calendar report](../../docs/audits/2026-10-30-calendar-picker-width.md). One write slot at a time; both isolated servers stopped, owner's5176 preserved.

Owner authorized ticket13 and18 using subagents. Both are implemented locally, without commit/publication. GPT-6 Luna removed only the redundant media-type badge/import/state (18); format/lint/typecheck/build passed. GPT-6.1 Sol implemented13 after Luna returned the write slot: reachable Essential scrolling, visible-viewport panel bounds and shared document/app scroll locking through final close/reset.90 relevant tests passed, plus56 browser checks in normal Chromium and56 in Chromium with a simulated iPhone platform. These do not certify physical Safari. Format/lint/typecheck/build passed; [evidence and limits](../../docs/audits/2026-10-30-drawer-scroll-landscape-writing.md). The owner's5176 server and external changes were preserved; isolated5189 stopped.17 and all other queued work remain unstarted. General style inventory was not started in this selective execution.

At initial registration, the owner agreed to the feedback analysis and requested new correction tickets plus a separate [general style analysis](../visual-consistency/issues/01-app-style-analysis-and-simplification.md). Ticket12 was reused and13–18 were prepared without implementation at that point; the selective execution result above supersedes that initial state. [Execution order with model assignments](EXECUTION.md):13 →17 →12 →14 →15 →16 →18 → integrated review. Read-only style inventory starts alongside functional work; the coordinator consolidates the applicable visual direction before14–16.17 precedes cosmetic work because toolbar height affects landscape writing. This is sequencing, not authorization to run parallel checkout writers or begin implementation.

The style analysis should inform cosmetic consolidation and reuse these tickets rather than duplicate them. It does not block the functional landscape/scroll fix. Ticket14 owns06 presentation/08 spacing follow-up;15 owns08 section tabs;16 follows the accepted02 compact behavior;17/18 relate to03 without falsely asserting an Instagram toolbar reproduction. Existing accepted scopes stay accepted.07/09 strategy work remains independently pending.

## Owner validation — 2026-10-30

Ticket10 explicitly approved;01/02/04/05/11 reported OK in the exercised iPhone flows. Ticket08 colors accepted, spacing/section navigation still under review. Ticket06 date behavior acknowledged but full-date truncation/compact header requested. Ticket03 remains under follow-up. The nine implementations are local commits, not published. Ticket07/09 remain unstarted; ticket12 is newly prepared. [Detailed acceptance, screenshots, analysis and proposals](../../docs/audits/2026-10-30-mobile-owner-feedback.md). Custom drawer background movement and landscape Essential writing remain open independently of the accepted overlay/compact behaviors. No blanket Safari certification.

Original sequence (2026-10-29; implementation history, not the current correction queue):10 before final visual layout acceptance (font metrics affect spacing), then01 and02/03 with integration on an actual iPhone.04/05/06/08/11 and presentation work in07 are otherwise independently preparable. Coordinate07/09 through the operation state;09 replaces07's temporary strategy leave restriction only when durable server acceptance exists. Ticket11's comparison uses ticket01's dialog reachability. One executor writes in the checkout at a time. Sequence does not authorize agent delegation.

## Shared execution and verification requirements

Start with docs/audits/CURRENT.md and Git status. Read only task dependencies. Implement in existing components/models; preserve strict TypeScript, React Aria focus, session generations, authorized scope, canonical cache updates and action save versioning.

Each functional fix needs a failing regression in the real implementation, controlling the external boundary instead of copying implementation into a test. Run relevant tests, bun run format, bun run lint, bun run typecheck and build for runtime changes. Run bun run test:serverless before a push if its AGENTS triggers apply. Do not create automated write fixtures against production: local dev uses production data.

Record separately: source prepared, controlled browser/test result, actual Safari/device validation, SQL applied and published deployment Ready. No ticket here presumes a migration or remote write is necessary. Update CURRENT, relevant operation/contract documents, and the UI gallery only if a new shared component is actually introduced.

## Source evidence

Screenshots were supplied by the owner from /Users/euchicosousa/Downloads; reference filenames in each ticket identify them. They were not copied into Git. Source inspection supports the listed current behaviors but is not new device execution or database/provider certification.

## Approved reopening behavior

### Reopening an existing action (original item 5)

Final owner decision: show cached content immediately, already editable, and fetch canonical data in the background. If the version matches, do nothing. If a newer version exists, automatically open comparison showing what actually changed, even if the form is clean. No silent refresh or automatic merge. Ticket11 is now prepared; both the prior read-only gate and the later silent-clean-form-refresh proposal are superseded.

Keep the base, current local values and remote snapshot separate. Include remote-only changes in comparison; current ConflictComparison's pending-only field list is insufficient. Display fields are not a write patch. Preserve local refs/IME/media and expected version until explicit resolution. Coordinate any pending save and discard responses older than its canonical confirmation.

The user may accept the current server state or explicitly resolve true pending local edits through existing version-controlled behavior; opening/cancelling comparison never writes. Version checks on save still catch subsequent changes. Same-version responses, failed checks and local typing alone do not falsely trigger remote-change comparison. No background polling or reopening of the separately closed save-recovery/duplication ticket.

## Newly approved follow-ups

### Strategy work after closing everything (original item 9 extension)

Owner explicitly authorized preparing ticket09 for server-owned generation/persistence independent of the drawer. All strategies are currently submitted for saving; only selection is a separate change. Fetch unmount is not cancellation, but a browser-dependent save callback is not durable completion. Ticket09 includes acceptance identity/status, authorized saved action, safe retries, quota, competing changes and recovery after leaving. SQL and implementation are not performed in this preparation round.

### Profile colors and control spacing (original item 8)

Explicitly approved in the latest feedback; ticket08 is prepared. Coordinate final spacing with ticket10 because restoring the web font changes actual metrics.

### Brand font

Investigation authorized and completed at the controlled Chromium/source level. Existing PP Object Sans web faces are not registered by the app entry chain; a local font on the Mac masks this omission. Temporary stylesheet injection successfully loaded the shipped Regular WOFF2. Ticket10 preserves the existing font unless subsequent checks justify replacement. It explicitly verifies Safari format support, file integrity, WOFF2/WOFF fallback and delivery, and identifies exact replacement assets for the owner only if needed. See [diagnosis](../../docs/audits/2026-10-29-font-loading-diagnosis.md). Actual Safari and production are not certified by this probe.

## Separate validation

### Public portal/review validation

Still untested; previously proposed as a separate validation task. Not counted as approved Safari coverage, and no new execution ticket was created in this preparation round.
