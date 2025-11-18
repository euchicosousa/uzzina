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
import { useMatches, useSubmit } from "react-router";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "~/routes/app";
import { ActionItem } from "../features/ActionItem";
import { Draggable, Droppable } from "../features/DnD";
import { handleAction } from "~/lib/helpers";
import { UBadge } from "../uzzina/UBadge";

export default function KanbanComponent({ actions }: { actions: Action[] }) {
  const { states } = useMatches()[1].loaderData as AppLoaderData;
  const submit = useSubmit();

  const [activeAction, setActiveAction] = useState<Action>();
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
      handleAction(
        {
          ...activeAction,
          intent: INTENT.update_action,
          state: event.over.id,
        },
        submit,
      );
    }
    setActiveAction(undefined);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <h5 className="p-8 pb-4">Kanban</h5>
      <div className="overflow-x-auto pb-8">
        <div className="grid min-w-[1500px] grid-cols-7 overflow-hidden px-8">
          <DndContext
            id={"kanban"}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {states.map((state) => (
              <KanbanColumn
                id={state.slug}
                state={state}
                key={state.id}
                actions={actions.filter(
                  (action) => action.state === state.slug,
                )}
              />
            ))}
            <DragOverlay
              className="z-100"
              style={{ transition: "transform 100ms ease" }}
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
  state: State;
}) => {
  return (
    <Droppable id={id} className="flex h-[30vh] flex-col overflow-hidden">
      {(isOver) => {
        return (
          <div
            className={cn(
              "flex h-full flex-col overflow-hidden border-t-4 transition-colors",
              isOver && "bg-muted/50",
            )}
            style={{ borderTopColor: state.color }}
          >
            <div className="flex items-center justify-between px-1 py-2 text-lg font-medium tracking-tight">
              <div>{state.title}</div>
              <UBadge value={actions.length} />
            </div>

            <div className="flex h-full flex-col overflow-y-auto p-1">
              <div className="flex flex-col [&>div:last-child>*]:border-b-transparent [&>div>*]:border-b">
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
