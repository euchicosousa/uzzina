import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { format, isSameDay, parseISO } from "date-fns";
import { useState } from "react";
import { ActionItem } from "~/components/features/ActionItem";
import {
  CalendarActions,
  type CalendarLayoutOptions,
} from "~/components/features/Calendar";
import { useActionMutations } from "~/hooks/useActionMutations";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import { getNewDateForAction } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import { DragStateContext } from "./DragStateContext";
import type { ViewOptions } from "./ViewOptions";
const DEFAULT_CELEBRATIONS: Celebration[] = [];
const DEFAULT_LAYOUT_OPTIONS: CalendarLayoutOptions = {};
export function CalendarWithDnd({
  actions,
  calendarDays,
  celebrations = DEFAULT_CELEBRATIONS,
  viewOptions,
  currentDay,
  onCreateAction,
  layoutOptions = DEFAULT_LAYOUT_OPTIONS,
}: {
  actions: Action[];
  calendarDays: Date[];
  celebrations?: Celebration[];
  viewOptions: ViewOptions;
  currentDay?: Date;
  onCreateAction?: (day: Date) => void;
  layoutOptions?: CalendarLayoutOptions;
}) {
  const { handleAction } = useActionMutations();
  const [activeAction, setActiveAction] = useState<Action>();
  // Local override: maps action.id → updated date fields.
  // Applied immediately on drop so the DOM is correct before the drop
  // animation runs. Cleared once the server data is revalidated.

  const [dateOverrides, setDateOverrides] = useState<
    Record<string, Partial<Action>>
  >({});
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const handleDragStart = (event: DragStartEvent) => {
    const found = actions.find((a) => a.id === event.active.id);
    if (found) {
      setActiveAction(found);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeAction) {
      const key = "date";
      const value = format(
        parseISO(event.over.id as string),
        "yyyy-MM-dd",
      ).concat(format(activeAction[key], " HH:mm:ss"));
      const newDates = getNewDateForAction(activeAction, parseISO(value));
      setDateOverrides((prev) => ({
        ...prev,
        [activeAction.id]: newDates,
      }));
      handleAction({
        ...activeAction,
        intent: INTENT.update_action,
        ...newDates,
      });
    }
    setActiveAction(undefined);
  };
  const actionsWithOverrides = actions.map((action) =>
    dateOverrides[action.id]
      ? {
          ...action,
          ...dateOverrides[action.id],
        }
      : action,
  );
  const calendar = calendarDays.map((date) => ({
    date,
    actions: actionsWithOverrides.filter((action) =>
      isSameDay(parseISO(action.date), date),
    ),
    celebrations: celebrations.filter((c) => isSameDay(parseISO(c.date), date)),
  }));
  return (
    <DragStateContext.Provider value={!!activeAction}>
      <DndContext
        id="calendar"
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <CalendarActions
          calendar={calendar}
          currentDay={currentDay}
          layoutOptions={layoutOptions}
          onCreateAction={onCreateAction}
          viewOptions={viewOptions}
        />
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
                showLate: viewOptions.late,
                showPartner: viewOptions.partner,
                showCategory: viewOptions.category,
                showResponsibles: viewOptions.responsibles,
                showPriority: viewOptions.priority,
              }}
              isDragging
              variant={viewOptions.variant}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragStateContext.Provider>
  );
}
