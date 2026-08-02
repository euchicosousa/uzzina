import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cnfast";
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-2xl squircle border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground [a]:hover:bg-card/80 border-foreground/20 ",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        success:
          "bg-success-background text-success border-success/20 dark:bg-success-background [a]:hover:bg-success-background/80",
        warning:
          "bg-warning-background text-warning border-warning/20 dark:bg-warning-background [a]:hover:bg-warning-background/80",
        error:
          "bg-error-background text-error border-error/20 dark:bg-error-background [a]:hover:bg-error-background/80",
        info: "bg-info-background text-info border-info/20 dark:bg-info-background [a]:hover:bg-info-background/80",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
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
