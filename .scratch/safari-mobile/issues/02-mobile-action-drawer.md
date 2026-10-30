# 02: Give the mobile action drawer more space and a discoverable complete footer

**Status:** ready-for-agent — ticket preparation authorized 2026-10-29; implementation not started.
**Original proposal:** item 2, refined by owner. **Priority:** high.
**Blocked by:** none for implementation; final keyboard acceptance requires ticket 01.

## Evidence and entry points

IMG_9843.PNG and IMG_9856.PNG. Inspect ActionFormDrawer, EssentialsTab, ActionFormFooter, ActionDrawerFocusScope and ActionDatePicker. The footer currently scrolls only the first group; sprint/duplicate/archive and a wide save button consume the rest.

## Deliverable and approved decisions

- [ ] On mobile, preserve action tabs and title. The metadata summary shows only the date, an expansion icon and, when work attachments exist, a file indicator icon.
- [ ] No visible “Mais detalhes”, metadata labels, file count or extra explanatory text in the collapsed summary. Icon controls have accessible names; these are not visible labels.
- [ ] Expand/collapse the existing authorship/update/ID, strategy and work attachment controls without losing their state or changing their persistence. Preserve date access and long-date layout.
- [ ] Reuse an existing suitable file icon. Do not add a new attachment badge system.
- [ ] One horizontal mobile scrolling strip contains, in order, partner, phase/status, category, color when applicable, sprint, duplicate, archive/restore. Prioritize the first controls at initial scroll position.
- [ ] Keep Criar/Atualizar outside the scrolling strip, always reachable, icon-only on mobile with pending indicator and accessible state/name. Preserve existing desktop presentation.
- [ ] Show a subtle edge fade only where more content actually exists. At the end remove the right fade; show the left fade after scrolling. Do not introduce automatic scrolling, an extra fixed arrow button or a new operations menu.
- [ ] Do not mask the save button or intercept touch/focus through the fade. Keyboard focus brings offscreen controls into view. Swiping does not activate an operation.
- [ ] Preserve touch targets, draft-specific availability, category-specific color, sprint behavior, manual save/Shift+save, guards and the independent two-action forms.

## Verification and boundaries

Exercise new/existing/archived actions, long title/date, attachments absent/present, conditional color, keyboard-only scrolling and both ends of overflow. Verify focus navigation with expanded/collapsed details; hidden controls must not remain focusable. No second permanent footer row.

This ticket changes layout, not duplicate/save semantics; preserve the existing save/duplicate protections. The save-recovery/duplication ticket was closed without implementation and is not reopened here. Follow ../README.md.
