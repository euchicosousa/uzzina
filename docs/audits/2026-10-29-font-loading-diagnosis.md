# Brand font loading diagnosis — 2026-10-29

## Scope

Owner requested investigation after noticing the intended brand font was absent in Safari screenshots. This round diagnoses and prepares a ticket; no application fix, font replacement, build, push or deployment was performed.

## Source evidence

- app/tailwind.css defines --font-sans with “PP Object Sans” first and applies font-sans to html.
- public/object-sans/object-sans.css defines normal 300/400/500/700 faces, using WOFF2 with WOFF fallback and font-display: swap.
- The source entry chain (index.html → app/main.tsx → app/tailwind.css) does not load that stylesheet or otherwise register those faces.
- The owner said “BB Objekt Sans”; assets/internal family are “PP Object Sans”. The naming difference is recorded rather than assuming another family.

## Controlled reproduction

A temporary Playwright/Chromium probe rendered the existing dist build's /login page. Browser routing fulfilled local build assets only and blocked external origins; no real account, API, production data or write was involved. It added a plain span inheriting the actual app styles and inspected FontFaceSet, font requests and actual rendered faces through the browser protocol.

Temporary probe: /private/tmp/uzzina-font-audit/probe.cjs. Baseline command: node /private/tmp/uzzina-font-audit/probe.cjs. Control command adds --load-stylesheet, loading only the existing stylesheet into the temporary page. These temporary files are outside the repository.

Baseline reproduced twice: no registered web faces, no font-file requests. The rendered face was PPObjectSans-Regular with isCustomFont:false: a locally installed font on this Mac masks the missing web registration. This does NOT mean the intended face was absent on this particular Mac, and a computed family declaration alone would have missed the problem.

Control: add the existing stylesheet only in the temporary page and request Regular with pt-BR sample “Ação preferências Hoje”. The browser fetched /object-sans/object-sans.css and Regular/Medium WOFF2 assets, registered four faces and rendered the sample with PPObjectSans-Regular, isCustomFont:true. Regular was loaded; not all weights were certified.

Baseline exited 1 by design (web font not loaded); control exited 0 (web font rendered). Browser processes were closed. Initial restricted process launch failed; the isolated probe subsequently ran with execution approval. No automatic approval rejection occurred.

## Interpretation

The missing stylesheet registration is a confirmed app-level problem and is not specific to Safari. A device lacking a local copy is expected to use the system fallback. The temporary control shows that Regular can load/render in Chromium using the existing assets; corrupt files or an engine-specific issue are not needed to explain the confirmed omission.

This does not certify the published HTML/assets, all glyphs/weights, Safari or the actual iPhone. Remaining verification belongs to the implementation ticket. Keep the brand font provisionally; do not replace it solely from this finding.

## Follow-up

[Ticket 10](../../.scratch/safari-mobile/issues/10-load-brand-font.md) covers loading, meaningful regression and cross-browser verification. Correct typography before final visual spacing acceptance for the mobile/profile work.
