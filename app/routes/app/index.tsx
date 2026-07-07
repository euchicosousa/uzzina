import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";

import { CalendarHomeComponent } from "~/components/features/home/CalendarHomeComponent";
import { LateHomeComponent } from "~/components/features/home/LateHomeComponent";
import { PartnersHomeComponent } from "~/components/features/home/PartnersHomeComponent";
import { SprintHomeComponent } from "~/components/features/home/SprintHomeComponent";
import { TodayHomeComponent } from "~/components/features/home/TodayHomeComponent";

import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchAllLateActions, fetchHomeActions } from "~/lib/supabase.queries";
import { Footer } from "~/components/layout/Footer";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

import { useAppContext } from "~/contexts/AppContext";
import type { Partner } from "~/types";

function AppHome() {
  const { person, partners } = useAppContext();

  const now = new Date();

  const startDateISO = startOfWeek(startOfMonth(now)).toISOString();
  const endDateISO = endOfDay(endOfWeek(endOfMonth(now))).toISOString();
  const todayEndISO = endOfDay(now).toISOString();

  // Busca as ações no client usando TanStack Query
  const { data: currentActions = [], isLoading: isLoadingHomeActions } =
    useQuery({
      queryKey: QUERY_KEYS.actions.home(person.user_id),
      queryFn: () =>
        fetchHomeActions(
          person.user_id,
          startDateISO,
          endDateISO,
          todayEndISO,
          partners.map((p: Partner) => p.slug),
        ),
    });

  // Busca as lateActions no client usando TanStack Query
  const { data: currentLateActions = [] } = useQuery({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p: Partner) => p.slug),
      ),
  });

  const { setBaseAction, partnerFilters } = useAppContext();

  const filteredActions = useMemo(() => {
    if (partnerFilters.length === 0) return currentActions;
    return currentActions.filter((action) =>
      action.partners?.some((p) => partnerFilters.includes(p)),
    );
  }, [currentActions, partnerFilters]);

  const filteredLateActions = useMemo(() => {
    if (partnerFilters.length === 0) return currentLateActions;
    return currentLateActions.filter((action) =>
      action.partners?.some((p) => partnerFilters.includes(p)),
    );
  }, [currentLateActions, partnerFilters]);

  const sprintActions = useMemo(
    () =>
      sortActions(
        filteredActions.filter((action) =>
          action.sprints?.includes(person.user_id),
        ),
        ORDER_BY.phase,
      ),
    [filteredActions, person.user_id],
  );

  return (
    <>
      {sprintActions.length > 0 && (
        <>
          <SprintHomeComponent actions={sprintActions} />
          {/* <div className="-mx-8 h-2 border-b"></div> */}
        </>
      )}

      <TodayHomeComponent
        actions={filteredActions}
        isLoading={isLoadingHomeActions}
      />
      {/* <div className="-mx-8 h-2 border-b"></div> */}
      <CalendarHomeComponent
        actions={filteredActions}
        setBaseAction={setBaseAction}
      />
      <PartnersHomeComponent actions={filteredLateActions} />
      <LateHomeComponent actions={filteredLateActions} />
      <Footer />
    </>
  );
}
