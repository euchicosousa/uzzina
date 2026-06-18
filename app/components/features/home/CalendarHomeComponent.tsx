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
import { useMatches } from "react-router";
import { CalendarWithDnd } from "~/components/features/CalendarWithDnd";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { Toggle } from "~/components/ui/toggle";
import { getCleanAction } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchCelebrations } from "~/lib/supabase.queries";

export function CalendarHomeComponent({
  actions,
  setBaseAction,
}: {
  actions: Action[];
  setBaseAction: (action: Action | null) => void;
}) {
  const { person } = useMatches()[1].loaderData as AppLoaderData;

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
    <HomeComponentWrapper
      title={
        period === "week" ? (
          "Essa Semana"
        ) : (
          <span className="capitalize">
            {format(currentDate, "MMMM", { locale: ptBR })}
          </span>
        )
      }
      OptionsComponent={
        <div className="flex items-center gap-8">
          <div className="flex gap-1">
            <Toggle
              pressed={period === "week"}
              onClick={() => setPeriod("week")}
              className="raised"
              key="week-toggle"
            >
              Semana
            </Toggle>
            <Toggle
              pressed={period === "month"}
              onClick={() => setPeriod("month")}
              className="raised"
              key="month-toggle"
            >
              Mês
            </Toggle>
          </div>
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
          />
        </div>
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
          viewOptions={viewOptions}
          isCompact={period === "month"}
          isScroll={period === "week"}
          showBorder={period === "month"}
          onCreateAction={(day) => {
            setBaseAction({
              ...(getCleanAction({
                user_id: person.user_id,
                date: day,
              }) as unknown as Action),
            });
          }}
        />
      </div>
    </HomeComponentWrapper>
  );
}
