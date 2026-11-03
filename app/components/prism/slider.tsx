import {
  Slider as SliderPrimitive,
  SliderTrack as SliderTrackPrimitive,
  SliderThumb as SliderThumbPrimitive,
  SliderOutput as SliderOutputPrimitive,
  SliderFill as SliderFillPrimitive,
  type SliderProps as SliderPrimitiveProps,
  type SliderTrackProps,
  type SliderThumbProps,
  type SliderFillProps,
  type SliderOutputProps,
} from "react-aria-components";
import { cn } from "cnfast";

export interface PrismSliderProps<T = number | number[]> extends Omit<
  SliderPrimitiveProps<T>,
  "className"
> {
  className?: string;
}

export function PrismSlider<T extends number | number[]>({
  className,
  ...props
}: PrismSliderProps<T>) {
  return (
    <SliderPrimitive
      className={cn("flex w-full flex-col gap-2", className)}
      data-slot="slider"
      {...props}
    />
  );
}

export function PrismSliderTrack({
  className,
  children,
  ...props
}: Omit<SliderTrackProps, "className"> & { className?: string }) {
  return (
    <SliderTrackPrimitive
      className={cn(
        "relative flex h-2 w-full cursor-pointer items-center rounded-full bg-secondary select-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      data-slot="slider-track"
      {...props}
    >
      {children ?? (
        <>
          <PrismSliderFill />
          <PrismSliderThumb />
        </>
      )}
    </SliderTrackPrimitive>
  );
}

export function PrismSliderFill({
  className,
  ...props
}: Omit<SliderFillProps, "className"> & { className?: string }) {
  return (
    <SliderFillPrimitive
      className={cn("h-full rounded-full bg-primary", className)}
      data-slot="slider-fill"
      {...props}
    />
  );
}

export function PrismSliderThumb({
  className,
  ...props
}: Omit<SliderThumbProps, "className"> & { className?: string }) {
  return (
    <SliderThumbPrimitive
      className={cn(
        "top-1/2 box-border size-5 rounded-full border-2 border-primary bg-background shadow-sm transition-transform outline-none data-disabled:cursor-not-allowed data-dragging:scale-110 data-[focus-visible]:ring-3 data-[focus-visible]:ring-ring/30",
        className,
      )}
      data-slot="slider-thumb"
      {...props}
    />
  );
}

export function PrismSliderOutput({
  className,
  ...props
}: Omit<SliderOutputProps, "className"> & { className?: string }) {
  return (
    <SliderOutputPrimitive
      className={cn("text-sm font-medium text-foreground", className)}
      data-slot="slider-output"
      {...props}
    />
  );
}
