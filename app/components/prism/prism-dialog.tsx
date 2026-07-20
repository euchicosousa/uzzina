import * as React from "react";
import {
  Dialog as RADialog,
  Modal as RAModal,
  ModalOverlay as RAModalOverlay,
  type ModalOverlayProps as RAModalOverlayProps,
  Heading as RAHeading,
  type HeadingProps as RAHeadingProps,
} from "react-aria-components";
import { cn } from "~/lib/utils";
export const PrismDialogTrigger = RAModalOverlay;
export const PrismDialogOverlay = React.forwardRef<
  HTMLDivElement,
  RAModalOverlayProps
>(({ className, ...props }, ref) => {
  return (
    <RAModalOverlay
      ref={ref}
      className={(renderProps) =>
        cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 ",
          "data-entering:animate-in data-leaving:animate-out data-entering:fade-in-0 data-leaving:fade-out-0",
          typeof className === "function" ? className(renderProps) : className,
        )
      }
      {...props}
    />
  );
});
PrismDialogOverlay.displayName = "PrismDialogOverlay";
export interface PrismDialogContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof RAModal>,
  "children"
> {
  children: React.ReactNode;
}
export const PrismDialogContent = React.forwardRef<
  HTMLDivElement,
  PrismDialogContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <RAModal
      ref={ref}
      className={(renderProps) =>
        cn(
          "w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-2xl outline-none",
          "data-entering:animate-in data-leaving:animate-out data-entering:zoom-in-95 data-leaving:zoom-out-95 data-entering:duration-200 data-leaving:duration-150",
          typeof className === "function" ? className(renderProps) : className,
        )
      }
      {...props}
    >
      <RADialog className="outline-none flex flex-col h-full w-full">
        {children}
      </RADialog>
    </RAModal>
  );
});
PrismDialogContent.displayName = "PrismDialogContent";
export function PrismDialogTitle({ className, ...props }: RAHeadingProps) {
  return (
    <RAHeading
      className={cn(
        "text-lg font-bold tracking-tight text-foreground",
        className,
      )}
      slot="title"
      {...props}
    />
  );
}
