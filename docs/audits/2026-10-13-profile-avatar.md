# Profile avatar — 2026-10-13

## Scope and cause

The Minha Conta photo upload button inherited PrismButton’s `squircle` corner shape. Its width and height were already equal (80px), but `rounded-full` alone did not override `corner-shape: superellipse(1.5)`. The button also inherited 12px horizontal padding.

## Change

`app/routes/app/profile.tsx` uses the existing `no-squircle!` utility to explicitly override the base shape, removes button padding, and makes UAvatar fill the available area. The important modifier is necessary because the squircle utility follows no-squircle in the stylesheet. Shared button styling and upload behavior remain unchanged.

## Verification and limits

A temporary local harness rendered the upload JSX taken directly from the profile route with the real CloudinaryUpload, UAvatar, PrismButton and application CSS. Browser measurements before the change: 80×80px, superellipse(1.5), padding 0px 12px. After: 80×80px, superellipse(1) (circular), padding 0px; the inner avatar was 78×78px inside the button border. Visual inspection confirmed the circular result. The temporary harness was removed.

Format, lint, typecheck, build and diff check passed. Existing build chunk warning remains. This was a visual correction; no redundant class-string unit test was added. The isolated browser check does not verify authenticated navigation, provider upload or persistence. No SQL, push or deployment was performed.
