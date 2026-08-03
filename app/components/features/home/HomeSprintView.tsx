import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { RotateCcwIcon } from "lucide-react";
import { useState } from "react";
import type { Action } from "~/types";
import {
  ActionItem,
  type ActionDisplayFlags,
} from "~/components/features/ActionItem";
import { SortableItem } from "~/components/features/DnD";
import {
  useViewOptions,
  ViewOptionsComponent,
} from "~/components/features/ViewOptions";
import { PrismButton, PrismSkeleton } from "~/components/prism";
import { useAppContext } from "~/contexts/AppContext";
import { useLoading } from "~/hooks/useLoading";
import { useSprintOrder } from "~/hooks/useSprintOrder";
import { VARIANT } from "~/lib/CONSTANTS";
import { getGridClasses } from "~/lib/uzzina-utils";
import { HomeViewWrapper } from "./HomeViewWrapper";
export function HomeSprintView({ actions }: { actions: Action[] }) {
  const isLoading = useLoading(["actions"]);
  const { person } = useAppContext();
  const { orderedActions, handleReorder, clearOrder, hasCustomOrder } =
    useSprintOrder(person.user_id, actions);
  const [activeAction, setActiveAction] = useState<Action | undefined>(
    undefined,
  );
  const [viewOptions, setViewOptions] = useViewOptions({
    variant: VARIANT.block,
    showOptions: {
      variant: true,
      columns: true,
    },
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  function handleDragStart(event: DragStartEvent) {
    const found = orderedActions.find((a) => a.id === event.active.id);
    if (found) setActiveAction(found);
  }
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      handleReorder(String(active.id), String(over.id));
    }
    setActiveAction(undefined);
  }
  const actionIds = orderedActions.map((a) => a.id);
  const gridClasses = getGridClasses(viewOptions.columns ?? 1);
  const displayFlags = {
    showCategory: true,
    showLate: true,
    showPartner: true,
    showSprint: false,
    showResponsibles: true,
  } as ActionDisplayFlags;
  return (
    <HomeViewWrapper
      OptionsComponent={
        <div className="flex items-center gap-2">
          {hasCustomOrder && (
            <PrismButton onClick={clearOrder} size="sm" variant="destructive">
              <RotateCcwIcon className="size-3.5" />
              Restaurar ordem
            </PrismButton>
          )}
          <ViewOptionsComponent
            setViewOptions={setViewOptions}
            viewOptions={viewOptions}
          />
        </div>
      }
      title="Sprint"
    >
      <div className="px-8 xl:px-16">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4 py-4">
            {["sprint-sk-1", "sprint-sk-2", "sprint-sk-3", "sprint-sk-4"].map(
              (skKey) => (
                <PrismSkeleton key={skKey} className="h-32 rounded-2xl" />
              ),
            )}
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            id="sprint-dnd"
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            <SortableContext items={actionIds} strategy={rectSortingStrategy}>
              <div className={`${gridClasses} gap-2 p-1`}>
                {orderedActions.map((action) => (
                  <SortableItem key={action.id} id={action.id}>
                    <ActionItem
                      action={action}
                      displayFlags={displayFlags}
                      variant={viewOptions.variant}
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
            <DragOverlay
              adjustScale={false}
              dropAnimation={{
                duration: 150,
                easing: "ease-in-out",
              }}
            >
              {activeAction ? (
                <ActionItem
                  action={activeAction}
                  displayFlags={displayFlags}
                  isDragging
                  variant={viewOptions.variant}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </HomeViewWrapper>
  );
}
