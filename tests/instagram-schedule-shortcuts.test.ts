import { describe, expect, test } from "bun:test";
import {
  getScheduleShortcuts,
  pickPartnerPostTime,
} from "../app/lib/instagram-schedule-shortcuts";

const LEAD = 2 * 60_000;
const at = (h: number, m: number, s = 0) => new Date(2026, 10, 25, h, m, s);
const ids = (list: { id: string }[]) => list.map((item) => item.id);

describe("atalhos de programação", () => {
  test("antes do horário de hoje mostra os três atalhos", () => {
    const list = getScheduleShortcuts({
      now: at(10, 0, 30),
      postTime: "17:00",
      minimumLeadMs: LEAD,
    });
    expect(ids(list)).toEqual(["soon", "today", "tomorrow"]);
    expect(list[0]?.date).toEqual(at(10, 3));
    expect(list[1]?.label).toBe("Hoje 17:00");
    expect(list[2]?.date).toEqual(new Date(2026, 10, 26, 17, 0));
  });
  test("depois do horário de hoje omite 'Hoje'", () => {
    const list = getScheduleShortcuts({
      now: at(17, 30),
      postTime: "17:00",
      minimumLeadMs: LEAD,
    });
    expect(ids(list)).toEqual(["soon", "tomorrow"]);
  });
  test("horário a menos de 2 min no futuro omite 'Hoje'", () => {
    const list = getScheduleShortcuts({
      now: at(16, 59),
      postTime: "17:00",
      minimumLeadMs: LEAD,
    });
    expect(ids(list)).toEqual(["soon", "tomorrow"]);
  });
  test("virada de dia e de mês", () => {
    const list = getScheduleShortcuts({
      now: new Date(2026, 10, 30, 23, 59),
      postTime: "08:00",
      minimumLeadMs: LEAD,
    });
    expect(list[0]?.date).toEqual(new Date(2026, 11, 1, 0, 1));
    expect(list.at(-1)?.date).toEqual(new Date(2026, 11, 1, 8, 0));
  });
  test("sem horário só mostra 'Daqui a 2 min'", () => {
    const list = getScheduleShortcuts({
      now: at(10, 0),
      postTime: null,
      minimumLeadMs: LEAD,
    });
    expect(ids(list)).toEqual(["soon"]);
  });
  test("stories usa o horário de stories; feed, vídeo e reel usam o do feed", () => {
    const times = { feedTime: "17:00:00", storiesTime: "08:00" };
    expect(pickPartnerPostTime("stories", times)).toBe("08:00");
    expect(pickPartnerPostTime("feed", times)).toBe("17:00");
    expect(pickPartnerPostTime("reel", times)).toBe("17:00");
    expect(pickPartnerPostTime("video", times)).toBe("17:00");
    expect(pickPartnerPostTime("feed", {})).toBeNull();
  });
});
