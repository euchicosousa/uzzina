import {
  DialogTrigger,
  Heading,
  Popover as PopoverPrimitive,
  type DialogTriggerProps,
  type PopoverProps as PopoverPrimitiveProps,
} from "react-aria-components";
import { cn } from "cnfast";
function PopoverTrigger({ children, ...props }: DialogTriggerProps) {
  return (
    <DialogTrigger data-slot="popover-trigger" {...props}>
      {children}
    </DialogTrigger>
  );
}
/**
 * React Aria already limits the popover height to the visual viewport, but it
 * anchors to the trigger even when the iOS keyboard covers it, leaving the
 * popover under the keyboard. Clamp the anchor to the visible area instead.
 */
function getVisibleTargetRect(target: Element): DOMRect {
  const rect = target.getBoundingClientRect();
  const viewport = window.visualViewport;
  if (!viewport || viewport.scale > 1) return rect;
  const visibleTop = viewport.offsetTop;
  const visibleBottom = viewport.offsetTop + viewport.height;
  const clamp = (value: number) =>
    Math.min(Math.max(value, visibleTop), visibleBottom);
  const top = clamp(rect.top);
  const bottom = clamp(rect.bottom);
  if (top === rect.top && bottom === rect.bottom) return rect;
  const { left, right, width } = rect;
  const height = bottom - top;
  return {
    x: left,
    y: top,
    top,
    bottom,
    left,
    right,
    width,
    height,
    toJSON: () => ({
      x: left,
      y: top,
      top,
      bottom,
      left,
      right,
      width,
      height,
    }),
  };
}
const popoverWidths = {
  sm: "w-56",
  default: "w-72",
  lg: "w-80",
} as const;
function Popover({
  className,
  placement = "bottom",
  offset = 4,
  crossOffset = 0,
  size = "default",
  ...props
}: Omit<PopoverPrimitiveProps, "className"> & {
  className?: string;
  /** Width scale: sm `w-56`, default `w-72`, lg `w-80`. */
  size?: "sm" | "default" | "lg";
}) {
  return (
    <PopoverPrimitive
      className={cn(
        popoverWidths[size],
        "z-50 flex max-w-[calc(100vw-2rem)] origin-(--trigger-anchor-point) flex-col gap-4 overflow-y-auto rounded-2xl border border-foreground/5 bg-popover p-4 text-sm text-foreground shadow-lg outline-hidden squircle data-entering:animate-overlay-pop-in data-exiting:animate-overlay-pop-out motion-reduce:animate-none dark:border-foreground/10",
        className,
      )}
      crossOffset={crossOffset}
      data-slot="popover-content"
      getTargetRect={getVisibleTargetRect}
      offset={offset}
      placement={placement}
      {...props}
    />
  );
}
function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 text-sm", className)}
      data-slot="popover-header"
      {...props}
    />
  );
}
function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<typeof Heading>) {
  return (
    <Heading
      className={cn("text-base font-medium", className)}
      data-slot="popover-title"
      {...props}
    />
  );
}
function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-secondary-foreground", className)}
      data-slot="popover-description"
      {...props}
    />
  );
}
export {
  Popover as PrismPopover,
  PopoverDescription as PrismPopoverDescription,
  PopoverHeader as PrismPopoverHeader,
  PopoverTitle as PrismPopoverTitle,
  PopoverTrigger as PrismPopoverTrigger,
};
