import { useState, useEffect } from "react";

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Definimos lg (1024px) como o breakpoint para considerar "desktop" no Tailwind
    const mq = window.matchMedia("(min-width: 1024px)");
    
    // Set inicial
    setIsDesktop(mq.matches);
    
    // Handler para quando a tela for redimensionada
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}
