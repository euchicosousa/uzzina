import { useAppContext } from "~/contexts/AppContext";
import { getUserPreferences } from "~/lib/preferences";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { useRef, useState } from "react";
import { UCalendarToolbar } from "~/components/uzzina/UCalendarToolbar";
import {
  TODAY_VIEW_LABELS,
  TodayBoard,
  TodayViewToggle,
  useTodayActions,
  useTodayPageHeading,
  type TodayViewMode,
} from "~/components/features/home/TodayViewParts";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { useSelectionContext } from "~/hooks/useMultiSelection";
import { cn } from "~/lib/utils";
import type { Action } from "~/types";

// Dedicated /app/today page: the header stays fixed and only the content scrolls.
export function TodayPageView({
  actions,
  isLoading,
  currentDay,
  onCurrentDayChange,
}: {
  actions: Action[];
  isLoading?: boolean;
  currentDay: Date;
  onCurrentDayChange: (date: Date) => void;
}) {
  const { person } = useAppContext();
  const [view, setView] = useState<TodayViewMode>(
    () => getUserPreferences(person).defaultTodayView,
  );
  const filteredActions = useTodayActions(actions, view, currentDay);
  useSelectionContext(JSON.stringify([currentDay, view]));
  const heading = useTodayPageHeading(currentDay);

  const pageRef = useRef<HTMLDivElement>(null);
  useFillScrollViewport(pageRef);

  const isKanban = view === "kanban";
  return (
    <div
      ref={pageRef}
      data-today-page
      className={cn(
        "relative mx-2 flex min-h-0 flex-col overflow-hidden border-x lg:mx-8",
        isKanban && "pb-(--app-bar-space)",
      )}
    >
      <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b px-3 py-2 lg:flex-nowrap lg:gap-8 lg:px-8 lg:py-6">
        <h1
          className="min-w-0 flex-1 basis-40 truncate text-2xl font-semibold lg:flex-initial lg:basis-auto lg:text-3xl xl:text-4xl"
          title={heading}
        >
          {heading}
        </h1>
        {/* Mobile already identifies the view through the selected control. */}
        <p className="hidden flex-1 text-center text-lg font-medium lg:block">
          {TODAY_VIEW_LABELS[view]}
        </p>
        <div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-2 self-end lg:self-auto">
          <UCalendarToolbar
            currentDay={currentDay}
            setCurrentDay={onCurrentDayChange}
          />
          <TodayViewToggle view={view} onViewChange={setView} />
        </div>
      </div>
      {isKanban ? (
        <div className="min-h-0 flex-1 px-3 pt-4 lg:px-8 lg:pt-6">
          <TodayBoard
            view={view}
            actions={filteredActions}
            isLoading={isLoading}
            currentDay={currentDay}
            fillHeight
          />
        </div>
      ) : (
        <div
          // A new day or view starts its content from the top.
          key={`${view}-${currentDay.getTime()}`}
          role="region"
          aria-label="Ações do dia"
          tabIndex={-1}
          onFocus={(event) => {
            if (event.target === event.currentTarget)
              event.currentTarget.blur();
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) event.preventDefault();
          }}
          className="min-h-0 flex-1 overflow-y-auto px-3 pt-4 lg:px-8 lg:pt-6"
        >
          <TodayBoard
            view={view}
            actions={filteredActions}
            isLoading={isLoading}
            currentDay={currentDay}
            showFeedTitle={false}
          />
          <AppBarSpacer />
        </div>
      )}
    </div>
  );
}
