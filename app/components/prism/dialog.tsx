import {
  Dialog as DialogPrimitive,
  DialogTrigger as DialogTriggerPrimitive,
  Heading,
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
  type DialogProps as DialogPrimitiveProps,
  type DialogTriggerProps as DialogTriggerPrimitiveProps,
  type ModalOverlayProps as ModalOverlayPrimitiveProps,
} from "react-aria-components";
import { cn } from "cnfast";
import { XIcon } from "lucide-react";
import { PrismButton } from ".";
import {
  useVisibleViewport,
  type VisibleViewport,
} from "~/hooks/useVisibleViewport";
function DialogTrigger({ ...props }: DialogTriggerPrimitiveProps) {
  return <DialogTriggerPrimitive data-slot="dialog-trigger" {...props} />;
}
function DialogClose({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof PrismButton>) {
  return (
    <PrismButton
      className={cn(className)}
      data-slot="dialog-close"
      size={size || "sm"}
      slot="close"
      variant={variant}
      {...props}
    />
  );
}
function DialogOverlay({
  className,
  children,
  ...props
}: Omit<ModalOverlayPrimitiveProps, "className" | "children"> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <ModalOverlayPrimitive
      className={cn(
        "data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0 fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm",
        className,
      )}
      data-slot="dialog-overlay"
      {...props}
    >
      {children}
    </ModalOverlayPrimitive>
  );
}
// Outer margin kept around dialogs inside the visible viewport.
const DIALOG_MARGIN = 16;
// Natural height of a top-aligned command dialog (input, list and footer).
const TOP_DIALOG_HEIGHT = 416;

type DialogPlacement = "center" | "top";

function getDialogFrame(
  { top, height }: VisibleViewport,
  placement: DialogPlacement,
): React.CSSProperties {
  // Top-aligned dialogs start at a third of the visible height while their
  // natural height still fits below; otherwise they move up to the margin.
  const insetTop =
    placement === "top"
      ? Math.min(
          height / 3,
          Math.max(DIALOG_MARGIN, height - TOP_DIALOG_HEIGHT - DIALOG_MARGIN),
        )
      : DIALOG_MARGIN;
  return {
    top,
    height: Math.max(0, height),
    paddingTop: insetTop,
    paddingRight: DIALOG_MARGIN,
    paddingBottom: DIALOG_MARGIN,
    paddingLeft: DIALOG_MARGIN,
  };
}

// Mounted only while the overlay is open, so closed dialogs do not listen to
// viewport changes.
function DialogFrame({
  className,
  children,
  placement,
  showCloseButton,
}: {
  className?: string;
  children: React.ReactNode;
  placement: DialogPlacement;
  showCloseButton: boolean;
}) {
  const visible = useVisibleViewport();
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 flex justify-center",
        placement === "top" ? "items-start" : "items-center",
      )}
      data-slot="dialog-viewport"
      style={getDialogFrame(visible, placement)}
    >
      <ModalPrimitive
        className={cn(
          "data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 pointer-events-auto relative z-50 grid max-h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none squircle sm:w-full sm:max-w-lg dark:ring-foreground/10",
          className,
        )}
        data-slot="dialog-content"
      >
        <DialogPrimitive
          className="[display:inherit] min-h-0 [flex-direction:inherit] gap-[inherit] outline-none"
          data-slot="dialog"
        >
          {children}
          {showCloseButton && (
            <DialogClose
              className="absolute top-2 right-2"
              size="icon-xs"
              variant={"ghost"}
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          )}
        </DialogPrimitive>
      </ModalPrimitive>
    </div>
  );
}
function Dialog({
  className,
  children,
  showCloseButton = true,
  isDismissable = true,
  placement = "center",
  ...props
}: Omit<ModalOverlayPrimitiveProps, "className" | "children"> &
  Pick<React.ComponentProps<typeof ModalPrimitive>, "isDismissable"> & {
    className?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    /**
     * Vertical position inside the visible viewport. Dialogs taller than the
     * available space keep the outer margin and scroll their content.
     */
    placement?: DialogPlacement;
  }) {
  return (
    <DialogOverlay isDismissable={isDismissable} {...props}>
      <DialogFrame
        className={className}
        placement={placement}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogFrame>
    </DialogOverlay>
  );
}
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 px-5 py-4", className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end",
        className,
      )}
      data-slot="dialog-footer"
      {...props}
    >
      {children}
      {showCloseButton && <DialogClose variant="ghost">Close</DialogClose>}
    </div>
  );
}
function DialogTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Heading>, "slot">) {
  return (
    <Heading
      className={cn("font-heading text-xl leading-none font-medium", className)}
      data-slot="dialog-title"
      slot="title"
      {...props}
    />
  );
}
function DialogDescription({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "slot">) {
  return (
    <div
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      data-slot="dialog-description"
      {...props}
    />
  );
}
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 px-5 py-2", className)}
      data-slot="dialog-body"
      {...props}
    />
  );
}
export {
  type DialogPrimitiveProps,
  type DialogTriggerPrimitiveProps,
  Dialog as PrismDialog,
  DialogBody as PrismDialogBody,
  DialogClose as PrismDialogClose,
  DialogDescription as PrismDialogDescription,
  DialogFooter as PrismDialogFooter,
  DialogHeader as PrismDialogHeader,
  DialogOverlay as PrismDialogOverlay,
  DialogTitle as PrismDialogTitle,
  DialogTrigger as PrismDialogTrigger,
};
