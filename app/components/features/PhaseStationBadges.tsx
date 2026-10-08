import { cn } from "cnfast";
import { PHASES, type PHASE_TYPE } from "~/lib/CONSTANTS";
import { PhaseIcon } from "./PhaseIcon";
import Color from "color";

export function PhaseStationBadges({ phase }: { phase: PHASE_TYPE }) {
  return phase.slug === PHASES.finished.slug ? (
    <PhaseIcon phase={phase} size="sm" />
  ) : (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-3xl font-bold tracking-wide text-white squircle",
      )}
    >
      <div
        className="truncate px-2 py-0.5 text-[8px] uppercase"
        style={{
          color: phase.color,
          backgroundColor: Color(phase.color).alpha(0.1).string(),
        }}
      >
        {phase.title}
      </div>
    </div>
  );
}
