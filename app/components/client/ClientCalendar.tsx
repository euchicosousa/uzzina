import type { Action } from "~/types";
import type { DashActionDto } from "~/services/dash-client";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { parseU } from "~/utils/date";
import { ptBR } from "date-fns/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import {
  PrismButton,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { CATEGORIES, DATE_TIME_DISPLAY, type CATEGORY } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { getFormattedDateTime } from "~/utils/date";
import { Content } from "../features/Content";
import { UIcons } from "~/components/uzzina/UIcons";
type ClientCalendarProps<
  T extends Action | DashActionDto = Action | DashActionDto,
> = {
  actions: T[];
  currentDay: Date;
  onPrev: () => void;
  onNext: () => void;
  onActionClick: (action: T) => void;
  view?: "week" | "month";
  calendarView?: "week" | "month";
  setCalendarView?: (view: "week" | "month") => void;
  endContent?: ReactNode;
};
export function ClientCalendar<
  T extends Action | DashActionDto = Action | DashActionDto,
>({
  actions,
  currentDay,
  onPrev,
  onNext,
  onActionClick,
  view = "week",
  calendarView,
  setCalendarView,
  endContent,
}: ClientCalendarProps<T>) {
  const weekStart = startOfWeek(currentDay, {
    weekStartsOn: 0,
  });
  const days = useMemo(() => {
    return view === "week"
      ? Array.from(
          {
            length: 7,
          },
          (_, i) => addDays(weekStart, i),
        )
      : eachDayOfInterval({
          start: startOfWeek(startOfMonth(currentDay), {
            weekStartsOn: 0,
          }),
          end: endOfWeek(endOfMonth(currentDay), {
            weekStartsOn: 0,
          }),
        });
  }, [view, currentDay, weekStart]);
  const title = useMemo(() => {
    return view === "week"
      ? `${format(days[0], "d 'de' MMMM", {
          locale: ptBR,
        })} — ${format(days[6], "d 'de' MMMM yyyy", {
          locale: ptBR,
        })}`
      : format(currentDay, "MMMM yyyy", {
          locale: ptBR,
        });
  }, [view, days, currentDay]);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <PrismButton
            aria-label={view === "week" ? "Semana anterior" : "Mês anterior"}
            onClick={onPrev}
            size="icon-sm"
            variant="ghost"
          >
            <ChevronLeftIcon className="size-4" />
          </PrismButton>
          <span className="text-sm font-medium capitalize">{title}</span>
          <PrismButton
            aria-label={view === "week" ? "Próxima semana" : "Próximo mês"}
            onClick={onNext}
            size="icon-sm"
            variant="ghost"
          >
            <ChevronRightIcon className="size-4" />
          </PrismButton>
        </div>

        <div className="flex items-center gap-2">
          {setCalendarView && (
            <PrismToggleGroup
              aria-label="Visualização do calendário"
              selectedKeys={calendarView ? [calendarView] : [view]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as "week" | "month";
                if (selected) setCalendarView(selected);
              }}
              size="sm"
            >
              <PrismToggleGroupItem id="week">Semana</PrismToggleGroupItem>
              <PrismToggleGroupItem id="month">Mês</PrismToggleGroupItem>
            </PrismToggleGroup>
          )}
          {endContent}
        </div>
      </div>

      {/* Container com rolagem global nos 2 eixos divididos */}
      <div className="min-h-0 w-full flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-375 flex-col overflow-hidden">
          {/* Cabeçalho dos dias da semana (apenas para Mês) */}
          {view === "month" && (
            <div className="grid shrink-0 grid-cols-7 border-b bg-secondary">
              {Array.from({
                length: 7,
              }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: Lista estática dos dias da semana
                  key={i}
                  className="py-2 text-center text-xs font-semibold text-secondary-foreground uppercase"
                >
                  {format(addDays(weekStart, i), "EEE", {
                    locale: ptBR,
                  })}
                </div>
              ))}
            </div>
          )}

          <div className="grid min-h-0 flex-1 auto-rows-max grid-cols-7 content-start divide-x divide-y overflow-y-auto">
            {days.map((day) => {
              const dayActions = actions.filter((a) =>
                isSameDay(parseU(a.date), day),
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
                      <div className="text-[10px] font-semibold tracking-wide text-secondary-foreground uppercase">
                        {format(day, "EEE", {
                          locale: ptBR,
                        })}
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                        isCurrentDay
                          ? "bg-primary text-primary-foreground"
                          : "text-secondary-foreground",
                        view === "week" && "mx-auto mt-0.5 size-7 text-sm",
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>

                  {/* Ações do dia */}
                  <div className="flex flex-col gap-px p-1">
                    {dayActions.map((action) => {
                      const category = Object.hasOwn(
                        CATEGORIES,
                        action.category,
                      )
                        ? CATEGORIES[action.category as CATEGORY]
                        : undefined;
                      const actionTime = parseU(action.date);
                      return (
                        <PrismButton
                          key={action.id}
                          className={cn(
                            "w-full rounded-xl px-1.5 py-1 text-left font-normal transition-colors squircle hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/30",
                            view === "week" && "px-2 py-1.5",
                          )}
                          onPress={() => onActionClick(action)}
                          variant="unstyled"
                        >
                          <Content action={action} showDate={false} />
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <span
                              className="size-4"
                              aria-label={category?.title}
                              role={category ? "img" : undefined}
                            >
                              {category && (
                                <UIcons
                                  className="size-full"
                                  color={category.color}
                                  slug={category.slug}
                                />
                              )}
                            </span>

                            <div className="text-xs text-secondary-foreground">
                              {getFormattedDateTime(
                                actionTime,
                                DATE_TIME_DISPLAY.TimeOnly,
                              )}
                            </div>
                          </div>
                        </PrismButton>
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
