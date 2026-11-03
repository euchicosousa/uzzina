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

function Accordion({ className, ...props }: DisclosureGroupProps) {
  return (
    <AccordionPrimitive
      data-slot="accordion"
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border squircle",
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
        "w-full min-w-0 not-last:border-b data-open:bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: Omit<ButtonProps, "children"> & { children: React.ReactNode }) {
  return (
    <AccordionHeaderPrimitive className="flex w-full min-w-0 flex-1" level={6}>
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
          className="pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none ml-auto hidden size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionTriggerPrimitive>
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
      className="data-open:animate-accordion-down data-closed:animate-accordion-up h-(--disclosure-panel-height) w-full min-w-0 overflow-clip px-4 text-sm transition-[height]"
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-4 break-words [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
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
