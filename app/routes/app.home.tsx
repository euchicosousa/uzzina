import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import {
  data,
  useLoaderData,
  useMatches,
  useOutletContext,
  type LoaderFunctionArgs,
} from "react-router";

import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import { ORDER_BY, STATES } from "~/lib/CONSTANTS";
import { sortActions } from "~/lib/helpers";
import { getHomeActions } from "~/models/actions.server";
import { getUserId } from "~/services/auth.server";
import type { AppLoaderData } from "./app";

import { CalendarHomeComponent } from "~/components/features/home/CalendarHomeComponent";
import { LateHomeComponent } from "~/components/features/home/LateHomeComponent";
import { PartnersHomeComponent } from "~/components/features/home/PartnersHomeComponent";
import { SprintHomeComponent } from "~/components/features/home/SprintHomeComponent";
import { TodayHomeComponent } from "~/components/features/home/TodayHomeComponent";

export type AppHomeLoaderData = {
  actions: Action[];
  actionsChart: Action[];
};

export const runtime = "edge";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  let start = startOfWeek(startOfMonth(new Date()));
  let end = endOfDay(endOfWeek(endOfMonth(addMonths(new Date(), 1))));
  let todayEnd = endOfDay(new Date());

  // @ts-ignore
  const allActions = await getHomeActions(
    supabase,
    user_id,
    start.toISOString(),
    end.toISOString(),
    todayEnd.toISOString(),
  );

  const actions =
    (allActions as Action[])?.filter(
      (action: Action) =>
        action.date >= format(start, "yyyy-MM-dd HH:mm:ss") &&
        action.date <= format(end, "yyyy-MM-dd HH:mm:ss"),
    ) || [];

  const actionsChart =
    (allActions as Action[])?.filter(
      (action: Action) =>
        action.state !== STATES.finished.slug &&
        action.date <= format(todayEnd, "yyyy-MM-dd HH:mm:ss"),
    ) || [];

  return data({ actions, actionsChart } as AppHomeLoaderData, {
    headers: { "Cache-Control": "no-store" },
  });
};

import { useMemo } from "react";
import type { Action } from "~/models/actions.server";

export default function AppHome() {
  let { actions, actionsChart } = useLoaderData<typeof loader>();
  let { person } = useMatches()[1].loaderData as AppLoaderData;
  const currentActions = useOptimisticActions(actions);

  const currentLateActions = useOptimisticActions(actionsChart);

  const sprintActions = useMemo(() => {
    return sortActions(
      currentActions.filter(
        (action) =>
          action.sprints?.length &&
          action.sprints.filter((sprint) => sprint === person.user_id),
      ),
      ORDER_BY.state,
    );
  }, [currentActions]);

  const { setBaseAction } = useOutletContext<OutletContext>();

  return (
    <>
      {sprintActions.length > 0 && (
        <SprintHomeComponent actions={sprintActions} />
      )}
      <TodayHomeComponent actions={currentActions} />
      <CalendarHomeComponent
        actions={currentActions}
        setBaseAction={setBaseAction}
      />
      <PartnersHomeComponent actions={currentLateActions} />
      <LateHomeComponent actions={currentLateActions} />
    </>
  );
}
