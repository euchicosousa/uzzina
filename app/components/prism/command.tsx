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
import { InputGroup, InputGroupAddon } from "~/components/prism/input-group";
import { SearchIcon, CheckCircle2Icon } from "lucide-react";
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
  const { contains } = useFilter({
    sensitivity: "base",
  });
  return (
    <div
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-3xl bg-popover text-popover-foreground squircle",
        className,
      )}
      data-slot="command"
      dir={dir}
      style={style}
    >
      <Autocomplete {...props} filter={props.filter || contains}>
        {props.children}
      </Autocomplete>
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
      className={cn(
        "top-1/3 translate-y-0 overflow-hidden sm:max-w-xl",
        className,
      )}
      isDismissable
      isOpen={open}
      onOpenChange={onOpenChange}
      showCloseButton={showCloseButton}
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
function CommandInput({ className, ...props }: InputProps) {
  return (
    <SearchField
      aria-label={props.placeholder || "Search"}
      autoFocus
      className="p-2 w-full"
      data-slot="command-input-wrapper"
    >
      <InputGroup className="h-10 bg-input rounded-2xl squircle">
        <Input
          {...props}
          className={cn(
            "w-full text-base outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden",
            className,
          )}
          data-slot="command-input"
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </SearchField>
  );
}
function CommandList<T extends object>({ className, ...props }: MenuProps<T>) {
  return (
    <Menu
      {...props}
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none border-t",
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
        "overflow-hidden space-y-1 p-2 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      data-slot="command-group"
      {...props}
    >
      {heading && (
        <Header className="uppercase tracking-wide" cmdk-group-heading="">
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
  "data-selected": dataSelected,
  "data-checked": dataChecked,
  ...props
}: MenuItemProps<T> & {
  isSelected?: boolean;
  "data-selected"?: boolean | string;
  "data-checked"?: boolean | string;
}) {
  const selected =
    isSelected ??
    (dataSelected === true || dataSelected === "true") ??
    (dataChecked === true || dataChecked === "true");
  return (
    <MenuItem
      {...props}
      className={cn(
        "group/command-item relative squircle flex min-h-7 cursor-default items-center gap-2 rounded-2xl px-4 h-8 outline-hidden select-none in-data-[slot=dialog-content]:rounded-2xl data-focused:bg-secondary/50 data-focused:text-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-secondary/50 data-[selected=true]:text-foreground data-[checked=true]:bg-secondary/50 data-[checked=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 data-focused:*:[svg]:text-foreground data-[selected=true]:*:[svg]:text-foreground data-[checked=true]:*:[svg]:text-foreground",
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
          <CheckCircle2Icon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-50 group-data-[selected=true]/command-item:opacity-50" />
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
