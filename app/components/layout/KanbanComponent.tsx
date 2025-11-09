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
import { INTENT } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "~/routes/app";
import { ActionItem } from "../features/ActionItem";
import { Draggable, Droppable } from "../features/DnD";

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
      handleAction({
        ...activeAction,
        intent: INTENT.update_action,
        state: event.over.id,
      });
    }
    setActiveAction(undefined);
  };

  const handleAction = (data: any) => {
    submit(
      {
        ...data,
      },
      {
        method: "post",
        action: "/action/handle-action",
        navigate: false,
      },
    );
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <h5 className="p-8 pb-4">Kanban</h5>
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-7xl grid-cols-7 overflow-hidden px-8">
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
                <ActionItem action={activeAction} isDragging />
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
    <Droppable id={id} className="flex max-h-[30vh] flex-col overflow-hidden">
      {(isOver) => {
        return (
          <div
            className={cn(
              "flex h-full flex-col overflow-hidden border-t-4 p-1 transition-colors",
              isOver && "bg-muted/50",
            )}
            style={{ borderTopColor: state.color }}
          >
            <div className="my-2 pb-2 text-xs font-bold tracking-wider uppercase">
              {state.title}
            </div>

            <div className="flex h-full flex-col gap-1 overflow-y-auto pr-1">
              <div className="flex flex-col gap-1">
                {actions.map((action) => (
                  <Draggable id={action.id} key={action.id}>
                    <ActionItem action={action} showLate />
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
