import type { Action } from "~/types";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { DATE_TIME_DISPLAY, INTENT, STATIONS } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { ActionItem } from "../features/ActionItem";
import { UBadge } from "../uzzina/UBadge";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { ActionContainer } from "../features/ActionContainer";
import { Droppable } from "../features/DnD";
import { DragStateContext } from "../features/DragStateContext";
import { useActionMutations } from "~/hooks/useActionMutations";
import { PrismBadge } from "../prism";
export default function KanbanStationsFlow({ actions }: { actions: Action[] }) {
  const isDesktop = useIsDesktop();
  const { handleAction } = useActionMutations();
  const [activeAction, setActiveAction] = useState<Action>();

  // Local overrides: maps action.id -> new station slug
  const [stationOverrides, setStationOverrides] = useState<
    Record<string, string | null>
  >({});
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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
      const targetStation =
        event.over.id === "none" ? null : (event.over.id as string);

      // 1. Apply local override
      setStationOverrides((prev) => ({
        ...prev,
        [activeAction.id]: targetStation,
      }));

      // 2. Persist mutation
      handleAction({
        ...activeAction,
        intent: INTENT.update_action,
        station: targetStation,
      });
    }
    setActiveAction(undefined);
  };

  // Merge overrides into actions
  const actionsWithOverrides = useMemo(() => {
    return actions.map((action) => {
      if (stationOverrides[action.id] !== undefined) {
        return {
          ...action,
          station: stationOverrides[action.id],
        };
      }
      return action;
    });
  }, [actions, stationOverrides]);

  // Pre-group by station
  const actionsByStation = useMemo(() => {
    const map: Record<string, Action[]> = {
      flow: [],
      planning: [],
      creation: [],
      client: [],
      none: [],
    };
    for (const action of actionsWithOverrides) {
      const key = action.station ?? "none";
      if (!map[key]) map[key] = [];
      map[key].push(action);
    }
    return map;
  }, [actionsWithOverrides]);
  if (isDesktop) {
    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        <DragStateContext.Provider value={!!activeAction}>
          <DndContext
            id="stations-flow-kanban"
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            {/* Top 4 columns */}
            <div className="grid grid-cols-4 flex-1 min-h-0 overflow-hidden pb-4">
              {Object.values(STATIONS).map((station) => (
                <KanbanColumn
                  key={station.slug}
                  actions={actionsByStation[station.slug] ?? []}
                  isDraggable={true}
                  station={station}
                />
              ))}
            </div>
            {/* Bottom row: Sem estação */}
            <div className="h-[220px] shrink pt-4">
              <KanbanRow
                actions={actionsByStation.none ?? []}
                isDraggable={true}
              />
            </div>

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
        </DragStateContext.Provider>
      </div>
    );
  }

  // Mobile: 5 columns horizontal
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto pb-8 h-[calc(100vh-200px)]">
        <div className="flex min-w-max h-full overflow-hidden">
          {Object.values(STATIONS).map((station) => (
            <KanbanColumn
              key={station.slug}
              actions={actionsByStation[station.slug] ?? []}
              className="w-[300px]"
              isDraggable={false}
              station={station}
            />
          ))}
          <KanbanColumn
            actions={actionsByStation.none ?? []}
            className="w-[300px]"
            isDraggable={false}
            station={{
              slug: "none",
              title: "Sem estação",
              color: "#888",
            }}
          />
        </div>
      </div>
    </div>
  );
}
const KanbanColumn = ({
  actions,
  station,
  className,
  isDraggable,
}: {
  actions: Action[];
  station: {
    slug: string;
    title: string;
    color: string;
  };
  className?: string;
  isDraggable: boolean;
}) => {
  return (
    <Droppable
      className={cn("flex h-full flex-col overflow-hidden", className)}
      id={station.slug}
    >
      {(isOver) => (
        <div
          className={cn(
            "flex h-full w-full flex-col overflow-hidden border-t-4 transition-colors px-4",
            isOver && "border-primary/50 bg-primary/5",
          )}
          style={{
            borderTopColor: station.color,
          }}
        >
          <div className="flex items-center gap-2 px-1 py-2 text-lg font-medium tracking-tight">
            <div>{station.title}</div>
            <PrismBadge>{actions.length}</PrismBadge>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <ActionContainer
              actions={actions}
              ascending={true}
              dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
              displayFlags={{
                showLate: true,
                showPartner: true,
                showCategory: true,
              }}
              isDraggable={isDraggable}
              orderBy="date"
            />
          </div>
        </div>
      )}
    </Droppable>
  );
};
const KanbanRow = ({
  actions,
  isDraggable,
}: {
  actions: Action[];
  isDraggable: boolean;
}) => {
  const sortedActions = useMemo(() => {
    return [...actions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [actions]);
  return (
    <Droppable className="flex h-full flex-col overflow-hidden" id="none">
      {(isOver) => (
        <div
          className={cn(
            "flex flex-col h-full overflow-hidden border-t-4 border-gray-400 pt-2 px-4 transition-colors",
            isOver && "border-primary/50 bg-primary/5",
          )}
        >
          <div className="flex items-center gap-2 px-1 pb-2 text-lg font-medium tracking-tight">
            <div>Sem estação</div>
            <PrismBadge>{actions.length}</PrismBadge>
          </div>
          <div className="flex overflow-x-auto gap-2 p-1 h-full">
            {sortedActions.map((action) => (
              <div key={action.id} className="w-[300px] shrink-0">
                <ActionItem
                  action={action}
                  dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                  displayFlags={{
                    showLate: true,
                    showPartner: true,
                    showCategory: true,
                  }}
                  isDraggable={isDraggable}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Droppable>
  );
};
