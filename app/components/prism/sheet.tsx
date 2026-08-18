"use client";

import type * as React from "react";
import {
  Heading,
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
  Dialog as SheetPrimitive,
  DialogTrigger as SheetTriggerPrimitive,
  type ModalOverlayProps as ModalOverlayPrimitiveProps,
  type DialogProps as SheetPrimitiveProps,
  type DialogTriggerProps as SheetTriggerPrimitiveProps,
} from "react-aria-components";
import { cn } from "cnfast";
import { Button } from "~/components/prism/button";
import { XIcon } from "lucide-react";
function SheetTrigger({ ...props }: SheetTriggerPrimitiveProps) {
  return <SheetTriggerPrimitive data-slot="sheet-trigger" {...props} />;
}
function SheetClose({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(className)}
      data-slot="sheet-close"
      size={size}
      slot="close"
      variant={variant}
      {...props}
    />
  );
}
function SheetOverlay({
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
        "fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 data-entering:opacity-0 data-exiting:opacity-0 supports-backdrop-filter:backdrop-blur-sm",
        className,
      )}
      data-slot="sheet-overlay"
      isDismissable
      {...props}
    >
      {children}
    </ModalOverlayPrimitive>
  );
}
function Sheet({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: Omit<ModalOverlayPrimitiveProps, "className" | "children"> &
  Pick<React.ComponentProps<typeof ModalPrimitive>, "isDismissable"> & {
    className?: string;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    showCloseButton?: boolean;
  }) {
  return (
    <SheetOverlay {...props}>
      <ModalPrimitive
        className={cn(
          "fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-xl transition duration-200 ease-in-out data-entering:opacity-0 data-exiting:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-entering:translate-y-10 data-[side=bottom]:data-exiting:translate-y-10 data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-entering:translate-x-10 data-[side=left]:data-exiting:translate-x-10 data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-entering:translate-x-10 data-[side=right]:data-exiting:translate-x-10 data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-entering:translate-y-10 data-[side=top]:data-exiting:translate-y-10 data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className,
        )}
        data-side={side}
        data-slot="sheet-content"
      >
        <SheetPrimitive
          className="[display:inherit] h-full max-h-[inherit] [flex-direction:inherit] gap-inherit outline-none"
          data-slot="sheet"
        >
          {children}
          {showCloseButton && (
            <SheetClose
              className="absolute top-4 right-4 bg-secondary"
              size="icon-sm"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </SheetClose>
          )}
        </SheetPrimitive>
      </ModalPrimitive>
    </SheetOverlay>
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Sheet> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}) {
  return (
    <Sheet
      className={className}
      showCloseButton={showCloseButton}
      side={side}
      {...props}
    >
      {children}
    </Sheet>
  );
}
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-6", className)}
      data-slot="sheet-header"
      {...props}
    />
  );
}
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      data-slot="sheet-footer"
      {...props}
    />
  );
}
function SheetTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Heading>, "slot">) {
  return (
    <Heading
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className,
      )}
      data-slot="sheet-title"
      slot="title"
      {...props}
    />
  );
}
function SheetDescription({
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "slot">) {
  return (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="sheet-description"
      {...props}
    />
  );
}
export {
  type SheetPrimitiveProps,
  type SheetTriggerPrimitiveProps,
  Sheet as PrismSheet,
  SheetTrigger as PrismSheetTrigger,
  SheetClose as PrismSheetClose,
  SheetContent as PrismSheetContent,
  SheetHeader as PrismSheetHeader,
  SheetFooter as PrismSheetFooter,
  SheetTitle as PrismSheetTitle,
  SheetDescription as PrismSheetDescription,
};
