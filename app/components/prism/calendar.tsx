import { cva } from "class-variance-authority";
import { cn } from "cnfast";
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
import {
  PrismButton,
  PrismSelect,
  PrismSelectContent,
  PrismSelectGroup,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
} from "~/components/prism";
import { buttonVariants } from "./button";

export type CalendarCellSize = "sm" | "default" | "lg";

// Cell sizes follow the button scale (minus xs): sm = h-8, default = h-10,
// lg = h-12, with the matching control radius (2xl, 2xl, 3xl).
// Width model: the grid is a fixed-layout table whose header cells declare
// --cell-size as the column width. The table width is 7 x --cell-size with
// min-width 100% (a percentage `width` would inflate the intrinsic width of
// w-fit calendars to the whole available space). When the calendar is
// stretched (w-full), the extra width is split equally across the 7 columns
// and each day fills its column (height stays --cell-size), so range
// selections remain continuous. Never put percentage widths on th/td: in an
// auto-layout table a 100% column swallows all extra width.
const cellSizeConfig = {
  sm: {
    container: "[--cell-radius:var(--radius-2xl)] [--cell-size:32px]",
    cell: "",
    headerCell: "",
    heading: "text-base",
    icon: "size-4",
  },
  default: {
    container: "[--cell-radius:var(--radius-2xl)] [--cell-size:40px]",
    cell: "",
    headerCell: "",
    heading: "text-base",
    icon: "size-5",
  },
  lg: {
    container: "[--cell-radius:var(--radius-3xl)] [--cell-size:48px] text-base",
    cell: "text-base [&>span]:text-sm",
    headerCell: "text-sm",
    heading: "text-lg",
    icon: "size-6",
  },
} as const;

// Shared text sizing: text-sm everywhere, overridden only by lg (text-base).
const baseCellClassName =
  "h-(--cell-size) w-full text-sm squircle rounded-(--cell-radius) [&>span]:text-xs";
const baseHeaderCellClassName = "h-(--cell-size) w-(--cell-size) text-xs";

