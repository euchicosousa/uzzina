import type { Action, Celebration } from "~/types";
import { useMemo, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { format, isSameDay, isSameMonth } from "date-fns";
import { DATE_TIME_DISPLAY, VARIANT } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import type { UViewOptions } from "~/components/uzzina/UViewOptions";
import { ActionContainer } from "./ActionContainer";
import { getInstagramFeedActions } from "~/utils/validation";
import { LinkIcon, PlusIcon } from "lucide-react";
import {
  PrismBadge,
  PrismButton,
  PrismSkeletonGroup,
} from "~/components/prism";
import { useLoading } from "~/hooks/useLoading";
export type PartnerCelebrationDisplay = {
  linkedIds?: readonly string[];
  status: "unavailable" | "loading";
};

export function CalendarDayCell({
  currentDay,
  day,
  onCreateAction,
  viewOptions,
  actions,
  celebrations,
  partnerCelebrations,
  showBorder,
  renderDayLabel,
}: {
  currentDay?: Date;
  day: Date;
  onCreateAction?: (day: Date) => void;
  viewOptions: UViewOptions;
  actions: Action[];
  celebrations?: Celebration[];
  partnerCelebrations?: PartnerCelebrationDisplay;
  showBorder?: boolean;
  highlightThisWeek?: boolean;
  renderDayLabel?: (day: Date, label: ReactNode) => ReactNode;
}) {
  const today = new Date();
  const { setNodeRef } = useDroppable({
    id: `${format(day, "yyyy-MM-dd")}`,
  });
  const isLoading = useLoading(["actions"]);
  const skeletonCount = useMemo(() => Math.ceil(Math.random() * 3) + 1, []);
  const dayLabel = (
    <span
      className={cn(
        "grid h-8 place-content-center text-lg font-medium",
        isSameDay(day, today)
          ? "w-8 rounded-full bg-foreground text-background"
          : "",
      )}
      suppressHydrationWarning
    >
      {format(day, "d")}
    </span>
  );

  return (
    <div
      key={format(day, "yyyy-MM-dd")}
      ref={setNodeRef}
      className={cn(
        "group/column flex min-h-0 flex-col hover:bg-input",
        showBorder && "border-b",
        viewOptions.limitHeight && "max-h-[min(24rem,60dvh)]",
      )}
      id={`day_${format(day, "yyyy-MM-dd")}`}
    >
      <div className="flex min-h-0 flex-col gap-2 p-1">
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                !isSameMonth(day, currentDay || today) ? "opacity-25" : "",
              )}
              suppressHydrationWarning
            >
              {renderDayLabel ? renderDayLabel(day, dayLabel) : dayLabel}
            </div>
            {actions.length > 0 && (
              <div className="text-xs opacity-30">({actions.length})</div>
            )}
          </div>
          {onCreateAction && (
            <div className="isolate opacity-0 transition duration-300 group-hover/column:opacity-100 focus-within:opacity-100">
              <PrismButton
                aria-label={`Criar ação em ${format(day, "dd/MM/yyyy")}`}
                className="rounded-full"
                onPress={() => {
                  onCreateAction(day);
                }}
                size="icon-xs"
                variant="default"
              >
                <PlusIcon className="size-3.5" />
              </PrismButton>
            </div>
          )}
        </div>
        <div
          aria-label={`Ações de ${format(day, "dd/MM/yyyy")}`}
          className={cn(
            "min-h-0",
            viewOptions.limitHeight && "overflow-y-auto",
          )}
        >
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
                  scrollable={false}
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
                  scrollable={false}
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
              scrollable={false}
              isDraggable
              orderBy={viewOptions.order}
              variant={viewOptions.variant}
            />
          )}
          {celebrations && celebrations.length > 0 && (
            <CelebrationList
              celebrations={celebrations}
              display={partnerCelebrations}
            />
          )}
        </div>
      </div>
    </div>
  );
}
/**
 * Same markup everywhere. Only the partner calendar passes `display`, which
 * highlights the dates linked to the partner with the info badge.
 */
function CelebrationList({
  celebrations,
  display,
}: {
  celebrations: Celebration[];
  display?: PartnerCelebrationDisplay;
}) {
  return (
    <ul className="flex min-w-0 flex-col items-start gap-px py-2">
      {celebrations.map(({ id, title, is_holiday: isHoliday }) => {
        const linked = display?.linkedIds?.includes(id);
        return (
          <li key={id} className="max-w-full leading-none">
            <PrismBadge
              variant={linked ? "info" : "ghost"}
              className={cn(
                "max-w-full whitespace-normal",
                !linked && "opacity-50",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 shrink-0 rounded-full border border-current",
                  isHoliday && "bg-current",
                )}
              />
              <span className="sr-only">
                {isHoliday ? "Feriado. " : "Data comemorativa. "}
              </span>
              <span className="min-w-0 truncate wrap-anywhere">{title}</span>
              {linked && (
                <>
                  <LinkIcon aria-hidden="true" />
                  <span className="sr-only">Vinculada ao parceiro.</span>
                </>
              )}
              {display && linked === undefined && (
                <span className="sr-only">
                  {display.status === "loading"
                    ? "Consultando vínculo."
                    : "Vínculo indisponível."}
                </span>
              )}
            </PrismBadge>
          </li>
        );
      })}
    </ul>
  );
}
