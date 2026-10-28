import { cn } from "~/lib/utils";

// Reserves room at the end of a scroll area so its last item can scroll above the floating AppBar.
export function AppBarSpacer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-(--app-bar-space) w-full shrink-0", className)}
      data-app-bar-spacer
    />
  );
}
