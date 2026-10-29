import { useLayoutEffect, useState, type RefObject } from "react";

// Same first step as the drawer's container queries (@[40rem]/action). Desktop
// panels are always at least 640px wide (sm:max-w-2xl, lg:w-2xl, side-by-side),
// so only a phone-width panel crosses it.
export const COMPACT_PANEL_MAX_WIDTH = 640;

// Observes the panel itself rather than the window: the compact layout moves
// controls between groups, which CSS container queries cannot express without
// duplicating them.
export function useCompactPanel(ref: RefObject<HTMLElement | null>) {
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth < COMPACT_PANEL_MAX_WIDTH,
  );
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const { width } = element.getBoundingClientRect();
      // A hidden panel reports zero; keep its last real layout until shown.
      if (width > 0) setCompact(width < COMPACT_PANEL_MAX_WIDTH);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return compact;
}
