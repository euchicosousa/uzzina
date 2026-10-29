import { act } from "@testing-library/react";

type ViewportState = {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
  scale: number;
};

/**
 * Installs a controllable `window.visualViewport`, the browser boundary that
 * reports the area left visible by the iOS keyboard. `set` changes it and
 * dispatches the same resize/scroll events Safari fires.
 */
export function installVisualViewport(initial: Partial<ViewportState> = {}) {
  const state: ViewportState = {
    width: 375,
    height: 844,
    offsetTop: 0,
    offsetLeft: 0,
    scale: 1,
    ...initial,
  };
  const target = new window.EventTarget();
  const viewport = Object.defineProperties(target, {
    width: { get: () => state.width },
    height: { get: () => state.height },
    offsetTop: { get: () => state.offsetTop },
    offsetLeft: { get: () => state.offsetLeft },
    pageTop: { get: () => state.offsetTop },
    pageLeft: { get: () => state.offsetLeft },
    scale: { get: () => state.scale },
  });
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: viewport,
  });
  return {
    set(next: Partial<ViewportState>) {
      Object.assign(state, next);
      act(() => {
        viewport.dispatchEvent(new window.Event("resize"));
        viewport.dispatchEvent(new window.Event("scroll"));
      });
    },
    restore() {
      Reflect.deleteProperty(window, "visualViewport");
    },
  };
}
