# Pending decisions, acceptance and priority — 01/11/2026

Consolidation requested by the owner after permanent09 publication. Based on CURRENT, the style review through round3, AI-usage ticket, planning proposal and existing acceptance records. This document does not implement the proposals or change existing acceptance. Recommendations are proposals for the owner's decision.

## How to read priority and effort

- High urgency: affects access, core operation, legibility or verification of newly published critical behavior. This is prioritization of recorded evidence, not a new production-incident declaration.
- Medium: affects recurring operation or unlocks a product delivery.
- Low: appearance, optional maintenance or a future feature without a current blocker.
- Easy: localized change or short owner acceptance. Medium: several consumers/states. Hard: new measurement/persistence/authorization or a broad interaction change. These are relative estimates; a failed acceptance needs diagnosis before estimating its correction.

The decision itself and its implementation have different effort. Choosing a palette policy is quick; verifying all palettes/consumers is medium work.

## 1. Authorize objective fixes

These are findings/proposed scopes from the other agent's style review. The owner can authorize a bounded batch; existing accepted scopes remain accepted. The new portal finding concerns narrower phones/multiple partners beyond the previous exercised cases.

| Ref | Scope and acceptance | Urgency | Effort |
|---|---|---|---|
| C1 | Portal header on320–375px: greeting, partner picker and Sair remain visible/reachable with multiple partners and long names; no horizontal page overflow. | High | Easy |
| C2 | Team login on320–430px: fields and Entrar fit; desktop remains intact. Note: since commit 08a0006 the portal login `/dash/login` uses the same `grid-cols-[2rem_28rem_2rem]` frame as `/login` (`app/routes/dash/login.tsx:66`, `app/routes/login.tsx:58`), so the narrow-phone clipping found for the team login (style report A1: fields cut at 320/375, card cut at 390) likely also affects the portal login. Unverified at runtime. 08a0006 is committed and pushed but not deployed; production remains a714b2d (`dpl_Fe9vmb1gTokKiPGEeP2qAXDK33rz`). | High | Easy |
| C3 | Remaining unnamed controls, invisible focus and autocomplete: name actual controls, show keyboard focus, preserve editor/popover behavior. These are additional occurrences from round3, not reopening the already fixed K03/K04 occurrences. | High | Medium |
| C4 | Text/field/status contrast: correct failing combinations; authorize the palette/border policy in D7/D8. Passing legibility is the target, not a personal preference to waive it. | High | Medium |
| C5 | Admin320px layout/names, AppBar width, drawer tab labels and badges under enlarged spacing: all labels and controls remain readable/reachable. | Medium | Medium |
| C6 | Action cards with nested interactive controls and alternate movement paths: preserve opening, selection, drag and inner commands while correcting semantics/keyboard operation. Coordinate D10. | Medium | Hard |

C1/C2 implemented locally on 01/11 (see CURRENT), awaiting owner check; not deployed. Suggested execution order: C1/C2 → C3/C4 → C5 → C6. Creating individual correction tickets or starting the batch still depends on the owner's execution choice; this table creates no new tracker tickets.

## 2. Visual and interaction choices

Recommendations below are this consolidation's proposals. They do not replace a choice already recorded by the owner.

| Ref | Exact choice | Recommended starting point | Urgency | Implementation effort |
|---|---|---|---|---|
| D1 | Text links use primary color or muted gray? | Primary where contrast passes; distinguish links from secondary text and preserve keyboard focus. | Low | Easy |
| D2 | Header avatar/bell remain circular or follow squircle? | Keep circular for this round, preserving the familiar header; fix focus independently. | Low | Easy |
| D3 | Approve one heading scale across Home/Admin/Leads/Profile? | Page30px mobile/48px desktop and section24px as the proposal; preserve approved Today/Profile behavior and test wrapping. | Medium | Medium |
| D4 | View switching uses one universal control or stays contextual (portal tabs, partner toggle, Today options)? | Keep contextual choices and common Prism interaction/focus rules. | Low | Medium |
| D5 | Home's other sections adopt the compact mobile spacing already used by HomeToday? | Yes, mobile only; preserve the approved global header and dedicated Today spacing. | Medium | Medium |
| D6 | Help mobile selector remains native or becomes PrismSelect? | Keep native initially; unify only if its actual behavior warrants migration. | Low | Easy if unchanged |
| D7 | Approve stronger field borders/background separation where current field boundaries fail contrast? | Yes, minimally strengthen boundaries in both themes rather than retaining the failing combinations. | High | Medium |
| D8 | Approve changing primary/background/foreground lightness for failing palettes? | Yes, only what is needed for legibility, preserving hue/identity and checking text, focus and status chips. Do not remove palettes automatically. | High | Medium |
| D9 | Add a keyboard-visible “Ir para o conteúdo” control to bypass repeated navigation? | Yes; focus/scroll only the correct main region, without changing ordinary mouse layout. | Medium | Easy/medium |
| D10 | Accept the drawer as the keyboard alternative for movement, or require direct keyboard movement in boards/calendars? | Use the drawer where it produces the same phase/date/responsible result; identify any drag-only operation still lacking an equivalent before closing the scope. Media keyboard reordering remains preserved. | Medium | Medium via drawer; hard for direct movement |
| D11 | Authorize internal consolidation of duplicate destructive/error button variants? | Yes, use the existing error pattern through a consumer migration, preserving action confirmations/meaning. This can be delegated as technical work. | Low | Medium |

