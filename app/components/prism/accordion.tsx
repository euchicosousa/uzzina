import type * as React from "react";
import {
  DisclosurePanel as AccordionContentPrimitive,
  Heading as AccordionHeaderPrimitive,
  Disclosure as AccordionItemPrimitive,
  DisclosureGroup as AccordionPrimitive,
  Button as AccordionTriggerPrimitive,
  type ButtonProps,
  type DisclosureGroupProps,
  type DisclosurePanelProps,
  type DisclosureProps,
} from "react-aria-components";

import { cn } from "~/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export type AccordionVariant = "default" | "card";

/**
 * `default`: items have no fill and do not change color on hover.
 * `card`: items sit on a fixed `bg-card` fill; the closed item's hover is
 * `bg-secondary-hover` (hover over a card).
 */
function Accordion({
  className,
  variant = "default",
  ...props
}: DisclosureGroupProps & { variant?: AccordionVariant }) {
  return (
    <AccordionPrimitive
      data-slot="accordion"
      data-variant={variant}
      className={cn(
        "group/accordion flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border squircle",
        className,
      )}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: DisclosureProps) {
  return (
    <AccordionItemPrimitive
      data-slot="accordion-item"
      className={cn(
        "w-full min-w-0 not-last:border-b group-data-[variant=card]/accordion:bg-card group-data-[variant=card]/accordion:not-data-expanded:hover:bg-secondary-hover",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  info,
  ...props
}: Omit<ButtonProps, "children"> & {
  children: React.ReactNode;
  /**
   * Set when the row holds its own controls (for example an info button).
   * A button cannot sit inside the trigger button, so the trigger becomes a
   * transparent overlay covering the row. Controls inside `children` must add
   * `pointer-events-auto relative z-10`; the rest of the row ignores the mouse.
   */
  info?: boolean;
}) {
  if (!info) {
    return (
      <AccordionHeaderPrimitive
        className="flex w-full min-w-0 flex-1"
        level={6}
      >
        <AccordionTriggerPrimitive
          slot="trigger"
          data-slot="accordion-trigger"
          className={cn(
            "group/accordion-trigger relative flex w-full min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden border border-transparent p-4 text-left text-sm font-medium transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
          {...props}
        >
          <span
            className="min-w-0 flex-1 truncate text-left"
            title={typeof children === "string" ? children : undefined}
          >
            {children}
          </span>
          <ChevronDownIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none ml-auto size-4 shrink-0 opacity-60 group-aria-expanded/accordion-trigger:hidden"
          />
          <ChevronUpIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none ml-auto hidden size-4 shrink-0 opacity-60 group-aria-expanded/accordion-trigger:inline"
          />
        </AccordionTriggerPrimitive>
      </AccordionHeaderPrimitive>
    );
  }

  return (
    <AccordionHeaderPrimitive className="flex w-full min-w-0 flex-1" level={6}>
      <span
        className={cn(
          "relative flex w-full min-w-0 flex-1 items-center justify-between gap-4 overflow-hidden border border-transparent p-4 text-left text-sm font-medium transition-all",
          className,
        )}
      >
        <AccordionTriggerPrimitive
          slot="trigger"
          data-slot="accordion-trigger"
          className="peer/accordion-trigger absolute inset-0 z-0 cursor-pointer rounded-[inherit] outline-none disabled:pointer-events-none disabled:opacity-50"
          {...props}
        />
        <span className="pointer-events-none relative min-w-0 flex-1 text-left">
          {children}
        </span>
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none size-4 shrink-0 opacity-60 peer-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden size-4 shrink-0 opacity-60 peer-aria-expanded/accordion-trigger:inline"
        />
      </span>
    </AccordionHeaderPrimitive>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: DisclosurePanelProps) {
  return (
    <AccordionContentPrimitive
      data-slot="accordion-content"
      className="h-(--disclosure-panel-height) w-full min-w-0 overflow-clip px-4 text-sm transition-[height]"
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-4 break-words [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionContentPrimitive>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Accordion as PrismAccordion,
  AccordionItem as PrismAccordionItem,
  AccordionTrigger as PrismAccordionTrigger,
  AccordionContent as PrismAccordionContent,
};
