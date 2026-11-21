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

/**
 * When a finalized suggestion's action will be scheduled, mirroring
 * `finalize_social_plan`: 11:00 on its day, or about 10 minutes from now when
 * the day is today and it is already 11:00 or later (agency time zone).
 */
export function plannedActionTimeLabel(
  scheduledDate: string,
  now: Date = new Date(),
): string {
  const [year, month, day] = scheduledDate.split("-");
  const label = `${day}/${month}/${year}`;
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: PLANNING_TIME_ZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(now),
  );
  if (scheduledDate === planningToday(now) && hour >= 11) {
    return `${label}, daqui a cerca de 10 minutos`;
  }
  return `${label} às 11:00`;
}
