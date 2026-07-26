import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cnfast";
import { Separator } from "~/components/prism/separator";
const buttonGroupVariants = cva(
  "inline-flex w-fit items-stretch group/button-group *:focus-visible:relative *:focus-visible:z-10 *:hover:z-10",
  {
    variants: {
      orientation: {
        horizontal:
          "flex-row [&>*:not(:first-child)]:-ml-px [&>*:first-child]:rounded-r-none! [&>*:first-child]:rounded-l-xl! [&>*:first-child]:squircle! [&>*:not(:first-child):not(:last-child)]:rounded-none! [&>*:last-child]:rounded-l-none! [&>*:last-child]:rounded-r-xl! [&>*:last-child]:squircle!",
        vertical:
          "flex-col [&>*:not(:first-child)]:-mt-px [&>*:first-child]:rounded-b-none! [&>*:first-child]:rounded-t-xl! [&>*:first-child]:squircle! [&>*:not(:first-child):not(:last-child)]:rounded-none! [&>*:last-child]:rounded-t-none! [&>*:last-child]:rounded-b-xl! [&>*:last-child]:squircle!",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);
function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      className={cn(
        buttonGroupVariants({
          orientation,
        }),
        className,
      )}
      data-orientation={orientation || "horizontal"}
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
        "flex items-center gap-2 rounded-xl squircle border bg-muted px-3 text-sm font-medium text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
        className,
      ),
      ...props,
    };
    return render(renderProps);
  }
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl squircle border bg-muted px-3 text-sm font-medium text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
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
        "relative z-10 self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
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
