import { useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useMatches } from "react-router";
import { CalendarActions } from "~/components/features/Calendar";
import {
  ViewOptionsComponent,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import { Toggle } from "~/components/ui/toggle";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { getCleanAction } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export function CalendarHomeComponent({
  actions,
  setBaseAction,
}: {
  actions: Action[];
  setBaseAction: (action: Action | null) => void;
}) {
  const { celebrations } = useMatches()[1].loaderData as AppLoaderData;

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
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    ascending: true,
    category: true,
    late: true,
    partner: true,
    order: ORDER_BY.date,
    showOptions: {
      ascending: true,
      order: true,
      finishedOnEnd: true,
    },
  });

  const { person } = useMatches()[1].loaderData as AppLoaderData;

  let calendar = calendarDays.map((day) => {
    return {
      date: day,
      actions: actions.filter((action) => isSameDay(action.date, day)),
      celebrations: celebrations.filter((celebration) =>
        isSameDay(parseISO(celebration.date), day),
      ),
    };
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
            >
              Semana
            </Toggle>
            <Toggle
              pressed={period === "month"}
              onClick={() => setPeriod("month")}
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
          period === "week" ? "h-[50vh]" : "",
        )}
      >
        <CalendarActions
          calendar={calendar}
          viewOptions={viewOptions}
          isCompact={period === "month"}
          isScroll={period === "week"}
          onCreateAction={(day) => {
            setBaseAction({
              ...(getCleanAction(person.user_id, day) as unknown as Action),
            });
          }}
        />
      </div>
    </HomeComponentWrapper>
  );
}
