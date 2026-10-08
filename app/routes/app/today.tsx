import { filterOperationalActions } from "~/utils/partner-visibility";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchHomeActions } from "~/lib/supabase.queries";

import { useAppContext } from "~/contexts/AppContext";
import type { Partner } from "~/types";

export const Route = createFileRoute("/app/today")({
  component: TodayPage,
});

function TodayPage() {
  const { person, partners } = useAppContext();
  const partnerSlugs = partners.map(p => p.slug).sort();
  const [currentDay, setCurrentDay] = useState(new Date());

  const startDateISO = startOfDay(currentDay).toISOString();
  const endDateISO = endOfDay(currentDay).toISOString();
  const todayEndISO = endOfDay(new Date()).toISOString();

  const { data: currentActions = [], isLoading: isLoadingHomeActions } =
    useQuery({
      queryKey: QUERY_KEYS.actions.list("today",person.user_id,person.admin,partnerSlugs,startDateISO,endDateISO),
      queryFn: () =>
        fetchHomeActions(
          person.user_id,
          startDateISO,
          endDateISO,
          todayEndISO,
          partners.map((p: Partner) => p.slug),
        ),
    });

  const { partnerFilters } = useAppContext();

  const filteredActions = useMemo(() => {
    const operational = filterOperationalActions(currentActions,partners);
    if (partnerFilters.length === 0) return operational;
    return operational.filter((action) =>
      action.partners?.some((p) => partnerFilters.includes(p)),
    );
  }, [currentActions, partnerFilters, partners]);

  return (
    <HomeTodayView
      actions={filteredActions}
      currentDay={currentDay}
      isLoading={isLoadingHomeActions}
      onCurrentDayChange={setCurrentDay}
    />
  );
}
