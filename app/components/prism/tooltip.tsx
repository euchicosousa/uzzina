import type { ReactNode } from "react";
import {
  Tooltip as TooltipPrimitive,
  TooltipTrigger,
  type TooltipProps,
} from "react-aria-components";
import { cn } from "cnfast";

/**
 * Hover/focus hint for icon-only controls. The child must be a React Aria
 * focusable (PrismButton, PrismToggle, toggle group item). The hint is visual
 * only: keep the control's own aria-label.
 */
function Tooltip({
  label,
  children,
  placement = "bottom",
  delay = 400,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  placement?: TooltipProps["placement"];
  /** Milliseconds before the first hint opens; later ones open at once. */
  delay?: number;
  className?: string;
}) {
  return (
    <TooltipTrigger closeDelay={0} delay={delay}>
      {children}
      <TooltipPrimitive
        className={cn(
          "z-50 max-w-60 rounded-xl border border-foreground/5 bg-popover px-2.5 py-1.5 text-xs text-foreground shadow-lg outline-hidden squircle data-entering:animate-overlay-pop-in data-exiting:animate-overlay-pop-out motion-reduce:animate-none dark:border-foreground/10",
          className,
        )}
        data-slot="tooltip"
        offset={6}
        placement={placement}
      >
        {label}
      </TooltipPrimitive>
    </TooltipTrigger>
  );
}

export { Tooltip as PrismTooltip };
