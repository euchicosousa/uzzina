# Safari/mobile follow-up — approved tickets and open decisions

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

Suggested sequence: 10 before final visual layout acceptance (font metrics affect spacing), then 01 and 02/03 with integration on an actual iPhone. 04/05/06/08/11 and presentation work in 07 are otherwise independently preparable. Coordinate 07/09 through the operation state; 09 replaces 07's temporary strategy leave restriction only when durable server acceptance exists. Ticket11's comparison uses ticket01's dialog reachability. One executor writes in the checkout at a time. Sequence does not authorize agent delegation.

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
