import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useSubmit } from "react-router";
import {
  DATE_TIME_DISPLAY,
  INTENT,
  STATES,
  type STATE_TYPE,
} from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { ActionItem } from "../features/ActionItem";
import { Draggable, Droppable } from "../features/DnD";
import { handleAction } from "~/lib/helpers";
import { UBadge } from "../uzzina/UBadge";

export default function KanbanComponent({ actions }: { actions: Action[] }) {
  const submit = useSubmit();

  const [activeAction, setActiveAction] = useState<Action>();

  // Local override: maps action.id → new state slug
  // Applied immediately on drop so the DOM is correct before drop animation runs.
  const [stateOverrides, setStateOverrides] = useState<Record<string, string>>(
    {},
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveAction(actions.find((action) => action.id === event.active.id)!);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeAction) {
      const newState = event.over.id as string;

      // 1. Apply override locally RIGHT NOW so that in the same batched render
      //    the item already appears in the new column — this is what the drop
      //    animation will use to calculate the destination position.
      setStateOverrides((prev) => ({ ...prev, [activeAction.id]: newState }));

      // 2. Persist to server (async fetcher)
      handleAction(
        {
          ...activeAction,
          intent: INTENT.update_action,
          state: newState,
        },
        submit,
      );
    }

    // 3. Clear overlay in the same render cycle as the override update above.
    //    React batches these together, so the drop animation starts from the
    //    correct (new) column position in the DOM.
    setActiveAction(undefined);
  };

  // Apply local overrides on top of server-supplied actions
  const actionsWithOverrides = actions.map((action) =>
    stateOverrides[action.id]
      ? { ...action, state: stateOverrides[action.id] }
      : action,
  );

  return (
    <div className="w-full max-w-full overflow-hidden">
      <h5 className="pb-4">Kanban</h5>
      <div className="overflow-x-auto pb-8">
        <div className="grid min-w-[1500px] grid-cols-7 overflow-hidden">
          <DndContext
            id={"kanban"}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {Object.values(STATES).map((state) => (
              <KanbanColumn
                id={state.slug}
                state={state}
                key={state.slug}
                actions={actionsWithOverrides.filter(
                  (action) => action.state === state.slug,
                )}
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
                  showLate
                  showPartner
                  // showCategory
                  dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

const KanbanColumn = ({
  actions,
  id,
  state,
}: {
  actions: Action[];
  id: string;
  state: STATE_TYPE;
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
            // style={{ borderTopColor: state.color }}
          >
            <div className="flex items-center gap-2 px-1 py-2 text-lg font-medium tracking-tight">
              <div>{state.title}</div>
              <UBadge value={actions.length} />
            </div>

            <div className="flex h-full flex-col overflow-y-auto p-1">
              <div className="flex flex-col divide-y">
                {actions.map((action) => (
                  <Draggable id={action.id} key={action.id}>
                    <ActionItem
                      action={action}
                      showLate
                      showPartner
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
