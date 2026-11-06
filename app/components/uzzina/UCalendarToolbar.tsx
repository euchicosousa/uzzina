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
  PrismButtonGroup,
  PrismCalendar,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";

export type UCalendarToolbarVariant =
  "default" | "ghost" | "outline" | "secondary";

export type UCalendarToolbarSize = "xs" | "sm" | "default" | "lg";

export interface UCalendarToolbarProps {
  currentDay: Date;
  setCurrentDay: (day: Date) => void;
  days?: number;
  showDate?: boolean;
  variant?: UCalendarToolbarVariant;
  size?: UCalendarToolbarSize;
  className?: string;
}

const SIDE_BUTTON_SIZES = {
  xs: "icon-xs",
  sm: "icon-sm",
  default: "icon",
  lg: "icon-lg",
} as const;

export function UCalendarToolbar({
  currentDay,
  setCurrentDay,
  days = 1,
  showDate,
  variant = "secondary",
  size = "sm",
  className,
}: UCalendarToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sideButtonSize = SIDE_BUTTON_SIZES[size];

  return (
    <PrismButtonGroup className={className} size={size}>
      <PrismButton
        aria-label={days === 1 ? "Dia anterior" : `Voltar ${days} dias`}
        className="hidden md:flex"
        onClick={() => {
          setCurrentDay(addDays(currentDay, -days));
        }}
        size={sideButtonSize}
        variant={variant}
      >
        <ChevronLeftIcon />
      </PrismButton>

      <PrismPopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <PrismButton
          aria-label={`Escolher data, ${format(currentDay, showDate ? "MMMM/yy" : "dd/MM/yyyy", { locale: ptBR })}`}
          className="max-md:ml-0! max-md:rounded-(--group-radius)!"
          size={showDate ? size : sideButtonSize}
          variant={variant}
        >
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
          <CalendarDaysIcon />
        </PrismButton>
        <PrismPopover className="w-auto p-2" placement="bottom">
          <PrismCalendar
            captionLayout="dropdown"
            className="max-w-full"
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
        size={sideButtonSize}
        variant={variant}
      >
        <ChevronRightIcon />
      </PrismButton>
    </PrismButtonGroup>
  );
}
