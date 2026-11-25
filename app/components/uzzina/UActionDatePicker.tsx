import { useState } from "react";
import { CalendarDate, Time } from "@internationalized/date";
import {
  PrismButton,
  PrismCalendar,
  PrismPopover,
  PrismPopoverTrigger,
  PrismTimeField,
  type PrismButtonVariantProps,
} from "~/components/prism";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { CalendarIcon } from "lucide-react";
import { getFormattedDateTime } from "~/utils/date";

export function UActionDatePicker({
  onSelect,
  date,
  dateTimeDisplay = DATE_TIME_DISPLAY.DayDateMonthTime,
  ariaLabel = "Data e hora da ação",
  className,
  size = "sm",
  isLate,
  minimumLeadMinutes = 0,
  variant = "link",
  placeholder = "Escolha a data",
}: {
  onSelect?: (date: Date) => void;
  date?: Date;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  ariaLabel?: string;
  className?: string;
  size?: PrismButtonVariantProps["size"];
  isLate?: boolean;
  minimumLeadMinutes?: number;
  /** Prism button variant. Default: link. */
  variant?: PrismButtonVariantProps["variant"];
  placeholder?: string;
}) {
  const isButtonTrigger = variant !== "link";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const getInitialDate = () => {
    if (minimumLeadMinutes <= 0) return new Date();
    const timestamp = Date.now() + minimumLeadMinutes * 60_000;
    return new Date(Math.ceil(timestamp / 60_000) * 60_000);
  };
  const timeValue =
    selectedDate ?? (minimumLeadMinutes > 0 ? getInitialDate() : undefined);
  const handleCalendarSelect = (newDate: CalendarDate | null) => {
    if (newDate) {
      const current = selectedDate ? new Date(selectedDate) : getInitialDate();
      current.setFullYear(newDate.year, newDate.month - 1, newDate.day);
      setSelectedDate(current);
    }
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedDate(date);
    } else if (
      onSelect &&
      selectedDate &&
      selectedDate.getTime() !== date?.getTime()
    ) {
      onSelect(selectedDate);
    }
  };
  return (
    <PrismPopoverTrigger onOpenChange={handleOpenChange}>
      <PrismButton
        aria-label={ariaLabel}
        className={cn(
          isButtonTrigger && "justify-start font-normal",
          isLate && "text-error-foreground",
          className,
        )}
        size={size}
        variant={variant}
      >
        {isButtonTrigger && <CalendarIcon />}
        {date ? getFormattedDateTime(date, dateTimeDisplay) : placeholder}
      </PrismButton>

      <PrismPopover className="w-auto p-2">
        <PrismCalendar
          cellSize="sm"
          onChange={handleCalendarSelect}
          value={
            selectedDate
              ? new CalendarDate(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() + 1,
                  selectedDate.getDate(),
                )
              : undefined
          }
        />

        <hr className="-mx-2 -my-2" />

        <PrismTimeField
          className="flex items-center justify-between gap-2 pl-2"
          label="Defina a hora"
          onChange={(time) => {
            if (time) {
              const newDate = selectedDate
                ? new Date(selectedDate)
                : getInitialDate();
              newDate.setHours(time.hour, time.minute);
              setSelectedDate(newDate);
            }
          }}
          size="sm"
          value={
            timeValue
              ? new Time(timeValue.getHours(), timeValue.getMinutes())
              : undefined
          }
        />
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
