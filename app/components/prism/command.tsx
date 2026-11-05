import { createContext, useContext, useRef } from "react";
import {
  Autocomplete,
  Collection,
  composeRenderProps,
  Header,
  Input,
  Menu,
  MenuItem,
  MenuSection,
  SearchField,
  Separator,
  useFilter,
  type AutocompleteProps,
  type InputProps,
  type MenuItemProps,
  type MenuProps,
  type MenuSectionProps,
  type SeparatorProps,
} from "react-aria-components";
import { cn } from "cnfast";
import {
  PrismDialog,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
} from "~/components/prism";
import { SearchIcon, CheckCircle2Icon } from "lucide-react";
type CommandActionModifiers = { shiftKey: boolean };
const CommandActivationContext = createContext<{
  current: { shiftKey: boolean; keyboard: boolean };
} | null>(null);

function Command({
  className,
  dir,
  style,
  ...props
}: Omit<AutocompleteProps, "className" | "style"> & {
  className?: string;
  dir?: React.HTMLAttributes<HTMLDivElement>["dir"];
  style?: React.CSSProperties;
}) {
  const activation = useRef({ shiftKey: false, keyboard: false });
  const { contains } = useFilter({
    sensitivity: "base",
  });
  return (
    <div
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-2xl bg-popover text-popover-foreground squircle",
        className,
      )}
      data-slot="command"
      dir={dir}
      onClickCapture={(event) => {
        // React Aria activates menu items with .click() on Enter, losing modifiers.
        if (!activation.current.keyboard) {
          activation.current.shiftKey = event.shiftKey;
        }
      }}
      onKeyDownCapture={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          activation.current = { shiftKey: event.shiftKey, keyboard: true };
        }
      }}
      onKeyUpCapture={() => {
        activation.current = { shiftKey: false, keyboard: false };
      }}
      onPointerDownCapture={() => {
        activation.current = { shiftKey: false, keyboard: false };
      }}
      onBlurCapture={() => {
        activation.current = { shiftKey: false, keyboard: false };
      }}
      style={style}
    >
      <CommandActivationContext.Provider value={activation}>
        <Autocomplete {...props} filter={props.filter || contains}>
          {props.children}
        </Autocomplete>
      </CommandActivationContext.Provider>
    </div>
  );
}
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  open,
  onOpenChange,
  className,
  showCloseButton = false,
  ...props
}: Omit<
  React.ComponentProps<typeof PrismDialog>,
  "children" | "className" | "isOpen" | "onOpenChange"
