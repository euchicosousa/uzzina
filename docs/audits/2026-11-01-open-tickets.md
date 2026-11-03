# Open items — 01/11/2026

## Closed by owner acceptance

Portal/access and login;16 action footer; media controls (remove/reorder/persist); partner identity in AI; Today keyboard focus. Also accepted 01/11: portal header and team/portal login on narrow phones (C1/C2, commit `b1ff935`); permanent strategies 09 real generation (V1); inline title on phone (V8). Earlier acceptances remain valid. Today design concerns belong to the other agent. No further validation requested for these closed items.

## Remaining

| Item | Next step / status |
|---|---|
| [03 — Instagram mobile](../../.scratch/safari-mobile/issues/03-mobile-instagram-editor.md) | Portrait approved. Landscape with keyboard lacks usable space. Evaluate a minimum-visible-space advisory, suggesting rotating the phone to portrait when applicable. Threshold decided: advisory where the Essencial tab starts scrolling (title + metadata + 200px description exceed the scroller height), landscape only for now; portrait with keyboard deliberately out of scope, real-device testing may change it. Presentation/implementation not yet authorized; no new layout implementation authorized. See ticket 03. |
| Forgot/reset password narrow widths — in progress (owner authorized 01/11): follow login pattern | Not yet delivered; these screens use a separate grid that can clip at narrow widths. Recorded on delivery. |
| Media drag delay | Study later: owner reports roughly1s delay on mobile, shorter on desktop, with the dragged item suspended before settling. Not independently reproduced; separate from approved media functionality. |
| Carousel gesture — investigation in progress | Optional sideways swipe/slide transition instead of direct image replacement. Enhancement suggestion, not a confirmed defect; investigation running separately, recorded on delivery. |
| [Style/accessibility — Linear + Swiss Design System](../../.scratch/visual-consistency/README.md) | Deep 5-stream audit completed ([2026-11-01-strict-design-system-audit.md](2026-11-01-strict-design-system-audit.md)), canonical specification in [docs/design-system.md](../design-system.md) and 10 ready-for-agent tickets (`01`–`10`) published in `.scratch/visual-consistency/issues/`. |
| [AI usage in My Account](../../.scratch/ai-usage/issues/01-ai-usage-visibility.md) | Deferred by owner. |
| [Social planning](../plans/social-planning-ticket-breakdown.md) | Deferred by owner; seven proposed deliveries, no new tickets started. |

07/09 and K04/K05 delivered. Optional platform maintenance and unreproduced bulk date/time focus candidate remain recorded for later, without new tickets. Inline title remains delivered in the general use checklist, without a separate ticket; no new specific acceptance inferred. Historical decision specifications and pending-acceptance statements are superseded by this owner feedback where applicable.

Documentation only: no code changes, automated tests, paid AI generation, SQL or deployment for this update.
