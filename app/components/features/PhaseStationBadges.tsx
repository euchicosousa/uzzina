import { cn } from "cnfast";
import { PHASES, type PHASE_TYPE } from "~/lib/CONSTANTS";
import { PhaseIcon } from "./PhaseIcon";
import Color from "color";

export function PhaseStationBadges({
  phase,
}: {
  phase: PHASE_TYPE;
}) {
  return phase.slug === PHASES.done.slug ? (
    <PhaseIcon phase={phase} size="sm" />
  ) : (
    <div
      className={cn(
        "relative text-white flex rounded-3xl squircle overflow-hidden font-bold tracking-wide",
      )}
    >
      <div
        className="text-[8px] uppercase truncate py-0.5 px-2"
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