Source reconciliation: CURRENT mentions12 decisions on the private approval site; the repository report explicitly enumerates11 (six original plus five added in round3). The missing correspondence must be reconciled by that review's author; no twelfth owner requirement is invented here. The source style report is still separate work in the shared checkout.

## 3. AI usage in My Account

Already recorded: compact read-only information inside My Account, agency-level direction, no provider costs exposed, no new navigation/dashboard and no new generation block. These do not need to be chosen again. The current technical counter records attempts/user/UTC day and is not weighted token consumption.

Overall urgency: low/medium; no generation blocker. Overall implementation: hard compared with the visual fixes, because real usage recording and agency authorization are required.

| Ref | What the owner must specify | Recommended starting point |
|---|---|---|
| U1 | Which internal people share the same agency allowance, and who may see the aggregate: all authorized members or only admins? | Agency-authorized active internal members see the aggregate; external portal accounts do not. Describe the business membership; implementation verifies its actual database link. Partner/client are not assumed to be agency. |
| U2 | Period and reset timezone: calendar month or another cycle; which timezone? | Calendar month in America/Fortaleza. This display/measurement period does not change the existing UTC technical daily quota. |
| U3 | What amount represents100%, in which internal units, and how weighted model/token use converts to those units? | Explicit configurable agency reference and versioned conversion. No numeric allowance/factor has been chosen. Supply the intended allowance or choose an initial display without percentage until a valid reference exists; never derive percentage from the100-attempt daily safety cap. |
| U4 | Who may maintain allowance/conversion/pricing versions, and when do changes take effect? | Restricted technical/owner administration; new reference from the next period and no silent historical recalculation. Agency admin does not automatically receive provider-price visibility. |
| U5 | Exact placement/minimum presentation inside My Account? | Compact block at the end of Preferences: period, percentage when defined, freshness/incomplete state. Read-only and independent of saving the profile. |
| U6 | Approve measuring only the existing enabled generation flows initially, with measured history starting at activation? | Yes. No model selector or new model scope. Provider identifiers, actual enabled models, tariffs and available usage fields are technical verification for implementation, not values the owner must invent. No fabricated historical token use. |

Required to begin the intended percentage-based delivery: U1–U4 resolved; U5/U6 can be approved together with the proposed minimal version. Official tariffs/contracts will be checked when implementing, rather than choosing speculative values in this document.

## 4. Social planning proposal

Overall urgency: medium only if it is the next business priority; otherwise low. Implementation: hard, seven proposed vertical deliveries. No executable planning tickets have been published yet.

Already recorded: by commercial partner; accessible to authorized team members; global search/menu plus partner-page access; current Contexto/Tom; theme/quantity or period/frequency; editable suggestions; optional formats and commemorations; approved suggestions become actions; each new generation is integral and independent. These are preserved.

