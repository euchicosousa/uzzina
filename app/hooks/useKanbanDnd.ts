import { useState, useMemo } from "react";
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
  fieldKey: "phase" | "station";
  onDrop: (action: Action, newValue: T) => void;
  parseTarget: (overId: string) => T;
}) {
  const [activeAction, setActiveAction] = useState<Action | undefined>();
  const [overrides, setOverrides] = useState<Record<string, T>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = actions.find((a) => a.id === event.active.id);
    if (found) setActiveAction(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeAction) {
      const newValue = parseTarget(event.over.id as string);
      setOverrides((prev) => ({ ...prev, [activeAction.id]: newValue }));
      onDrop(activeAction, newValue);
    }
    setActiveAction(undefined);
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
  };
}
