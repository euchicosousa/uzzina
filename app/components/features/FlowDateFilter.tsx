import { useState, useEffect, useRef, useMemo } from "react";
import { format, endOfWeek, endOfMonth, isSameDay, startOfWeek, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import type { DateRange } from "react-day-picker";

interface FlowDateFilterProps {
  dateRange: { from?: Date; to: Date };
  onChange: (range: { from?: Date; to: Date }) => void;
}

function getWeekRange(now: Date) {
  return {
    from: startOfWeek(now, { weekStartsOn: 0 }),
    to: endOfWeek(now, { weekStartsOn: 0 }),
  };
}

function getMonthRange(now: Date) {
  return {
    from: startOfWeek(startOfMonth(now), { weekStartsOn: 0 }),
    to: endOfWeek(endOfMonth(now), { weekStartsOn: 0 }),
  };
}

export function FlowDateFilter({ dateRange, onChange }: FlowDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const nowRef = useRef(new Date());
  const now = nowRef.current;

  const defaultRange = getWeekRange(now);

  const [tempRange, setTempRange] = useState<DateRange>({
    from: dateRange.from || defaultRange.from,
    to: dateRange.to || defaultRange.to,
  });

  useEffect(() => {
    if (isOpen) {
      const week = getWeekRange(now);
      setTempRange({
        from: dateRange.from || week.from,
        to: dateRange.to || week.to,
      });
    }
  }, [isOpen, dateRange, now]);

  const isTodaySelected = useMemo(() => {
    return (
      dateRange.from &&
      isSameDay(dateRange.from, now) &&
      isSameDay(dateRange.to, now)
    );
  }, [dateRange, now]);

  const isCurrentWeekSelected = useMemo(() => {
    const week = getWeekRange(now);
    return (
      dateRange.from &&
      isSameDay(dateRange.from, week.from) &&
      isSameDay(dateRange.to, week.to)
    );
  }, [dateRange, now]);

  const isCurrentMonthSelected = useMemo(() => {
    const month = getMonthRange(now);
    return (
      dateRange.from &&
      isSameDay(dateRange.from, month.from) &&
      isSameDay(dateRange.to, month.to)
    );
  }, [dateRange, now]);

  const handleQuickSelectToday = () => {
    const todayRange = { from: now, to: now };
    onChange(todayRange);
    setTempRange(todayRange);
    setIsOpen(false);
  };

  const handleQuickSelectWeek = () => {
    const week = getWeekRange(now);
    onChange(week);
    setTempRange(week);
    setIsOpen(false);
  };

  const handleQuickSelectMonth = () => {
    const month = getMonthRange(now);
    onChange(month);
    setTempRange(month);
    setIsOpen(false);
  };

  const handleCalendarChange = (range: DateRange | undefined) => {
    if (!range) return;
    setTempRange(range);
  };

  const handleConfirm = () => {
    if (tempRange.from) {
      onChange({
        from: tempRange.from,
        to: tempRange.to || tempRange.from,
      });
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const displayText = () => {
    if (isTodaySelected) return "Hoje";
    if (isCurrentWeekSelected) return "Esta semana";
    if (isCurrentMonthSelected) return "Esse mês";
    
    if (dateRange.from) {
      if (isSameDay(dateRange.from, dateRange.to)) {
        return format(dateRange.from, "dd 'de' MMM", { locale: ptBR });
      }
      return `${format(dateRange.from, "dd MMM", { locale: ptBR })} - ${format(
        dateRange.to,
        "dd MMM",
        { locale: ptBR }
      )}`;
    }
    return `Até ${format(dateRange.to, "dd 'de' MMM", { locale: ptBR })}`;
  };

  const getPreviewText = () => {
    if (!tempRange.from) return "Nenhuma data selecionada";
    if (!tempRange.to || isSameDay(tempRange.from, tempRange.to)) {
      return format(tempRange.from, "dd/MM/yyyy");
    }
    return `${format(tempRange.from, "dd/MM/yyyy")} a ${format(tempRange.to, "dd/MM/yyyy")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex h-9 items-center gap-2 rounded-xl px-3 border border-border bg-card/20 hover:bg-card transition-colors squircle text-sm"
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span>{displayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 bg-popover/40 backdrop-blur-xl border border-border rounded-2xl shadow-xl" align="end">
        <div className="flex flex-col gap-3">
          {/* Quick select buttons */}
          <div className="flex gap-2">
            <Button
              variant={isTodaySelected ? "secondary" : "ghost"}
              className="flex-1 rounded-lg text-xs h-8"
              onClick={handleQuickSelectToday}
            >
              Hoje
            </Button>
            <Button
              variant={isCurrentWeekSelected ? "secondary" : "ghost"}
              className="flex-1 rounded-lg text-xs h-8"
              onClick={handleQuickSelectWeek}
            >
              Esta Semana
            </Button>
            <Button
              variant={isCurrentMonthSelected ? "secondary" : "ghost"}
              className="flex-1 rounded-lg text-xs h-8"
              onClick={handleQuickSelectMonth}
            >
              Esse Mês
            </Button>
          </div>
          
          <div className="border-t border-border/60 my-1" />

          {/* Calendar Picker */}
          <Calendar
            mode="range"
            selected={tempRange}
            onSelect={handleCalendarChange}
            numberOfMonths={1}
            disabled={(date) => date < new Date(2020, 0, 1)}
          />

          <div className="border-t border-border/60 my-1 flex flex-col gap-2 pt-2">
            <div className="text-xs text-center font-medium text-foreground/80">
              {getPreviewText()}
            </div>
            <Button
              size="sm"
              className="w-full rounded-xl text-xs h-8"
              disabled={!tempRange.from}
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
