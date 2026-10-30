import { useState, useEffect } from "react";

function matchesMinWidth(minWidth: number) {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
}

export function useIsDesktop(minWidth = 1024) {
  // Start from the real viewport so layouts do not flash the narrow variant on first paint.
  const [isDesktop, setIsDesktop] = useState(() => matchesMinWidth(minWidth));

  useEffect(() => {
    // Match the breakpoint of the view using this hook.
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);

    // Set inicial
    setIsDesktop(mq.matches);

    // Handler para quando a tela for redimensionada
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, [minWidth]);

  return isDesktop;
}
