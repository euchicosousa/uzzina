import { DndContext, DragOverlay } from "@dnd-kit/core";
import { cn } from "cnfast";
import { useMemo } from "react";
import { useActionMutations } from "~/hooks/useActionMutations";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useKanbanDnd } from "~/hooks/useKanbanDnd";
import { useSelectionActions } from "~/hooks/useMultiSelection";
import {
  DATE_TIME_DISPLAY,
  INTENT,
  type PHASE,
  PHASES,
  PRIORITIES,
  type PRIORITY,
  type PRIORITY_TYPE,
} from "~/lib/CONSTANTS";
import type { Action } from "~/types";
import { ActionItem } from "../features/ActionItem";
import { DROP_TARGET_HIGHLIGHT, Draggable, Droppable } from "../features/DnD";
import { DragStateContext } from "../features/DragStateContext";
import { PrismBadge } from "../prism";

// Columns run from the least to the most urgent.
const PRIORITY_COLUMNS: PRIORITY_TYPE[] = [
  PRIORITIES.low,
  PRIORITIES.medium,
  PRIORITIES.high,
];

// Literal class names so Tailwind can detect them.
const PRIORITY_BORDER: Record<PRIORITY, string> = {
  low: "border-priority-low",
  medium: "border-priority-medium",
  high: "border-priority-high",
};

function isPriority(value: unknown): value is PRIORITY {
  return typeof value === "string" && value in PRIORITIES;
}

function isPhase(value: unknown): value is PHASE {
  return typeof value === "string" && Object.hasOwn(PHASES, value);
}

function getPhaseOrder(phase: unknown): number {
  return isPhase(phase) ? PHASES[phase].order : Number.MAX_SAFE_INTEGER;
}

// Invalid legacy values (such as the string "null") are shown as medium
// without rewriting the stored data.
function getColumnPriority(action: Action): PRIORITY {
  return isPriority(action.priority) ? action.priority : "medium";
}

export function PriorityBoard({
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
  } = useKanbanDnd<PRIORITY>({
    actions,
    fieldKey: "priority",
    parseTarget: (overId) => (isPriority(overId) ? overId : undefined),
    onDrop: async (action, newPriority) => {
      const confirmed = await handleAction({
        intent: INTENT.update_action,
        id: action.id,
        expectedUpdatedAt: action.updated_at,
        priority: newPriority,
      });
      if (!confirmed) throw new Error("O movimento não foi confirmado.");
      return confirmed;
    },
  });

  const actionsByPriority = useMemo(() => {
    const map: Record<PRIORITY, Action[]> = { low: [], medium: [], high: [] };
    for (const action of actionsWithOverrides) {
      map[getColumnPriority(action)].push(action);
    }
    for (const column of Object.values(map)) {
      column.sort((a, b) => getPhaseOrder(a.phase) - getPhaseOrder(b.phase));
    }
    return map;
  }, [actionsWithOverrides]);

  const columns = PRIORITY_COLUMNS.map((priority) => (
    <PriorityColumn
      key={priority.slug}
      actions={actionsByPriority[priority.slug]}
      priority={priority}
      fillHeight={fillHeight}
    />
  ));

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
            "grid min-w-150 grid-cols-3 overflow-hidden",
            fillHeight && "h-full min-h-0",
          )}
        >
          <DragStateContext.Provider value={!!activeAction}>
            {isDesktop ? (
              <DndContext
                id="priority-board"
                onDragCancel={handleDragCancel}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                sensors={sensors}
              >
                {columns}
                <DragOverlay
                  adjustScale={false}
                  className="z-100"
                  dropAnimation={{ duration: 150, easing: "ease-in-out" }}
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
              columns
            )}
          </DragStateContext.Provider>
        </div>
      </div>
    </div>
  );
}

function PriorityColumn({
  actions,
  priority,
  fillHeight,
}: {
  actions: Action[];
  priority: PRIORITY_TYPE;
  fillHeight: boolean;
}) {
  useSelectionActions(actions);
  return (
    <Droppable
      className={cn(
        "flex w-full flex-col overflow-hidden",
        fillHeight ? "h-full min-h-0" : "h-[30vh]",
      )}
      id={priority.slug}
    >
      {(isOver) => (
        <div
          className={cn(
            "flex h-full flex-col overflow-hidden border-t-4 transition-colors",
            PRIORITY_BORDER[priority.slug],
            isOver && DROP_TARGET_HIGHLIGHT,
          )}
        >
          <div className="flex shrink-0 items-center gap-2 px-1 py-4 font-medium tracking-tight">
            <h4>{priority.title}</h4>
            <PrismBadge>{actions.length}</PrismBadge>
          </div>
          <div
            role="region"
            aria-label={`Ações com prioridade ${priority.title}`}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pt-1 pb-6"
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
      )}
    </Droppable>
  );
}
