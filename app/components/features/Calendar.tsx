import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { ViewOptions } from "~/components/features/ViewOptions";
import { cn } from "~/lib/utils";
import { CalendarDay } from "./CalendarDay";
export { CalendarButtons } from "./CalendarButtons";
import type { Action } from "~/models/actions.server";

export type CalendarActionsType = {
  date: Date;
  actions?: Action[];
  celebrations?: Celebration[];
};

export function CalendarActions({
  currentDay,
  calendar,
  viewOptions,
  onCreateAction,
  isCompact,
  isScroll,
}: {
  currentDay?: Date;
  calendar: CalendarActionsType[];
  viewOptions: ViewOptions;
  onCreateAction?: (day: Date) => void;
  isCompact?: boolean;
  isScroll?: boolean;
}) {
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full w-full min-w-[1500px] flex-col overflow-hidden">
        <WeekHeader />
        <div className="grid h-full shrink grid-cols-7 overflow-y-auto">
          {calendar.map((day) => (
            <CalendarDay
              currentDay={currentDay}
              day={day.date}
              onCreateAction={onCreateAction}
              viewOptions={viewOptions}
              actions={day.actions || []}
              celebrations={day.celebrations}
              isCompact={isCompact}
              isScroll={isScroll}
              key={format(day.date, "yyyy-MM-dd")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const WeekHeader = () => {
  const week = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });
  return (
    <div className="grid grid-cols-7 border-b">
      {week.slice(0, 7).map((day) => (
        <div key={day.toISOString()} className="p-2 xl:p-3">
          <div
            className={cn(
              "overflow-hidden text-sm leading-none font-medium text-ellipsis whitespace-nowrap capitalize xl:text-lg",
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
