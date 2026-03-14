import {
  addDays,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { STATES, type STATE } from "~/lib/CONSTANTS";

type ClientCalendarProps = {
  actions: Action[];
  currentDay: Date;
  onPrev: () => void;
  onNext: () => void;
  onActionClick: (action: Action) => void;
};

export function ClientCalendar({
  actions,
  currentDay,
  onPrev,
  onNext,
  onActionClick,
}: ClientCalendarProps) {
  // Semana começa na segunda-feira
  const weekStart = startOfWeek(currentDay, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Navegação da semana */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onPrev}>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(days[0], "d 'de' MMMM", { locale: ptBR })} —{" "}
          {format(days[6], "d 'de' MMMM yyyy", { locale: ptBR })}
        </span>
        <Button variant="ghost" size="icon" onClick={onNext}>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {/* Grade da semana */}
      <div className="grid min-h-0 flex-1 grid-cols-7 divide-x overflow-y-auto">
        {days.map((day) => {
          const dayActions = actions.filter((a) =>
            isSameDay(parseISO(a.date), day),
          );
          const isCurrentDay = isToday(day);

          return (
            <div key={day.toISOString()} className="flex flex-col overflow-hidden">
              {/* Cabeçalho do dia */}
              <div
                className={cn(
                  "sticky top-0 z-10 border-b bg-background px-2 py-2 text-center",
                  isCurrentDay && "bg-primary/5",
                )}
              >
                <div className="text-muted-foreground text-xs uppercase tracking-wide">
                  {format(day, "EEE", { locale: ptBR })}
                </div>
                <div
                  className={cn(
                    "mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-medium",
                    isCurrentDay &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>

              {/* Ações do dia */}
              <div className="flex-1 space-y-1 overflow-y-auto p-1">
                {dayActions.map((action) => {
                  const state = STATES[action.state as STATE];
                  return (
                    <button
                      key={action.id}
                      onClick={() => onActionClick(action)}
                      className="hover:bg-muted/60 w-full rounded-lg px-2 py-1.5 text-left transition-colors"
                    >
                      <div className="flex items-start gap-1.5">
                        <span
                          className="mt-0.5 size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: state?.color ?? "#999" }}
                        />
                        <span className="line-clamp-2 text-xs leading-snug">
                          {action.title}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-0.5 pl-3.5 text-[10px]">
                        {format(parseISO(action.date), "HH:mm")}
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
  );
}
