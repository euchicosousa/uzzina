import { useState } from "react";
import { CalendarDate, Time } from "@internationalized/date";
import {
  PrismButton,
  PrismCalendar,
  PrismPopover,
  PrismPopoverTrigger,
  PrismTimeField,
} from "~/components/prism";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { getFormattedDateTime } from "~/utils/date";

export function UActionDatePicker({
  onSelect,
  date,
  dateTimeDisplay = DATE_TIME_DISPLAY.DayDateMonthTime,
  className,
  size = "sm",
  isLate,
}: {
  onSelect?: (date: Date) => void;
  date?: Date;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  className?: string;
  size?: "sm" | "default" | "lg";
  isLate?: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const handleCalendarSelect = (newDate: CalendarDate | null) => {
    if (newDate) {
      const current = selectedDate ? new Date(selectedDate) : new Date();
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
        aria-label="Data e hora da ação"
        className={cn(isLate && "text-destructive", className)}
        size={size}
        variant="link"
      >
        {date ? getFormattedDateTime(date, dateTimeDisplay) : "Escolha a data"}
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
            if (selectedDate && time) {
              const newDate = new Date(selectedDate);
              newDate.setHours(time.hour, time.minute);
              setSelectedDate(newDate);
            }
          }}
          size="sm"
          value={
            selectedDate
              ? new Time(selectedDate.getHours(), selectedDate.getMinutes())
              : undefined
          }
        />
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
