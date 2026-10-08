import { ActionConflictError } from "~/lib/supabase.mutations";
import { getActionRevision } from "~/utils/date";
import { useMemo, useState, useRef } from "react";
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
  fieldKey: "phase" | "date";
  onDrop: (action: Action, newValue: T) => Promise<Action>;
  parseTarget: (overId: string, action: Action) => T | undefined;
}) {
  const dragSession = useRef(0);
  const [activeAction, setActiveAction] = useState<Action | undefined>();
  const [overrides, setOverrides] = useState<
    Record<string, { operationId: number; value: T }>
  >({});

  const operationCounter = useRef(0);
  const writes = useRef(new Map<string, Promise<Action>>());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    dragSession.current += 1;
    const found = actions.find((a) => a.id === event.active.id);
    setActiveAction(found);
  };

  const handleDragCancel = () => {
    dragSession.current += 1;
    setActiveAction(undefined);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!activeAction || event.active.id !== activeAction.id) return;
    const session = dragSession.current;
    try {
      if (event.over && activeAction && event.active.id === activeAction.id) {
        const newValue = parseTarget(String(event.over.id), activeAction);
        if (newValue === undefined) return;
        const actionId = activeAction.id;
        const operationId = ++operationCounter.current;
        setOverrides((prev) => ({
          ...prev,
          [actionId]: { operationId, value: newValue },
        }));
        try {
          const previous = writes.current.get(actionId);
          const save = async () => {
            let baseline = activeAction;
            if (previous) {
              try {
                const confirmed = await previous;
                if (
                  getActionRevision(confirmed.updated_at) >
                  getActionRevision(baseline.updated_at)
                )
                  baseline = confirmed;
              } catch (error) {
                if (error instanceof ActionConflictError) throw error;
              }
            }
            return onDrop(baseline, newValue);
          };
          const saving = save();
          writes.current.set(actionId, saving);
          try {
            await saving;
          } catch (error) {
            if (writes.current.get(actionId) === saving)
              writes.current.delete(actionId);
            throw error;
          }
        } catch (err) {
          console.error("Drag save failed:", err);
        } finally {
          setOverrides((prev) => {
            if (prev[actionId]?.operationId !== operationId) return prev;
            const next = { ...prev };
            delete next[actionId];
            return next;
          });
        }
      }
    } finally {
      if (dragSession.current === session) setActiveAction(undefined);
    }
  };

  const actionsWithOverrides = useMemo(
    () =>
      actions.map((action) =>
        overrides[action.id] !== undefined
          ? { ...action, [fieldKey]: overrides[action.id]?.value }
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
