export const DEFAULT_INSTAGRAM_FEED_TIME = "17:00";
export const DEFAULT_INSTAGRAM_STORIES_TIME = "08:00";

/** Normalizes a database time ("17:00:00") or "H:mm" to "HH:mm"; null when invalid. */
export function normalizePostTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatPostTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
