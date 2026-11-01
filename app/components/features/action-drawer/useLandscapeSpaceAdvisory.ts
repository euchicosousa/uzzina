import { useCallback, useLayoutEffect, useState, type RefObject } from "react";

// Used until the Essencial tab has been measured once (the drawer can open
// directly on Instagram): roughly title + compact metadata + the 200px
// description minimum.
const FALLBACK_ESSENTIAL_HEIGHT = 340;
// Extra height needed to hide the advisory again, so small changes near the
// limit do not toggle it.
const EXIT_MARGIN = 24;

function isLandscapePhone() {
  // Coarse pointer keeps desktop windows out; the height comparison below
  // keeps tablets with plenty of room out.
  if (!window.matchMedia("(pointer: coarse)").matches) return false;
  const orientation = window.screen?.orientation?.type;
  return orientation
    ? orientation.startsWith("landscape")
    : window.matchMedia("(orientation: landscape)").matches;
}

/**
 * True when a landscape phone gives the drawer less height than the Essencial
 * tab needs without scrolling. Essencial reports that need through
 * `reportEssentialHeight` (title + metadata + description minimum) whenever it
 * is mounted; the last value is kept while another tab is active, so the
 * decision is the same on every tab. The hook only reads the size of the
 * content area (which follows the visible viewport) and never writes layout.
 */
export function useLandscapeSpaceAdvisory(
  contentRef: RefObject<HTMLElement | null>,
) {
  const [essentialHeight, setEssentialHeight] = useState<number | null>(null);
  const [lowSpace, setLowSpace] = useState(false);
  const reportEssentialHeight = useCallback((height: number) => {
    const rounded = Math.round(height);
    setEssentialHeight((previous) =>
      previous === rounded ? previous : rounded,
    );
  }, []);
  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const needed = essentialHeight ?? FALLBACK_ESSENTIAL_HEIGHT;
    const measure = () => {
      const { height } = element.getBoundingClientRect();
      // A hidden panel reports zero; keep the last decision until shown.
      if (height <= 0) return;
      setLowSpace(
        (previous) =>
          isLandscapePhone() &&
          height < (previous ? needed + EXIT_MARGIN : needed),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.screen?.orientation?.addEventListener("change", measure);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(element);
    return () => {
      window.removeEventListener("resize", measure);
      window.screen?.orientation?.removeEventListener("change", measure);
      observer?.disconnect();
    };
  }, [contentRef, essentialHeight]);
  return { lowSpace, reportEssentialHeight };
}