| Ref | Remaining approval | Concrete proposed behavior |
|---|---|---|
| P1 | Depth of a suggestion and minimum input | Title, format, objective and brief/approach, plus a short distribution analysis. Full script/caption remain in action production. Context or request must explain the subject; voice may be empty; missing facts are identified, not invented. |
| P2 | Frequency/count/distribution details | Inclusive period;1–7 posts/week; suggest weekdays that the user may change; count actual weekday occurrences including partial weeks and show total before generation. No four-week-month approximation. Theme mode takes an integer quantity and may start undated. |
| P3 | Formats and commemorative extras | Optional exact static/carousel/reels distribution must sum to regular quantity; without it AI chooses. Commemorations start off; when on, only existing complete dates inside the period are considered, with no annual recurrence invention or internet search. Relevant extras explain their relation and add to regular quantity. |
| P4 | Review, pending items and finalization | Explicitly save edits/decisions. Pending/rejected items remain in history and stay out of created actions. Before finalizing show approved/pending/rejected totals and require a date for each approved item. Successful finalization closes that proposal's review; new ideas use a new proposal. |
| P5 | Default time and date safeguards | Explicit shared time initially11h in the operational timezone, adjustable before confirmation. Undated theme suggestions must be dated first. No implicit movement to today/now+10min. |
| P6 | Initial limits | Up to50 regular suggestions,10 extras and90 days. Reject excess visibly before provider call, without truncation. Implementation verifies output/runtime feasibility before claiming these limits supported. |
| P7 | Approve the seven-delivery division | Theme generation/reopen → review → period/frequency → format distribution → commemorative extras → suggestion calendar → finalization into actions. Only real dependencies block work; publishing tickets does not start all deliveries automatically. |

Technical invariants retained without a new preference vote: server-authorized partner/team scope, session isolation, generation-request idempotency and at-most-one action per approved suggestion despite retries. No new agency model is required for this planning scope.

## 5. Accept or report failure for implemented work

Owner accepted V2, V3, V5, V6 and V7 on 01/11 (see open tickets, "Closed by owner acceptance"); V4 is partly decided. These are user checks, not requests for another design choice. Use own suitable records; report pass/fail with page/device/steps. Passing a narrow check does not imply every scenario/device is certified.

| Ref | Item and exact short check | Urgency | Effort to validate |
|---|---|---|---|
| V1 | Permanent09: generate on an action, let server acceptance finish, close and later reopen; all five saved strategies appear, without automatic selection/title replacement. Infrastructure already verified. | High after publication | Easy |
| V2 | Partner identity in AI: **accepted by owner 01/11, closed.** | Closed | None |
| V3 | Local portal: **accepted by owner 01/11 after the address rule was removed (a714b2d); closed.** No normalization applies. | Closed | None |
| V4 | Instagram03: portrait accepted. Landscape advisory threshold decided 01/11: where the Essencial tab starts scrolling (title + metadata + 200px description exceed the scroller height), landscape only; portrait with keyboard out of scope for now. Presentation/implementation not yet authorized. Accepted13/17/18 remain accepted. See [ticket 03](../../.scratch/safari-mobile/issues/03-mobile-instagram-editor.md). | Medium | Medium |
| V5 | Media controls: **accepted by owner 01/11, closed.** | Closed | None |
| V6 | Footer16: **accepted by owner 01/11, closed.** | Closed | None |
| V7 | Today focus: **accepted by owner 01/11, closed.** | Closed | None |
| V8 | Inline title, without its own ticket: editing/cancelling/saving a one-line title on phone does not change card/neighbor height. | Low | Easy |

Header, portal visual,12 and15 retain their prior acceptance. C1 is the later narrower-phone/multiple-partner portal finding, not cancellation of the earlier approval.

## 6. Investigation and maintenance

| Item | Actual next step | Urgency | Effort |
|---|---|---|---|
| Bulk date/time focus candidate | Reproduce with steps/device before defining a fix or creating a ticket. No owner feature decision is missing. | Low until reproduced; reassess impact afterward | Unknown |
| Platform advisories / pg_net schema | Decide whether to defer optional schema maintenance or authorize a separately reviewed maintenance plan. Worker is active with signed requests; default net schema is not Data-API exposed. Drop/recreate was rejected automatically for shared-object risk; no bypass attempted. | Low, no new blocking incident established | Medium/risk-sensitive |

Recommended sequence now: V1 (09 real generation check) and V8 → V4 presentation decision → approve C1/C2/C3 and contrast policy D7/D8 → aesthetic choices → U1–U6 → planning approval when selected as business priority. The owner may approve recommendations by group and specify only exceptions; missing numeric agency allowance/conversion still needs explicit resolution.

## Evidence and limits

Sources: [CURRENT](CURRENT.md), [open tickets](2026-11-01-open-tickets.md), [style rounds1–3](2026-10-31-style-analysis.md), [AI usage ticket](../../.scratch/ai-usage/issues/01-ai-usage-visibility.md), [planning proposal](../plans/social-planning-ticket-breakdown.md). Style runtime used controlled data; it is not a new live incident audit. Urgency/effort and suggested defaults are this consolidation's estimates. No implementation, deployment, database/provider call, new tracker ticket or owner acceptance was performed by writing this specification.
