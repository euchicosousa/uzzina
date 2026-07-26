import type { Action } from "~/types";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { format, isSameDay, isSameMonth, isSameWeek } from "date-fns";
import { DATE_TIME_DISPLAY, VARIANT } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import type { ViewOptions } from "~/components/features/ViewOptions";
import { ActionContainer } from "./ActionContainer";
import { getInstagramFeedActions } from "~/utils/validation";
import { PlusIcon } from "lucide-react";
import { PrismSkeletonGroup } from "~/components/prism";
import { useLoading } from "~/hooks/useLoading";
export function CalendarDay({
  currentDay,
  day,
  onCreateAction,
  viewOptions,
  actions,
  celebrations,
  isCompact,
  showBorder,
  highlightThisWeek,
}: {
  currentDay?: Date;
  day: Date;
  onCreateAction?: (day: Date) => void;
  viewOptions: ViewOptions;
  actions: Action[];
  celebrations?: Celebration[];
  isCompact?: boolean;
  showBorder?: boolean;
  highlightThisWeek?: boolean;
}) {
  const today = new Date();
  const { setNodeRef } = useDroppable({
    id: `${format(day, "yyyy-MM-dd")}`,
  });
  const isLoading = useLoading(["actions"]);
  const skeletonCount = useMemo(() => Math.ceil(Math.random() * 3) + 1, []);

  // Modifica a data no render utilizando um helper ou no browser, mas para o SSR não quebrar o layout,
  // mantemos sem mutar horas baseadas no tempo real do servidor. Mover para uma constante estável ou no efeito.
  // Removido day.setHours(new Date().getHours(), new Date().getMinutes()); pois altera a data em tempo real no render.

  return (
    <div
      key={format(day, "yyyy-MM-dd")}
      ref={setNodeRef}
      className={cn(
        "group/column flex flex-col justify-between hover:bg-foreground/5 duration-500",
        showBorder && "border-b",
        highlightThisWeek && isSameWeek(day, currentDay || today) && "",
        viewOptions.variant === VARIANT.content
          ? ""
          : isCompact
            ? "h-72 overflow-hidden"
            : "h-96 overflow-hidden",
      )}
      id={`day_${format(day, "yyyy-MM-dd")}`}
    >
      <div className="flex h-full shrink flex-col gap-2 overflow-hidden p-1">
        <div className="flex items-center justify-between">
          <div className="gap-2 flex items-center">
            <div
              className={cn(
                !isSameMonth(day, currentDay || today) ? "opacity-25" : "",
              )}
              suppressHydrationWarning
            >
              <div
                className={cn(
                  "grid h-8 place-content-center text-lg font-medium",
                  isSameDay(day, today)
                    ? "w-8 rounded-full bg-foreground text-background"
                    : "",
                )}
                suppressHydrationWarning
              >
                {format(day, "d")}
              </div>
            </div>
            {actions.length > 0 && (
              <div className="text-xs opacity-30">({actions.length})</div>
            )}
          </div>
          {onCreateAction && (
            <div className="isolate transition duration-300 opacity-0 group-hover/column:opacity-100">
              <button
                className="grid size-6 cursor-pointer place-content-center rounded-full bg-primary text-primary-foreground"
                onClick={() => {
                  onCreateAction(day);
                }}
                type="button"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>
          )}
        </div>
        <div className={cn("h-full overflow-hidden")}>
          {isLoading && actions.length === 0 && (
            <PrismSkeletonGroup
              className="gap-1"
              count={skeletonCount}
              delay={400}
              orientation="vertical"
            />
          )}

          {viewOptions.variant === VARIANT.content ? (
            <div className="flex flex-col gap-2">
              {getInstagramFeedActions(actions).length > 0 && (
                <ActionContainer
                  actions={getInstagramFeedActions(actions)}
                  ascending={viewOptions.ascending}
                  dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                  displayFlags={{
                    showCategory: viewOptions.category,
                    showPartner: viewOptions.partner,
                    showResponsibles: viewOptions.responsibles,
                    showLate: viewOptions.late,
                    showPriority: viewOptions.priority,
                  }}
                  isCompact={isCompact}
                  isDraggable
                  orderBy={viewOptions.order}
                  variant={viewOptions.variant}
                />
              )}
              {getInstagramFeedActions(actions, false).length > 0 && (
                <ActionContainer
                  actions={getInstagramFeedActions(actions, false)}
                  ascending={viewOptions.ascending}
                  dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
                  displayFlags={{
                    showCategory: viewOptions.category,
                    showPartner: viewOptions.partner,
                    showResponsibles: viewOptions.responsibles,
                    showLate: viewOptions.late,
                    showPriority: viewOptions.priority,
                  }}
                  isCompact={isCompact}
                  isDraggable
                  orderBy={viewOptions.order}
                  variant={VARIANT.line}
                />
              )}
            </div>
          ) : (
            <ActionContainer
              actions={actions}
              ascending={viewOptions.ascending}
              dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
              displayFlags={{
                showCategory: viewOptions.category,
                showPartner: viewOptions.partner,
                showResponsibles: viewOptions.responsibles,
                showLate: viewOptions.late,
                showPriority: viewOptions.priority,
              }}
              isCompact={isCompact}
              isDraggable
              orderBy={viewOptions.order}
              variant={viewOptions.variant}
            />
          )}
        </div>
      </div>
      {celebrations && celebrations.length > 0 && (
        <CelebrationContainer celebrations={celebrations} />
      )}
    </div>
  );
}
function CelebrationContainer({
  celebrations,
}: {
  celebrations: Celebration[];
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1 px-2 py-4 text-xs">
      {celebrations.map((celebration) => (
        <div key={celebration.id} title={celebration.title}>
          <div className="flex items-center gap-2">
            <div className="size-1 rounded-full bg-primary"></div>
            <div className="truncate opacity-50">{celebration.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
