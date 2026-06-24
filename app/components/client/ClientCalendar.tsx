import type { Action } from "~/types";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { DATE_TIME_DISPLAY, PHASES, type PHASE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { getFormattedDateTime } from "~/utils/date";
import { Content } from "../features/Content";
import { PhaseIcon } from "../features/PhaseIcon";

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
            type="button"
            onClick={() => setCalendarView?.("week")}
            className={`rounded-l-lg px-3 py-1 font-medium transition-colors ${calendarView === "week" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setCalendarView?.("month")}
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
            <div className="grid shrink-0 grid-cols-7 border-b bg-muted/20">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: Lista estática dos dias da semana
                  key={i}
                  className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase"
                >
                  {format(addDays(weekStart, i), "EEE", { locale: ptBR })}
                </div>
              ))}
            </div>
          )}

          <div className="grid flex-1 grid-cols-7 divide-x divide-y overflow-y-auto">
            {days.map((day) => {
              const dayActions = actions.filter((a) =>
                isSameDay(parseISO(a.date), day),
              );
              const isCurrentDay = isToday(day);

              return (
                <div key={day.toISOString()} className={cn("flex flex-col")}>
                  {/* Cabeçalho do dia */}
                  <div
                    className={cn(
                      "sticky top-0 z-10 border-b bg-background px-2 py-1 text-center",
                      view === "month" &&
                        "flex items-center justify-between border-none px-2 py-1",
                    )}
                  >
                    {view === "week" && (
                      <div className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
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
                      const phase = PHASES[(action.phase as PHASE) || "idea"];
                      const actionTime = parseISO(action.date);

                      return (
                        <button
                          type="button"
                          key={action.id}
                          onClick={() => onActionClick(action)}
                          className={cn(
                            "w-full rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted/60",
                            view === "week" && "rounded-lg px-2 py-1.5",
                          )}
                        >
                          <Content action={action} showDate={false} />
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <PhaseIcon phase={phase} size="sm" variant="icon" />

                            <div className="text-xs text-muted-foreground">
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
