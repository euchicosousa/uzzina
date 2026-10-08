import type { Action } from "~/types";
import {
  DndContext,
  DragOverlay,
} from "@dnd-kit/core";
import { format, isSameDay } from "date-fns";
import { parseU } from "~/utils/date";
import { useKanbanDnd } from "~/hooks/useKanbanDnd";
import { ActionItem } from "~/components/features/ActionItem";
import {
  CalendarActions,
  type CalendarLayoutOptions,
} from "~/components/features/Calendar";
import { useActionMutations } from "~/hooks/useActionMutations";
import { DATE_TIME_DISPLAY, INTENT } from "~/lib/CONSTANTS";
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
  const {activeAction, actionsWithOverrides, sensors, handleDragStart, handleDragEnd, handleDragCancel} = useKanbanDnd<string>({
    actions,
    fieldKey: "date",
    parseTarget: (overId, action) => {
      if (!calendarDays.some(day => format(day, "yyyy-MM-dd") === overId)) return undefined;
      return `${overId} ${format(parseU(action.date), "HH:mm:ss")}`;
    },
    onDrop: async (action, date) => {
      const confirmed = await handleAction({
        intent: INTENT.update_action,
        id: action.id,
        expectedUpdatedAt: action.updated_at,
        date,
      });
      if (!confirmed) throw new Error("O movimento não foi confirmado.");
      return confirmed;
    },
  });
  const calendar = calendarDays.map((date) => ({
    date,
    actions: actionsWithOverrides.filter((action) =>
      isSameDay(parseU(action.date), date),
    ),
    celebrations: celebrations.filter((c) => isSameDay(parseU(c.date), date)),
  }));
  return (
    <DragStateContext.Provider value={!!activeAction}>
      <DndContext
        id="calendar"
        onDragCancel={handleDragCancel}
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
