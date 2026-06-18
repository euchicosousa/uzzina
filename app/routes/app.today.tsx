import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { useMemo } from "react";
import { useMatches, useOutletContext } from "react-router";
import { TodayHomeComponent } from "~/components/features/home/TodayHomeComponent";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchHomeActions } from "~/lib/supabase.queries";
import type { AppLoaderData } from "./app";

export const runtime = "edge";

export default function TodayPage() {
  const { person } = useMatches()[1].loaderData as AppLoaderData;

  const now = new Date();

  const startDateISO = startOfDay(now).toISOString();
  const endDateISO = endOfDay(now).toISOString();
  const todayEndISO = endOfDay(now).toISOString();

  const { data: currentActions = [], isLoading: isLoadingHomeActions } =
    useQuery({
      queryKey: QUERY_KEYS.actions.home(person.user_id),
      queryFn: () =>
        fetchHomeActions(person.user_id, startDateISO, endDateISO, todayEndISO),
    });

  const { partnerFilters } = useOutletContext<OutletContext>();

  const filteredActions = useMemo(() => {
    if (partnerFilters.length === 0) return currentActions;
    return currentActions.filter((action) =>
      action.partners?.some((p) => partnerFilters.includes(p)),
    );
  }, [currentActions, partnerFilters]);

  return (
    <TodayHomeComponent
      actions={filteredActions}
      isLoading={isLoadingHomeActions}
    />
  );
}
