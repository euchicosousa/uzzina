import * as React from "react";
import {
  ComboBox as RAComboBox,
  type ComboBoxProps as RAComboBoxProps,
  Input as RAInput,
  type InputProps as RAInputProps,
  Group as RAGroup,
} from "react-aria-components";
import { cn } from "~/lib/utils";
import { PrismPopover } from "~/components/prism";
import { PrismListBox } from "./prism-listbox";
export interface PrismComboboxProps<T extends object> extends Omit<
  RAComboBoxProps<T>,
  "children" | "className"
> {
  children: React.ReactNode;
  className?: string | ((values: unknown) => string);
}
export function PrismCombobox<T extends object>({
  children,
  className,
  ...props
}: PrismComboboxProps<T>) {
  return (
    <RAComboBox
      className={(renderProps) =>
        cn(
          "w-full flex flex-col",
          typeof className === "function" ? className(renderProps) : className,
        )
      }
      {...props}
    >
      {children}
    </RAComboBox>
  );
}
export const PrismComboboxInputGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RAGroup>
>(({ className, ...props }, ref) => {
  return (
    <RAGroup
      ref={ref}
      className={(renderProps) =>
        cn(
          "flex h-12 w-full items-center rounded-xl squircle border border-input bg-input px-3 outline-none transition-all",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          typeof className === "function" ? className(renderProps) : className,
        )
      }
      {...props}
    />
  );
});
PrismComboboxInputGroup.displayName = "PrismComboboxInputGroup";
export const PrismComboboxInput = React.forwardRef<
  HTMLInputElement,
  RAInputProps
>(({ className, ...props }, ref) => {
  return (
    <RAInput
      ref={ref}
      className={cn(
        "flex h-full w-full bg-transparent text-sm text-foreground placeholder:text-foreground/45 outline-none",
        className,
      )}
      {...props}
    />
  );
});
PrismComboboxInput.displayName = "PrismComboboxInput";
export interface PrismComboboxDropdownProps<T extends object> {
  children: React.ReactNode;
  popoverClassName?: string;
  listBoxClassName?: string;
  placement?:
    "bottom" | "bottom start" | "bottom end" | "top" | "top start" | "top end";
  items?: Iterable<T>;
}
export function PrismComboboxDropdown<T extends object>({
  children,
  popoverClassName,
  listBoxClassName,
  placement = "bottom start",
  items,
}: PrismComboboxDropdownProps<T>) {
  return (
    <PrismPopover
      className={cn(
        "w-[280px] overflow-hidden rounded-2xl p-1 bg-popover shadow-xl border border-border",
        popoverClassName,
      )}
      placement={placement}
    >
      <PrismListBox className={listBoxClassName} items={items}>
        {children}
      </PrismListBox>
    </PrismPopover>
  );
}
