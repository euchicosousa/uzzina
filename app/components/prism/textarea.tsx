import type * as React from "react";
import {
  composeRenderProps,
  TextArea as TextareaPrimitive,
} from "react-aria-components";
import { cn } from "cnfast";
function Textarea({
  className,
  ...props
}: React.ComponentProps<typeof TextareaPrimitive>) {
  return (
    <TextareaPrimitive
      className={composeRenderProps(className, (className) =>
        cn(
          "flex field-sizing-content min-h-30 w-full resize-none rounded-2xl border border-transparent bg-input px-5 py-3 text-base transition-[color,box-shadow] duration-200 outline-none squircle placeholder:text-foreground/40 focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-error-background aria-invalid:text-error-foreground aria-invalid:border-error aria-invalid:ring-error-background md:text-sm",
          className,
        ),
      )}
      data-slot="textarea"
      {...props}
    />
  );
}
export { Textarea };
