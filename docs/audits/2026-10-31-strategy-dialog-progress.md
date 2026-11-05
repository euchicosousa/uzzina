# Strategy generation dialog — ticket07

Implemented locally on 31/10/2026 following authorization to execute items1–4 in order. [Ticket07](../../.scratch/archive/resolved-tickets.md#safari-mobile-issues-07-strategy-dialog-progress) owns presentation; durable execution remains [ticket09](../../.scratch/archive/resolved-tickets.md#safari-mobile-issues-09-durable-strategy-generation).

## Behavior

The strategy dialog opens when generation starts, before the provider response. It announces generating/regenerating, saving and canonical saved states separately. Generation errors retain previous strategies and expose a deliberate retry. Closing the dialog preserves the operation and exposes a reopen control even during the first generation; completion and errors do not reopen a dismissed dialog.

Unsaved strategies remain in the existing save coordinator's pending patch. A null write confirmation is not success. Selecting/using strategies is disabled while generation/persistence is pending or strategy changes remain unsaved. Retrying persistence uses the existing explicit action Save/Create path without another provider request; conflicts use the existing authorized comparison, rebase or discard decisions. Selecting and using a strategy waits for its write confirmation before requesting content.

The coordinator owns canonical data; the old unconditional strategy reapplication after a write was removed. A remote version explicitly adopted by the user can therefore discard local generation without being overwritten. Async hook callbacks validate their mounting/opening and query-session generation before applying provider responses. Independent forms retain independent requests and results. Draft generation in this legacy path retains unsaved strategies until existing authorized creation succeeds; opening a draft creates nothing.

The action leave guard remains active while browser-owned generation/saving is pending. This implementation does not claim durability across closing the browser. Prompts, provider/quota, server authorization, schema and environment are unchanged. Existing PrismDialog viewport framing and margin behavior is reused.

## Verification

Real hook regression before implementation:11 pass/4 fail (immediate modal, generation error state, late unmount and session-reset responses). Real drawer progress/error tests were also red before its implementation. Controlled boundaries are AI provider response and database client; actual hook, form, coordinator, editors and Prism dialog remain in the tests.

Hook/coordinator:25 pass. Seven new drawer scenarios cover immediate progress/dismiss/reopen without unsolicited reopening, write failure/retry with one AI call, generation failure/retry with prior strategies, delayed save and leave guard, conflict comparison/rebase unsaved draft/create and explicit conflict discard without stale progress. Independent strategy panels and unmount/session reset are covered by hook tests.

Format, lint, typecheck and production build passed, retaining the existing font-loading lint information and chunk-size build warning. A full drawer run at Bun's default5s test timeout exceeded5s in an existing search-created-draft scenario and cascaded into subsequent test failures; isolated verification with a15s timeout passed that scenario (5.6s). The four affected search cases passed with the15s timeout. Full15s run:93 pass, plus the final discard/activity regression passed separately. After09 integration, the full real drawer suite passed99 tests, including five new durable scenarios; cohorts overlap.

No real paid generation, production login/database mutation, SQL, server restart/cache clearing, env change, commit, push or deployment. Component tests/build do not certify physical mobile/browser use, remote database authorization or rollout.
