import { describe, expect, test } from "bun:test";
import {
  buildInstagramCalendarEvents,
  type CalendarScheduleRow,
} from "../app/lib/instagram-calendar-events";

const batch = {
  action_id: "a1",
  partner_id: "p1",
  profile_username: "perfil",
  format: "feed",
};
const row = (rel: CalendarScheduleRow["instagram_schedule_batches"]) =>
  ({
    id: "s1",
    attempt_id: "t1",
    scheduled_at: "2026-11-25T16:00:00Z",
    status: "published",
    results: [{ id: "m", permalink: "https://instagram.com/p/x" }],
    instagram_schedule_batches: rel,
  }) satisfies CalendarScheduleRow;
const attempt = {
  id: "t1",
  action_id: "a1",
  partner_id: "p1",
  profile_username: "perfil",
  format: "feed",
  status: "published",
  created_at: "2026-11-25T16:00:05Z",
  results: [],
};
const run = (rel: CalendarScheduleRow["instagram_schedule_batches"]) =>
  buildInstagramCalendarEvents({
    attempts: [attempt],
    schedules: [row(rel)],
    actions: new Map([["a1", { title: "Ação" }]]),
    partners: new Map([["p1", { title: "Parceiro" }]]),
  });

describe("calendário de publicações", () => {
  test("programação com relação em objeto aparece", () => {
    const events = run(batch);
    expect(events).toHaveLength(1);
    expect(events[0]?.id).toBe("schedule:s1");
    expect(events[0]?.permalinks).toEqual(["https://instagram.com/p/x"]);
  });
  test("relação em array também aparece", () => {
    expect(run([batch])).toHaveLength(1);
  });
  test("relação ausente não quebra", () => {
    expect(run(null)).toHaveLength(0);
  });
});
