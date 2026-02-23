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
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
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
        variant="ghost"
        onClick={() => {
          setCurrentDay(addDays(currentDay, -days));
        }}
      >
        <IconChevronLeft />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <IconCalendarEvent />
            {showDate && (
              <span className="capitalize">
                {format(currentDay, "MMMM/yy", { locale: ptBR })}
              </span>
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
                    className="hover:bg-secondary h-24 w-24 text-3xl leading-none font-medium tracking-tighter capitalize"
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
        onClick={() => {
          setCurrentDay(addDays(currentDay, days));
        }}
      >
        <IconChevronRight />
      </Button>
    </div>
  );
}
