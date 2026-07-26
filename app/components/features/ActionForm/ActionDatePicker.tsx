import { CalendarDaysIcon } from "lucide-react";
import { useState } from "react";
import { Pressable } from "react-aria-components";
import { CalendarDate, Time } from "@internationalized/date";
import {
  PrismCalendar,
  PrismLabel,
  PrismPopover,
  PrismPopoverTrigger,
  PrismSeparator,
  PrismTimeField,
} from "~/components/prism";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { getFormattedDateTime } from "~/utils/date";
export function ActionDatePicker({
  onSelect,
  date,
  dateTimeDisplay = DATE_TIME_DISPLAY.DayDateMonthTime,
  className,
  size = "lg",
}: {
  onSelect?: (date: Date) => void;
  date?: Date;
  dateTimeDisplay?: (typeof DATE_TIME_DISPLAY)[keyof typeof DATE_TIME_DISPLAY];
  className?: string;
  size?: "sm" | "lg";
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
    } else if (onSelect && selectedDate) {
      onSelect(selectedDate);
    }
  };
  return (
    <PrismPopoverTrigger onOpenChange={handleOpenChange}>
      <Pressable>
        <div
          className={cn(
            "underline-offset-2 hover:underline cursor-pointer",
            className,
          )}
          role="button"
        >
          {size === "sm" && (
            <CalendarDaysIcon className="size-3.5 text-muted-foreground shrink-0" />
          )}
          {date
            ? getFormattedDateTime(date, dateTimeDisplay)
            : "Escolha a data"}
        </div>
      </Pressable>

      <PrismPopover className="w-auto">
        <PrismCalendar
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
        <hr className="-mx-4" />
        <div className="flex justify-between items-center gap-2">
          <PrismLabel>Defina a hora</PrismLabel>
          <PrismTimeField
            aria-label="Defina a hora"
            onChange={(time) => {
              if (selectedDate && time) {
                const newDate = new Date(selectedDate);
                newDate.setHours(time.hour, time.minute);
                setSelectedDate(newDate);
              }
            }}
            value={
              selectedDate
                ? new Time(selectedDate.getHours(), selectedDate.getMinutes())
                : undefined
            }
          />
        </div>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
