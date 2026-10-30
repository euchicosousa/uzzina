# 03: Prioritize writing space in the mobile Instagram tab

**Status:** ready-for-agent — ticket preparation authorized 2026-10-29; implementation not started.
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
