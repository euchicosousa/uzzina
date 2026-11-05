# Calendar picker width — 2026-10-30

Ticket: [12](../../.scratch/archive/resolved-tickets.md#safari-mobile-issues-12-compact-date-picker-width). Result: implemented and verified locally, awaiting owner-device acceptance. The original screenshot's normal-text root cause was not reproduced; this does not prevent completing the demonstrated width/legibility correction. The normal and enlarged-text source behavior is verified with the real components and Today route. No physical Safari acceptance or publication is claimed.

## Evidence and diagnosis

The real `CalendarToolbar` → `PrismPopover` → `PrismCalendar`, application CSS and local PP Object Sans were exercised in an isolated server on127.0.0.1:5190. Chromium and WebKit26.5 mobile/touch emulation passed the initial normal-text checks at320/375/390/430px. The complete Today route was also checked in WebKit using fictitious authenticated HTTP responses: popover246.48px, grid214.48px, day30.64px, seven columns and next navigation visible at all four widths. This does not reproduce `IMG_9903.PNG` or certify the owner's Safari version/device.

The explicit increased-text acceptance case did go red:320px with root text125% in WebKit, popover clientWidth280 versus scrollWidth306; grid265.67px, last column and next control extending to297.67px beyond the popover's292px right edge. The caption's month/year padding and rem-sized controls determine an intrinsic width beyond the available content area; percentage/aspect-square cells then follow that width. Shared icon-button48px was considered but computed sizes ruled it out for this reproduction. No speculative global calendar change was applied.

The one-line `CalendarToolbar` calendar override sets32px day/navigation size, removes outer day aspect sizing, fixes inner day squares at32px and uses smaller local caption padding. Day text remains its normal inherited size, including125%; overflow is not hidden, and necessary vertical scrolling remains. Scope includes Today, Home Today and the partner toolbar through their existing shared component. Normal-text days now32×32px, grid224px, popover256px. At125% in September: day32×32px, grid229.67px, clientWidth270=scrollWidth270. November/May also fit.

## Consumers and scope

- `CalendarToolbar`: Today page, Home Today, and partner toolbar; only changed consumer.
- `ActionDatePicker`: calendar/time popover; unchanged.
- `BulkDateTimeDialog`: calendar in its existing w72 dialog; unchanged.
- Celebrations admin: full-width calendar; unchanged.
- `CelebrationDialog`: approved36px days, full-width grid, hidden outside-month dates and today dot; its real source override is unchanged. No copied fixture is used as proof.
- `FlowDateFilter`: one-month range calendar; unchanged. The shared multi-month implementation also remains unchanged.
- No calendar example was found in the current `/ui` gallery.

## Verification

Permanent loop: `scripts/check-calendar-width-browser.cjs`, fixture `tests/fixtures/calendar-width-browser.tsx`. It blocks external HTTP, rejects port5176 and imports actual components, CSS and the local font. Launch an isolated Vite server with React/Tailwind, tsconfig paths, a distinct cache and no API middleware, then set `CALENDAR_TEST_URL` if using a port other than5190. `CALENDAR_ENGINE=webkit` selects WebKit; the default is Chromium. `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_BROWSERS_PATH` can point to the installed runtime/browser bundle. `CALENDAR_BEHAVIOR_ONLY=1` runs the keyboard/short-height check alone.

- WebKit:30 geometry cases passed:320/375/390/430/1440px ×100%/125% text ×September/November/May2026 (five/six weeks). Assertions cover all seven weekday columns, caption controls, scrollWidth/clientWidth,32px squares and Escape/focus return. Separate final behavior run passed after correcting test locators and waiting for the inner select overlay to finish closing before Escape: ArrowRight/Enter selects16September, month/year select November2027,220px height retains vertical scrolling at125% text.
- Chromium: the same30 geometry cases and final keyboard/month/year/Escape/focus/short-height checks passed.
- `bun test tests/prism-calendar.test.tsx`:1pass,0fail (caption tab order).
- `bun run format`, `bun run lint`, `bun run typecheck`, `bun run build`:passed. Lint retains the preexisting informational `useTemplate` finding in `tests/font-loading.test.ts`; build retains the existing large-chunk notice.

The normal-text original symptom and physical iPhone/Safari acceptance remain pending. Text125% is a controlled root-font-size case, not a claim about the owner's device settings. No actual keyboard, browser chrome or pinch-zoom certification. No database, provider, SQL, paid generation, production writes, commit, push or deploy. Owner's server5176 and its cache were untouched. Other uncommitted title/toolbar/documentation changes were preserved. Temporary launcher is removed and isolated server stopped after checks.


## Resumed execution after owner request

The owner asked to verify and finish12 after accepting13/18/17. The prior fixed32px version was rechecked in the real `/app/today` route: all four phone widths and1440px passed at100/125% text. A further meaningful accessibility case,320px with200% text, failed against that version: clientWidth256 versus scrollWidth391, grid326.67px. Bounding the day squares alone did not bound the caption or preserve larger numeric glyphs.

The final correction remains entirely local to `CalendarToolbar`:

- Day/navigation size is `clamp(32px, 2em, 40px)`:32px at normal text,35px at125%,40px at200%. Numbers keep their larger font and fit within the square; a36px probe failed the glyph-width assertion at200% and was replaced.
- Calendar width is exactly seven cell sizes with a maximum of its available width. Popover has8px horizontal padding and a viewport-relative width cap with16px total outer allowance. No overflow is concealed.
- Caption center can wrap month/year into separate rows; header and selector triggers have natural height with a minimum cell-height. Their text is not scaled down, cropped or forced into32px height. DOM/focus order remains previous → month → year → next.
- `PrismCalendar`, other consumers,36px celebration presentation, range selection and shared buttons are unchanged.

Final browser assertions include every day label's text bounds and month/year text bounds inside their triggers, not just button rectangles. Inspected screenshots outside Git: `/tmp/uzzina-calendar-320-200.png` and `/tmp/uzzina-calendar-390-100.png`; seven columns, arrows, month/year and numeric glyphs are visible. At200% the caption uses two rows. The coordinator also reviewed these captures without an additional finding.

The clean final isolated server disables HMR: an intermediate run's geometry and interactions passed but its global verdict failed on a transient Vite module/HMR error while fixtures were being edited. That run was not counted as the clean final result.

Final verification: WebKit45 geometry cases (five widths ×100/125/200% ×three five/six-week months) plus keyboard/month/year/Escape/focus/short-height behavior; Chromium15 geometry cases (five widths ×three text sizes, September) plus the same behavior; complete Today route WebKit15 geometry cases (five widths ×three text sizes, controlled current date). All passed. Existing earlier normal/125% three-month coverage remains recorded above; no unrelated test suites were repeated. `bun test tests/prism-calendar.test.tsx`1pass; format/lint/typecheck/build passed, with only the previously recorded informational lint/build notices. Normal geometry: grid224px, popover240px;125%: grid245px, popover261px;200%: grid280px, popover296px. ClientWidth equals scrollWidth at each size.

Implementation is complete for the tested source behavior. Remaining validation is the owner's physical iPhone/Safari acceptance and any eventual deployment; the screenshot's original normal-text cause is not retroactively attributed to the increased-text finding. No production/database/provider writes, paid AI, SQL, commit, push or deploy. Owner's5176 server/cache and external changes remain preserved. Isolated5190 and temporary launch/probe files are removed after verification.

## Owner acceptance — 2026-10-31

Owner confirmed ticket12 passed the device checks and authorized closing/committing its acceptance. Implementation remains in `ceafc6f`; no new execution or publication is inferred.
