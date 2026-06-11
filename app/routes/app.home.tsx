import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { useMemo } from "react";
import { useMatches, useOutletContext } from "react-router";

import { useOptimisticQuery } from "~/hooks/useOptimisticQuery";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
import type { AppLoaderData } from "./app";

import { CalendarHomeComponent } from "~/components/features/home/CalendarHomeComponent";
import { LateHomeComponent } from "~/components/features/home/LateHomeComponent";
import { PartnersHomeComponent } from "~/components/features/home/PartnersHomeComponent";
import { SprintHomeComponent } from "~/components/features/home/SprintHomeComponent";
import { TodayHomeComponent } from "~/components/features/home/TodayHomeComponent";

import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchAllLateActions, fetchHomeActions } from "~/lib/supabase.queries";

export const runtime = "edge";

export default function AppHome() {
  const { person, partners } = useMatches()[1].loaderData as AppLoaderData;

  const now = new Date();

  const startDateISO = startOfWeek(startOfMonth(now)).toISOString();
  const endDateISO = endOfDay(endOfWeek(endOfMonth(now))).toISOString();
  const todayEndISO = endOfDay(now).toISOString();

  // Busca as ações no client usando TanStack Query
  const { data: currentActions = [] } = useOptimisticQuery({
    queryKey: QUERY_KEYS.actions.home(person.user_id),
    queryFn: () =>
      fetchHomeActions(person.user_id, startDateISO, endDateISO, todayEndISO),
  });

  // Busca as lateActions no client usando TanStack Query
  const { data: currentLateActions = [] } = useOptimisticQuery({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p) => p.slug),
      ),
  });

  const sprintActions = useMemo(
    () =>
      sortActions(
        currentActions.filter((action) =>
          action.sprints?.includes(person.user_id),
        ),
        ORDER_BY.phase,
      ),
    [currentActions, person.user_id],
  );

  const { setBaseAction } = useOutletContext<OutletContext>();

  return (
    // <div className="mx-8 flex flex-col gap-6 border-r border-l">
    <>
      {sprintActions.length > 0 && (
        <>
          <SprintHomeComponent actions={sprintActions} />
          {/* <div className="-mx-8 h-2 border-b"></div> */}
        </>
      )}
      <TodayHomeComponent actions={currentActions} />
      {/* <div className="-mx-8 h-2 border-b"></div> */}
      <CalendarHomeComponent
        actions={currentActions}
        setBaseAction={setBaseAction}
      />
      <PartnersHomeComponent actions={currentLateActions} />
      <LateHomeComponent actions={currentLateActions} />
    </>
    // </div>
  );
}
