import {
  addDays,
  addYears,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfYear,
  format,
  isSameYear,
  startOfYear,
  subYears,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useState } from "react";
import {
  PrismButton,
  PrismCalendar,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { cn } from "~/lib/utils";
export function CalendarButtons({
  currentDay,
  setCurrentDay,
  days = 1,
  showDate,
  mode = "day",
}: {
  currentDay: Date;
  setCurrentDay: (day: Date) => void;
  days?: number;
  showDate?: boolean;
  mode?: "day" | "month";
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <PrismButton
        className="hidden md:flex"
        onClick={() => {
          setCurrentDay(addDays(currentDay, -days));
        }}
        size="icon"
        variant="ghost"
      >
        <ChevronLeftIcon />
      </PrismButton>

      <PrismPopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <PrismButton variant="ghost">
          <CalendarDaysIcon />
          {showDate && (
            <>
              <span className="hidden capitalize md:block">
                {format(currentDay, "MMMM/yy", {
                  locale: ptBR,
                })}
              </span>
              <span className="block capitalize md:hidden">
                {format(currentDay, "MM/yy", {
                  locale: ptBR,
                })}
              </span>
            </>
          )}
        </PrismButton>
        <PrismPopover className="w-fit" placement="bottom">
          <PrismCalendar
            onSelect={(day) => {
              if (day) {
                setCurrentDay(day);
                setIsOpen(false);
              }
            }}
            selected={currentDay}
          />
        </PrismPopover>
      </PrismPopoverTrigger>

      <PrismButton
        className="hidden md:flex"
        onClick={() => {
          setCurrentDay(addDays(currentDay, days));
        }}
        size="icon"
        variant="ghost"
      >
        <ChevronRightIcon />
      </PrismButton>
    </div>
  );
}
