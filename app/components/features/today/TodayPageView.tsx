import { useAppContext } from "~/contexts/AppContext";
import { getUserPreferences } from "~/lib/preferences";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { useRef, useState } from "react";
import { CalendarToolbar } from "~/components/features/CalendarToolbar";
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
        "relative mx-4 flex min-h-0 flex-col overflow-hidden border-x lg:mx-8",
        isKanban && "pb-(--app-bar-space)",
      )}
    >
      <div className="flex shrink-0 flex-col justify-between gap-1 border-b px-8 pb-3 lg:flex-row lg:items-center lg:gap-8 lg:py-6 xl:px-16">
        {/* Only one variant is displayed (display:none leaves the other out of the accessibility tree). */}
        <h1 className="pt-3 text-2xl font-semibold lg:pt-0 lg:text-3xl xl:text-4xl">
          <span className="md:hidden">{heading.narrow}</span>
          <span className="hidden md:inline">{heading.wide}</span>
        </h1>
        {/* Mobile already identifies the view through the selected control. */}
        <p className="hidden flex-1 text-center text-lg font-medium lg:block">
          {TODAY_VIEW_LABELS[view]}
        </p>
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <CalendarToolbar
            currentDay={currentDay}
            setCurrentDay={onCurrentDayChange}
          />
          <TodayViewToggle view={view} onViewChange={setView} />
        </div>
      </div>
      {isKanban ? (
        <div className="min-h-0 flex-1 px-8 pt-6 xl:px-16">
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
          tabIndex={0}
          className="min-h-0 flex-1 overflow-y-auto px-8 pt-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset xl:px-16"
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
