import { useSelectionActions } from "~/hooks/useMultiSelection";
import type { Action } from "~/types";
import { DndContext, DragOverlay } from "@dnd-kit/core";
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
export default function KanbanPhasesBoard({
  actions,
  fillHeight = false,
}: {
  actions: Action[];
  fillHeight?: boolean;
}) {
  const isDesktop = useIsDesktop();
  const { handleAction } = useActionMutations();
  const {
    activeAction,
    actionsWithOverrides,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnd<string>({
    actions,
    fieldKey: "phase",
    parseTarget: (overId) =>
      Object.values(PHASES).some((phase) => phase.slug === overId)
        ? overId
        : undefined,
    onDrop: async (action, newPhase) => {
      const confirmed = await handleAction({
        intent: INTENT.update_action,
        id: action.id,
        expectedUpdatedAt: action.updated_at,
        phase: newPhase,
      });
      if (!confirmed) throw new Error("O movimento não foi confirmado.");
      return confirmed;
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
    <div
      className={cn(
        "w-full max-w-full overflow-hidden",
        fillHeight && "h-full min-h-0",
      )}
    >
      <div
        className={cn("overflow-x-auto pb-8", fillHeight && "h-full min-h-0")}
      >
        <div
          className={cn(
            "grid min-w-300 grid-cols-6 overflow-hidden",
            fillHeight && "h-full min-h-0",
          )}
        >
          <DragStateContext.Provider value={!!activeAction}>
            {isDesktop ? (
              <DndContext
                id={"kanban"}
                onDragCancel={handleDragCancel}
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
                    fillHeight={fillHeight}
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
                  fillHeight={fillHeight}
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
  fillHeight,
}: {
  actions: Action[];
  id: string;
  phase: PHASE_TYPE;
  fillHeight: boolean;
}) => {
  useSelectionActions(actions);
  return (
    <Droppable
      className={cn(
        "flex w-full flex-col overflow-hidden",
        fillHeight ? "h-full min-h-0" : "h-[30vh]",
      )}
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
            <div className="flex shrink-0 items-center gap-2 px-1 py-4 font-medium tracking-tight">
              <h4>{phase.title}</h4>
              <PrismBadge>{actions.length}</PrismBadge>
            </div>

            <div
              role="region"
              aria-label={`Ações em ${phase.title}`}
              tabIndex={0}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
            >
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
