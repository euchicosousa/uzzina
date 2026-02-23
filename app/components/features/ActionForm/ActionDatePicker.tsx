import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useEffect, useState } from "react";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { getFormattedDateTime } from "~/utils/date";

export function ActionDatePicker({
  onSelect,
  date,
}: {
  onSelect?: (date: Date) => void;
  date?: Date;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(newIsOpen) => {
        setIsOpen(newIsOpen);
        if (!newIsOpen && onSelect && selectedDate) {
          onSelect(selectedDate);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button className="cursor-pointer underline-offset-4 hover:underline">
          {date
            ? getFormattedDateTime(date, DATE_TIME_DISPLAY.DayDateMonthTime)
            : "Escolha a data"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          className="w-full"
          mode="single"
          selected={selectedDate}
          locale={ptBR}
          onSelect={(date) => {
            if (date) {
              const newDate = selectedDate
                ? new Date(selectedDate)
                : new Date();
              newDate.setFullYear(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
              );
              setSelectedDate(newDate);
            }
          }}
        />
        <div className="flex items-center justify-between gap-4 border-t p-4">
          <div className="text-sm">Defina a hora</div>
          <Input
            type="time"
            // step={1}

            value={selectedDate ? format(selectedDate, "HH:mm") : ""}
            // value={"13:00"}
            className="w-auto appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            onChange={(e) => {
              if (selectedDate) {
                const [hours, minutes] = e.target.value.split(":").map(Number);
                const newDate = new Date(selectedDate);
                newDate.setHours(hours || 0, minutes || 0);
                setSelectedDate(newDate);
              }
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
