import {
  mergeCommemorativeSlots,
  sequencePlanningFormats,
  type PlanningFormatCounts,
} from "./slot-calculator.js";
import type { PeriodPlanningSlot } from "./theme-contract.js";

/** Suggestions generated per server batch; the Mesa uses it to estimate progress. */
export const PLANNING_PERIOD_BATCH_SIZE = 14;

export function buildPlanningPeriodSlots(
  options: Parameters<typeof mergeCommemorativeSlots>[0],
  formatCounts: PlanningFormatCounts,
): PeriodPlanningSlot[] {
  const regularFormats = sequencePlanningFormats(formatCounts);
  let regularIndex = 0;
  const celebrations = [...options.celebrations].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  return mergeCommemorativeSlots({ ...options, celebrations }).map((slot) => ({
    ...slot,
    isExtra: slot.isExtra === true,
    // Extras are plain posts (Estático) and never consume the regular counts.
    format: slot.isExtra ? "static" : regularFormats[regularIndex++],
  }));
}
