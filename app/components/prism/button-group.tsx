import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cnfast";
import { Separator } from "~/components/prism/separator";
const buttonGroupVariants = cva(
  "inline-flex w-fit items-stretch group/button-group *:focus-visible:relative *:focus-visible:z-20 *:hover:z-10",
  {
    variants: {
      size: {
        xs: "[&>*:first-child]:rounded-l-2xl! [&>*:last-child]:rounded-r-2xl! [&>*:only-child]:rounded-2xl!",
        sm: "[&>*:first-child]:rounded-l-2xl! [&>*:last-child]:rounded-r-2xl! [&>*:only-child]:rounded-2xl!",
        default:
          "[&>*:first-child]:rounded-l-2xl! [&>*:last-child]:rounded-r-2xl! [&>*:only-child]:rounded-2xl!",
        lg: "[&>*:first-child]:rounded-l-3xl! [&>*:last-child]:rounded-r-3xl! [&>*:only-child]:rounded-3xl!",
      },
      orientation: {
        horizontal:
          "flex-row [&>*:not(:first-child)]:-ml-px [&>*:first-child]:rounded-r-none! [&>*:first-child]:squircle! [&>*:not(:first-child):not(:last-child)]:rounded-none! [&>*:last-child]:rounded-l-none! [&>*:last-child]:squircle! [&>*:only-child]:squircle!",
        vertical:
          "flex-col [&>*:not(:first-child)]:-mt-px [&>*:first-child]:rounded-b-none! [&>*:first-child]:squircle! [&>*:not(:first-child):not(:last-child)]:rounded-none! [&>*:last-child]:rounded-t-none! [&>*:last-child]:squircle! [&>*:only-child]:squircle!",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      size: "default",
    },
  },
);
function ButtonGroup({
  className,
  orientation,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      className={cn(
        buttonGroupVariants({
          orientation,
          size,
        }),
        className,
      )}
      data-orientation={orientation || "horizontal"}
      data-size={size || "default"}
      data-slot="button-group"
      role="group"
      {...props}
    />
  );
}
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
      className: cn(
        "flex items-center gap-2 rounded-2xl squircle border bg-muted px-3 text-sm font-medium text-muted-foreground group-data-[size=lg]/button-group:text-base [&_svg]:pointer-events-none [&_svg:not([class*='opacity-'])]:opacity-60 [&_svg:not([class*='size-'])]:size-5",
        className,
      ),
      ...props,
    };
    return render(renderProps);
  }
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border bg-muted px-3 text-sm font-medium text-muted-foreground squircle group-data-[size=lg]/button-group:text-base [&_svg]:pointer-events-none [&_svg:not([class*='opacity-'])]:opacity-60 [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
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
