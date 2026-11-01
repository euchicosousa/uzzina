# 09: Persist strategy generation independently of the action drawer

**Status:** implemented-published — permanent09 integrated, committed and published Ready on2026-11-01; real signed worker/scheduler HTTP200 and heartbeat verified. [Rollout record](../../../docs/audits/2026-11-01-strategy-permanent-rollout.md). No paid real generation or physical-device acceptance inferred. No implementation/activation step pending.
**Original proposal:** owner-authorized extension of item 9.
**Priority:** high.
**Blocked by:** none for design/source preparation; any remote database rollout requires verified environment/catalog and an explicit reviewed rollout. Integrates ticket 07 presentation.

## Original problem and behavior (superseded locally; rollout pending)

useActionAI calls the generation endpoint, applies all parsed strategies to local state, then calls updateAction({ strategies: newStrategies }). The full set is intended to persist in actions.strategies, not only the selected option. Selecting an option updates its selected marker and may adopt its headline as the action title.

The fetch does not specify an AbortController; unmounting alone is not a cancellation protocol. However, response handling and saving currently depend on the browser, and prepareLeave prevents closing the action while AI is processing. This is not durable execution after the drawer/page/browser closes.

## Deliverable

An authorized server-owned strategy operation accepts one request, records its identity and state, generates and persists its result, and lets the user close the drawer and later recover progress/results from the action. Completion must not depend on a mounted browser callback.

## Acceptance

Technical implementation and controlled regression criteria below are complete; real scheduler/HTTP/heartbeat verification is in the rollout record. Owner normal-use acceptance of a chosen paid generation is separate.

- [x] Inspect current hosting/runtime and choose the smallest execution design that proves durable progress within its lifecycle. A detached promise, browser-global hook or waitUntil alone is not evidence of restart/retry durability.
- [x] Record accepted operation identity, requesting identity, target action, relevant input/version and observable pending/succeeded/failed state before declaring the operation accepted. Distinguish accepted work from a request that never reached the server.
- [x] Authorize the saved action and operational scope on the server before accepting work; never treat supplied action ID, partner IDs or copied context as authorization. Derive/validate source data and model permissions.
- [x] Generation requested for a draft must first use the existing authorized action-creation flow and receive its canonical ID; if it cannot safely create/save, do not dispatch an orphan generation. Merely opening a draft still creates nothing.
- [x] Preserve five-strategy validation and current editorial prompts. Persist the full result set, including strategy fields; do not implicitly select an option or change action title/content on generation completion.
- [x] Make all five persisted options available on reopen, with canonical success shown only after confirmed persistence. An operation failure is visible and recoverable without pretending generated data is saved.
- [x] Duplicate activation/reconnect/repeated delivery for the same operation does not generate or persist twice. Preserve technical quota reservation before generation; design retries so retrying a write does not call the model again or consume another generation reservation.
- [x] Store/recover a generated result if its final action write fails. Treat ambiguous provider completion explicitly; do not promise exactly-once provider billing without evidence or blindly repeat an uncertain generation.
- [x] Prevent late regeneration results from overwriting newer results or user selection. Detect material action/context changes using recorded inputs/version; preserve unrelated title/content/media edits and route incompatible completion to explicit recovery rather than overwriting the action.
- [x] After server acceptance, closing the strategy modal/drawer or navigating does not cancel accepted work. Keep guards for unrelated unsaved edits, pending saves and other AI operations. Only relax the strategy-generation guard once acceptance/durability is established.
- [x] Closing the page/browser is not cancellation; operation status/result can be recovered on a later authorized visit. No unsolicited modal reopening or routing.
- [x] Logout/reset discards private client subscriptions/cache and old callbacks; server work must not transfer to a new identity. Recheck current authorization before final writes and status/result reads; define revoked/deleted-action behavior explicitly.
- [x] Keep two actions independent. A job belongs to action/operation identity, not primary/secondary slot. Avoid polling when inactive and use bounded status reads when needed.
- [x] No broad service-role access, relaxed RLS, anonymous result endpoints or token exposure. If new tables/models are necessary, document schema/security, migrations, AGENTS and required knowledge artifacts; verify actual grants/RLS and separate SQL prepared from SQL applied.

## Integration with ticket 07

Ticket 07 supplies immediate modal/progress/error presentation and remains independently deliverable with the old guard. This ticket supersedes its temporary guard limitation only for server-accepted durable strategy operations. Keep caption/content/post generation out of this ticket.

## Verification

Regression tests must exercise real acceptance/execution/persistence/status boundaries with controlled provider/database responses: close/unmount after acceptance, reopen/reload, duplicate request, worker retry/interruption, generated-result write failure, conflicting regeneration/selection, edits during processing, draft creation failure, revoked access and session switch. Verify that no browser callback is necessary to save results.

Use an operational rollout plan appropriate to the chosen mechanism; migrations alone do not certify it. Run applicable serverless checks before push and never use paid generations or production fixtures for automated regression. Follow ../README.md.
