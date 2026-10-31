# Today focus and complementary inspection — 2026-10-31

Owner authorized this existing ticket within the five-fix queue. The assigned agent prepared the test and bounded inspection, then hit its usage limit; the coordinator completed implementation and verification. One checkout writer at a time. No new ticket was created.

## Correction and regressions

The real Today/Home test first failed12 cases: seven wrapper Tab/loading cases and five contextual creation-name cases. Early fixture selectors were corrected to include the avatar in the partner link name and the actual category title; these harness mistakes are not product defects. The real CSS/browser baseline separately confirmed forward/empty-backward Tab and direct background clicks focusing the wrapper, plus invisible unnamed creation buttons.

Today keeps the named scroll region and its keyed reset, AppBarSpacer and controls. `tabIndex=-1` prevents both explicit and native sequential scroller focus. A local mouse-down guard prevents direct background clicks from focusing the region; descendant controls retain normal events. The wrapper ring is removed. Partners/Categories creation buttons have contextual names and reveal on React Aria focused state, preserving hover/rest behavior and keyboard focus indicators. Home shares the corrected creation controls. No global focus trap, navigation changes or writes on draft opening.

Final focused suite:12pass/0fail/40 expectations. The integrated Today/heading/date/Prism/Profile/Header suite passed35 tests; after the final focus-reveal refinement, the27 Today/heading/date tests passed again. Browser details are finalized below. The harness waits for CSS transitions and imports; its WebKit attachment check focuses the link explicitly because native link traversal depends on platform keyboard settings.

## Final browser result

`scripts/check-today-focus-browser.cjs` passed37 groups in Chromium and37 in WebKit:390/1440px, light/dark, Partners/Categories/Feed populated/empty, forward/backward Tab, direct region-background click, real focused creation visibility/names, contextual draft activation, inner scrolling, Home creation and attachment-link→remove keyboard flow. Source and CSS are real; no application logic is copied into the fixture. Creation opens drafts only.

The isolated Vite harness initially reused pages and hot reload; WebKit recorded cancelled module imports during its first page load. A reduced10-group run passed. Lifecycle tracing then captured cancelled local scripts (not a provider/network diagnosis). The final harness uses fresh pages, waits for imports/transitions, and runs against an isolated server with hot reload/file watching disabled after dependency warmup. The final37-group WebKit run was clean with the page-error assertion still active; no broad error suppression was added. The final focused-state change also preserves visibility for programmatic/pointer focus. Chromium's37-group source verification passed. Native device/OS keyboard preferences remain outside these controlled engines.

Isolated5187 stopped on completion;5176 was not restarted or reconfigured. Final global format/lint/typecheck/build and7 native packaged serverless checks passed. See CURRENT for integrated test counts. Temporary final logs: `/tmp/uzzina-focus-chromium-final.log`, `/tmp/uzzina-focus-webkit-final.log`; red browser evidence was preserved at `/tmp/uzzina-focus-red-evidence.log`.

## Complementary inspection

The directed search covered23 files matching opacity/hover/focusable wrappers and reused the earlier [11-family keyboard inventory](2026-10-29-keyboard-focus-inventory.md). Search matches are triage, not proof of defects. Existing K03/K04/K05 remain proposals outside these fixes.

| Surface | Evidence and outcome | Follow-up |
| --- | --- | --- |
| Today Partners/Categories and Home creation | Real DOM + Chromium/WebKit focus/activation checks; K01 plus wrapper confirmed and corrected. | Physical device acceptance separate. |
| Content media manager | Existing K02; corrected by the independent [media delivery](2026-10-31-media-controls.md). | No duplicate ticket. |
| WorkFileThumbnail | Actual browser: focusing attachment link reveals remove; Tab reaches it and Enter removes the file. | No correction applied. Touch-target size not audited here. |
| CalendarDayCell creation | Static focus-within reveal already exists; limited cells intentionally expose their scroll region. | No new failure established; not a fresh calendar keyboard matrix. |
| Comments edit/delete and celebration actions | Static focus-within reveal exists; earlier inventory coverage reused. | No new whole-page execution or correction claimed. |
| Profile/admin avatar overlays | Static overlay hides decoration over a visible interactive trigger. | No new failure established. |
| Kanban/Profile/conflict comparison | Named scrolling regions with intentional focus; different purpose from Today wrapper. | Preserved; no blanket tabindex removal or new full workflow test. |
| ActionLine/Content/command check marks/sheets | Static time/media/selection/transition decoration, not an additional hidden command. | Preserved. |
| BulkDateTimeDialog collapsed date/time sections | Static candidate: opacity/max-height collapse keeps interactive children mounted without an obvious inert boundary. | Needs directed browser reproduction; not confirmed or fixed, no new ticket. |

## Verification boundaries

All HTTP/provider boundaries in fixtures are controlled; external requests and APIs are blocked in the browser. No real Supabase authorization test, database writes, paid generation, SQL, commit, push or deployment. Native iPhone browser chrome, virtual keyboard and physical touch are not certified. Owner's5176/cache remain untouched. Global checks and the five-fix status are recorded in CURRENT.
