import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { DATE_TIME_DISPLAY, STATES, type STATE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { getFormattedDateTime } from "~/utils/date";
import { Content } from "../features/Content";
import { StateIcon } from "../features/StateIcon";

type ClientCalendarProps = {
  actions: Action[];
  currentDay: Date;
  onPrev: () => void;
  onNext: () => void;
  onActionClick: (action: Action) => void;
  view?: "week" | "month";
  calendarView?: "week" | "month";
  setCalendarView?: (view: "week" | "month") => void;
};

export function ClientCalendar({
  actions,
  currentDay,
  onPrev,
  onNext,
  onActionClick,
  view = "week",
  calendarView,
  setCalendarView,
}: ClientCalendarProps) {
  const weekStart = startOfWeek(currentDay, { weekStartsOn: 0 });

  const days = useMemo(() => {
    return view === "week"
      ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      : eachDayOfInterval({
          start: startOfWeek(startOfMonth(currentDay), { weekStartsOn: 0 }),
          end: endOfWeek(endOfMonth(currentDay), { weekStartsOn: 0 }),
        });
  }, [view, currentDay, weekStart]);

  const title = useMemo(() => {
    return view === "week"
      ? `${format(days[0], "d 'de' MMMM", { locale: ptBR })} — ${format(
          days[6],
          "d 'de' MMMM yyyy",
          { locale: ptBR },
        )}`
      : format(currentDay, "MMMM yyyy", { locale: ptBR });
  }, [view, days, currentDay]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onPrev}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm font-medium capitalize">{title}</span>
          <Button variant="ghost" size="icon" onClick={onNext}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        <div className="flex rounded-lg border text-sm">
          <button
            onClick={() => setCalendarView && setCalendarView("week")}
            className={`rounded-l-lg px-3 py-1 font-medium transition-colors ${calendarView === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Semana
          </button>
          <button
            onClick={() => setCalendarView && setCalendarView("month")}
            className={`rounded-r-lg px-3 py-1 font-medium transition-colors ${calendarView === "month" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Container com rolagem global nos 2 eixos divididos */}
      <div className="min-h-0 w-full flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-[1500px] flex-col overflow-hidden">
          {/* Cabeçalho dos dias da semana (apenas para Mês) */}
          {view === "month" && (
            <div className="bg-muted/20 grid shrink-0 grid-cols-7 border-b">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="text-muted-foreground py-2 text-center text-xs font-semibold uppercase"
                >
                  {format(addDays(weekStart, i), "EEE", { locale: ptBR })}
                </div>
              ))}
            </div>
          )}

          <div className="grid flex-1 grid-cols-7 divide-x divide-y overflow-y-auto">
            {days.map((day) => {
              const dayActions = actions.filter((a) =>
                isSameDay(parseISO(a.instagram_date || a.date), day),
              );
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDay);

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex flex-col",
                    // !isCurrentMonth && view === "month" && "opacity-50",
                  )}
                >
                  {/* Cabeçalho do dia */}
                  <div
                    className={cn(
                      "bg-background sticky top-0 z-10 border-b px-2 py-1 text-center",
                      view === "month" &&
                        "flex items-center justify-between border-none px-2 py-1",
                    )}
                  >
                    {view === "week" && (
                      <div className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                        {format(day, "EEE", { locale: ptBR })}
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                        isCurrentDay
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground",
                        view === "week" && "mx-auto mt-0.5 size-7 text-sm",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>

                  {/* Ações do dia */}
                  <div className="flex h-full min-h-[120px] flex-col gap-px p-1">
                    {dayActions.map((action) => {
                      const state = STATES[action.state as STATE];
                      const actionTime = parseISO(
                        action.instagram_date || action.date,
                      );

                      return (
                        <button
                          key={action.id}
                          onClick={() => onActionClick(action)}
                          className={cn(
                            "hover:bg-muted/60 w-full rounded-md px-1.5 py-1 text-left transition-colors",
                            view === "week" && "rounded-lg px-2 py-1.5",
                          )}
                        >
                          <Content action={action} showDate={false} />
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <StateIcon state={state} />

                            <div className="text-muted-foreground text-xs">
                              {getFormattedDateTime(
                                actionTime,
                                DATE_TIME_DISPLAY.TimeOnly,
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
