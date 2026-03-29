import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
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
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
  return (
    <div className="flex">
      <Button
        className="hidden md:flex"
        variant="ghost"
        onClick={() => {
          setCurrentDay(addDays(currentDay, -days));
        }}
      >
        <ChevronLeftIcon />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <CalendarDaysIcon />
            {showDate && (
              <>
                <span className="hidden capitalize md:block">
                  {format(currentDay, "MMMM/yy", { locale: ptBR })}
                </span>
                <span className="block capitalize md:hidden">
                  {format(currentDay, "MM/yy", { locale: ptBR })}
                </span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-0">
          {mode === "day" ? (
            <Calendar
              captionLayout="dropdown"
              selected={currentDay}
              onSelect={(day) => {
                if (day) {
                  setCurrentDay(day);
                }
              }}
              mode="single"
            />
          ) : (
            <div>
              <div className="flex justify-center gap-2 border-b p-4">
                {eachYearOfInterval({
                  start: subYears(currentDay, 1),
                  end: addYears(currentDay, 1),
                }).map((year) => {
                  return (
                    <button
                      key={year.toISOString()}
                      onClick={() => {
                        setCurrentDay(year);
                      }}
                      className={cn(
                        "hover:bg-secondary h-8 w-full rounded-full leading-none tracking-tighter capitalize",
                        isSameYear(year, currentDay)
                          ? "bg-primary hover:bg-primary/80 font-medium text-white"
                          : "",
                      )}
                    >
                      {format(year, "yyyy", { locale: ptBR })}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-3">
                {eachMonthOfInterval({
                  start: startOfYear(currentDay),
                  end: endOfYear(currentDay),
                }).map((day) => (
                  <button
                    // @ts-ignore
                    key={day.toISOString()}
                    onClick={() => {
                      setCurrentDay(day);
                    }}
                    className="hover:bg-secondary h-12 w-18 text-xl leading-none font-medium tracking-tighter capitalize"
                  >
                    {format(day, "MMM", { locale: ptBR })}
                  </button>
                ))}
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        className="hidden md:flex"
        onClick={() => {
          setCurrentDay(addDays(currentDay, days));
        }}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
