import * as React from "react";
import {
  Button as ButtonPrimitive,
  Collection,
  ComboBox as ComboBoxPrimitive,
  ComboBoxStateContext,
  ComboBoxValue as ComboBoxValuePrimitive,
  composeRenderProps,
  Header as HeaderPrimitive,
  ListBoxItem as ListBoxItemPrimitive,
  ListBox as ListBoxPrimitive,
  ListBoxSection as ListBoxSectionPrimitive,
  Popover as PopoverPrimitive,
  Separator as SeparatorPrimitive,
  type ButtonProps,
  type ComboBoxValueProps,
  type HeaderProps,
  type ListBoxItemProps,
  type ListBoxProps,
  type ListBoxSectionProps,
  type SeparatorProps,
} from "react-aria-components";
import { cn } from "cnfast";
import { Button } from "~/components/prism/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/prism/input-group";
import { ChevronDownIcon, XIcon, CheckCircle2Icon } from "lucide-react";
function ComboboxValue<T>({ ...props }: ComboBoxValueProps<T>) {
  return <ComboBoxValuePrimitive data-slot="combobox-value" {...props} />;
}
function ComboboxTrigger({
  className,
  children,
  ...props
}: Omit<ButtonProps, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <ButtonPrimitive
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      data-slot="combobox-trigger"
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 opacity-60" />
    </ButtonPrimitive>
  );
}
function ComboboxClear({
  className,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const state = React.useContext(ComboBoxStateContext);
  if (state?.inputValue === "") {
    return null;
  }
  return (
    <InputGroupButton
      aria-label="Clear"
      className={cn(className)}
      data-slot="combobox-clear"
      onPress={() => {
        state?.setValue(null);
      }}
      size={size}
      slot={null}
      variant="ghost"
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </InputGroupButton>
  );
}
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  size?: "default" | "sm" | "lg";
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  const buttonSize =
    size === "sm" ? "icon-xs" : size === "lg" ? "icon" : "icon-sm";
  return (
    <InputGroup className={cn("w-auto", className)} size={size}>
      <InputGroupInput disabled={disabled} size={size} {...props} />
      <InputGroupAddon align="inline-end" className="pr-3">
        {showTrigger && (
          <InputGroupButton
            data-slot="combobox-trigger"
            isDisabled={disabled}
            size={buttonSize}
            variant="ghost"
          >
            <ChevronDownIcon className="pointer-events-none" />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear isDisabled={disabled} size={buttonSize} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}
function ComboboxContent({
  className,
  placement = "bottom",
  offset = 6,
  crossOffset = 0,
  anchor,
  ...props
}: Omit<
  React.ComponentProps<typeof PopoverPrimitive>,
  "className" | "children"
> & {
  className?: string;
  children?: React.ReactNode;
  anchor?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <PopoverPrimitive
      className={cn(
        "relative isolate z-50 max-h-72 w-(--trigger-width) min-w-36 origin-(--trigger-anchor-point) overflow-hidden rounded-2xl border border-popover-border bg-popover text-foreground shadow-lg squircle data-entering:animate-overlay-pop-in data-exiting:animate-overlay-pop-out *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:bg-input *:data-[slot=input-group]:shadow-none motion-reduce:animate-none",
        className,
      )}
      crossOffset={crossOffset}
      data-slot="combobox-content"
      offset={offset}
      placement={placement}
      triggerRef={anchor}
      {...props}
    />
  );
}
function ComboboxList<T extends object>({
  className,
  ...props
}: ListBoxProps<T>) {
  return (
    <ListBoxPrimitive
      className={cn(
        "group/combobox-content no-scrollbar max-h-[inherit] scroll-py-1 overflow-y-auto overscroll-contain p-1.5 data-empty:p-0",
        className,
      )}
      data-slot="combobox-list"
      {...props}
    />
  );
}
function ComboboxItem<T extends object>({
  className,
  children,
  ...props
}: ListBoxItemProps<T>) {
  return (
    <ListBoxItemPrimitive
      className={cn(
        "relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none squircle data-disabled:pointer-events-none data-disabled:opacity-50 not-data-[focus-visible]:data-hovered:bg-secondary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-60 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="combobox-item"
      textValue={typeof children === "string" ? children : undefined}
      {...props}
    >
      {composeRenderProps(children, (children, { isSelected }) => (
        <>
          {children}
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            {isSelected ? (
              <CheckCircle2Icon className="pointer-events-none opacity-100" />
            ) : null}
          </span>
        </>
      ))}
    </ListBoxItemPrimitive>
  );
}
function ComboboxGroup<T extends object>({
  className,
  ...props
}: ListBoxSectionProps<T>) {
  return (
    <ListBoxSectionPrimitive
      className={cn(className)}
      data-slot="combobox-group"
      {...props}
    />
  );
}
function ComboboxLabel({ className, ...props }: HeaderProps) {
  return (
    <HeaderPrimitive
      className={cn("px-2 py-1.5 text-xs text-secondary-foreground", className)}
      data-slot="combobox-label"
      {...props}
    />
  );
}
function ComboboxEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-secondary-foreground group-data-empty/combobox-content:flex",
        className,
      )}
      data-slot="combobox-empty"
      {...props}
    />
  );
}
function ComboboxSeparator({ className, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      data-slot="combobox-separator"
      {...props}
    />
  );
}
function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}
export {
  ComboBoxPrimitive as PrismCombobox,
  ComboboxInput as PrismComboboxInput,
  ComboboxContent as PrismComboboxContent,
  ComboboxList as PrismComboboxList,
  ComboboxItem as PrismComboboxItem,
  ComboboxGroup as PrismComboboxGroup,
  ComboboxLabel as PrismComboboxLabel,
  Collection as PrismComboboxCollection,
  ComboboxEmpty as PrismComboboxEmpty,
  ComboboxSeparator as PrismComboboxSeparator,
  ComboboxTrigger as PrismComboboxTrigger,
  ComboboxValue as PrismComboboxValue,
  useComboboxAnchor,
};
