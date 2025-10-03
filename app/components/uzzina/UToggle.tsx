import { cn } from "~/lib/utils";
import { Button } from "../ui/button";

export const UToggle = ({
  children,
  checked,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  checked: boolean;
  children: React.ReactElement;
}) => {
  return (
    <Button
      {...props}
      variant={checked ? "outline" : "ghost"}
      className={cn("border", !checked && "border-transparent", className)}
    >
      {children}
    </Button>
  );
};
