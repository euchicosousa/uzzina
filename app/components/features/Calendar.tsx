import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusIcon } from "lucide-react";
import { DATE_TIME_DISPLAY, VARIANT } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import type { ViewOptions } from "~/routes/app.partner.slug";
import { Button } from "../ui/button";
import { ActionContainer } from "./ActionContainer";
import { Droppable } from "./DnD";
import React from "react";

export const CalendarActions = ({
  calendar,
  actions,
  viewOptions,
  onCreateAction,
  isCompact,
  isScroll,
}: {
  calendar: Date[];
  actions: Action[];
  viewOptions: ViewOptions;
  onCreateAction?: (day: Date) => void;
  isCompact?: boolean;
  isScroll?: boolean;
}) => {
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full w-full min-w-[1600px] flex-col overflow-hidden">
        <WeekHeader />
        <div className="grid h-full shrink grid-cols-7 overflow-y-auto">
          {calendar.map((day) => (
            <Droppable id={day.toISOString()} key={day.toISOString()} className={cn(
              "group/column border-b pb-4",
              !isSameMonth(day, new Date()) ? "bg-secondary/75" : "",
            )}>
              {(isOver) => (
                <React.Fragment>
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "p-2 text-lg",
                        isSameDay(day, new Date()) ? "font-bold underline" : "",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    {onCreateAction && (
                      <div className="opacity-0 group-hover/column:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => {
                            onCreateAction(day);
                          }}
                        >
                          <PlusIcon className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      viewOptions.variant === VARIANT.content ? "p-2" : "",
                      isScroll ? "h-80" : "",
                    )}
                  >
                    <ActionContainer
                      actions={actions.filter((action) =>
                        isSameDay(
                          viewOptions.instagram
                            ? action.instagram_date
                            : action.date,
                          day,
                        ),
                      )}
                      dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                      showCategory={viewOptions.category}
                      showPartner={viewOptions.partner}
                      showResponsibles={viewOptions.responsibles}
                      showLate={viewOptions.late}
                      showPriority={viewOptions.priority}
                      showDivider={true}
                      orderBy={viewOptions.order}
                      ascending={viewOptions.ascending}
                      isCompact={isCompact}
                      isInstagramDate={viewOptions.instagram}
                      variant={viewOptions.variant}
                      isScroll={isScroll}
                      isDraggable
                    />
                  </div>
                </React.Fragment>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeekHeader = () => {
  const week = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });
  return (
    <div className="grid grid-cols-7 border-b">
      {week.slice(0, 7).map((day) => (
        <div key={day.toISOString()} className="p-2 text-center xl:p-3">
          <div
            className={cn(
              "text-sm leading-none font-medium capitalize xl:text-lg",
              format(day, "i") === format(new Date(), "i")
                ? "font-bold underline"
                : "",
            )}
          >
            <span className="uppercase sm:hidden">
              {format(day, "eeeeee", { locale: ptBR })}
            </span>
            <span className="hidden sm:block xl:hidden">
              {format(day, "eee", { locale: ptBR })}
            </span>
            <span className="hidden xl:block">
              {format(day, "eeee", { locale: ptBR })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
