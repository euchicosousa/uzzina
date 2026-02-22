import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useState } from "react";
import {
  useMatches,
  useOutletContext,
  useParams,
  useSubmit,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionItem } from "~/components/features/ActionItem";
import { CalendarActions } from "~/components/features/Calendar";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
import {
  getCleanAction,
  getNewDateForAction,
  handleAction,
  isInstagramFeed,
} from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";
import { type ViewOptions } from "./ViewOptions";

export function ActionCalendarPartnerPage({
  currentDay = new Date(),
  actions,
  viewOptions,
}: {
  currentDay?: Date;
  actions: Action[];
  viewOptions: ViewOptions;
}) {
  let calendarDates = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDay)),
    end: endOfWeek(endOfMonth(currentDay)),
  });

  const { person, celebrations } = useMatches()[1].loaderData as AppLoaderData;

  let params = useParams();
  const partnerSlug = params.slug;

  invariant(partnerSlug);

  const { setBaseAction } = useOutletContext<any>();

  const [activeAction, setActiveAction] = useState<Action>();
  // Local override: maps action.id → updated date fields
  // Applied immediately on drop so the DOM correct before drop animation runs.
  const [dateOverrides, setDateOverrides] = useState<
    Record<string, Partial<Action>>
  >({});
  const submit = useSubmit();
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
      const key =
        viewOptions.instagram && isInstagramFeed(activeAction.category)
          ? "instagram_date"
          : "date";
      // event.over.id is ISO string from Droppable id
      const value = format(
        parseISO(event.over.id as string),
        "yyyy-MM-dd",
      ).concat(format(activeAction[key], " HH:mm:ss"));

      const newDates = getNewDateForAction(
        activeAction,
        parseISO(value),
        viewOptions.instagram && isInstagramFeed(activeAction.category),
      );

      // 1. Apply override locally RIGHT NOW so that in the same batched render
      //    the item already appears in the new day — this is what the drop
      //    animation uses to calculate the destination position.
      setDateOverrides((prev) => ({ ...prev, [activeAction.id]: newDates }));

      // 2. Persist to server (async fetcher)
      handleAction(
        {
          ...activeAction,
          intent: INTENT.update_action,
          ...newDates,
        },
        submit,
      );
    }

    // 3. Clear overlay in the same render cycle as the override update above.
    setActiveAction(undefined);
  };

  // Apply local date overrides on top of server-supplied actions
  const actionsWithOverrides = actions.map((action) =>
    dateOverrides[action.id]
      ? { ...action, ...dateOverrides[action.id] }
      : action,
  );

  let calendar = calendarDates.map((date) => ({
    date,
    actions: actionsWithOverrides.filter((action) =>
      isSameDay(
        viewOptions.instagram && isInstagramFeed(action.category)
          ? action.instagram_date
          : action.date,
        date,
      ),
    ),
    celebrations: celebrations.filter((celebration) =>
      isSameDay(parseISO(celebration.date), date),
    ),
  }));

  return (
    <DndContext
      id={"calendar"}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CalendarActions
        currentDay={currentDay}
        calendar={calendar}
        viewOptions={viewOptions}
        onCreateAction={(day) => {
          setBaseAction({
            ...(getCleanAction(person.user_id, day) as unknown as Action),
            partners: [partnerSlug],
          });
        }}
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
