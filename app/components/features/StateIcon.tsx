import { STATES, type SIZE, type STATE_TYPE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { CheckIcon } from "lucide-react";

export function StateIcon({
  state,
  size = "sm",
}: {
  state: STATE_TYPE;
  size?: (typeof SIZE)[keyof typeof SIZE] | "dot";
}) {
  let sizeClasses = {
    xs: "size-3",
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
    xl: "size-8",
    "2xl": "size-12",
    dot: "size-2",
  }[size];
  return size === "dot" ? (
    <div
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: state.color }}
    ></div>
  ) : state.slug === STATES.finished.slug ? (
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
