import { useDroppable } from "@dnd-kit/core";
import {
  addDays,
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isSameMonth,
  isThisYear,
  isToday,
  startOfWeek,
  startOfYear,
  subYears,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import { DATE_TIME_DISPLAY, VARIANT } from "~/lib/CONSTANTS";
import { isInstagramFeed } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { ViewOptions } from "~/routes/app.partner.slug";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ActionContainer } from "./ActionContainer";

export type CalendarActionsType = {
  date: Date;
  actions?: Action[];
  celebrations?: Celebration[];
};

export const CalendarActions = ({
  currentDay,
  calendar,
  viewOptions,
  onCreateAction,
  isCompact,
  isScroll,
}: {
  currentDay?: Date;
  calendar: CalendarActionsType[];
  viewOptions: ViewOptions;
  onCreateAction?: (day: Date) => void;
  isCompact?: boolean;
  isScroll?: boolean;
}) => {
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full w-full min-w-[1500px] flex-col overflow-hidden">
        <WeekHeader />
        <div className="grid h-full shrink grid-cols-7 overflow-y-auto">
          {calendar.map((day) => (
            <CalendarDay
              currentDay={currentDay}
              day={day.date}
              onCreateAction={onCreateAction}
              viewOptions={viewOptions}
              actions={day.actions || []}
              celebrations={day.celebrations}
              isCompact={isCompact}
              isScroll={isScroll}
              key={format(day.date, "yyyy-MM-dd")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CalendarDay = ({
  currentDay,
  day,
  onCreateAction,
  viewOptions,
  actions,
  celebrations,
  isCompact,
  isScroll,
}: {
  currentDay?: Date;
  day: Date;
  onCreateAction?: (day: Date) => void;
  viewOptions: ViewOptions;
  actions: Action[];
  celebrations?: Celebration[];
  isCompact?: boolean;
  isScroll?: boolean;
}) => {
  const { setNodeRef } = useDroppable({
    id: `${format(day, "yyyy-MM-dd")}`,
  });
  return (
    <div
      ref={setNodeRef}
      id={`day_${format(day, "yyyy-MM-dd")}`}
      key={format(day, "yyyy-MM-dd")}
      className={cn(
        "group/column flex flex-col justify-between border-b p-2",
        isScroll ? "h-96 overflow-hidden" : "",
      )}
    >
      <div className="flex h-full shrink flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              !isSameMonth(day, currentDay || new Date()) ? "opacity-25" : "",
            )}
          >
            <div
              className={cn(
                "grid h-8 place-content-center text-lg font-medium",
                isSameDay(day, new Date())
                  ? "bg-foreground text-background w-8 rounded-full"
                  : "",
              )}
            >
              {format(day, "d")}
            </div>
          </div>
          {onCreateAction && (
            <div className="isolate opacity-0 group-hover/column:opacity-100">
              <button
                className="bg-primary grid size-6 cursor-pointer place-content-center rounded-full text-white"
                onClick={() => {
                  onCreateAction(day);
                }}
              >
                <PlusIcon className="size-4" />
              </button>
            </div>
          )}
        </div>
        <div
          className={cn(
            "h-full overflow-hidden",
            viewOptions.variant === VARIANT.content ? "p-2" : "",
          )}
        >
          <ActionContainer
            actions={actions}
            dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
            showCategory={viewOptions.category}
            showPartner={viewOptions.partner}
            showResponsibles={viewOptions.responsibles}
            showLate={viewOptions.late}
            showPriority={viewOptions.priority}
            showDivider={true}
            showSprint={viewOptions.sprint}
            orderBy={viewOptions.order}
            ascending={viewOptions.ascending}
            isCompact={isCompact}
            isInstagramDate={viewOptions.instagram}
            variant={viewOptions.variant}
            isScroll={isScroll}
            isDraggable
          />
        </div>
      </div>
      {celebrations && celebrations.length > 0 && (
        <CelebrationContainer celebrations={celebrations} />
      )}
    </div>
  );
};

const WeekHeader = () => {
  const week = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });
  return (
    <div className="grid grid-cols-7 border-b">
      {week.slice(0, 7).map((day) => (
        <div key={day.toISOString()} className="p-2 text-center xl:p-3">
          <div
            className={cn(
              "overflow-hidden text-sm leading-none font-medium text-ellipsis whitespace-nowrap capitalize xl:text-lg",
              format(day, "i") === format(new Date(), "i")
                ? "font-bold underline"
                : "",
            )}
          >
            <span className="uppercase sm:hidden">
              {format(day, "eeeeee", { locale: ptBR })}
            </span>
            <span className="hidden sm:block xl:hidden">
              {format(day, "eee", { locale: ptBR })}
            </span>
            <span className="hidden xl:block">
              {format(day, "eeee", { locale: ptBR })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const CalendarButtons = ({
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
}) => {
  return (
    <div className="flex">
      <Button
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
            <CalendarIcon />
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
                        isThisYear(year)
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
        <ChevronRightIcon />
      </Button>
    </div>
  );
};

export const CelebrationContainer = ({
  celebrations,
}: {
  celebrations: Celebration[];
}) => {
  return (
    <div className="flex shrink-0 flex-col gap-1 px-2 py-4 text-xs">
      {celebrations.map((celebration) => (
        <div key={celebration.id}>
          <div className="flex items-center gap-2">
            <div className="bg-primary size-1 rounded-full"></div>
            <div className="line-clamp-1 opacity-50">{celebration.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
