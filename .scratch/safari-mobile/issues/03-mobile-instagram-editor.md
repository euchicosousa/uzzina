# 03: Prioritize writing space in the mobile Instagram tab

**Owner feedback — 2026-11-01:** portrait works normally. Landscape with the keyboard open remains unusable due to insufficient visible space. Remaining direction for evaluation: detect minimum usable space and show an advisory, suggesting portrait orientation when appropriate. **Threshold decided (2026-11-01):** the advisory triggers where the action drawer's Essencial tab starts scrolling (`data-essential-scroller` in `EssentialsTab.tsx`: title and metadata `shrink-0`, description `min-h-50` = 200px). Scrolling starts when title + metadata + 200px exceed the scroller height; it is not a fixed px value and depends on wrapping. Panel height comes from the visible viewport (`ActionDrawerPanel.tsx`). For now the advisory applies only in landscape; no orientation detection exists today (landscape is only inferred in `useShortWritingPanel`: width < 752 and height < 480, exit at 560). Natural measuring point: `useShortWritingPanel` (already observes the scroller with ResizeObserver): `scrollHeight > clientHeight`, also observing children. Owner concern: portrait with the keyboard open may also hit this limit; deliberately out of scope for now, and real-device testing may change the decision. Presentation and implementation are not yet authorized; no further layout workaround authorized.

See [ticket 20](20-landscape-space-advisory.md) for the landscape advisory.

**Status:** implemented-follow-up-required — local implementation exists; owner feedback on 2026-10-30 requests media-label simplification and writing/toolbar review; no final acceptance or publication.
**Original proposal:** item 3, refined by owner. **Priority:** high.
**Blocked by:** none for implementation; final keyboard acceptance requires ticket 01. Coordinate layout with ticket 02.

## Evidence and implementation entry points

IMG_9844.PNG, IMG_9845.PNG and IMG_9846.PNG. Inspect InstagramTab, InstagramPreview, ContentFilesManager and RichTextEditor. Caption currently uses a textarea; preserve its literal text contract instead of converting it to rich HTML.

## Acceptance

- [ ] With no media, show only the existing “Adicionar conteúdo” control in the media area on mobile. No empty preview, placeholder icon/message, Gerenciar control or replacement empty-state button.
- [ ] With media, show a height-limited preview plus Adicionar conteúdo and Gerenciar. Keep images/video, order and upload lifecycle unchanged.
- [ ] Both content and caption receive a substantial writing region sized from usable space, with reachable controls in portrait and landscape.
- [ ] Determine the editor size from available viewport/panel space after actual controls, not a fixed 600px or an unqualified 50vh. Constrain/reflow when the viewport is short; do not create an impossible minimum height that hides controls behind the keyboard.
- [ ] Let the media section move out of the writing area through scrolling. Avoid competing small nested scroll regions. Keep the active caret/text visible during typing and preserve cursor/selection during resize.
- [ ] Make the mobile rich-text toolbar compact: one row of basic commands and an icon to open additional commands. Choose the precise basic set after inspecting existing commands; every current command remains available.
- [ ] Additional commands use the existing accessible Prism/React Aria approach. Opening/using the menu preserves the editor selection, command state and focus return. Toolbar arrow navigation, Tab to text, Alt+Shift+F10/F9 and nested Escape handling remain valid.
- [ ] Desktop and side-by-side panels retain their container-query behavior. A narrow drawer on desktop must not depend only on window width for layout.
- [ ] Preserve per-action identity, blur/manual save behavior, file order, literal caption, AI controls and unsaved edits.

## Verification

Cover no media, image, video, multiple files, long content and caption, both tabs, orientation change, keyboard open/closed and narrow/wide panels. Test real toolbar commands in the editor, including selection preservation through the additional menu, rather than a copied toolbar fixture. Follow ../README.md.

## Owner feedback — 2026-10-30

See the [acceptance and follow-up analysis](../../../docs/audits/2026-10-30-mobile-owner-feedback.md). Acceptance applies to the scenarios the owner reported, not all potential device/database/provider cases. Earlier preparation-only wording describes the historical ticket-creation round; implementation results are recorded in CURRENT.
