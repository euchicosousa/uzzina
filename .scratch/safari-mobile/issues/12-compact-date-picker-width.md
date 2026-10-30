# 12: Fit date-picker calendars to the available mobile width

**Status:** implemented and verified locally on2026-10-30 — normal/increased-text sizing and legibility corrected; awaiting owner-device acceptance. Original screenshot normal-text root cause is not claimed as reproduced. See [diagnosis and verification](../../../docs/audits/2026-10-30-calendar-picker-width.md).
**Blocked by:** none for reproduction. Preserve ticket01 viewport behavior and the approved celebration calendar.

## Report and evidence

Owner's `IMG_9903.PNG` shows the date picker opened from Today on an iPhone: oversized square cells, the rightmost weekday/date column clipped and the next-month control outside the visible area. The owner reports internal scrolling despite sufficient screen space. This is the small date picker, not the operational action calendar's week/day layout.

Source path: `CalendarToolbar` → `PrismPopover` → `PrismCalendar`. Calendar cells combine full-width/aspect-square layout, a minimum cell size and shared icon-button sizing; the popover has its own padding/maximum width. These are inspection targets, not a reproduced root cause. Measure computed sizes before choosing a fix.

## Acceptance

- [x] Reproduce with the real components/CSS/font at phone widths, including 320/375/390/430px, and record popover, grid and cell geometry. Do not infer CSS pixels from screenshot pixels.
- [x] All seven weekday/date columns and previous/month/year/next controls fit simultaneously without horizontal scrolling or clipping. Do not hide overflow to conceal inaccessible controls.
- [x] Choose bounded, consistent day cells based on available width; keep a practical touch target. Avoid stretching square cells simply to fill a large container.
- [ ] Keep selection, today indicator, focus ring and range states legible. Test long month labels, five/six-week months and increased text size.
- [x] Preserve authorized date changes, closing/return of focus, keyboard arrows/Enter/Escape and month/year selection.
- [x] Inventory other PrismCalendar consumers (action date, partner toolbar, celebration, gallery and any range use); verify affected ones, preserving celebration's approved fixed36px layout. Do not globally shrink unrelated app buttons.
- [x] In landscape/with a keyboard, retain vertical scrolling if content cannot fit the actual visible height; the goal is to eliminate unnecessary horizontal overflow, not prohibit necessary vertical scrolling.
- [ ] Add a failing browser geometry regression against real components before correcting. Verify Safari/iPhone separately from controlled Chromium/WebKit runs.

## Verification and boundary

Use controlled HTTP/data and the existing font. Run pertinent tests, format/lint/typecheck/build for the eventual runtime change; record actual device validation and deployment separately. No automatic implementation, production writes, paid generation, SQL or publication from creating this ticket. Coordinate mobile spacing with the [implementation analysis](../../../docs/audits/2026-10-30-calendar-picker-width.md), without redesigning operational calendars.

## Local implementation result

CalendarToolbar now bounds day/navigation squares to32px and reduces only its caption padding; shared PrismCalendar, unrelated buttons, range and approved36px celebration styles remain unchanged. WebKit red at320px/text125% (scroll306/client280) became green (scroll270/client270);30 geometry cases passed including five/six-week months, desktop and100/125% text. Keyboard date/month/year selection, Escape/focus return and short-height vertical scrolling passed. Normal100% screenshot behavior was not reproduced, including the full Today route with controlled HTTP; do not mark that original symptom resolved. Format/lint/typecheck/build passed. Detailed browser results and limits are in the report. No commit/push/deploy, SQL or production writes.


## Completed verification after owner request

Owner requested verification/completion after accepting13/18/17. The final local CalendarToolbar correction uses bounded32–40px days matched to text size, width equal to seven cells,8px popover padding and a caption that wraps month/year with natural trigger height. A real200%-text failure (320px: scroll391/client256) went green (296/296), including numeric/caption text bounds; fonts are not reduced. Normal/125% remain green. Shared calendars/range/celebration36px are untouched.

Clean final verification: WebKit45 fixture geometries plus keyboard/selection/focus/short-height; Chromium15 geometries plus the same behavior; real Today WebKit15 controlled-HTTP geometries. Format/lint/typecheck/build and calendar caption test passed. Two final screenshots visually inspected. Implementation complete locally; physical Safari/iPhone acceptance and publication remain separate and pending. See report for exact source behavior, historical evidence and limits.
