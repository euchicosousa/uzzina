import { CheckCircle2Icon, CheckIcon } from "lucide-react";
import { STATES, type SIZE, type STATE_TYPE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

export function StateIcon({
  state,
  size = "sm",
}: {
  state: STATE_TYPE;
  size?: (typeof SIZE)[keyof typeof SIZE];
}) {
  let sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
    xl: "size-10",
  }[size];
  return state.slug === STATES.finished.slug ? (
    <div
      className={cn("grid aspect-square place-content-center rounded-full")}
      style={{ backgroundColor: state.color }}
    >
      <CheckIcon className={cn("scale-75 text-white", sizeClasses)} />
    </div>
  ) : (
    <div className="relative">
      <svg
        className={`absolute top-0 left-0 stroke-4 ${sizeClasses} opacity-10`}
        viewBox="0 0 20 20"
        stroke="currentColor"
      >
        <circle cx="10" cy="10" r="8" fill="none" />
      </svg>
      <svg
        className={`-rotate-90 stroke-4 ${sizeClasses}`}
        style={{ color: state.color }}
        viewBox="0 0 20 20"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${Math.floor(state.order * 7.3)},51`}
        />
      </svg>
    </div>
  );
}
