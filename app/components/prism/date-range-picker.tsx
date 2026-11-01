import { CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button as ButtonPrimitive } from "react-aria-components";
import { cn } from "cnfast";
import {
  PrismPopover,
  PrismPopoverTrigger,
  PrismRangeCalendar,
} from "~/components/prism";
import { parseU } from "~/utils/date";

export interface DateRangeValue {
  start: Date;
  end: Date;
  startDateString: string;
  endDateString: string;
}

export interface PrismDateRangePickerProps {
  id?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  value?: {
    start?: Date | string | null;
    end?: Date | string | null;
  } | null;
  defaultValue?: {
    start?: Date | string | null;
    end?: Date | string | null;
  } | null;
  onChange?: (range: DateRangeValue) => void;
  isDisabled?: boolean;
  numberOfMonths?: number;
  placeholder?: string;
  "aria-label"?: string;
}

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  if (d instanceof Date) return d;
  return parseU(d);
}

function toCalendarDate(date: Date): CalendarDate {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

export function PrismDateRangePicker({
  id,
  className,
  triggerClassName,
  popoverClassName,
  value: controlledValue,
  defaultValue,
  onChange,
  isDisabled = false,
  numberOfMonths = 1,
  placeholder = "Selecione o período",
  "aria-label": ariaLabel = "Selecionar período",
}: PrismDateRangePickerProps) {
  const [internalValue, setInternalValue] = useState<{
    start: Date | null;
    end: Date | null;
  }>(() => ({
    start: toDate(defaultValue?.start),
    end: toDate(defaultValue?.end),
  }));

  const isControlled = controlledValue !== undefined;
  const currentStart = toDate(
    isControlled ? controlledValue?.start : internalValue.start,
  );
  const currentEnd = toDate(
    isControlled ? controlledValue?.end : internalValue.end,
  );

  const calendarRangeValue = useMemo(() => {
    if (!currentStart || !currentEnd) return null;
    return {
      start: toCalendarDate(currentStart),
      end: toCalendarDate(currentEnd),
    };
  }, [currentStart, currentEnd]);

  const formattedDisplayText = useMemo(() => {
    if (!currentStart || !currentEnd) return placeholder;

    const startText = format(currentStart, "dd 'de' MMM", { locale: ptBR });
    const endText = format(currentEnd, "dd 'de' MMM 'de' yyyy", {
      locale: ptBR,
    });
    return `${startText} – ${endText}`;
  }, [currentStart, currentEnd, placeholder]);

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <PrismPopoverTrigger>
        <ButtonPrimitive
          aria-label={ariaLabel}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
          id={id}
          isDisabled={isDisabled}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                "truncate text-sm font-medium",
                !currentStart || !currentEnd
                  ? "text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {formattedDisplayText}
            </span>
          </div>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </ButtonPrimitive>

        <PrismPopover
          className={cn("w-auto p-3", popoverClassName)}
          placement="bottom start"
        >
          <PrismRangeCalendar
            numberOfMonths={numberOfMonths}
            onChange={(range) => {
              if (range?.start && range?.end) {
                const start = new Date(
                  range.start.year,
                  range.start.month - 1,
                  range.start.day,
                );
                const end = new Date(
                  range.end.year,
                  range.end.month - 1,
                  range.end.day,
                );
                const result: DateRangeValue = {
                  start,
                  end,
                  startDateString: format(start, "yyyy-MM-dd"),
                  endDateString: format(end, "yyyy-MM-dd"),
                };

                if (!isControlled) {
                  setInternalValue({ start, end });
                }
                onChange?.(result);
              }
            }}
            value={calendarRangeValue}
          />
        </PrismPopover>
      </PrismPopoverTrigger>
    </div>
  );
}

