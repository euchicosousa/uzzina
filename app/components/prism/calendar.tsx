import type * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  RangeCalendar as AriaRangeCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarHeading,
  CalendarMonthPicker,
  CalendarYearPicker,
  type CalendarCellRenderProps,
  type CalendarProps,
  type DateValue,
  type RangeCalendarProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";
import { PrismButton } from "~/components/prism/";
import { buttonVariants } from "~/components/prism/button";
import {
  PrismSelect,
  PrismSelectContent,
  PrismSelectGroup,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
} from "~/components/prism";
const cellVariants = cva(
  "group/day relative mt-2 aspect-square h-full w-full cursor-default rounded-(--cell-radius) text-center select-none [&:is(:last-child>[data-selected=true])>div]:rounded-r-(--cell-radius)",
  {
    variants: {
      showWeekNumber: {
        false:
          "[&:is(:first-child>[data-selected=true])>div]:rounded-l-(--cell-radius)",
        true: "[&:is(:nth-child(2)>[data-selected=true])>div]:rounded-l-(--cell-radius)",
      },
      isToday: {
        true: "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
      },
      isSelectionStart: {
        true: "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
      },
      isSelectionEnd: {
        true: "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
      },
      isUnavailable: {
        true: "text-muted-foreground opacity-50 [&>div]:line-through",
      },
      isDisabled: {
        true: "text-muted-foreground opacity-50",
      },
      isOutsideMonth: {
        true: "text-muted-foreground aria-selected:text-muted-foreground",
      },
    },
  },
);
import { CalendarDate } from "@internationalized/date";

