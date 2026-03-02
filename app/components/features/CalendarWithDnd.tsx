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
import { useEffect, useState } from "react";
import { useSubmit } from "react-router";
import { ActionItem } from "~/components/features/ActionItem";
import { CalendarActions } from "~/components/features/Calendar";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import {
  getNewDateForAction,
  handleAction,
  isInstagramFeed,
} from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { ViewOptions } from "./ViewOptions";

export function CalendarWithDnd({
  actions,
  calendarDays,
  celebrations = [],
  viewOptions,
  currentDay,
  onCreateAction,
  isCompact,
  isScroll,
}: {
  actions: Action[];
  calendarDays: Date[];
  celebrations?: Celebration[];
  viewOptions: ViewOptions;
  currentDay?: Date;
  onCreateAction?: (day: Date) => void;
  isCompact?: boolean;
  isScroll?: boolean;
}) {
  const submit = useSubmit();
  const [activeAction, setActiveAction] = useState<Action>();
  // Local override: maps action.id → updated date fields.
  // Applied immediately on drop so the DOM is correct before the drop
  // animation runs. Cleared once the server data is revalidated.
  const [dateOverrides, setDateOverrides] = useState<
    Record<string, Partial<Action>>
  >({});

  useEffect(() => {
    setDateOverrides({});
  }, [actions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveAction(actions.find((a) => a.id === event.active.id)!);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeAction) {
      const key =
        viewOptions.instagram && isInstagramFeed(activeAction.category)
          ? "instagram_date"
          : "date";

      const value = format(
        parseISO(event.over.id as string),
        "yyyy-MM-dd",
      ).concat(format(activeAction[key], " HH:mm:ss"));

      const newDates = getNewDateForAction(
        activeAction,
        parseISO(value),
        viewOptions.instagram && isInstagramFeed(activeAction.category),
      );

      setDateOverrides((prev) => ({ ...prev, [activeAction.id]: newDates }));

      handleAction(
        { ...activeAction, intent: INTENT.update_action, ...newDates },
        submit,
      );
    }

    setActiveAction(undefined);
  };

  const actionsWithOverrides = actions.map((action) =>
    dateOverrides[action.id]
      ? { ...action, ...dateOverrides[action.id] }
      : action,
  );

  const calendar = calendarDays.map((date) => ({
    date,
    actions: actionsWithOverrides.filter((action) =>
      isSameDay(
        viewOptions.instagram && isInstagramFeed(action.category)
          ? action.instagram_date
          : action.date,
        date,
      ),
    ),
    celebrations: celebrations.filter((c) => isSameDay(parseISO(c.date), date)),
  }));

  return (
    <DndContext
      id="calendar"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CalendarActions
        currentDay={currentDay}
        calendar={calendar}
        viewOptions={viewOptions}
        onCreateAction={onCreateAction}
        isCompact={isCompact}
        isScroll={isScroll}
      />
      <DragOverlay
        className="z-100"
        dropAnimation={{ duration: 150, easing: "ease-in-out" }}
        adjustScale={false}
      >
        {activeAction ? (
          <ActionItem
            action={activeAction}
            variant={viewOptions.variant}
            isDragging
            showLate={viewOptions.late}
            showPartner={viewOptions.partner}
            showCategory={viewOptions.category}
            showResponsibles={viewOptions.responsibles}
            showPriority={viewOptions.priority}
            dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
