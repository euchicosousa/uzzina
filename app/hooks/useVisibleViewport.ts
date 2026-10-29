import { useLayoutEffect, useState } from "react";

/** Visible area in layout-viewport (client) coordinates. */
export type VisibleViewport = { top: number; height: number };

export function readVisibleViewport(
  previous?: VisibleViewport,
): VisibleViewport {
  const viewport = window.visualViewport;
  if (!viewport) return { top: 0, height: window.innerHeight };
  // A pinch-zoomed visual viewport pans across the page; following it would
  // move overlays with every pan, so keep the last unzoomed geometry.
  if (viewport.scale > 1)
    return previous ?? { top: 0, height: viewport.height * viewport.scale };
  // Rubber-band overscroll can report a negative offset for a moment.
  return { top: Math.max(0, viewport.offsetTop), height: viewport.height };
}

/**
 * Tracks the part of the layout viewport the user can actually see. iOS
 * Safari keeps the layout viewport (and `vh`/`dvh`) unchanged when the
 * software keyboard opens and may pan the visual viewport, so fixed overlays
 * must follow both its height and its vertical offset.
 */
export function useVisibleViewport(): VisibleViewport {
  const [visible, setVisible] = useState(() => readVisibleViewport());
  useLayoutEffect(() => {
    const update = () =>
      setVisible((previous) => {
        const next = readVisibleViewport(previous);
        return next.top === previous.top && next.height === previous.height
          ? previous
          : next;
      });
    update();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return visible;
}
