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
  const sizeClasses = {
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
        className={cn(sizeClasses, "transition-colors duration-500")}
        color={phase.color}
        slug={phase.slug}
      />
    );
  }

  // Se concluído, mostra o círculo preenchido com check
  const isFinished = phase.slug === PHASES.done.slug;
  if (size === "dot") {
    return (
      <div
        key={phase.color}
        className="size-2 shrink-0 animate-pop rounded-full"
        style={{
          backgroundColor: phase.color,
        }}
      ></div>
    );
  }
  if (isFinished) {
    return (
      <div
        className={cn(
          "grid aspect-square place-content-center rounded-full shrink-0",
          sizeClasses,
          "animate-pop",
        )}
        style={{
          backgroundColor: phase.color,
        }}
      >
        <CheckIcon
          className={cn(sizeClasses, "shrink-0 scale-70 text-white")}
        />
      </div>
    );
  }
  return (
    <div className={cn("relative shrink-0", sizeClasses)}>
      {/* Background circle (shadow) */}
      <svg
        className="absolute inset-0 stroke-2 opacity-10 size-full"
        stroke="currentColor"
        viewBox="0 0 20 20"
      >
        <title>Progresso Fundo</title>
        <circle cx="10" cy="10" fill="none" r="8" />
      </svg>
      {/* Progress circle */}
      <svg
        className="-rotate-90 stroke-2 transition-all duration-500 size-full"
        style={{
          color: phase.color,
        }}
        viewBox="0 0 20 20"
      >
        <title>Progresso</title>
        <circle
          className="transition-all duration-500"
          cx="10"
          cy="10"
          fill="none"
          r="8"
          stroke="currentColor"
          strokeDasharray={`${Math.floor(phase.order * 8.5)},51`}
        />
      </svg>
    </div>
  );
}
