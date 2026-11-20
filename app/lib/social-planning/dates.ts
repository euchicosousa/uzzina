import type { PlanSuggestion } from "./types";

const PLANNING_TIME_ZONE = "America/Sao_Paulo";

/** Calendar day (`YYYY-MM-DD`) in the agency time zone, used as the default idea date. */
export function planningToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PLANNING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Fills the date of suggestions that have none (legacy proposals) without touching dated ones. */
export function withPlanningDates(
  suggestions: PlanSuggestion[],
  today: string = planningToday(),
): PlanSuggestion[] {
  return suggestions.map((suggestion) =>
    suggestion.scheduled_date
      ? suggestion
      : { ...suggestion, scheduled_date: today },
  );
}
