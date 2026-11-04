import { CalendarDaysIcon } from "lucide-react";
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

export interface UActionDatePickerProps {
  onSelect?: (date: Date) => void;
  date?: Date;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  className?: string;
  size?: "sm" | "default" | "lg";
  isLate?: boolean;
}

export function UActionDatePicker({
  onSelect,
  date,
  dateTimeDisplay = DATE_TIME_DISPLAY.DayDateMonthTime,
  className,
  size = "sm",
  isLate,
}: UActionDatePickerProps) {
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
        <CalendarDaysIcon />
        <span>
          {date ? getFormattedDateTime(date, dateTimeDisplay) : "Definir data"}
        </span>
      </PrismButton>
      <PrismPopover className="w-auto p-2" placement="bottom">
        <PrismCalendar
          captionLayout="dropdown"
          className="max-w-full"
          onChange={handleCalendarSelect}
          value={
            selectedDate
              ? new CalendarDate(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth() + 1,
                  selectedDate.getDate(),
                )
              : null
          }
        />
        <div className="flex w-full justify-center">
          <PrismTimeField
            aria-label="Horário da ação"
            className="w-full justify-between"
            granularity="minute"
            hourCycle={24}
            onChange={(time: Time | null) => {
              if (time) {
                const current = selectedDate
                  ? new Date(selectedDate)
                  : new Date();
                current.setHours(time.hour, time.minute, 0, 0);
                setSelectedDate(current);
              }
            }}
            value={
              selectedDate
                ? new Time(selectedDate.getHours(), selectedDate.getMinutes())
                : new Time(12, 0)
            }
          />
        </div>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
