import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
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
import { useMemo } from "react";
import type { Action } from "~/models/actions.server";

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
};

export const runtime = "edge";

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

export default function AppHome() {
  let { actions } = useLoaderData<typeof loader>();
  let { person, lateActions } = useMatches()[1].loaderData as AppLoaderData;
  const currentActions = useOptimisticActions(actions);

  const currentLateActions = useOptimisticActions(lateActions);

  const sprintActions = useMemo(
    () =>
      sortActions(
        currentActions.filter((action) =>
          action.sprints?.includes(person.user_id),
        ),
        ORDER_BY.state,
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
