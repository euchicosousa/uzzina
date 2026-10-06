import { useEffect, useMemo, useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Action } from "~/types";

export function useKanbanDnd<T extends string | null>({
  actions,
  fieldKey,
  onDrop,
  parseTarget,
}: {
  actions: Action[];
  fieldKey: "phase";
  onDrop: (action: Action, newValue: T) => unknown;
  parseTarget: (overId: string) => T;
}) {
  const [activeAction, setActiveAction] = useState<Action | undefined>();
  const [overrides, setOverrides] = useState<Record<string, T>>({});

  // Limpa overrides automaticamente quando as ações canônicas do servidor atualizarem
  useEffect(() => {
    setOverrides((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const action of actions) {
        if (next[action.id] !== undefined) {
          if (action[fieldKey] === next[action.id]) {
            delete next[action.id];
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [actions, fieldKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = actions.find((a) => a.id === event.active.id);
    if (found) setActiveAction(found);
  };

  const handleDragCancel = () => {
    setActiveAction(undefined);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    try {
      if (event.over && activeAction) {
        const newValue = parseTarget(event.over.id as string);
        const actionId = activeAction.id;
        setOverrides((prev) => ({ ...prev, [actionId]: newValue }));
        try {
          await onDrop(activeAction, newValue);
        } catch (err) {
          console.error("Erro no drop do Kanban:", err);
        } finally {
          setOverrides((prev) => {
            if (prev[actionId] === undefined) return prev;
            const next = { ...prev };
            delete next[actionId];
            return next;
          });
        }
      }
    } finally {
      setActiveAction(undefined);
    }
  };

  const actionsWithOverrides = useMemo(
    () =>
      actions.map((action) =>
        overrides[action.id] !== undefined
          ? { ...action, [fieldKey]: overrides[action.id] }
          : action,
      ),
    [actions, overrides, fieldKey],
  );

  return {
    activeAction,
    actionsWithOverrides,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
