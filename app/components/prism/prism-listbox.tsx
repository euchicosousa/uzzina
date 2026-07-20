import type * as React from "react";
import {
  ListBox as RAListBox,
  ListBoxItem as RAListBoxItem,
  type ListBoxProps as RAListBoxProps,
  type ListBoxItemProps as RAListBoxItemProps,
  Header as RAHeader,
  Section as RASection,
  type SectionProps as RASectionProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";
export function PrismListBox<T extends object>({
  className,
  ...props
}: RAListBoxProps<T>) {
  return (
    <RAListBox
      className={(renderProps) =>
        cn(
          "outline-none max-h-[inherit] overflow-y-auto flex flex-col gap-0.5 p-1",
          typeof className === "function" ? className(renderProps) : className,
        )
      }
      {...props}
    />
  );
}
export function PrismListBoxItem<T extends object>({
  className,
  children,
  ...props
}: RAListBoxItemProps<T>) {
  return (
    <RAListBoxItem
      className={(renderProps) =>
        cn(
          "flex w-full items-center gap-2 px-3 py-2 rounded-xl squircle cursor-pointer outline-none transition-colors",
          "data-focused:bg-secondary data-focused:text-foreground text-muted-foreground hover:text-foreground",
          "data-selected:bg-primary/10 data-selected:text-primary",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          typeof className === "function" ? className(renderProps) : className,
        )
      }
      {...props}
    >
      {children}
    </RAListBoxItem>
  );
}
export function PrismListBoxSection<T extends object>({
  className,
  children,
  ...props
}: RASectionProps<T>) {
  return (
    <RASection className={cn("flex flex-col gap-0.5", className)} {...props}>
      {children}
    </RASection>
  );
}
export function PrismListBoxHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RAHeader>) {
  return (
    <RAHeader
      className={cn(
        "px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}
