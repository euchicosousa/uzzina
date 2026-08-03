import { useCallback, useEffect, useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { Action } from "~/types";

export function useSprintOrder(userId: string, actions: Action[]) {
  const storageKey = `uzzina-sprint-order-${userId}`;

  // 1. Lê a ordem salva do localStorage
  const getSavedOrder = useCallback((): string[] => {
    if (typeof window === "undefined" || !userId) return [];
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }, [storageKey, userId]);

  const [order, setOrder] = useState<string[]>(getSavedOrder);

  // Re-sincroniza o estado inicial se o userId mudar
  useEffect(() => {
    setOrder(getSavedOrder());
  }, [getSavedOrder]);

  // 2. Limpeza Automática (Pruning): Mantém no localStorage apenas IDs de ações que continuam no Sprint
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentActionIds = new Set(actions.map((a) => a.id));
    const savedOrder = getSavedOrder();

    if (savedOrder.length === 0) return;

    const cleanedOrder = savedOrder.filter((id) => currentActionIds.has(id));

    // Se houve remoção de ações que saíram do Sprint, atualiza o localStorage
    if (cleanedOrder.length !== savedOrder.length) {
      setOrder(cleanedOrder);
      if (cleanedOrder.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cleanedOrder));
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [actions, getSavedOrder, storageKey]);

  // 3. Aplica a ordem armazenada nas ações recebidas
  const orderedActions = useMemo(() => {
    if (order.length === 0) return actions;

    const actionMap = new Map(actions.map((a) => [a.id, a]));
    const result: Action[] = [];

    // Adiciona na ordem salva
    for (const id of order) {
      const action = actionMap.get(id);
      if (action) {
        result.push(action);
        actionMap.delete(id);
      }
    }

    // Ações novas que entraram no Sprint vão para o final
    for (const action of actionMap.values()) {
      result.push(action);
    }

    return result;
  }, [actions, order]);

  // 4. Salva a nova ordem após o Drag-and-Drop
  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      const currentIds = orderedActions.map((a) => a.id);
      const oldIndex = currentIds.indexOf(activeId);
      const newIndex = currentIds.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(currentIds, oldIndex, newIndex);
        setOrder(newOrder);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(newOrder));
        }
      }
    },
    [orderedActions, storageKey],
  );

  // 5. Botão de Reset: Limpa a ordem personalizada e volta para a ordem natural
  const clearOrder = useCallback(() => {
    setOrder([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const hasCustomOrder = order.length > 0;

  return {
    orderedActions,
    handleReorder,
    clearOrder,
    hasCustomOrder,
  };
}