> & {
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <PrismDialog
      // A flex column lets the command shrink to the visible height, so the
      // list scrolls while the input and footer stay reachable.
      className={cn("flex flex-col overflow-hidden p-0", className)}
      isDismissable
      isOpen={open}
      onOpenChange={onOpenChange}
      placement="top"
      showCloseButton={showCloseButton}
      size="lg"
      {...props}
    >
      <PrismDialogHeader className="sr-only">
        <PrismDialogTitle>{title}</PrismDialogTitle>
        <PrismDialogDescription>{description}</PrismDialogDescription>
      </PrismDialogHeader>
      {children}
    </PrismDialog>
  );
}
function CommandInput({
  className,
  size = "default",
  suffix,
  ...props
}: Omit<InputProps, "size"> & {
  size?: "sm" | "default";
  /** Controls rendered at the end of the field (e.g. filters). */
  suffix?: React.ReactNode;
}) {
  const field = (
    <SearchField
      aria-label={props.placeholder || "Search"}
      autoFocus
      className={cn(
        "flex w-full items-center px-3.5",
        suffix ? "min-w-0 flex-1" : "border-b border-border",
      )}
      data-slot="command-input-wrapper"
    >
      <SearchIcon
        className={cn(
          "mr-2.5 shrink-0 opacity-60",
          size === "sm" ? "size-3.5" : "size-4",
        )}
      />
      <Input
        {...props}
        className={cn(
          "flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden",
          size === "sm" && "h-9",
          suffix && "min-w-0 truncate",
          className,
        )}
        data-slot="command-input"
      />
    </SearchField>
  );
  if (!suffix) return field;
  // The suffix sits outside SearchField so its buttons don't inherit the
  // field's clear-button context. Right inset equals the vertical inset of a
  // 32px control in the field: (44 - 32) / 2 = 6px, or (36 - 32) / 2 = 2px.
  return (
    <div
      className="flex w-full items-center border-b border-border"
      data-slot="command-input-group"
    >
      {field}
      <div
        className={cn(
          "flex shrink-0 items-center gap-1",
          size === "sm" ? "pr-0.5" : "pr-1.5",
        )}
        data-slot="command-input-suffix"
      >
        {suffix}
      </div>
    </div>
  );
}
function CommandList<T extends object>({ className, ...props }: MenuProps<T>) {
  return (
    <Menu
      {...props}
      className={cn(
        "no-scrollbar max-h-72 scroll-py-2 overflow-x-hidden overflow-y-auto p-1 outline-none",
        className,
      )}
      data-slot="command-list"
    />
  );
}
function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("py-6 text-center text-sm", className)}
      data-slot="command-empty"
      {...props}
    />
  );
}
function CommandGroup<T extends object>({
  className,
  children,
  items,
  heading,
  ...props
}: MenuSectionProps<T> & {
  heading?: string;
}) {
  return (
    <MenuSection
      className={cn(
        "space-y-1 overflow-hidden p-0 text-foreground **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      data-slot="command-group"
      {...props}
    >
      {heading && (
        <Header className="tracking-wide uppercase" cmdk-group-heading="">
          {heading}
        </Header>
      )}
      <Collection items={items}>{children}</Collection>
    </MenuSection>
  );
}
function CommandSeparator({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      className={cn("my-2 h-px bg-border", className)}
      data-slot="command-separator"
      {...props}
    />
  );
}
function CommandItem<T extends object>({
  className,
  children,
  textValue,
  isSelected,
  onAction,
  "data-selected": dataSelected,
  "data-checked": dataChecked,
  ...props
}: Omit<MenuItemProps<T>, "onAction"> & {
  onAction?: (modifiers: CommandActionModifiers) => void;
  isSelected?: boolean;
  "data-selected"?: boolean | string;
  "data-checked"?: boolean | string;
}) {
  const activation = useContext(CommandActivationContext);
  const selected =
    isSelected ??
    (dataSelected === true || dataSelected === "true") ??
    (dataChecked === true || dataChecked === "true");
  return (
    <MenuItem
      {...props}
      onAction={() => {
        const shiftKey = activation?.current.shiftKey ?? false;
        if (activation) {
          activation.current = { shiftKey: false, keyboard: false };
        }
        onAction?.({ shiftKey });
      }}
      className={cn(
        "group/command-item relative flex h-8 min-h-7 cursor-default items-center gap-2 rounded-xl px-3 outline-hidden select-none squircle data-focused:bg-secondary/50 data-focused:text-foreground data-[checked=true]:bg-secondary/50 data-[checked=true]:text-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-secondary/50 data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-60 [&_svg:not([class*='size-'])]:size-5 data-focused:*:[svg]:text-foreground data-[checked=true]:*:[svg]:text-foreground data-[selected=true]:*:[svg]:text-foreground",
        className,
      )}
      data-checked={selected ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-slot="command-item"
      textValue={
        textValue || (typeof children === "string" ? children : undefined)
      }
    >
      {composeRenderProps(children, (children) => (
        <>
          {children}
          <CheckCircle2Icon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100 group-data-[selected=true]/command-item:opacity-100" />
        </>
      ))}
    </MenuItem>
  );
}
function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-focused/command-item:text-foreground group-data-selected/command-item:text-foreground",
        className,
      )}
      data-slot="command-shortcut"
      {...props}
    />
  );
}
export {
  Command as PrismCommand,
  CommandDialog as PrismCommandDialog,
  CommandInput as PrismCommandInput,
  CommandList as PrismCommandList,
  CommandEmpty as PrismCommandEmpty,
  CommandGroup as PrismCommandGroup,
  CommandItem as PrismCommandItem,
  CommandShortcut as PrismCommandShortcut,
  CommandSeparator as PrismCommandSeparator,
};
