# 18: Remove the redundant media-type badge beside Add content

**Status:** implemented locally — 2026-10-30.
**Priority:** low.
**Blocked by:** none.

## Evidence and delivery

`UZZINA 5.png` shows Imagem beside Adicionar conteúdo. ContentFilesManager already had this detected-type badge before the compact-layout commit; keeping upload visible in compact mode now places both together. Remove the informational type badge from this manager, including the corresponding Vídeo/Carrossel presentation, without removing media management or a useful file count there.

## Acceptance

- [x] Remove the redundant detected-type label and any code made unused solely by its removal; preserve type detection where previews or other consumers actually need it.
- [x] Keep Adicionar conteúdo and management/file-count controls accessible in empty/single/multiple image/video states and mobile/desktop layouts.
- [x] Keep the upload widget mounted through multiple success events; preserve file ordering, preview, reorder/removal and canonical save behavior. Do not remount upload to simplify the layout.
- [x] Run format, lint, typecheck and build; no existing focused real-component test was found for this cosmetic-only removal.

## Result — 2026-10-30

Removed the detected Imagem/Vídeo/Carrossel badge and the manager's now-unused `detectPostType` import/state. `ContentFilesManager` still renders the same mounted Cloudinary upload control, management button/file count and reorder dialog; preview type detection remains in `InstagramPreview`.

Verification: `bun run format`, `bun run lint`, `bun run typecheck` and `bun run build` passed. Lint reported one existing informational suggestion in `tests/font-loading.test.ts:69`; build reported the existing large-chunk warning. No targeted test or browser check was run because this change only removes a label and no focused test exists.

## Scope

Separate from17 toolbar work and the existing media-controls visibility ticket. No Cloudinary widget redesign or broad preview rewrite. This implementation is local; no commit or publication.
