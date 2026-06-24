/**
 * Contexto mínimo para informar se há um drag ativo no DndContext pai.
 * `useContext` nunca joga erro — retorna `false` por padrão fora de providers.
 */
import { createContext, useContext } from "react";

export const DragStateContext = createContext(false);

function useDragState(): boolean {
  return useContext(DragStateContext);
}
