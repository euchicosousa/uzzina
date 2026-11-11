import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cnfast";
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs whitespace-nowrap transition-all focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-error aria-invalid:ring-error-background [&>svg]:pointer-events-none [&_svg:not([class*='opacity-'])]:opacity-60 [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-card text-foreground [a]:hover:bg-card/80 border-foreground/20 ",
        secondary: "bg-secondary text-foreground [a]:hover:bg-secondary/80",
        success:
          "bg-success-background text-success border-success-background",
        warning:
          "bg-warning-background text-warning-foreground border-warning-background",
        error:
          "bg-error-background text-error-foreground border-error-background",
        info: "bg-info-background text-info-foreground border-info-background",
        outline:
          "border-border text-foreground [a]:hover:bg-secondary [a]:hover:text-secondary-foreground",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
function Badge({
  className,
  variant = "default",
  render,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    render?: (props: React.HTMLAttributes<HTMLElement>) => React.ReactNode;
  }) {
  if (render) {
    const renderProps = {
      "data-slot": "badge",
      "data-variant": variant,
      className: cn(
        badgeVariants({
          variant,
        }),
        className,
      ),
      ...props,
    };
    return render(renderProps);
  }
  return (
    <span
      className={cn(
        badgeVariants({
          variant,
        }),
        className,
      )}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  );
}
export { Badge as PrismBadge, badgeVariants };
