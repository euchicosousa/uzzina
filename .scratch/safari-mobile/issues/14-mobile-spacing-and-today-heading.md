# 14: Reduce wasted mobile space and truncate the complete Today date

**Status:** implemented and owner-approved on2026-10-30 for the reported scenarios; local commit authorized. No push or deploy.
**Priority:** normal.
**Blocked by:** none. Coordinate shared style recommendations; this bounded mobile correction need not wait for a general audit.

## Delivery

Use the full selected-date text with one-line ellipsis on the dedicated Today page and reduce accumulated mobile spacing in Today, Home Today and Profile while preserving the approved desktop composition. Evidence: `IMG_9902.PNG`, `UZZINA.png`, `UZZINA 2.png`; [implementation analysis](../../../docs/audits/2026-10-30-mobile-spacing-today-heading.md).

## Acceptance

- [x] Measure nested margins/padding/gaps and usable content/header height before/after at320/375/390/430px and landscape. Specify local mobile overrides; do not globally shrink spacing or touch targets.
- [x] Dedicated Today uses the complete date wording and truncate, not a special mobile abbreviation. Keep selected day, today and different-year rules; full text remains available to assistive technology.
- [x] Give the heading a shrinkable width and preserve access to every date/view control. Reduce header height without clipping controls; use measured wrapping where one row cannot fit.
- [x] Reduce unnecessary outer/inner spacing in Today, Home Today and Profile, preserving legibility, focus indicators, comfortable touch targets and full text under increased text size.
- [x] Home's Today component stays separate: do not replace its heading with the dedicated page's date. Preserve natural Home height and existing Kanban behavior.
- [x] Preserve desktop spacing/composition, Profile mounted values/manual save/native validation, independent scroll regions, Today scroll reset and AppBarSpacer reservations.
- [x] Add relevant regressions on actual components before runtime changes; verify layout at the listed widths and a representative desktop width with the shipped font. Document actual device acceptance separately.

## Coordination and boundary

Supersedes the presentation follow-up of ticket06 and spacing remainder of08, not the accepted date logic or palette colors. Ticket15 owns profile tab appearance/semantics; ticket16 owns footer frames. General style analysis inventories wider inconsistencies without expanding this implementation to every page. Follow README checks. No implementation, commit or publication in this ticket-preparation round.

## Implementation and verification — 2026-10-30

Owner authorized this bounded correction after ticket19. [Operation report](../../../docs/audits/2026-10-30-mobile-spacing-today-heading.md) records red/green measurements, checks and limits.

- Dedicated Today renders one complete selected-date string with ellipsis, preserving today/year rules and the full accessible text. Natural header wrapping leaves a useful title width rather than squeezing it beside all controls.
- At390px, Today/Home content starts at21px rather than49px. Today header101→93px, Home Today224→118px; at844px the dedicated header is65px. Home keeps its own title and natural height. HomeViewWrapper's compactMobile flag is opt-in only for HomeToday, preserving other blocks.
- Profile's local mobile gutters/top padding are12px; section padding24→12px and gaps24→16px. Local choice/switch/save wrapping preserves full labels at200% text and touch sizes. Desktop1440px spacing/composition and40px save height are unchanged.
- Four heading tests failed before correction;30 relevant component tests now pass. Chromium70 and WebKit71 real-route/browser assertions passed across320/375/390/430/844/1440px, including200% text, state retention/native validation and one explicit controlled profile save. Format/lint/typecheck/build passed.

The unchanged viewport-height hook produces two transient WebKit notifications (`ResizeObserver loop completed with undelivered notifications.`) during200% text changes on Today/Profile. A read-only previous-source/classes control reproduced the same two; the final check requires no recurrence after500ms of settling. Other page errors remain failures. Full Home/AppBar have preexisting overflow at320px/text200% outside this ticket; the corrected HomeToday content and the authorized date/profile controls remain contained. Screenshots reviewed by the coordinator. Physical iPhone/Safari acceptance remains separate; no production/database/provider writes or owner-server restart.

## Subsequent owner feedback

Owner accepted14/19 and requested their commit. The separate top-alignment follow-up from UZZINA9.png will be investigated after this accepted implementation and before15; it is not claimed fixed in this commit.


## Top alignment follow-up — clarified 2026-10-31

Owner clarified that “top” means the global logo/menu Header. The initial Today-heading interpretation was withdrawn before commit; accepted14 page spacing is preserved. Header now aligns to the inner vertical frame edges, including the actual scrollbar gutter. Chromium36/WebKit36 bounded assertions passed; final integrated results are in the [follow-up report](../../../docs/audits/2026-10-30-today-header-alignment.md). Local correction, awaiting owner-device acceptance;14/19 remain accepted and committed as `53508d2`.
