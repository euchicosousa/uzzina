import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CheckIcon, GripVerticalIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { CalendarGrid } from "~/components/features/Calendar";
import { DROP_TARGET_HIGHLIGHT } from "~/components/features/DnD";
import { PrismButton } from "~/components/prism";
import { MAX_PLANNING_PERIOD_DAYS } from "~/lib/social-planning/slot-calculator";
import type {
  PlanSuggestion,
  PlanSuggestionStatus,
} from "~/lib/social-planning/types";
import { cn } from "~/lib/utils";
import { PLANNING_FORMAT_LABELS } from "./PlanningPreview";

interface PlanningCalendarViewProps {
  suggestions: PlanSuggestion[];
  onEditSuggestion: (suggestion: PlanSuggestion) => void;
  onChangeStatus: (id: string, status: PlanSuggestionStatus) => void;
  onMoveSuggestion: (id: string, date: string) => void;
  startDate?: string;
  endDate?: string;
  isSaving: boolean;
}

export function PlanningCalendarView({
  suggestions,
  onEditSuggestion,
  onChangeStatus,
  onMoveSuggestion,
  startDate,
  endDate,
  isSaving,
}: PlanningCalendarViewProps) {
  const [draggedSuggestion, setDraggedSuggestion] =
    useState<PlanSuggestion | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const { days, suggestionsByDate, unscheduled } = useMemo(() => {
    const today = new Date();
    const start = startDate ? parseISO(startDate) : startOfMonth(today);
    const end = endDate ? parseISO(endDate) : endOfMonth(today);
    const length = differenceInCalendarDays(end, start) + 1;
    const dates = new Set<string>();
    const suggestionsByDate = new Map<string, PlanSuggestion[]>();
    const unscheduled: PlanSuggestion[] = [];

    const addDays = (first: Date, last: Date) => {
      for (const date of eachDayOfInterval({
        start: startOfWeek(first, { weekStartsOn: 0 }),
        end: endOfWeek(last, { weekStartsOn: 0 }),
      })) {
        dates.add(format(date, "yyyy-MM-dd"));
      }
    };
    if (length > 0 && length <= MAX_PLANNING_PERIOD_DAYS) {
      addDays(start, end);
    } else {
      addDays(today, today);
    }

    for (const suggestion of suggestions) {
      const day =
        suggestion.scheduled_date && parseISO(suggestion.scheduled_date);
      if (!day || !isValid(day)) {
        unscheduled.push(suggestion);
        continue;
      }
      const key = format(day, "yyyy-MM-dd");
      const group = suggestionsByDate.get(key) ?? [];
      group.push(suggestion);
      suggestionsByDate.set(key, group);
      if (!dates.has(key)) addDays(day, day);
    }

    return { days: [...dates].sort(), suggestionsByDate, unscheduled };
  }, [startDate, endDate, suggestions]);

  const stopDrag = () => {
    setDraggedSuggestion(null);
    setDragOverDate(null);
  };

  const suggestionItem = (suggestion: PlanSuggestion) => {
    const isApproved = suggestion.status === "approved";
    const isRejected = suggestion.status === "rejected";
    return (
      <li
        className="min-w-0 py-1"
        draggable={!isSaving}
        key={suggestion.id}
        onDragEnd={stopDrag}
        onDragStart={(event) => {
          if (isSaving) {
            event.preventDefault();
            return;
          }
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", suggestion.id);
          setDraggedSuggestion(suggestion);
        }}
      >
        <div className="flex items-start gap-0.5">
          <GripVerticalIcon
            aria-hidden="true"
            className="mt-1.5 size-3 shrink-0 cursor-grab text-secondary-foreground"
          />
          <PrismButton
            className="h-auto min-h-6 min-w-0 shrink justify-start px-0 text-left whitespace-normal"
            isDisabled={isSaving}
            onPress={() => onEditSuggestion(suggestion)}
            size="xs"
            variant="ghost"
          >
            <span className="line-clamp-3 wrap-anywhere">
              {suggestion.title}
            </span>
          </PrismButton>
        </div>
        <p className="text-xs break-words text-secondary-foreground">
          {PLANNING_FORMAT_LABELS[suggestion.format]}
          {suggestion.is_commemorative && (
            <span className="block">
              {suggestion.celebration_title || "Data comemorativa"}
            </span>
          )}
        </p>
        <div className="flex flex-wrap">
          <PrismButton
            aria-label={isApproved ? "Desfazer aprovação" : "Aprovar sugestão"}
            aria-pressed={isApproved}
            className={cn(isApproved && "text-success")}
            isDisabled={isSaving}
            onPress={() =>
              onChangeStatus(suggestion.id, isApproved ? "pending" : "approved")
            }
            size="icon-xs"
            variant="ghost"
          >
            <CheckIcon />
          </PrismButton>
          <PrismButton
            aria-label={isRejected ? "Desfazer descarte" : "Descartar sugestão"}
            aria-pressed={isRejected}
            className={cn(isRejected && "text-error")}
            isDisabled={isSaving}
            onPress={() =>
              onChangeStatus(suggestion.id, isRejected ? "pending" : "rejected")
            }
            size="icon-xs"
            variant="ghost"
          >
            <XIcon />
          </PrismButton>
        </div>
      </li>
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 px-6 py-4">
      <CalendarGrid compact>
        {days.map((date) => {
          const label = format(parseISO(date), "dd/MM/yyyy");
          return (
            <div
              aria-label={label}
              className={cn(
                "min-h-20 min-w-0 border-b border-border p-2",
                dragOverDate === date && DROP_TARGET_HIGHLIGHT,
              )}
              key={date}
              onDragLeave={(event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setDragOverDate(null);
                }
              }}
              onDragOver={(event) => {
                if (!draggedSuggestion || isSaving) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDragOverDate(date);
              }}
              onDrop={(event) => {
                if (!draggedSuggestion || isSaving) return;
                event.preventDefault();
                if (draggedSuggestion.scheduled_date !== date) {
                  onMoveSuggestion(draggedSuggestion.id, date);
                }
                stopDrag();
              }}
              role="group"
            >
              <time className="text-xs font-medium" dateTime={date}>
                {label.slice(0, 5)}
              </time>
              <ul className="mt-1 divide-y divide-border">
                {suggestionsByDate.get(date)?.map(suggestionItem)}
              </ul>
            </div>
          );
        })}
      </CalendarGrid>

      {unscheduled.length > 0 && (
        <section>
          <h3 className="mb-1 text-sm font-semibold">Sugestões sem data</h3>
          <ul className="divide-y divide-border">
            {unscheduled.map(suggestionItem)}
          </ul>
        </section>
      )}
    </div>
  );
}
