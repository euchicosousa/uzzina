import * as React from "react";
import {
  DialogTrigger as RADialogTrigger,
  Popover as RAPopover,
  type PopoverProps as RAPopoverProps,
  OverlayArrow as RAOverlayArrow,
} from "react-aria-components";
import { cn } from "~/lib/utils";
export const PrismPopover = RADialogTrigger;
export const PrismPopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ ...props }, ref) => {
  // PrismPopover is RADialogTrigger which expects a button child that handles click events.
  // We don't restrict props to allow direct pass-through for children buttons.
  return <span ref={ref} {...props} />;
});
PrismPopoverTrigger.displayName = "PrismPopoverTrigger";
export interface PrismPopoverContentProps extends Omit<
  RAPopoverProps,
  "children" | "className"
> {
  className?:
    string | ((values: { defaultClassName: string | undefined }) => string);
  children: React.ReactNode;
  showArrow?: boolean;
}
export const PrismPopoverContent = React.forwardRef<
  HTMLDivElement,
  PrismPopoverContentProps
>(({ className, children, showArrow = false, offset = 8, ...props }, ref) => {
  return (
    <RAPopover
      ref={ref}
      className={(values) =>
        cn(
          "z-50 squircle rounded-2xl border border-border bg-popover p-4 shadow-xl outline-none",
          "data-entering:animate-in data-leaving:animate-out data-entering:fade-in data-leaving:fade-out data-entering:zoom-in-95 data-leaving:zoom-out-95",
          "placement-bottom:slide-in-from-top-2 placement-top:slide-in-from-bottom-2 placement-left:slide-in-from-right-2 placement-right:slide-in-from-left-2",
          typeof className === "function" ? className(values) : className,
        )
      }
      offset={offset}
      {...props}
    >
      {showArrow && (
        <RAOverlayArrow className="group">
          <svg
            className="block fill-popover stroke-border stroke-1 placement-bottom:rotate-180 placement-left:-rotate-90 placement-right:rotate-90"
            height={12}
            viewBox="0 0 12 12"
            width={12}
          >
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </RAOverlayArrow>
      )}
      {children}
    </RAPopover>
  );
});
PrismPopoverContent.displayName = "PrismPopoverContent";
