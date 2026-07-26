import {
  DateInput as DateInputPrimitive,
  DateSegment as DateSegmentPrimitive,
  TimeField as TimeFieldPrimitive,
  type TimeFieldProps as TimeFieldPrimitiveProps,
  type TimeValue,
} from "react-aria-components";
import { cn } from "cnfast";
export interface PrismTimeFieldProps<
  T extends TimeValue = TimeValue,
> extends Omit<TimeFieldPrimitiveProps<T>, "className"> {
  className?: string;
}
function PrismTimeField<T extends TimeValue = TimeValue>({
  className,
  ...props
}: PrismTimeFieldProps<T>) {
  return (
    <TimeFieldPrimitive
      aria-label={props["aria-label"] ?? "Horário"}
      className={cn("w-auto", className)}
      data-slot="time-field"
      {...props}
    >
      <DateInputPrimitive
        className={cn(
          "squircle inline-flex h-12 w-full min-w-0 items-center rounded-2xl border border-transparent bg-input/50 px-2 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        )}
        data-slot="date-input"
      >
        {(segment) => (
          <DateSegmentPrimitive
            className={cn(
              "rounded-xl squircle p-1 px-2 text-foreground outline-none focus:bg-primary focus:text-primary-foreground data-[type=literal]:px-0.5 data-[type=literal]:text-muted-foreground data-placeholder:text-muted-foreground",
            )}
            segment={segment}
          />
        )}
      </DateInputPrimitive>
    </TimeFieldPrimitive>
  );
}
export { PrismTimeField };
