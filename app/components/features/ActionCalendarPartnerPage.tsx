import type { Action } from "~/types";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchCelebrations } from "~/lib/supabase.queries";
import { useOutletContext, useParams } from "react-router";
import invariant from "tiny-invariant";
import { CalendarWithDnd } from "~/components/features/CalendarWithDnd";
import { getCleanAction } from "~/lib/helpers";
import type { ViewOptions } from "./ViewOptions";

import { useAppContext } from "~/contexts/AppContext";

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

  const { person, partners } = useAppContext();

  const { data: celebrations = [] } = useQuery({
    queryKey: QUERY_KEYS.celebrations(),
    queryFn: fetchCelebrations,
    staleTime: 30 * 60 * 1000,
  });

  const params = useParams();
  const partnerSlug = params.slug;
  invariant(partnerSlug);

  const { setBaseAction } = useOutletContext<{
    setBaseAction: (action: Action | null) => void;
  }>();

  const responsibles = partners.filter((p) => p.slug === partnerSlug)[0]
    .users_ids;

  return (
    <CalendarWithDnd
      actions={actions}
      calendarDays={calendarDays}
      celebrations={celebrations}
      viewOptions={viewOptions}
      currentDay={currentDay}
      layoutOptions={{
        highlightThisWeek: true,
        showBorder: true,
        hideBorderOnLastRow: true,
      }}
      onCreateAction={(day) => {
        setBaseAction({
          ...(getCleanAction({
            user_id: person.user_id,
            date: day,
            partners: [partnerSlug],
          }) as unknown as Action),
          responsibles,
        });
      }}
    />
  );
}
