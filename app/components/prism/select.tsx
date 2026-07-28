import type * as React from "react";
import {
  Button as ButtonPrimitive,
  composeRenderProps,
  Header as HeaderPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
  ListBoxSection as ListBoxSectionPrimitive,
  Popover as PopoverPrimitive,
  SearchField,
  Select as SelectPrimitive,
  SelectValue as SelectValuePrimitive,
  Separator as SeparatorPrimitive,
  type ListBoxProps,
  type SearchFieldProps,
  type ListBoxSectionProps as SelectGroupProps,
  type SelectProps,
  type SelectValueProps,
} from "react-aria-components";
import { cn } from "cnfast";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/prism/input-group";
import { IconSelector, IconSearch, IconCheck } from "@tabler/icons-react";
function Select<T extends object, M extends "single" | "multiple" = "single">({
  className,
  ...props
}: SelectProps<T, M>) {
  return (
    <SelectPrimitive
      className={cn("w-fit", className)}
      data-slot="select"
      {...props}
    />
  );
}
function SelectGroup<T extends object>({
  className,
  ...props
}: SelectGroupProps<T>) {
  return (
    <ListBoxSectionPrimitive
      className={cn("scroll-my-1.5 p-1", className)}
      data-slot="select-group"
      {...props}
    />
  );
}
function SelectValue<T extends object>({
  className,
  children,
  ...props
}: SelectValueProps<T>) {
  return (
    <SelectValuePrimitive
      className={cn(
        "flex flex-1 text-left data-placeholder:text-muted-foreground",
        className,
      )}
      data-slot="select-value"
      {...props}
    >
      {typeof children === "function"
        ? children
        : ({ selectedItems, selectedText, defaultChildren }) =>
            selectedItems.length > 1 ? selectedText : defaultChildren}
    </SelectValuePrimitive>
  );
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: Omit<React.ComponentProps<typeof ButtonPrimitive>, "children"> & {
  children?: React.ReactNode;
  size?: "sm" | "default";
}) {
  return (
    <ButtonPrimitive
      className={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-2xl border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-12 data-[size=sm]:h-10 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-size={size}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <IconSelector className="pointer-events-none size-4 text-muted-foreground" />
    </ButtonPrimitive>
  );
}
function SelectContent({
  className,
  children,
  placement = "bottom",
  offset = 4,
  crossOffset = 0,
  ...props
}: Omit<
  React.ComponentProps<typeof PopoverPrimitive>,
  "className" | "children"
> & {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <SelectPopover
      className={className}
      crossOffset={crossOffset}
      offset={offset}
      placement={placement}
      {...props}
    >
      <SelectList>{children}</SelectList>
    </SelectPopover>
  );
}
function SelectPopover({
  className,
  children,
  placement = "bottom start",
  offset = 4,
  crossOffset = 0,
  ...props
}: Omit<
  React.ComponentProps<typeof PopoverPrimitive>,
  "className" | "children"
> & {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <PopoverPrimitive
      className={cn(
        "relative isolate z-50 w-(--trigger-width) min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-2xl squircle bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 **:data-[slot$=-item]:data-focused:bg-foreground/10 dark:ring-foreground/10",
        className,
      )}
      crossOffset={crossOffset}
      data-slot="select-content"
      offset={offset}
      placement={placement}
      {...props}
    >
      {children}
    </PopoverPrimitive>
  );
}
function SelectList<T extends object>({
  className,
  ...props
}: ListBoxProps<T>) {
  return (
    <ListBoxPrimitive
      className={cn(
        "group/select-list max-h-[inherit] overflow-x-hidden overflow-y-auto p-1 outline-hidden",
        className,
      )}
      data-slot="select-list"
      {...props}
    />
  );
}
function SelectInput({ className, ...props }: SearchFieldProps) {
  return (
    <SearchField
      {...props}
      autoFocus
      className={cn("p-1 pb-0", className)}
      data-slot="select-input-wrapper"
    >
      <InputGroup>
        <InputGroupInput
          className="[&::-webkit-search-cancel-button]:hidden"
          data-slot="select-input"
        />
        <InputGroupAddon>
          <IconSearch className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </SearchField>
  );
}
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof HeaderPrimitive>) {
  return (
    <HeaderPrimitive
      className={cn("px-2 py-1 text-xs text-muted-foreground", className)}
      data-slot="select-label"
      {...props}
    />
  );
}
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ListBoxItemPrimitive>) {
  return (
    <ListBoxItemPrimitive
      className={cn(
        "relative flex min-h-7 squircle w-full cursor-default items-center gap-2 rounded-xl py-1.5 pr-12 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-focused:bg-accent data-focused:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      data-slot="select-item"
      textValue={typeof children === "string" ? children : undefined}
      {...props}
    >
      {composeRenderProps(children, (children, { isSelected }) => (
        <>
          <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
            {children}
          </span>
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            {isSelected ? <IconCheck className="pointer-events-none" /> : null}
          </span>
        </>
      ))}
    </ListBoxItemPrimitive>
  );
}
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      data-slot="select-separator"
      {...props}
    />
  );
}
function SelectEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/select-list:flex",
        className,
      )}
      data-slot="select-empty"
      {...props}
    />
  );
}
export {
  Select as PrismSelect,
  SelectContent as PrismSelectContent,
  SelectGroup as PrismSelectGroup,
  SelectInput as PrismSelectInput,
  SelectItem as PrismSelectItem,
  SelectLabel as PrismSelectLabel,
  SelectList as PrismSelectList,
  SelectPopover as PrismSelectPopover,
  SelectSeparator as PrismSelectSeparator,
  SelectTrigger as PrismSelectTrigger,
  SelectValue as PrismSelectValue,
  SelectEmpty as PrismSelectEmpty,
};
