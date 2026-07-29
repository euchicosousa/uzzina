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
        "fixed inset-0 isolate z-50 bg-black/30 duration-100 data-entering:animate-in data-entering:fade-in-0 data-exiting:animate-out data-exiting:fade-out-0 supports-backdrop-filter:backdrop-blur-sm",
        className,
      )}
      data-slot="dialog-overlay"
      {...props}
    >
      {children}
    </ModalOverlayPrimitive>
  );
}
function Dialog({
  className,
  children,
  showCloseButton = true,
  isDismissable = true,
  ...props
}: Omit<ModalOverlayPrimitiveProps, "className" | "children"> &
  Pick<React.ComponentProps<typeof ModalPrimitive>, "isDismissable"> & {
    className?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
  }) {
  return (
    <DialogOverlay isDismissable={isDismissable} {...props}>
      <ModalPrimitive
        className={cn(
          "fixed squircle top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[min(var(--radius-4xl),24px)] bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95 sm:max-w-md dark:ring-foreground/10",
          className,
        )}
        data-slot="dialog-content"
      >
        <DialogPrimitive
          className="[display:inherit] gap-[inherit] outline-none"
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
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end px-5 py-4",
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
export {
  type DialogPrimitiveProps,
  type DialogTriggerPrimitiveProps,
  Dialog as PrismDialog,
  DialogClose as PrismDialogClose,
  DialogDescription as PrismDialogDescription,
  DialogFooter as PrismDialogFooter,
  DialogHeader as PrismDialogHeader,
  DialogOverlay as PrismDialogOverlay,
  DialogTitle as PrismDialogTitle,
  DialogTrigger as PrismDialogTrigger,
};
