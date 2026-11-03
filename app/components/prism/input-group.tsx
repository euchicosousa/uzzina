"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Group, type GroupProps } from "react-aria-components";
import { PrismInput } from "~/components/prism/input";
import { Textarea } from "~/components/prism/textarea";
import { Button as PrismButton } from "~/components/prism/button";
import { cn } from "cnfast";

export type InputGroupSize = "sm" | "default" | "lg";

const InputGroupContext = React.createContext<{
  size: InputGroupSize;
}>({
  size: "default",
});

function useInputGroupContext() {
  return React.useContext(InputGroupContext);
}

const inputGroupVariants = cva(
  "group/input-group relative flex w-full min-w-0 items-center rounded-2xl border border-transparent bg-input transition-[color,box-shadow] duration-200 outline-none squircle in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-ring/60 has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3",
  {
    variants: {
      size: {
        sm: "h-8 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
        default:
          "h-10 has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=inline-start]]:[&>input]:pl-2",
        lg: "h-12 rounded-3xl has-[>[data-align=inline-end]]:[&>input]:pr-2.5 has-[>[data-align=inline-start]]:[&>input]:pl-2.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export type InputGroupProps = GroupProps &
  VariantProps<typeof inputGroupVariants>;

function InputGroup({
  className,
  size = "default",
  ...props
}: InputGroupProps) {
  const effectiveSize = size ?? "default";
  const contextValue = React.useMemo(
    () => ({ size: effectiveSize }),
    [effectiveSize],
  );

  return (
    <InputGroupContext.Provider value={contextValue}>
      <Group
        className={cn(
          inputGroupVariants({
            size: effectiveSize,
          }),
          className,
        )}
        data-size={effectiveSize}
        data-slot="input-group"
        {...props}
      />
    </InputGroupContext.Provider>
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 text-sm select-none font-medium text-muted-foreground [&_svg]:text-foreground [&_svg:not([class*='opacity-'])]:opacity-60 group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:rounded-full **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1.5",
  {
    variants: {
      size: {
        sm: "py-0.5 [&>svg:not([class*='size-'])]:size-4 [&_[data-slot=icon]:not([class*='size-'])]:size-4 [&_button[data-slot=button]:not([class*='size-'])]:size-6 [&_button[data-slot=button]_svg:not([class*='size-'])]:size-4",
        default:
          "py-1 [&>svg:not([class*='size-'])]:size-5 [&_[data-slot=icon]:not([class*='size-'])]:size-5 [&_button[data-slot=button]:not([class*='size-'])]:size-8 [&_button[data-slot=button]_svg:not([class*='size-'])]:size-5",
        lg: "py-1.5 text-base [&>svg:not([class*='size-'])]:size-6 [&_[data-slot=icon]:not([class*='size-'])]:size-6 [&_button[data-slot=button]:not([class*='size-'])]:size-10 [&_button[data-slot=button]_svg:not([class*='size-'])]:size-6",
      },
      align: {
        "inline-start": "order-first",
        "inline-end": "order-last",
        "block-start":
          "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end":
          "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    compoundVariants: [
      {
        size: "sm",
        align: "inline-start",
        className:
          "pl-2.5 has-[>button]:pl-1 has-[>button]:ml-0 has-[>kbd]:ml-[-0.15rem]",
      },
      {
        size: "sm",
        align: "inline-end",
        className:
          "pr-2.5 has-[>button]:pr-1 has-[>button]:mr-0 has-[>kbd]:mr-[-0.15rem]",
      },
      {
        size: "default",
        align: "inline-start",
        className:
          "pl-3.5 has-[>button]:pl-1.5 has-[>button]:ml-0 has-[>kbd]:ml-[-0.15rem]",
      },
      {
        size: "default",
        align: "inline-end",
        className:
          "pr-3.5 has-[>button]:pr-1.5 has-[>button]:mr-0 has-[>kbd]:mr-[-0.15rem]",
      },
      {
        size: "lg",
        align: "inline-start",
        className:
          "pl-4 has-[>button]:pl-1.5 has-[>button]:ml-0 has-[>kbd]:ml-[-0.2rem]",
      },
      {
        size: "lg",
        align: "inline-end",
        className:
          "pr-4 has-[>button]:pr-1.5 has-[>button]:mr-0 has-[>kbd]:mr-[-0.2rem]",
      },
    ],
    defaultVariants: {
      size: "default",
      align: "inline-start",
    },
  },
);

export type InputGroupAddonProps = React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants> & {
    size?: InputGroupSize;
  };

function InputGroupAddon({
  className,
  align = "inline-start",
  size,
  ...props
}: InputGroupAddonProps) {
  const { size: groupSize } = React.useContext(InputGroupContext);
  const effectiveSize = size ?? groupSize ?? "default";

  return (
    <div
      className={cn(
        inputGroupAddonVariants({
          align,
          size: effectiveSize,
        }),
        className,
      )}
      data-align={align}
      data-size={effectiveSize}
      data-slot="input-group-addon"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      role="group"
      {...props}
    />
  );
}

export type InputGroupButtonProps = React.ComponentProps<typeof PrismButton>;

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size,
  ...props
}: InputGroupButtonProps) {
  const { size: groupSize } = React.useContext(InputGroupContext);
  const effectiveGroupSize = groupSize ?? "default";

  const resolvedSize =
    size ??
    (effectiveGroupSize === "sm"
      ? "icon-xs"
      : effectiveGroupSize === "lg"
        ? "icon"
        : "icon-sm");

  const sizeClasses = {
    sm: "size-6 [&_svg:not([class*='size-'])]:size-4",
    default: "size-8 [&_svg:not([class*='size-'])]:size-5",
    lg: "size-10 [&_svg:not([class*='size-'])]:size-6",
  }[effectiveGroupSize];

  return (
    <PrismButton
      className={cn(
        !size && sizeClasses,
        size &&
          effectiveGroupSize === "lg" &&
          "[&_svg:not([class*='size-'])]:size-6",
        size &&
          effectiveGroupSize === "default" &&
          "[&_svg:not([class*='size-'])]:size-5",
        size &&
          effectiveGroupSize === "sm" &&
          "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="input-group-button"
      size={resolvedSize}
      type={type}
      variant={variant}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  const { size: groupSize } = useInputGroupContext();
  const effectiveGroupSize = groupSize ?? "default";

  const sizeClasses = {
    sm: "[&_svg:not([class*='size-'])]:size-4",
    default: "[&_svg:not([class*='size-'])]:size-5",
    lg: "text-base [&_svg:not([class*='size-'])]:size-6",
  }[effectiveGroupSize];

  return (
    <span
      className={cn(
        "flex items-center gap-2 text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='opacity-'])]:opacity-60",
        sizeClasses,
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  size,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  size?: "default" | "sm" | "lg";
}) {
  const { size: groupSize } = useInputGroupContext();
  const effectiveSize = size ?? groupSize ?? "default";

  return (
    <PrismInput
      className={cn(
        "h-full flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className,
      )}
      data-slot="input-group-control"
      size={effectiveSize}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className,
      )}
      data-slot="input-group-control"
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  inputGroupVariants,
  inputGroupAddonVariants,
  useInputGroupContext,
};
