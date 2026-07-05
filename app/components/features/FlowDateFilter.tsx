import { useState } from "react";
import { format, endOfWeek, endOfMonth, isSameDay } from "date-fns";
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

export function FlowDateFilter({ dateRange, onChange }: FlowDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>({
    from: dateRange.from,
    to: dateRange.to,
  });

  const now = new Date();
  const defaultToWeek = endOfWeek(now, { weekStartsOn: 0 }); // Sábado
  const defaultToMonth = endOfMonth(now);

  const isCurrentWeekSelected =
    !dateRange.from && isSameDay(dateRange.to, defaultToWeek);

  const isCurrentMonthSelected =
    !dateRange.from && isSameDay(dateRange.to, defaultToMonth);

  const handleQuickSelectWeek = () => {
    onChange({ from: undefined, to: defaultToWeek });
    setTempRange({ from: undefined, to: defaultToWeek });
    setIsOpen(false);
  };

  const handleQuickSelectMonth = () => {
    onChange({ from: undefined, to: defaultToMonth });
    setTempRange({ from: undefined, to: defaultToMonth });
    setIsOpen(false);
  };

  const handleCalendarChange = (range: DateRange | undefined) => {
    if (!range) return;
    setTempRange(range);
    
    // Se o usuário selecionou tanto o "from" quanto o "to", nós salvamos.
    if (range.from && range.to) {
      onChange({ from: range.from, to: range.to });
      setIsOpen(false);
    } else if (range.from && !range.to) {
      // Se selecionou apenas o primeiro dia, deixamos temporário até fechar ou selecionar o segundo.
      onChange({ from: range.from, to: range.from });
    }
  };

  const displayText = () => {
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
