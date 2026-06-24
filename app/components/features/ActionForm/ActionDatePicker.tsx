import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CalendarDaysIcon } from "lucide-react";
import { useState } from "react";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = selectedDate ? new Date(selectedDate) : new Date();
      newDate.setFullYear(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      setSelectedDate(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedDate) {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours || 0, minutes || 0);
      setSelectedDate(newDate);
    }
  };

  return (
    <Popover
      onOpenChange={(newIsOpen) => {
        setIsOpen(newIsOpen);
        if (newIsOpen) {
          setSelectedDate(date);
        } else if (onSelect && selectedDate) {
          onSelect(selectedDate);
        }
      }}
      open={isOpen}
    >
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 transition-colors outline-none",
            size === "sm"
              ? "h-8 hover:bg-secondary text-xs px-3 cursor-pointer"
              : "cursor-pointer underline-offset-2 hover:underline",
            className,
          )}
          type="button"
        >
          {size === "sm" && (
            <CalendarDaysIcon className="size-3.5 text-muted-foreground shrink-0" />
          )}
          {date
            ? getFormattedDateTime(date, dateTimeDisplay)
            : "Escolha a data"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          className="w-full"
          locale={ptBR}
          mode="single"
          onSelect={handleCalendarSelect}
          selected={selectedDate}
        />
        <div className="flex items-center justify-between gap-4 border-t p-4">
          <div className="text-sm">Defina a hora</div>
          <Input
            className="w-auto appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={handleTimeChange}
            type="time"
            value={selectedDate ? format(selectedDate, "HH:mm") : ""}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
