import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { useMemo } from "react";
import {
  data,
  useLoaderData,
  useMatches,
  useOutletContext,
} from "react-router";
import type { Action } from "~/models/actions.server";

import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
// [ROLLBACK-HOME-LOADER] imports do servidor removidos:
// import { getHomeActions } from "~/models/actions.server";
// import { getUserId } from "~/services/auth.server";
import type { AppLoaderData } from "./app";

import { CalendarHomeComponent } from "~/components/features/home/CalendarHomeComponent";
import { LateHomeComponent } from "~/components/features/home/LateHomeComponent";
import { PartnersHomeComponent } from "~/components/features/home/PartnersHomeComponent";
import { SprintHomeComponent } from "~/components/features/home/SprintHomeComponent";
import { TodayHomeComponent } from "~/components/features/home/TodayHomeComponent";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchHomeActions, fetchAllLateActions } from "~/lib/supabase.queries";

export type AppHomeLoaderData = {
  startDateISO: string;
  endDateISO: string;
  todayEndISO: string;
};

export const runtime = "edge";

// [ROLLBACK-HOME-LOADER] Loader anterior que realizava getHomeActions no servidor:
/*
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const now = new Date();
  let start = startOfWeek(startOfMonth(now));
  let end = endOfDay(endOfWeek(endOfMonth(addMonths(now, 1))));
  let todayEnd = endOfDay(now);

  // @ts-ignore
  const allActions = await getHomeActions(
    supabase,
    user_id,
    start.toISOString(),
    end.toISOString(),
    todayEnd.toISOString(),
  );

  const actions = (allActions as Action[]) || [];

  return data({ actions } as AppHomeLoaderData, {
    headers: { "Cache-Control": "no-store" },
  });
};
*/

export const loader = async () => {
  const now = new Date();
  const start = startOfWeek(startOfMonth(now));
  const end = endOfDay(endOfWeek(endOfMonth(now)));
  const todayEnd = endOfDay(now);

  return data(
    {
      startDateISO: start.toISOString(),
      endDateISO: end.toISOString(),
      todayEndISO: todayEnd.toISOString(),
    } as AppHomeLoaderData,
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
};

export default function AppHome() {
  const { startDateISO, endDateISO, todayEndISO } =
    useLoaderData<typeof loader>();
  const { person, partners } = useMatches()[1].loaderData as AppLoaderData;

  // Busca as ações no client usando TanStack Query
  const { data: actions = [] } = useQuery({
    queryKey: QUERY_KEYS.actions.home(person.user_id),
    queryFn: () =>
      fetchHomeActions(person.user_id, startDateISO, endDateISO, todayEndISO),
  });

  // Busca as lateActions no client usando TanStack Query
  const { data: lateActions = [] } = useQuery({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p) => p.slug),
      ),
  });

  const currentActions = useOptimisticActions(actions);
  const currentLateActions = useOptimisticActions(lateActions);

  const sprintActions = useMemo(
    () =>
      sortActions(
        currentActions.filter((action) =>
          action.sprints?.includes(person.user_id),
        ),
        ORDER_BY.phase,
      ),
    [currentActions],
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
