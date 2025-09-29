import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { useState } from "react";
import { useMatches } from "react-router";
import type { AppLoaderData } from "~/routes/app";
import { ActionItem } from "../features/ActionItem";
import { Draggable, Droppable } from "../features/DnD";
import { cn } from "~/lib/utils";

export default function KanbanComponent({ actions }: { actions: Action[] }) {
  const { states } = useMatches()[1].loaderData as AppLoaderData;
  const [activeId, setActiveId] = useState<UniqueIdentifier>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over) {
      setActiveId(undefined);
      console.log(event.over.id);
    }
  };

  return (
    <div className="p-4">
      <h4 className="px-4">Kanban</h4>
      <div className="grid grid-cols-7">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {states.map((state) => (
            <KanbanColumn
              id={state.slug}
              state={state}
              key={state.id}
              actions={actions.filter((action) => action.state === state.slug)}
            />
          ))}
          <DragOverlay
            className="z-100"
            style={{ transition: "transform 100ms ease" }}
          >
            {activeId ? (
              <ActionItem
                action={actions.find((action) => action.id === activeId)!}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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
