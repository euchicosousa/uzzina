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
    <div className="overflow-x-hidden p-4">
      <h4 className="px-4">Kanban</h4>
      <div className="overflow-x-auto">
        <div className="grid min-w-5xl grid-cols-7">
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
              {activeAction ? <ActionItem action={activeAction} /> : null}
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
    <Droppable id={id}>
      {(isOver) => {
        return (
          <div
            className={cn(
              "h-full border-t-4 p-1 transition-colors",
              isOver && "bg-muted/50",
            )}
            style={{ borderTopColor: state.color }}
          >
            <div className="my-2 pb-2 text-xs font-bold tracking-wider uppercase">
              {state.title}
            </div>
            <div className="flex flex-col gap-1">
              {actions.map((action) => (
                <Draggable id={action.id} key={action.id}>
                  <ActionItem action={action} />
                </Draggable>
              ))}
            </div>
          </div>
        );
      }}
    </Droppable>
  );
};