const cellVariants = cva(
  "group/day relative mt-2 h-(--cell-size) w-full cursor-default squircle [&>div]:squircle rounded-(--cell-radius) p-0 text-center select-none [&:is(:last-child>[data-selected=true])>div]:rounded-r-(--cell-radius)",
  {
    variants: {
      showWeekNumber: {
        false:
          "[&:is(:first-child>[data-selected=true])>div]:rounded-l-(--cell-radius)",
        true: "[&:is(:nth-child(2)>[data-selected=true])>div]:rounded-l-(--cell-radius)",
      },
      isSelectionStart: {
        true: "relative isolate z-0 squircle rounded-l-(--cell-radius) bg-secondary after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-secondary",
      },
      isSelectionEnd: {
        true: "relative isolate z-0 squircle rounded-r-(--cell-radius) bg-secondary after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-secondary",
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

export interface PrismCalendarProps<
  T extends DateValue,
  M extends "single" | "multiple" = "single",
> extends Omit<CalendarProps<T, M>, "visibleDuration"> {
  buttonVariant?: React.ComponentProps<typeof PrismButton>["variant"];
  captionLayout?: "label" | "dropdown";
  cellSize?: CalendarCellSize;
  numberOfMonths?: number;
  showWeekNumber?: boolean;
  headerFormat?: Intl.DateTimeFormatOptions;
  renderCell?: (
    renderProps: CalendarCellRenderProps & {
      defaultChildren: React.ReactNode;
    },
  ) => React.ReactNode;
}

function Calendar<
  T extends DateValue,
  M extends "single" | "multiple" = "single",
>(props: PrismCalendarProps<T, M>) {
  const { cellSize = "default", ...restProps } = props;
  const resolvedCellSize = cellSize;

  return (
    <AriaCalendar
      {...restProps}
      className={cn(
        "group/calendar w-fit bg-background text-sm in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        cellSizeConfig[resolvedCellSize].container,
        props.className,
      )}
      data-cell-size={resolvedCellSize}
      data-slot="calendar"
      visibleDuration={{
        months: props.numberOfMonths || 1,
      }}
    >
      <CalendarInner {...restProps} cellSize={resolvedCellSize} />
    </AriaCalendar>
  );
}

export interface PrismRangeCalendarProps<
  T extends DateValue,
> extends RangeCalendarProps<T> {
  buttonVariant?: React.ComponentProps<typeof PrismButton>["variant"];
  captionLayout?: "label" | "dropdown";
  cellSize?: CalendarCellSize;
  headerFormat?: Intl.DateTimeFormatOptions;
  numberOfMonths?: number;
  showWeekNumber?: boolean;
  renderCell?: (
    renderProps: CalendarCellRenderProps & {
      defaultChildren: React.ReactNode;
    },
  ) => React.ReactNode;
}

function RangeCalendar<T extends DateValue>(props: PrismRangeCalendarProps<T>) {
  const { cellSize = "default", ...restProps } = props;
  const resolvedCellSize = cellSize;

  return (
    <AriaRangeCalendar
      {...restProps}
      className={cn(
        "group/calendar w-fit bg-background text-sm in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        cellSizeConfig[resolvedCellSize].container,
        props.className,
      )}
      data-cell-size={resolvedCellSize}
      data-slot="calendar"
      visibleDuration={{
        months: props.numberOfMonths || 1,
      }}
    >
      <CalendarInner {...restProps} cellSize={resolvedCellSize} isRange />
    </AriaRangeCalendar>
  );
}

function CalendarInner({
  captionLayout = "label",
  buttonVariant = "ghost",
  cellSize = "default",
  numberOfMonths = 1,
  showWeekNumber = false,
  headerFormat,
  renderCell,
  isRange,
}: {
  buttonVariant?: React.ComponentProps<typeof PrismButton>["variant"];
  captionLayout?: "label" | "dropdown";
  cellSize?: "sm" | "default" | "lg";
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
    <div className="flex flex-col gap-4 md:flex-row">
      {Array.from(
        {
          length: numberOfMonths,
        },
        (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: O número de meses renderizados é um range sequencial estático
          <div key={`month-offset-${i}`} className="flex w-full flex-col gap-4">
            {/* Previous/next live in the caption row so DOM (and Tab) order
                matches the visual order: previous, month, year, next. */}
            <div className="flex min-h-(--cell-size) w-full items-center justify-between gap-1">
              {i === 0 ? (
                <PrismButton
                  className="size-(--cell-size) rounded-(--cell-radius) p-0 select-none squircle aria-disabled:opacity-50"
                  slot="previous"
                  variant={buttonVariant}
                >
                  <ChevronLeftIcon
                    className={cn("cn-rtl-flip", cellSizeConfig[cellSize].icon)}
                  />
                </PrismButton>
              ) : (
                <span aria-hidden className="size-(--cell-size)" />
              )}
              <div
                className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1"
                data-slot="calendar-caption"
              >
                {captionLayout === "dropdown" ? (
                  <>
                    <MonthDropdown cellSize={cellSize} format={headerFormat} />
                    <YearDropdown cellSize={cellSize} format={headerFormat} />
                  </>
                ) : (
                  <CalendarHeading
                    className={cn(
                      "font-medium select-none",
                      cellSizeConfig[cellSize].heading,
                    )}
                    format={headerFormat}
                    offset={{
                      months: i,
                    }}
                  />
                )}
              </div>
              {i === numberOfMonths - 1 ? (
                <PrismButton
                  className="size-(--cell-size) rounded-(--cell-radius) p-0 select-none squircle aria-disabled:opacity-50"
                  slot="next"
                  variant={buttonVariant}
                >
                  <ChevronRightIcon
                    className={cn("cn-rtl-flip", cellSizeConfig[cellSize].icon)}
                  />
                </PrismButton>
              ) : (
                <span aria-hidden className="size-(--cell-size)" />
              )}
            </div>
            <CalendarGrid
              className="w-[calc(7*var(--cell-size))] min-w-full table-fixed border-collapse"
              offset={{
                months: i,
              }}
            >
              <AriaCalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell
                    className={cn(
                      "rounded-(--cell-radius) p-0 text-center align-middle font-normal text-muted-foreground select-none squircle",
                      baseHeaderCellClassName,
                      cellSizeConfig[cellSize].headerCell,
                    )}
                  >
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
                        isSelectionStart: Boolean(
                          renderProps.isSelectionStart && isRange,
                        ),
                        isSelectionEnd: Boolean(
                          renderProps.isSelectionEnd && isRange,
                        ),
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
                          "relative isolate z-10 flex h-full w-full flex-col gap-1 rounded-(--cell-radius) border-0 leading-none font-normal squircle group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-3 group-data-[focused=true]/day:ring-ring/30 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:squircle data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-secondary data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:squircle data-[selected-single=true]:rounded-(--cell-radius) data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:squircle data-[today=true]:rounded-(--cell-radius) data-[today=true]:bg-secondary data-[today=true]:text-foreground data-[today=true]:squircle dark:hover:text-foreground [&>span]:opacity-70",
                          baseCellClassName,
                          cellSizeConfig[cellSize].cell,
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
                        data-today={
                          renderProps.isToday && !renderProps.isSelected
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
// Month/year pickers read as plain caption text: no field background, only the
// chevron icon; hover and keyboard focus still show feedback. Height follows
// --cell-size so they line up with the previous/next buttons.
const captionTriggerClassName =
  "squircle h-auto min-h-(--cell-size) w-auto gap-1 bg-transparent px-2.5 py-0 font-medium data-[hovered]:bg-muted data-[size=default]:h-auto";
function MonthDropdown({
  format,
  cellSize = "default",
}: {
  format?: Intl.DateTimeFormatOptions;
  cellSize?: "sm" | "default" | "lg";
}) {
  return (
    <CalendarMonthPicker format={format?.month}>
      {(props) => (
        <PrismSelect {...props} className="relative">
          <PrismSelectTrigger
            className={cn(
              captionTriggerClassName,
              cellSizeConfig[cellSize].heading,
            )}
          >
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
function YearDropdown({
  format,
  cellSize = "default",
}: {
  format?: Intl.DateTimeFormatOptions;
  cellSize?: "sm" | "default" | "lg";
}) {
  return (
    <CalendarYearPicker format={format}>
      {(props) => (
        <PrismSelect {...props} className="relative">
          <PrismSelectTrigger
            className={cn(
              captionTriggerClassName,
              cellSizeConfig[cellSize].heading,
            )}
          >
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
export { Calendar as PrismCalendar, RangeCalendar as PrismRangeCalendar };
