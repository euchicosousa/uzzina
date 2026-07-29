import { cva } from "class-variance-authority";
import {
  composeRenderProps,
  Header as HeaderPrimitive,
  MenuItem as MenuItemPrimitive,
  Menu as MenuPrimitive,
  MenuSection as MenuSectionPrimitive,
  MenuTrigger as MenuTriggerPrimitive,
  Popover as PopoverPrimitive,
  Separator as SeparatorPrimitive,
  SubmenuTrigger as SubmenuTriggerPrimitive,
  type MenuItemProps as MenuItemPrimitiveProps,
  type MenuSectionProps as MenuSectionPrimitiveProps,
  type SeparatorProps as SeparatorPrimitiveProps,
} from "react-aria-components";
import { cn } from "cnfast";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof MenuTriggerPrimitive>) {
  return <MenuTriggerPrimitive data-slot="dropdown-menu-trigger" {...props} />;
}
function DropdownMenu({
  "data-slot": dataSlot = "dropdown-menu-content",
  placement = "bottom start",
  offset = 4,
  crossOffset = 0,
  className,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof MenuPrimitive<object>>,
  "children" | "className"
> &
  Pick<
    React.ComponentProps<typeof PopoverPrimitive>,
    "placement" | "offset" | "crossOffset"
  > & {
    "data-slot"?: string;
    className?: string;
    children?: React.ReactNode;
  }) {
  return (
    <PopoverPrimitive
      className={cn(
        "z-50 w-(--trigger-width) min-w-48 origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto rounded-3xl bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/5 outline-none data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:overflow-hidden data-exiting:fade-out-0 data-exiting:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 **:data-[slot$=-item]:data-focused:bg-foreground/10 dark:ring-foreground/10 squircle",
        className,
      )}
      crossOffset={crossOffset}
      data-slot={dataSlot}
      offset={offset}
      placement={placement}
    >
      <MenuPrimitive
        className="max-h-[inherit] overflow-x-hidden overflow-y-auto outline-hidden"
        {...props}
      >
        {children}
      </MenuPrimitive>
    </PopoverPrimitive>
  );
}
function DropdownMenuGroup({
  ...props
}: Omit<MenuSectionPrimitiveProps<object>, "children"> & {
  children?: React.ReactNode;
}) {
  return <MenuSectionPrimitive data-slot="dropdown-menu-group" {...props} />;
}
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof HeaderPrimitive> & {
  inset?: boolean;
}) {
  return (
    <HeaderPrimitive
      className={cn(
        "px-2 py-2 text-xs uppercase truncate tracking-wide font-medium text-muted-foreground data-inset:pl-7",
        className,
      )}
      data-inset={inset}
      data-slot="dropdown-menu-label"
      {...props}
    />
  );
}
const dropdownMenuItemVariants = cva(
  "group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 min-w-0 [&_svg]:opacity-50",
  {
    variants: {
      selectionMode: {
        none: "min-h-7 gap-2 rounded-lg px-3 py-1.5 text-sm focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 min-w-0",
        single:
          "min-h-7 gap-2 rounded-lg py-1.5 pr-8 pl-3 text-sm focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 min-w-0",
        multiple:
          "min-h-7 gap-2 rounded-lg py-1.5 pr-8 pl-3 text-sm focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 min-w-0",
      },
    },
  },
);
function DropdownMenuItem({
  className,
  inset,
  children,
  ...props
}: MenuItemPrimitiveProps<object> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenuItemPrimitive
      className={composeRenderProps(className, (className, { selectionMode }) =>
        cn(
          dropdownMenuItemVariants({
            selectionMode,
          }),
          className,
        ),
      )}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      data-variant={props.variant}
      textValue={typeof children === "string" ? children : props.textValue}
      {...props}
    >
      {composeRenderProps(
        children,
        (children, { isSelected, selectionMode }) => (
          <>
            {children}
            {selectionMode !== "none" ? (
              <span
                className="pointer-events-none absolute right-3 flex items-center justify-center size-4 shrink-0"
                data-selected={isSelected}
                data-slot="menu-item-indicator"
              >
                {isSelected ? <CheckIcon /> : null}
              </span>
            ) : null}
          </>
        ),
      )}
    </MenuItemPrimitive>
  );
}
function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof SubmenuTriggerPrimitive>) {
  return <SubmenuTriggerPrimitive data-slot="dropdown-menu-sub" {...props} />;
}
function DropdownMenuSubTrigger({
  className,
  inset,
  ...props
}: MenuItemPrimitiveProps<object> & {
  inset?: boolean;
}) {
  return (
    <MenuItemPrimitive
      className={cn(
        "flex min-h-7 cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:opacity-50",
        className,
      )}
      data-inset={inset}
      data-slot="dropdown-menu-sub-trigger"
      {...props}
    >
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <ChevronRightIcon className="ml-auto size-4" />
        </>
      ))}
    </MenuItemPrimitive>
  );
}
function DropdownMenuSubContent({
  placement = "end top",
  crossOffset = -3,
  offset = -2,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu>) {
  return (
    <DropdownMenu
      className={cn(
        "w-auto min-w-24 rounded-3xl bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/5 duration-100 dark:ring-foreground/10 squircle",
        className,
      )}
      crossOffset={crossOffset}
      data-slot="dropdown-menu-sub-content"
      offset={offset}
      placement={placement}
      {...props}
    />
  );
}
function DropdownMenuSeparator({
  className,
  ...props
}: SeparatorPrimitiveProps) {
  return (
    <SeparatorPrimitive
      className={cn("-mx-1 my-2 h-px bg-border/50", className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  );
}
function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className,
      )}
      data-slot="dropdown-menu-shortcut"
      {...props}
    />
  );
}
export {
  DropdownMenuTrigger as PrismMenu,
  DropdownMenuTrigger as PrismMenuTrigger,
  DropdownMenu as PrismMenuContent,
  DropdownMenuItem as PrismMenuItem,
  DropdownMenuSeparator as PrismMenuSeparator,
  DropdownMenuLabel as PrismMenuLabel,
  DropdownMenuGroup as PrismMenuGroup,
  DropdownMenuSub as PrismMenuSub,
  DropdownMenuSubTrigger as PrismMenuSubTrigger,
  DropdownMenuSubContent as PrismMenuSubContent,
  DropdownMenuShortcut as PrismMenuShortcut,
};
