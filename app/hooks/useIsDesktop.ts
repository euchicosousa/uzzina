import { useState, useEffect } from "react";

export function useIsDesktop(minWidth = 1024) {
  const [isDesktop, setIsDesktop] = useState(false);

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
