import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cnfast";
import { Separator } from "~/components/prism/separator";
// Square inner corners and the group radius only at the ends. The 1px pull
// only applies to default and outline (opaque borders); secondary and ghost
// sit side by side so translucent fills never overlap. attached={false}
// adds a 1px gap after default and secondary items only (DS18).
const buttonGroupVariants = cva(
  "inline-flex w-fit items-stretch group/button-group *:focus-visible:relative *:focus-visible:z-20 *:hover:z-10",
  {
    variants: {
      size: {
        xs: "[--group-radius:var(--radius-2xl)]",
        sm: "[--group-radius:var(--radius-2xl)]",
        default: "[--group-radius:var(--radius-2xl)]",
        lg: "[--group-radius:var(--radius-3xl)]",
      },
      orientation: {
        horizontal:
          "flex-row [&>*]:rounded-none! [&>*:first-child]:rounded-l-(--group-radius)! [&>*:last-child]:rounded-r-(--group-radius)!",
        vertical:
          "flex-col [&>*]:rounded-none! [&>*:first-child]:rounded-t-(--group-radius)! [&>*:last-child]:rounded-b-(--group-radius)!",
      },
      attached: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        orientation: "horizontal",
        attached: true,
        className:
          "[&>[data-variant=default]:not(:first-child)]:-ml-px [&>[data-variant=outline]:not(:first-child)]:-ml-px",
      },
      {
        orientation: "vertical",
        attached: true,
        className:
          "[&>[data-variant=default]:not(:first-child)]:-mt-px [&>[data-variant=outline]:not(:first-child)]:-mt-px",
      },
      {
        orientation: "horizontal",
        attached: false,
        className:
          "[&>[data-variant=default]:not(:first-child)]:ml-px [&>[data-variant=secondary]:not(:first-child)]:ml-px",
      },
      {
        orientation: "vertical",
        attached: false,
        className:
          "[&>[data-variant=default]:not(:first-child)]:mt-px [&>[data-variant=secondary]:not(:first-child)]:mt-px",
      },
    ],
    defaultVariants: {
      orientation: "horizontal",
      size: "default",
      attached: true,
    },
  },
);
function ButtonGroup({
  className,
  orientation,
  size,
  attached = true,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      className={cn(
        buttonGroupVariants({
          orientation,
          size,
          attached,
        }),
        className,
      )}
      data-attached={attached ? "true" : undefined}
      data-orientation={orientation || "horizontal"}
      data-size={size || "default"}
      data-slot="button-group"
      role="group"
      {...props}
    />
  );
}
const buttonGroupTextClasses =
  "flex items-center gap-2 rounded-2xl squircle border bg-secondary px-3 text-sm font-medium text-secondary-foreground group-data-[size=lg]/button-group:text-base [&_svg]:pointer-events-none [&_svg:not([class*='opacity-'])]:opacity-60 [&_svg:not([class*='size-'])]:size-5";
function ButtonGroupText({
  className,
  render,
  ...props
}: React.ComponentProps<"div"> & {
  render?: (props: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
}) {
  if (render) {
    const renderProps = {
      "data-slot": "button-group-text",
      className: cn(buttonGroupTextClasses, className),
      ...props,
    };
    return render(renderProps);
  }
  return (
    <div
      className={cn(buttonGroupTextClasses, className)}
      data-slot="button-group-text"
      {...props}
    />
  );
}
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      className={cn(
        "pointer-events-none relative z-20 shrink-0 self-stretch bg-border/80 group-has-data-[variant=default]/button-group:bg-primary-foreground/30 aria-[orientation=horizontal]:h-px aria-[orientation=vertical]:w-px",
        className,
      )}
      data-slot="button-group-separator"
      orientation={orientation}
      {...props}
    />
  );
}
export {
  ButtonGroup as PrismButtonGroup,
  ButtonGroupSeparator as PrismButtonGroupSeparator,
  ButtonGroupText as PrismButtonGroupText,
  buttonGroupVariants,
};
