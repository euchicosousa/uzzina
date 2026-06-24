import type { Action } from "~/types";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { ViewOptions } from "~/components/features/ViewOptions";
import { cn } from "~/lib/utils";
import { CalendarDay } from "./CalendarDay";
export { CalendarButtons } from "./CalendarButtons";

export type CalendarLayoutOptions = {
  isCompact?: boolean;
  showBorder?: boolean;
  highlightThisWeek?: boolean;
  hideBorderOnLastRow?: boolean;
};

export type CalendarActionsType = {
  date: Date;
  actions?: Action[];
  celebrations?: Celebration[];
};

const DEFAULT_LAYOUT_OPTIONS: CalendarLayoutOptions = {};

export function CalendarActions({
  currentDay,
  calendar,
  viewOptions,
  onCreateAction,
  layoutOptions = DEFAULT_LAYOUT_OPTIONS,
}: {
  currentDay?: Date;
  calendar: CalendarActionsType[];
  viewOptions: ViewOptions;
  onCreateAction?: (day: Date) => void;
  layoutOptions?: CalendarLayoutOptions;
}) {
  const {
    isCompact,
    showBorder,
    highlightThisWeek,
    hideBorderOnLastRow,
  } = layoutOptions;
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full w-full min-w-[1500px] flex-col overflow-hidden lg:min-w-[900px]">
        <WeekHeader />
        <div className="grid h-full shrink grid-cols-7 overflow-y-auto">
          {calendar.map((day, i) => {
            const isLastRow = i >= Math.floor((calendar.length - 1) / 7) * 7;
            return (
              <CalendarDay
                currentDay={currentDay}
                day={day.date}
                onCreateAction={onCreateAction}
                viewOptions={viewOptions}
                actions={day.actions || []}
                celebrations={day.celebrations}
                isCompact={isCompact}
                showBorder={
                  hideBorderOnLastRow && isLastRow ? false : showBorder
                }
                highlightThisWeek={highlightThisWeek}
                key={format(day.date, "yyyy-MM-dd")}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const WeekHeader = () => {
  const todayDayIndex = format(new Date(), "i");
  const week = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });
  return (
    <div className="grid grid-cols-7 border-b">
      {week.slice(0, 7).map((day) => (
        <div key={day.toISOString()} className="p-2 xl:p-3">
          <div
            suppressHydrationWarning
            className={cn(
              "overflow-hidden text-sm leading-none font-medium text-ellipsis whitespace-nowrap capitalize xl:text-lg",
              format(day, "i") === todayDayIndex
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
