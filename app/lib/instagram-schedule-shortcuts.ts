import { normalizePostTime } from "./partner-post-times";

export type ScheduleShortcut = {
  id: "soon" | "today" | "tomorrow";
  label: string;
  date: Date;
};

/** Stories use the Stories time; feed, video and reel use the feed time. */
export function pickPartnerPostTime(
  format: string | null | undefined,
  times: { feedTime?: string | null; storiesTime?: string | null },
) {
  const value = format === "stories" ? times.storiesTime : times.feedTime;
  return normalizePostTime(value);
}

/** Quick date options for the schedule tab, in the browser time zone. */
export function getScheduleShortcuts({
  now,
  postTime,
  minimumLeadMs,
}: {
  now: Date;
  postTime: string | null;
  minimumLeadMs: number;
}): ScheduleShortcut[] {
  const soon = new Date(
    Math.ceil((now.getTime() + minimumLeadMs) / 60_000) * 60_000,
  );
  const shortcuts: ScheduleShortcut[] = [
    { id: "soon", label: "Daqui a 2 min", date: soon },
  ];
  const normalized = normalizePostTime(postTime);
  if (!normalized) return shortcuts;
  const [hour, minute] = normalized.split(":").map(Number) as [number, number];
  const today = new Date(now);
  today.setHours(hour, minute, 0, 0);
  if (today.getTime() >= now.getTime() + minimumLeadMs)
    shortcuts.push({ id: "today", label: `Hoje ${normalized}`, date: today });
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hour, minute, 0, 0);
  shortcuts.push({
    id: "tomorrow",
    label: `Amanhã ${normalized}`,
    date: tomorrow,
  });
  return shortcuts;
}
