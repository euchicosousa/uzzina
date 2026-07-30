import type { Action } from "~/types";
import {
  DndContext,
  DragOverlay,
} from "@dnd-kit/core";
import { useMemo } from "react";
import { useActionMutations } from "~/hooks/useActionMutations";
import { useKanbanDnd } from "~/hooks/useKanbanDnd";
import {
  DATE_TIME_DISPLAY,
  INTENT,
  PHASES,
  type PHASE_TYPE,
} from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { ActionItem } from "../features/ActionItem";
import { Draggable, Droppable } from "../features/DnD";
import { DragStateContext } from "../features/DragStateContext";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { PrismBadge } from "../prism";

export default function KanbanHomeActions({ actions }: { actions: Action[] }) {
  const isDesktop = useIsDesktop();
  const { handleAction } = useActionMutations();

  const {
    activeAction,
    actionsWithOverrides,
    sensors,
    handleDragStart,
    handleDragEnd,
  } = useKanbanDnd<string>({
    actions,
    fieldKey: "phase",
    parseTarget: (overId) => overId,
    onDrop: (action, newPhase) => {
      handleAction({
        ...action,
        intent: INTENT.update_action,
        phase: newPhase,
      });
    },
  });

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
        <div className="grid  min-w-250 grid-cols-3 overflow-hidden">
          <DragStateContext.Provider value={!!activeAction}>
            {isDesktop ? (
              <DndContext
                id={"kanban"}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                sensors={sensors}
              >
                {Object.values(PHASES).map((phase) => (
                  <KanbanColumn
                    key={phase.slug}
                    actions={actionsByPhase[phase.slug] ?? []}
                    id={phase.slug}
                    phase={phase}
                  />
                ))}
                <DragOverlay
                  adjustScale={false}
                  className="z-100"
                  dropAnimation={{
                    duration: 150,
                    easing: "ease-in-out",
                  }}
                >
                  {activeAction ? (
                    <ActionItem
                      action={activeAction}
                      dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                      displayFlags={{
                        showLate: true,
                        showPartner: true,
                        showCategory: true,
                      }}
                      isDragging
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              Object.values(PHASES).map((phase) => (
                <KanbanColumn
                  key={phase.slug}
                  actions={actionsByPhase[phase.slug] ?? []}
                  id={phase.slug}
                  phase={phase}
                />
              ))
            )}
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
    <Droppable
      className="flex h-[30vh] w-full  flex-col overflow-hidden"
      id={id}
    >
      {(isOver) => {
        return (
          <div
            className={cn(
              "flex h-full flex-col overflow-hidden border-t-4 transition-colors",
              isOver && "border-primary text-primary",
            )}
            style={{
              borderTopColor: phase.color,
            }}
          >
            <div className="flex items-center gap-2 px-1 py-2 text-lg font-medium tracking-tight">
              <h3>{phase.title}</h3>
              <PrismBadge>{actions.length}</PrismBadge>
            </div>

            <div className="flex h-full flex-col overflow-y-auto p-1">
              <div className="flex flex-col gap-1">
                {actions.map((action) => (
                  <Draggable key={action.id} id={action.id}>
                    <ActionItem
                      action={action}
                      dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                      displayFlags={{
                        showLate: true,
                        showPartner: true,
                        showCategory: true,
                      }}
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
