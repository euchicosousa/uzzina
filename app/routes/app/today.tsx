import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfDay, format, isSameDay, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchHomeActions } from "~/lib/supabase.queries";
import { parseU } from "~/utils/date";

import { useAppContext } from "~/contexts/AppContext";
import type { Action, Partner } from "~/types";

export const Route = createFileRoute("/app/today")({
  component: TodayPage,
});

function TodayPage() {
  const { person, partners } = useAppContext();
  const queryClient = useQueryClient();
  const [currentDay, setCurrentDay] = useState(new Date());

  const dateKey = format(currentDay, "yyyy-MM-dd");
  const startDateISO = startOfDay(currentDay).toISOString();
  const endDateISO = endOfDay(currentDay).toISOString();
  const todayEndISO = endOfDay(new Date()).toISOString();

  const { data: currentActions = [], isLoading: isLoadingHomeActions } =
    useQuery({
      queryKey: QUERY_KEYS.actions.today(person.user_id, dateKey),
      queryFn: () =>
        fetchHomeActions(
          person.user_id,
          startDateISO,
          endDateISO,
          todayEndISO,
          partners.map((p: Partner) => p.slug),
        ),
      initialData: () => {
        // Aproveita o cache mensal da Home se já estiver carregado
        const cachedHomeActions = queryClient.getQueryData<Action[]>(
          QUERY_KEYS.actions.home(person.user_id),
        );
        if (cachedHomeActions) {
          return cachedHomeActions.filter((action) =>
            isSameDay(parseU(action.date), currentDay),
          );
        }
        return undefined;
      },
    });

  const { partnerFilters } = useAppContext();

  const filteredActions = useMemo(() => {
    if (partnerFilters.length === 0) return currentActions;
    return currentActions.filter((action) =>
      action.partners?.some((p) => partnerFilters.includes(p)),
    );
  }, [currentActions, partnerFilters]);

  return (
    <HomeTodayView
      actions={filteredActions}
      currentDay={currentDay}
      isLoading={isLoadingHomeActions}
      onCurrentDayChange={setCurrentDay}
    />
  );
}
