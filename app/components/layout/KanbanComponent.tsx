import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DATE_TIME_DISPLAY,
  INTENT,
  PHASES,
  type PHASE_TYPE,
} from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { ActionItem } from "../features/ActionItem";
import { Draggable, Droppable } from "../features/DnD";
import { useActionMutations } from "~/hooks/useActionMutations";
import { UBadge } from "../uzzina/UBadge";
import type { Action } from "~/models/actions.server";
import { DragStateContext } from "../features/DragStateContext";

export default function KanbanComponent({ actions }: { actions: Action[] }) {
  const _queryClient = useQueryClient();
  const { handleAction } = useActionMutations();

  const [activeAction, setActiveAction] = useState<Action>();

  // Local override: maps action.id → new phase slug
  const [phaseOverrides, setPhaseOverrides] = useState<Record<string, string>>(
    {},
  );

  // Clear overrides once the server data (actions prop) is revalidated.
  // The overrides exist only for smooth drop animations; once the loader
  // delivers fresh data that already contains the persisted changes,
  // keeping the overrides would cause stale values to shadow future updates.
  useEffect(() => {
    setPhaseOverrides({});
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = actions.find((action) => action.id === event.active.id);
    if (found) {
      setActiveAction(found);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeAction) {
      const newPhase = event.over.id as string;

      // 1. Apply override locally
      setPhaseOverrides((prev) => ({ ...prev, [activeAction.id]: newPhase }));

      // 2. Persist to server
      handleAction({
        ...activeAction,
        intent: INTENT.update_action,
        phase: newPhase,
      });
    }

    // 3. Clear overlay
    setActiveAction(undefined);
  };

  // Apply local overrides on top of server-supplied actions
  const actionsWithOverrides = useMemo(
    () =>
      actions.map((action) =>
        phaseOverrides[action.id]
          ? { ...action, phase: phaseOverrides[action.id] }
          : action,
      ),
    [actions, phaseOverrides],
  );

  // Pre-group by phase so each KanbanColumn doesn't re-filter on every render
  const actionsByPhase = useMemo(() => {
    const map: Record<string, Action[]> = {};
    for (const action of actionsWithOverrides) {
      const key = action.phase ?? "idea";
      if (!map[key]) map[key] = [];
      map[key].push(action);
    }
    return map;
  }, [actionsWithOverrides]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto pb-8">
        <div className="grid min-w-[1500px] grid-cols-6 overflow-hidden">
          <DragStateContext.Provider value={!!activeAction}>
            <DndContext
              id={"kanban"}
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {Object.values(PHASES).map((phase) => (
                <KanbanColumn
                  id={phase.slug}
                  phase={phase}
                  key={phase.slug}
                  actions={actionsByPhase[phase.slug] ?? []}
                />
              ))}
              <DragOverlay
                className="z-100"
                dropAnimation={{ duration: 150, easing: "ease-in-out" }}
                adjustScale={false}
              >
                {activeAction ? (
                  <ActionItem
                    action={activeAction}
                    isDragging
                    displayFlags={{
                      showLate: true,
                      showPartner: true,
                      showCategory: true,
                    }}
                    dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </DragStateContext.Provider>
        </div>
      </div>
    </div>
  );
}

const KanbanColumn = ({
  actions,
  id,
  phase,
}: {
  actions: Action[];
  id: string;
  phase: PHASE_TYPE;
}) => {
  return (
    <Droppable id={id} className="flex h-[30vh] flex-col overflow-hidden">
      {(isOver) => {
        return (
          <div
            className={cn(
              "flex h-full flex-col overflow-hidden border-t transition-colors",
              isOver && "border-primary text-primary",
            )}
            style={{ borderTopColor: phase.color }}
          >
            <div className="flex items-center gap-2 px-1 py-2 text-lg font-medium tracking-tight">
              <div>{phase.title}</div>
              <UBadge value={actions.length} />
            </div>

            <div className="flex h-full flex-col overflow-y-auto p-1">
              <div className="flex flex-col gap-1">
                {actions.map((action) => (
                  <Draggable id={action.id} key={action.id}>
                    <ActionItem
                      action={action}
                      displayFlags={{
                        showLate: true,
                        showPartner: true,
                        showCategory: true,
                      }}
                      dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                    />
                  </Draggable>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    </Droppable>
  );
};
