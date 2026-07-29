import { cn } from "cnfast";
import {  PHASES, type PHASE_TYPE, type STATION_TYPE } from "~/lib/CONSTANTS";
import { PhaseIcon } from "./PhaseIcon";
import Color from "color";
export function PhaseStationIcon({
  phase,
  station
}: {
  phase: PHASE_TYPE;
  station: STATION_TYPE | null
}) {
  


  return phase.slug === PHASES.done.slug ? <PhaseIcon phase={phase} size="sm" /> :  (
    <div className={cn("relative text-white shrink-0 h-4 flex rounded-3xl squircle overflow-hidden font-bold tracking-wide")}>
      {station && 
      <div className="text-[8px] uppercase flex items-center px-2" style={{color: station.color, backgroundColor: Color(station.color).alpha(0.1).string() }}>{station.title}</div> }
      <div className="text-[8px] uppercase flex items-center px-2" style={{color: phase.color, backgroundColor: Color(phase.color).alpha(0.1).string()}}>{phase.title}</div>
    </div>
  );
}
