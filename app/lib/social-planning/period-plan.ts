import {
  mergeCommemorativeSlots,
  sequencePlanningFormats,
  type PlanningFormatCounts,
} from "./slot-calculator.js";
import type { PeriodPlanningSlot } from "./theme-contract.js";

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
    format: slot.isExtra ? "carousel" : regularFormats[regularIndex++],
  }));
}
