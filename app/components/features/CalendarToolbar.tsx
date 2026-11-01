import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { CalendarDate } from "@internationalized/date";
import { useState } from "react";
import {
  PrismButton,
  PrismCalendar,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
export function CalendarToolbar({
  currentDay,
  setCurrentDay,
  days = 1,
  showDate,
}: {
  currentDay: Date;
  setCurrentDay: (day: Date) => void;
  days?: number;
  showDate?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center gap-1">
      <PrismButton
        aria-label={days === 1 ? "Dia anterior" : `Voltar ${days} dias`}
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
        <PrismButton
          aria-label={`Escolher data, ${format(currentDay, showDate ? "MMMM/yy" : "dd/MM/yyyy", { locale: ptBR })}`}
          variant="ghost"
        >
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
        <PrismPopover
          className="w-auto max-w-[calc(100vw-16px)] p-[8px]"
          placement="bottom"
        >
          <PrismCalendar
            captionLayout="dropdown"
            className="w-[calc(7*var(--cell-size))] max-w-full [--cell-size:clamp(32px,2em,40px)] [&_[data-slot=select-trigger]]:min-h-(--cell-size) [&_[data-slot=select-trigger]]:px-1 [&_[data-slot=select-trigger][data-size]]:h-auto [&_td>div]:aspect-auto [&_td>div>div]:size-(--cell-size) [&>div>div>div]:h-auto [&>div>div>div>div]:min-w-0 [&>div>div>div>div]:flex-1 [&>div>div>div>div]:flex-wrap"
            onChange={(day) => {
              if (day) {
                setCurrentDay(new Date(day.year, day.month - 1, day.day));
                setIsOpen(false);
              }
            }}
            value={
              new CalendarDate(
                currentDay.getFullYear(),
                currentDay.getMonth() + 1,
                currentDay.getDate(),
              )
            }
          />
        </PrismPopover>
      </PrismPopoverTrigger>

      <PrismButton
        aria-label={days === 1 ? "Próximo dia" : `Avançar ${days} dias`}
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
