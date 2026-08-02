import type { Action } from "~/types";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useState } from "react";
import { CalendarWithDnd } from "~/components/features/CalendarWithDnd";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { PrismToggleGroup, PrismToggleGroupItem } from "~/components/prism";
import { getCleanAction } from "~/lib/helpers";
import { cn } from "cnfast";
import { HomeViewWrapper } from "./HomeViewWrapper";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchCelebrations } from "~/lib/supabase.queries";
import { useAppContext } from "~/contexts/AppContext";
export function HomeCalendarView({
  actions,
  setBaseAction,
}: {
  actions: Action[];
  setBaseAction: (action: Action | null) => void;
}) {
  const { person } = useAppContext();
  const { data: celebrations = [] } = useQuery({
    queryKey: QUERY_KEYS.celebrations(),
    queryFn: fetchCelebrations,
    staleTime: 30 * 60 * 1000, // 30 minutos (celebrations são semi-estáticos)
  });
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [currentDate] = useState(new Date());
  const calendarDays = eachDayOfInterval({
    start:
      period === "week"
        ? startOfWeek(currentDate)
        : startOfWeek(startOfMonth(currentDate)),
    end:
      period === "week"
        ? endOfWeek(currentDate)
        : endOfWeek(endOfMonth(currentDate)),
  });
  const [viewOptions, setViewOptions] = useViewOptions({
    partner: true,
    showOptions: {
      ascending: true,
      order: true,
    },
  });
  return (
    <HomeViewWrapper
      OptionsComponent={
        <div className="flex items-center gap-8">
          <PrismToggleGroup
            aria-label="Alternar Período"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as typeof period;
              if (selected) setPeriod(selected);
            }}
            selectedKeys={new Set([period])}
            selectionMode="single"
            size="sm"
          >
            <PrismToggleGroupItem id="week">Semana</PrismToggleGroupItem>
            <PrismToggleGroupItem id="month">Mês</PrismToggleGroupItem>
          </PrismToggleGroup>
          <ViewOptionsComponent
            setViewOptions={setViewOptions}
            viewOptions={viewOptions}
          />
        </div>
      }
      title={
        period === "week" ? (
          "Essa Semana"
        ) : (
          <span className="capitalize">
            {format(currentDate, "MMMM", {
              locale: ptBR,
            })}
          </span>
        )
      }
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden px-8 xl:px-16",
          period === "week" ? "max-h-[50vh]" : "",
        )}
      >
        <CalendarWithDnd
          actions={actions}
          calendarDays={calendarDays}
          celebrations={celebrations}
          layoutOptions={{
            isCompact: period === "month",
            showBorder: period === "month",
          }}
          onCreateAction={(day) => {
            setBaseAction({
              ...(getCleanAction({
                user_id: person.user_id,
                date: day,
              }) as unknown as Action),
            });
          }}
          viewOptions={viewOptions}
        />
      </div>
    </HomeViewWrapper>
  );
}
