import { useSelectionContext } from "~/hooks/useMultiSelection";
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
import { Link } from "@tanstack/react-router";
import { CalendarWithDnd } from "~/components/features/CalendarWithDnd";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { PrismToggleGroup, PrismToggleGroupItem } from "~/components/prism";
import { createActionDraft } from "~/utils";
import { HomeViewWrapper } from "./HomeViewWrapper";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchCelebrations } from "~/lib/supabase.queries";
import { useAppContext } from "~/contexts/AppContext";
export function HomeCalendarView({
  actions,
  setPrimaryAction,
}: {
  actions: Action[];
  setPrimaryAction: (action: Action | null) => void;
}) {
  const { person } = useAppContext();
  const { data: celebrations = [] } = useQuery({
    queryKey: QUERY_KEYS.celebrations(person.user_id),
    queryFn: fetchCelebrations,
    staleTime: 30 * 60 * 1000, // 30 minutos (celebrations são semi-estáticos)
  });
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [heightLimits, setHeightLimits] = useState({
    week: true,
    month: false,
  });
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
      limitHeight: true,
      ascending: true,
      order: true,
    },
  });
  useSelectionContext(JSON.stringify([period, currentDate, viewOptions]));
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
            setViewOptions={(next) => {
              setHeightLimits((previous) => ({
                ...previous,
                [period]: !!next.limitHeight,
              }));
              setViewOptions(next);
            }}
            viewOptions={{ ...viewOptions, limitHeight: heightLimits[period] }}
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
      <div className="flex flex-col px-8 xl:px-16">
        <CalendarWithDnd
          actions={actions}
          calendarDays={calendarDays}
          celebrations={celebrations}
          renderDayLabel={(day, label) => (
            <Link
              to="/app/today"
              search={{ date: format(day, "yyyy-MM-dd") }}
              aria-label={`Ver ações de ${format(day, "dd/MM/yyyy")}`}
              className="block rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {label}
            </Link>
          )}
          layoutOptions={{
            showBorder: period === "month",
          }}
          onCreateAction={(day) => {
            setPrimaryAction(
              createActionDraft({ userId: person.user_id, date: day }),
            );
          }}
          viewOptions={{ ...viewOptions, limitHeight: heightLimits[period] }}
        />
      </div>
    </HomeViewWrapper>
  );
}
