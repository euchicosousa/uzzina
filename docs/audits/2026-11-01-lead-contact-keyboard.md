# K05 — one keyboard stop for the Lead contact

Owner authorized execution as item4 of the K04 →07 →09 →K05 sequence. Source scope: [K05 in the completed keyboard inventory](2026-10-29-keyboard-focus-inventory.md#k05--p3--duas-paradas-de-tab-para-o-mesmo-contato-de-lead).

## Result

`LeadDetail` now renders a single native contact anchor styled with the existing `buttonVariants`. The nested PrismButton was removed. Phone text, icon, green styling, maximum width/truncation and self alignment remain. The existing digit normalization, `https://wa.me/` destination, `target="_blank"` and `rel="noopener noreferrer"` are unchanged. No new primitive or route.

## Verification

Real-component regression in `tests/lead-contact-keyboard.test.tsx`:0pass/2fail before the fix because the second Tab stopped on the nested button;2pass after. Both a local formatted phone and an explicitly prefixed +55 phone verify the same normalized destination, link role/name, target/rel, one Tab stop and no duplicate button. Native Enter activation records the destination through a click listener that prevents external navigation; no contact/message is opened or sent.

Together with the existing Leads responsive route suite:12pass/0fail,66 assertions. Format, lint and typecheck passed; lint's existing informational notice remains. Root coordination completed the final integrated production build after K05; it passed with the existing large-chunk warning. The API/server package checks also passed9 endpoints for the integrated delivery.

No database, SQL, provider, environment, server restart/cache clearing, commit, push or deploy in this item. Physical device/screen-reader acceptance and a new pixel comparison are not claimed. Existing unrelated changes, including external style-analysis documentation and the K04/07/09 implementation, were preserved. Root owns CURRENT/TODO and final integration records.
