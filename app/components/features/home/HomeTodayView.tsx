import { useAppContext } from "~/contexts/AppContext";
import { getUserPreferences } from "~/lib/preferences";
import { useSelectionContext } from "~/hooks/useMultiSelection";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarToolbar } from "~/components/features/CalendarToolbar";
import type { Action } from "~/types";
import { HomeViewWrapper } from "./HomeViewWrapper";
import {
  TodayBoard,
  TodayViewToggle,
  useTodayActions,
  useTodayTitle,
  type TodayViewMode,
} from "./TodayViewParts";

export function HomeTodayView({
  actions,
  isLoading,
  currentDay: controlledDay,
  onCurrentDayChange,
  linkTitle = false,
}: {
  actions: Action[];
  isLoading?: boolean;
  currentDay?: Date;
  onCurrentDayChange?: (date: Date) => void;
  linkTitle?: boolean;
}) {
  const { person } = useAppContext();
  const [view, setView] = useState<TodayViewMode>(
    () => getUserPreferences(person).defaultTodayView,
  );

  const [uncontrolledDay, setUncontrolledDay] = useState(new Date());
  const currentDay = controlledDay ?? uncontrolledDay;
  const setCurrentDay = onCurrentDayChange ?? setUncontrolledDay;

  const filteredActions = useTodayActions(actions, view, currentDay);

  useSelectionContext(JSON.stringify([currentDay, view]));
  const title = useTodayTitle(currentDay);

  return (
    <HomeViewWrapper
      compactMobile
      title={
        linkTitle ? (
          <Link
            to="/app/today"
            search={{ date: format(currentDay, "yyyy-MM-dd") }}
            className="underline-offset-4 outline-none squircle hover:underline focus-visible:underline"
          >
            {title}
          </Link>
        ) : (
          title
        )
      }
      OptionsComponent={
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
          <CalendarToolbar
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
          />
          <TodayViewToggle view={view} onViewChange={setView} />
        </div>
      }
    >
      <div className="px-3 lg:px-8 xl:px-16">
        <TodayBoard
          view={view}
          actions={filteredActions}
          isLoading={isLoading}
          currentDay={currentDay}
        />
      </div>
    </HomeViewWrapper>
  );
}
