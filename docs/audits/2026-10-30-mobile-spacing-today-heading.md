# Mobile spacing and complete Today heading — 2026-10-30

## Authorized scope and state

Owner authorized ticket14 after the celebrations double-scroll correction19. This agent held the sole checkout write slot after19 handed it back. Existing uncommitted title files,19 source/tests/contract and unrelated planning/documentation were preserved. No commit, push, deploy, SQL, real database/provider mutation or paid AI generation was performed. Root owns CURRENT and queue consolidation.

Applied diagnosing-bugs for the red/green loop and writing-for-agents for the AGENTS contract update. This is the local Today/HomeToday/Profile correction; no shared tab semantics, footer restyling or general style audit was implemented.

## Reproduction and changes

`tests/today-page-heading.test.tsx` was changed first to require one complete date string. Before runtime changes, four tests failed and three passed: the heading contained separate abbreviated/full variants. The new permanent `scripts/check-mobile-spacing-browser.cjs` then measured the real authenticated routes, application CSS and shipped Object Sans, with controlled session/HTTP boundaries.

| Normal-text measurement | Before | Prepared result |
| --- | --- | --- |
| Today/HomeToday content left at390px |49px |21px |
| Dedicated Today header at390px |101px |93px |
| HomeToday header at390px |224px |118px |
| Profile mobile outer/top padding |16px |12px |
| Profile section top padding / gaps |24px /24px |12px /16px |
| Dedicated Today desktop1440px header |97px |97px |
| HomeToday desktop1440px header |144px |144px |
| Desktop profile padding / section gaps / save height |32px /24px /40px |32px /24px /40px |

Dedicated Today now uses the full weekday/date wording on every width, including Hoje and a different year when applicable. Its single text node remains available to assistive technology; CSS supplies one-line ellipsis. An initial one-row mobile probe left only71px of title at375px. The final layout wraps naturally using a useful heading basis, preserving the complete visual date prefix rather than reducing it to a few characters. Portrait controls use a second row; landscape844px fits one65px header row. All existing date/view controls keep their target sizes.

Mobile gutters/padding are reduced only on the two Today components. HomeToday opts into compactMobile on the existing HomeViewWrapper; other consumers retain their original classes. Home keeps its separate heading, natural height and existing Kanban behavior. No board logic, Today scroll-reset keys, AppBar reservations or height hook changed.

Profile reduces only local mobile padding/gaps. Its choices and switch cards can wrap long labels; save can grow and wrap at increased text size while keeping its touch minimum. Desktop classes restore the prior layout. Both account sections stay mounted, the single manual form/native invalid-field reveal remain intact, and no theme/persistence behavior changed. The increased-text probes preserved font size rather than shrinking it to pass.

## Verification

- `bun test tests/today-page-heading.test.tsx tests/today-date-navigation.test.tsx tests/today-preferences.test.tsx tests/profile-palette-swatches.test.tsx`:30 pass,0 fail,130 expectations. Date/navigation/year/Home-title, preferences and palette/manual preview coverage retained.
- Chromium:70 real-route layout/state assertions passed. WebKit:71 passed, adding an explicit settled-layout check. Widths320/375/390/430/844/1440px, portrait/landscape, shipped font, desktop geometry,200% root text at320px, date/control containment and independent page/profile scrolling were exercised.
- Profile checks include mounted values through section/resize changes, native validation exposing/focusing the hidden personal section, zero writes for layout/invalid/draft changes, and one explicit controlled profile+preferences save preserving an unknown preference key. These were HTTP fixtures; no real Supabase write occurred.
- `bun run format`, `bun run lint`, `bun run typecheck` and `bun run build` passed. Lint retains only the preexisting informational useTemplate finding in font-loading.test.ts; build retains the existing large-chunk advisory. Diff whitespace and local references checked. No additional broad suite was needed.
- Coordinator reviewed Today390/100%, Today320/200%, Home390 and Profile390 screenshots without new findings. Temporary captures/logs are under `/tmp/uzzina-mobile-spacing/`; they are operational artifacts, not repository assets.

## WebKit scheduling notification control

The first WebKit run met the layout/state assertions except an exact bottom comparison843.984375 versus844px. The assertion now uses the same1px subpixel tolerance as the existing profile checker.

WebKit also reported exactly two `ResizeObserver loop completed with undelivered notifications.` scheduling notifications during the Today and Profile200% text transitions. A bounded read-only control served the five prior ticket14 source files from HEAD and included their prior Tailwind classes in a temporary source; it reproduced the same literal notification twice in the same phases. The checkout was never swapped, and19 remained in place. Thus this was not introduced by14.

The final checker separates only that exact scheduling message, records its phase/count and requires no further notification during500ms after settling. All other page errors still fail. Final WebKit: two transition notices, no recurrence,71 checks passed. The shared useFillScrollViewport hook was preserved rather than refactored for a preexisting transient scheduling notice.

## Limits and environment

Real routes used isolated Vite at127.0.0.1:5191 with its own cache and no API middleware/route generation. The temporary prior-source control used5192 with a separate cache. Both servers were stopped after verification. The owner's production-backed5176 server/cache were untouched. External requests were fulfilled from controlled data or blocked; the script rejects5176 and non-loopback hosts.

At320px/text200%, other existing Home sections and AppBar still have overflow outside this bounded task. The corrected HomeToday content stays contained; its intentional full-viewport decorative divider is excluded from child-content overflow assertions. Those unrelated layouts were not redesigned or represented as fixed.

Automated desktop WebKit/Chromium and changed root text size do not certify a physical iPhone's software keyboard, Safari chrome or the published app. Owner acceptance for14 on the device remains pending. Prior13/18/17 acceptance remains valid in its reported scope. Code is prepared locally; no production publication was attempted.
