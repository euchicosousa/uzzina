import { PHASES, type SIZE, type PHASE_TYPE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { CheckIcon } from "lucide-react";
import { Icons } from "~/components/uzzina/UIIcons";

export function PhaseIcon({
  phase,
  size = "sm",
  variant = "progress",
}: {
  phase: PHASE_TYPE;
  size?: (typeof SIZE)[keyof typeof SIZE] | "dot";
  variant?: "progress" | "icon";
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

  // Se variant for "icon", retorna o ícone temático definido no UIIcons
  if (variant === "icon") {
    return (
      <Icons
        slug={phase.slug}
        className={cn(sizeClasses)}
        color={phase.color}
      />
    );
  }

  // Se concluído, mostra o círculo preenchido com check
  const isFinished = phase.slug === PHASES.concluido.slug;

  if (size === "dot") {
    return (
      <div
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: phase.color }}
      ></div>
    );
  }

  if (isFinished) {
    return (
      <div
        className={cn(
          "grid aspect-square place-content-center rounded-full",
          sizeClasses,
        )}
        style={{ backgroundColor: phase.color }}
      >
        <CheckIcon className={cn("scale-75 text-white", sizeClasses)} />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background circle (shadow) */}
      <svg
        className={`absolute top-0 left-0 stroke-4 ${sizeClasses} opacity-10`}
        viewBox="0 0 20 20"
        stroke="currentColor"
      >
        <circle cx="10" cy="10" r="8" fill="none" />
      </svg>
      {/* Progress circle */}
      <svg
        className={`-rotate-90 stroke-4 ${sizeClasses}`}
        style={{ color: phase.color }}
        viewBox="0 0 20 20"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${Math.floor(phase.order * 8.5)},51`}
        />
      </svg>
    </div>
  );
}
