# 10: Load the existing brand web font consistently across browsers

**Status:** ready-for-agent — ticket preparation and investigation authorized 2026-10-29; implementation not started.
**Priority:** high, before final mobile spacing acceptance.
**Blocked by:** none.

## Finding

The owner calls the font “BB Objekt Sans”; the repository declares and ships “PP Object Sans”. Verify that the supplied assets are indeed the intended brand face before any replacement. Do not silently rename a family or download a different font based on the spoken name.

app/tailwind.css lists “PP Object Sans” first in --font-sans and applies it to html. public/object-sans/object-sans.css defines its four static faces, but neither app/main.tsx, app/tailwind.css nor index.html loads that stylesheet. Merely naming a family does not register the web font.

See ../../../docs/audits/2026-10-29-font-loading-diagnosis.md for the controlled browser evidence. No web font registrations/requests were observed before a temporary test-only stylesheet injection; after injection, the bundled Regular WOFF2 loaded and the actual rendered face was reported as a web font. The local Mac has the font installed, which masks the omission visually.

## Acceptance

- [ ] Load the existing font faces through the actual app CSS/HTML entry path, using a correct base URL for the shipped font assets. Preserve a usable system sans fallback.
- [ ] Inventory the actual file formats/signatures, not just extensions, and match each CSS src format() descriptor. The repository already contains WOFF2 and WOFF for all four weights; confirm that the targeted Safari/macOS/iOS versions support the supplied files. Record the tested browser/OS versions and format actually downloaded.
- [ ] Test the existing WOFF2 primary source and WOFF fallback in Safari, using controlled source failure where needed. Check HTTP status, correct font MIME type, asset integrity/decoding, same-origin delivery (or CORS if hosting changes), CSS family/weight/style matching and any missing glyphs. Do not mistake a missing stylesheet, HTML fallback response or a locally installed font for unsupported format.
- [ ] If existing assets cannot render on the target Safari despite correct registration/delivery, identify the specific missing/invalid format or face and document the required replacement file for the owner. Do not request another font merely because of the filename; do not silently replace the brand face or add obsolete SVG/EOT assets without a demonstrated need.
- [ ] Verify that a fresh browser without a local installation requests and renders the custom font; computed font-family alone is not proof.
- [ ] Confirm 300/400/500/700 assets, pt-BR accents, uppercase/lowercase, numbers and representative UI weights. Handle requested 600 consistently with the available files; do not falsely declare an unsupported variable weight range.
- [ ] Inspect actual rendering/network decoding in Safari on Mac/iPhone and another engine. No font decode errors, HTML returned as a font, missing assets or clipping caused by changed metrics.
- [ ] Confirm title/body/button/input/editor/dialog typography, light/dark and public portal/review shared typography without exposing private data.
- [ ] Keep font-display/fallback behavior usable under slow/failed requests; avoid preloading all weights without demonstrated benefit.
- [ ] Recheck narrow date headings, drawer tabs/footer, profile padding and editor toolbar after real font loading. Update layout tickets if corrected metrics change their reproduction.
- [ ] Prefer preserving the existing font: controlled Chromium evidence gives no reason yet to replace it. A change to system sans or Google-hosted/self-hosted alternative is a separate documented choice if the existing assets prove unsuitable; do not add an external font provider unnecessarily.

## Verification

Add a meaningful regression on the real entry path/browser font registration and rendered download, not a test that merely checks a font name string. Validate a production build's asset paths. Controlled Chromium proves web-font registration/loading, not actual iOS Safari compatibility or the published deployment. Follow ../README.md.

## Format reference

[WebKit: Improved Font Loading](https://webkit.org/blog/6643/improved-font-loading/) documents WOFF2 support on macOS Sierra/iOS10 and the WOFF2-first, WOFF-fallback src pattern already used by these assets. Format support is therefore not evidence that every supplied file is valid; actual target Safari decoding/rendering still needs verification. This reference was checked on 2026-10-29.
