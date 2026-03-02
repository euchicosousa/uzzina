import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMatches, useOutletContext, useParams } from "react-router";
import invariant from "tiny-invariant";
import { CalendarWithDnd } from "~/components/features/CalendarWithDnd";
import { getCleanAction } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";
import { type ViewOptions } from "./ViewOptions";

export function ActionCalendarPartnerPage({
  currentDay = new Date(),
  actions,
  viewOptions,
}: {
  currentDay?: Date;
  actions: Action[];
  viewOptions: ViewOptions;
}) {
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDay)),
    end: endOfWeek(endOfMonth(currentDay)),
  });

  const { person, celebrations } = useMatches()[1].loaderData as AppLoaderData;

  const params = useParams();
  const partnerSlug = params.slug;
  invariant(partnerSlug);

  const { setBaseAction } = useOutletContext<any>();

  return (
    <CalendarWithDnd
      actions={actions}
      calendarDays={calendarDays}
      celebrations={celebrations}
      viewOptions={viewOptions}
      currentDay={currentDay}
      onCreateAction={(day) => {
        setBaseAction({
          ...(getCleanAction(person.user_id, day) as unknown as Action),
          partners: [partnerSlug],
        });
      }}
    />
  );
}
