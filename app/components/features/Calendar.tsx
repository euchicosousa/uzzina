import type { Action } from "~/types";
import type { ReactNode } from "react";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { ViewOptions } from "~/components/features/ViewOptions";
import { cn } from "cnfast";
import { CalendarDayCell } from "./CalendarDayCell";
export { CalendarToolbar } from "./CalendarToolbar";
export { CalendarToolbar as CalendarButtons } from "./CalendarToolbar";
export type CalendarLayoutOptions = {
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
  renderDayLabel,
  layoutOptions = DEFAULT_LAYOUT_OPTIONS,
}: {
  currentDay?: Date;
  calendar: CalendarActionsType[];
  viewOptions: ViewOptions;
  onCreateAction?: (day: Date) => void;
  renderDayLabel?: (day: Date, label: ReactNode) => ReactNode;
  layoutOptions?: CalendarLayoutOptions;
}) {
  const { showBorder, highlightThisWeek, hideBorderOnLastRow } = layoutOptions;
  return (
    <div className="w-full shrink-0 overflow-x-auto">
      <div className="flex w-full min-w-375 flex-col lg:min-w-225">
        <WeekHeader />
        <div className="grid grid-cols-7 items-stretch">
          {calendar.map((day, i) => {
            const isLastRow = i >= Math.floor((calendar.length - 1) / 7) * 7;
            return (
              <CalendarDayCell
                key={format(day.date, "yyyy-MM-dd")}
                actions={day.actions || []}
                celebrations={day.celebrations}
                currentDay={currentDay}
                day={day.date}
                highlightThisWeek={highlightThisWeek}
                onCreateAction={onCreateAction}
                renderDayLabel={renderDayLabel}
                showBorder={
                  hideBorderOnLastRow && isLastRow ? false : showBorder
                }
                viewOptions={viewOptions}
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
            className={cn(
              "overflow-hidden text-sm leading-none font-medium text-ellipsis whitespace-nowrap capitalize xl:text-lg",
              format(day, "i") === todayDayIndex ? "font-bold underline" : "",
            )}
            suppressHydrationWarning
          >
            <span className="uppercase sm:hidden">
              {format(day, "eeeeee", {
                locale: ptBR,
              })}
            </span>
            <span className="hidden sm:block xl:hidden">
              {format(day, "eee", {
                locale: ptBR,
              })}
            </span>
            <span className="hidden xl:block">
              {format(day, "eeee", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
