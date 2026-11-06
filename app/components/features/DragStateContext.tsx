/**
 * Contexto mínimo para informar se há um drag ativo no DndContext pai.
 * `useContext` nunca joga erro — retorna `false` por padrão fora de providers.
 */
import { createContext, useEffect } from "react";

export const DragStateContext = createContext(false);

/**
 * While an item is being dragged, the whole page shows the grabbing cursor
 * (see `html[data-dragging-item]` in tailwind.css), so the title's text cursor
 * and other controls do not show through the moving copy.
 */
export function useDragCursor(isDragging: boolean) {
  useEffect(() => {
    if (!isDragging) return;
    const root = document.documentElement;
    root.setAttribute("data-dragging-item", "true");
    return () => root.removeAttribute("data-dragging-item");
  }, [isDragging]);
}