/** Converts a JS Date (local time) → CalendarDate (year/month/day, no TZ). */
function toCalendarDate(date: Date): CalendarDate {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

/** Converts a CalendarDate → JS Date in LOCAL time (no UTC drift). */
function fromCalendarDate(value: DateValue): Date {
  return new Date(value.year, value.month - 1, value.day);
}

/** Extra Prism-specific props shared by both Calendar wrappers. */
type PrismCalendarExtra = {
  buttonVariant?: React.ComponentProps<typeof PrismButton>["variant"];
  captionLayout?: "label" | "dropdown";
  numberOfMonths?: number;
  showWeekNumber?: boolean;
  headerFormat?: Intl.DateTimeFormatOptions;
  isCellDisabled?: (date: CalendarDate) => boolean;
  isDisabled?: boolean;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  renderCell?: (
    renderProps: CalendarCellRenderProps & {
      defaultChildren: React.ReactNode;
    },
  ) => React.ReactNode;
};

/** Single-date selection calendar. Accepts and returns plain JS `Date`. */
type PrismCalendarProps = Omit<
  CalendarProps<CalendarDate>,
  "value" | "defaultValue" | "onChange" | "visibleDuration"
> &
  PrismCalendarExtra & {
    /** Currently selected date (JS `Date`). */
    selected?: Date;
    /** Called when the user picks a date. Receives a JS `Date`. */
    onSelect?: (date: Date | undefined) => void;
  };
function Calendar({ selected, onSelect, ...props }: PrismCalendarProps) {
  const ariaValue = selected ? toCalendarDate(selected) : undefined;
  const handleChange = (v: CalendarDate | null) => {
    onSelect?.(v ? fromCalendarDate(v) : undefined);
  };
  return (
    <AriaCalendar
      {...props}
      className={cn(
        "group/calendar w-fit bg-background [--cell-radius:var(--radius-md)] [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        props.className,
      )}
      data-slot="calendar"
      onChange={handleChange}
      value={ariaValue ?? null}
      visibleDuration={{
        months: props.numberOfMonths || 1,
      }}
    >
      <CalendarInner {...props} />
    </AriaCalendar>
  );
}

/** Date-range selection calendar. Accepts `{ from?, to? }` and returns the same. */
type PrismRangeCalendarProps = Omit<
  RangeCalendarProps<CalendarDate>,
  "value" | "defaultValue" | "onChange" | "visibleDuration"
> &
  PrismCalendarExtra & {
    /** Currently selected range (`from` / `to` are plain JS `Date`). */
    selected?: {
      from?: Date;
      to?: Date;
    };
    /** Called when the user picks a range. */
    onSelect?: (
      range:
        | {
            from: Date;
            to: Date;
          }
        | undefined,
    ) => void;
  };
function RangeCalendar({
  selected,
  onSelect,
  ...props
}: PrismRangeCalendarProps) {
  const ariaValue =
    selected?.from && selected?.to
      ? {
          start: toCalendarDate(selected.from),
          end: toCalendarDate(selected.to),
        }
      : null;
  const handleChange = (
    v: {
      start: CalendarDate;
      end: CalendarDate;
    } | null,
  ) => {
    onSelect?.(
      v
        ? {
            from: fromCalendarDate(v.start),
            to: fromCalendarDate(v.end),
          }
        : undefined,
    );
  };
  return (
    <AriaRangeCalendar
      {...props}
      className={cn(
        "group/calendar w-fit bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        props.className,
      )}
      data-slot="calendar"
      onChange={handleChange}
      value={ariaValue}
      visibleDuration={{
        months: props.numberOfMonths || 1,
      }}
    >
      <CalendarInner {...props} isRange />
    </AriaRangeCalendar>
  );
}
function CalendarInner({
  captionLayout = "label",
  buttonVariant = "ghost",
  numberOfMonths = 1,
  showWeekNumber = false,
  headerFormat,
  renderCell,
  isRange,
}: {
  buttonVariant?: React.ComponentProps<typeof PrismButton>["variant"];
  captionLayout?: "label" | "dropdown";
  numberOfMonths?: number;
  showWeekNumber?: boolean;
  headerFormat?: Intl.DateTimeFormatOptions;
  renderCell?: (
    renderProps: CalendarCellRenderProps & {
      defaultChildren: React.ReactNode;
    },
  ) => React.ReactNode;
  isRange?: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-4 md:flex-row">
      <header className="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1">
        <PrismButton size={"icon-xs"} slot="previous" variant={buttonVariant}>
          <ChevronLeftIcon className="cn-rtl-flip size-4" />
        </PrismButton>
        <PrismButton size={"icon-xs"} slot="next" variant={buttonVariant}>
          <ChevronRightIcon className="cn-rtl-flip size-4" />
        </PrismButton>
      </header>
      {Array.from(
        {
          length: numberOfMonths,
        },
        (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: month-offset is stable within a fixed numberOfMonths
          <div key={i} className="flex w-full flex-col gap-4">
            <div className="flex h-(--cell-size) w-full items-center justify-center gap-1 px-(--cell-size)">
              {captionLayout === "dropdown" ? (
                <>
                  <MonthDropdown format={headerFormat} />
                  <YearDropdown format={headerFormat} />
                </>
              ) : (
                <CalendarHeading
                  className="text-base font-medium select-none tracking-normal"
                  format={headerFormat}
                  offset={{
                    months: i,
                  }}
                />
              )}
            </div>
            <CalendarGrid
              className="w-full border-collapse"
              offset={{
                months: i,
              }}
            >
              <AriaCalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none">
                    {day}
                  </CalendarHeaderCell>
                )}
              </AriaCalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    className={(renderProps) =>
                      cellVariants({
                        ...renderProps,
                        showWeekNumber,
                      })
                    }
                    date={date}
                  >
                    {(renderProps) => (
                      <div
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "icon",
                          }),
                          "relative isolate z-10 flex aspect-square h-full w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
                        )}
                        data-range-end={renderProps.isSelectionEnd && isRange}
                        data-range-middle={
                          renderProps.isSelected &&
                          !renderProps.isSelectionStart &&
                          !renderProps.isSelectionEnd &&
                          isRange
                        }
                        data-range-start={
                          renderProps.isSelectionStart && isRange
                        }
                        data-selected-single={
                          renderProps.isSelected && !isRange
                        }
                      >
                        {renderCell
                          ? renderCell(renderProps)
                          : renderProps.defaultChildren}
                      </div>
                    )}
                  </CalendarCell>
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </div>
        ),
      )}
    </div>
  );
}
function MonthDropdown({ format }: { format?: Intl.DateTimeFormatOptions }) {
  return (
    <CalendarMonthPicker format={format?.month}>
      {(props) => (
        <PrismSelect {...props} className="relative">
          <PrismSelectTrigger>
            <PrismSelectValue />
          </PrismSelectTrigger>
          <PrismSelectContent className="min-w-0">
            <PrismSelectGroup>
              {props.items.map((item) => (
                <PrismSelectItem key={item.id} id={item.id}>
                  {item.formatted}
                </PrismSelectItem>
              ))}
            </PrismSelectGroup>
          </PrismSelectContent>
        </PrismSelect>
      )}
    </CalendarMonthPicker>
  );
}
function YearDropdown({ format }: { format?: Intl.DateTimeFormatOptions }) {
  return (
    <CalendarYearPicker format={format}>
      {(props) => (
        <PrismSelect {...props} className="relative">
          <PrismSelectTrigger>
            <PrismSelectValue />
          </PrismSelectTrigger>
          <PrismSelectContent className="min-w-0">
            {props.items.map((item) => (
              <PrismSelectItem key={item.id} id={item.id}>
                {item.formatted}
              </PrismSelectItem>
            ))}
          </PrismSelectContent>
        </PrismSelect>
      )}
    </CalendarYearPicker>
  );
}
export { Calendar as PrismCalendar, RangeCalendar };
