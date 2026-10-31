# Celebrations responsive scrolling — 2026-10-30

[Ticket19](../../.scratch/safari-mobile/issues/19-celebrations-responsive-scroll.md) implements the owner's explicit correction following `UZZINA 8.png`: a single natural mobile page scroll; right/list independent scrolling belongs to desktop columns. Work is limited to the existing celebrations route, its regressions and contract documentation. Calendar picker12 and outside title/documentation changes are preserved.

## Reproduction and cause

Permanent `scripts/check-celebrations-scroll-browser.cjs` loads the actual authenticated `/app/admin/celebrations` route, real CSS/font and144 fictitious dates. External HTTP is intercepted; local server5190 has its own cache and no API middleware. The script rejects5176 and rejects unexpected external mutations.

Before the correction,320/390/430/767px failed: both `.page-height` root and list owned vertical scrolling. Each had732px height; list scrollHeight8410px and scrollTop6192px from the desktop-style initial-month effect. At320/390/430 the list began162–190px below the form's end, because the left column reserved the full page height.768/1440px already behaved correctly as desktop list scrollers. This matches the reported mobile gap/nested-scroll symptom in actual source, rather than a copied component.

## Correction

Mobile root/columns now have natural height and visible overflow, delegating to the existing app scroll area. Fixed viewport height and column overflow are applied only from `md`. The left desktop column can also scroll in a low window and ends with AppBarSpacer; the list keeps its spacer. The existing `useIsDesktop(768)` gate matches CSS, delaying current-month positioning until the list actually owns scrolling. It does not mark initialization complete on mobile, scroll ancestors, or introduce `scrollIntoView`.

After: mobile root/list scrollHeight equals their natural clientHeight, leaving only the app scrollable; inner scrollTop0 and form/list gap32px. Desktop retains732px list height/8410px scrollHeight and initial offset6192px, without app scrolling. Existing CRUD/auth/query/grouping code is unchanged; tests do not certify database authorization or mutation/error responses.

## Verification and limits

- Chromium: all six widths320/390/430/767/768/1440 passed actual scroll ownership and geometry; wheel gestures move only the intended owner; final date sits above the floating AppBar. Fresh mobile→768 initializes the current month without moving the app; manual list position survives1440 resize; returning mobile removes the inner offset.
- WebKit: same route/matrix/interaction checks plus1440×390 desktop form-column and final-date reachability above AppBar passed.
- `bun test tests/celebrations-scroll.test.tsx`:3passed, including mobile no-scroll and existing desktop current-year/month-once/manual-position behavior.
- Format/lint/typecheck/build and diff checks passed. Only previously recorded informational lint (`tests/font-loading.test.ts`) and large-build-chunk notices remain.

Source behavior is implemented and locally verified. Physical Safari/iPhone acceptance and deployment remain separate. No actual touch inertia/browser chrome/keyboard certification. No CRUD writes, database/provider calls, SQL, paid AI, commit, push or deploy. Isolated5190 stopped and launcher removed after verification; owner's5176/cache and all external changes preserved. Root coordinator handles CURRENT/index and handoff to14.
