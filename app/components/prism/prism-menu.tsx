import * as React from "react";
import {
  Menu as RAMenu,
  MenuItem as RAMenuItem,
  MenuTrigger as RAMenuTrigger,
  type MenuItemProps as RAMenuItemProps,
  type MenuProps as RAMenuProps,
  Popover as RAPopover,
  Separator as RASeparator,
  type SeparatorProps as RASeparatorProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";
export const PrismMenu = RAMenuTrigger;
export const PrismMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ ...props }, ref) => {
  return <span ref={ref} {...props} />;
});
PrismMenuTrigger.displayName = "PrismMenuTrigger";
export interface PrismMenuContentProps<T> extends RAMenuProps<T> {
  className?: string;
  popoverClassName?: string;
  placement?:
    | "bottom"
    | "bottom start"
    | "bottom end"
    | "top"
    | "top start"
    | "top end"
    | "left"
    | "right";
}
export function PrismMenuContent<T extends object>({
  className,
  popoverClassName,
  placement,
  children,
  ...props
}: PrismMenuContentProps<T>) {
  return (
    <RAPopover
      className={() =>
        cn(
          "z-50 min-w-48 overflow-hidden rounded-2xl border p-1 shadow-xl outline-none bg-popover",
          popoverClassName,
        )
      }
      placement={placement}
    >
      <RAMenu
        className={() =>
          cn(
            "outline-none max-h-[inherit] overflow-y-auto flex flex-col gap-0.5",
            className,
          )
        }
        {...props}
      >
        {children}
      </RAMenu>
    </RAPopover>
  );
}
export interface PrismMenuItemProps extends RAMenuItemProps {
  className?: string;
}
export function PrismMenuItem({
  className,
  children,
  ...props
}: PrismMenuItemProps) {
  return (
    <RAMenuItem
      className={(_renderProps) =>
        cn(
          "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl squircle cursor-pointer outline-none transition-colors",
          "data-focused:bg-secondary data-focused:text-foreground text-muted-foreground hover:text-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          className,
        )
      }
      {...props}
    >
      {children}
    </RAMenuItem>
  );
}
export function PrismMenuSeparator({ className, ...props }: RASeparatorProps) {
  return (
    <RASeparator
      className={cn("my-1 border-b border-border/50", className)}
      {...props}
    />
  );
}
