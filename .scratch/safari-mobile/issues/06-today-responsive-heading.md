# 06: Show a consistent responsive date in the dedicated Today heading

**Status:** ready-for-agent — ticket preparation authorized 2026-10-29; implementation not started.
**Original proposal:** item 7. **Priority:** normal.
**Blocked by:** none.

## Evidence and entry points

IMG_9838.PNG and IMG_9839.PNG: today's title is only “Hoje”; a different date has a much longer heading that wraps. The latter also displays “Nenhuma ação para hoje.” Inspect TodayPageView, useTodayTitle and the shared TodayViewParts consumers.

## Acceptance

- [ ] Dedicated Today page always identifies the chosen date, including today.
- [ ] Wide-screen examples: “Hoje, quinta-feira, 29 de outubro” and a full weekday/date for another day, consistent with existing localization.
- [ ] Narrow-screen examples: “Hoje, 29 out.” and “Qua., 25 nov.”. Include year where needed to distinguish another year.
- [ ] Keep the same alignment/hierarchy across selected dates. Avoid avoidable two-line headings on normal phone widths; do not solve fitting by clipping meaningful date content.
- [ ] Compact mobile spacing between heading/date and view controls while retaining usable touch targets.
- [ ] Empty state for a different day says “Nenhuma ação para este dia” or equivalent date-correct copy. Inspect shared consumers before changing the copy so no misleading “hoje” remains.
- [ ] Preserve chosen day, router/calendar navigation, Back, defaultTodayView initialization, manual view selection, measured height, scroll resets and AppBar spacing.
- [ ] Do not redesign HomeTodayView or inadvertently expand its heading through a shared helper; dedicated-page improvements need not propagate to Home.

## Verification

Real heading/route behavior for today, another date, long weekday/month, another year, narrow/wide screen, day changes and Back. Assert selected-day meaning, not just copied formatting logic. Verify desktop header and mobile fit visually. Follow ../README.md.
