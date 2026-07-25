import { CalendarDate } from "@internationalized/date";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import {
  PrismPopover,
  PrismPopoverTrigger,
  PrismRangeCalendar,
} from "~/components/prism";
import { ComboboxTrigger } from "./ComboboxTrigger";
interface FlowDateFilterProps {
  dateRange: {
    from?: Date;
    to: Date;
  };
  onChange: (range: { from?: Date; to: Date }) => void;
}
export function FlowDateFilter({ dateRange, onChange }: FlowDateFilterProps) {
  const [tempRange, setTempRange] = useState<{
    from?: Date;
    to?: Date;
  }>(dateRange);
  const displayText = () => {
    if (!dateRange.from) {
      return `Até ${format(dateRange.to, "dd 'de' MMM", {
        locale: ptBR,
      })}`;
    }
    if (isSameDay(dateRange.from, dateRange.to)) {
      return format(dateRange.from, "dd 'de' MMM", {
        locale: ptBR,
      });
    }
    return `${format(dateRange.from, "dd MMM", {
      locale: ptBR,
    })} - ${format(dateRange.to, "dd MMM", {
      locale: ptBR,
    })}`;
  };
  return (
    <PrismPopoverTrigger>
      <ComboboxTrigger className="overflow-hidden" variant="filter">
        <CalendarIcon className="size-5" />
        <span className="truncate">{displayText()}</span>
      </ComboboxTrigger>

      <PrismPopover className="w-auto" placement="bottom end">
        <PrismRangeCalendar
          numberOfMonths={1}
          onChange={(range) => {
            if (range) {
              const newRange = {
                from: new Date(
                  range.start.year,
                  range.start.month - 1,
                  range.start.day,
                ),
                to: new Date(
                  range.end.year,
                  range.end.month - 1,
                  range.end.day,
                ),
              };
              setTempRange(newRange);
              onChange(newRange);
            }
          }}
          value={
            tempRange.from && tempRange.to
              ? {
                  start: new CalendarDate(
                    tempRange.from.getFullYear(),
                    tempRange.from.getMonth() + 1,
                    tempRange.from.getDate(),
                  ),
                  end: new CalendarDate(
                    tempRange.to.getFullYear(),
                    tempRange.to.getMonth() + 1,
                    tempRange.to.getDate(),
                  ),
                }
              : null
          }
        />
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
