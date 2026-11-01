# 20: Advise rotating to portrait when landscape leaves too little drawer space

**Status:** implemented locally (2026-11-01) — awaiting owner validation on a real phone; no commit, push or deploy.
**Priority:** high.
**Blocked by:** none; real-device keyboard validation relates to ticket 01. Origin: ticket 03.

## Owner decision — 2026-11-01 (revised same day)

When the phone is in landscape and the action drawer has less space than the Essencial tab needs without scrolling (title + metadata + 200px description `min-h-50` exceed the `data-essential-scroller` height), the whole action drawer is replaced by a blocking advisory: "Gire o telefone / A edição da ação precisa da tela na vertical.", with a "Fechar ação" button. Owner feedback: the first non-blocking strip was liked in content but not in presentation; it must be simple, hide everything and show only the advisory, on every tab. Landscape only; portrait with the keyboard open is deliberately out of scope.

## Presentation

Overlay `absolute inset-0` inside the form root (`ActionFormDrawer`), `role="status"`, shown only by the active form (so two mounted forms never show two). The form content sits in a `display: contents` wrapper with `inert`: it stays mounted (unsaved edits preserved) but unreachable; the focused element is blurred when the overlay appears (closes the keyboard). When the condition ends, the content returns as it was. Exit: rotate, or "Fechar ação" (the normal close path with its guards; needed in case orientation lock is on). Escape still closes via the existing handler.

## Evidence and entry points

- `EssentialsTab.tsx`: reports the needed height (title + metadata + description minimum).
- `useLandscapeSpaceAdvisory.ts`: landscape + coarse pointer + content-area height vs. last reported Essencial need (24px exit margin hysteresis; 340px fallback until measured). The overlay does not change the measured area, so it cannot feed back into the measurement.
- `ActionFormDrawer.tsx`: overlay, inert wrapper and blur.

## Acceptance

- [ ] Landscape phone with less height than Essencial needs: only the advisory is visible on Essencial, Instagram and Observações; nothing behind is reachable.
- [ ] Rotate to portrait: the form returns intact, edits preserved.
- [ ] Portrait (with or without keyboard), desktop and tablets with enough room: no overlay.
- [ ] "Fechar ação" closes with the usual unsaved-changes guards.
- [ ] Rotating or resizing near the limit does not flicker it.

## Verification

Owner checks on a real phone: type in a field in portrait, rotate to landscape (keyboard closes, advisory shows), rotate back (text intact). Code reasoning only; no automated test added.
