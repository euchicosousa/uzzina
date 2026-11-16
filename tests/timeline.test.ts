import { describe, expect, it } from "bun:test";
import type { Action, Person } from "~/types";
import {
  TIMELINE_MIN_DURATION_MINUTES,
  TIMELINE_PX_PER_MINUTE,
  TIMELINE_STEP_MINUTES,
  TIMELINE_TOTAL_MINUTES,
  applyTimelineMinutesToDate,
  assignTimelineLanes,
  getActionDurationMinutes,
  getActionStartMinutes,
  getTimelinePeopleRows,
  moveTimelineInterval,
  resizeTimelineDuration,
  resizeTimelineStart,
  snapMinutesToStep,
} from "~/utils/timeline";

function makePerson(userId: string, name: string, admin = false): Person {
  return {
    id: `person-${userId}`,
    user_id: userId,
    name,
    surname: "Teste",
    short: name.slice(0, 2).toUpperCase(),
    initials: name.slice(0, 2).toUpperCase(),
    email: `${userId}@uzzina.test`,
    image: null,
    admin,
    areas: ["design"],
    visible: true,
    preferences: null,
    created_at: "2026-01-01T00:00:00.000Z",
  };
}

function makeAction(overrides: Partial<Action> & { id: string }): Action {
  return {
    title: `Action ${overrides.id}`,
    date: "2026-11-16 09:00:00",
    time: 30,
    phase: "do",
    priority: "medium",
    category: "post",
    color: "#666666",
    partners: ["partner-1"],
    responsibles: [],
    sprints: null,
    user_id: "u1",
    archived: false,
    description: null,
    content_description: null,
    content_files: null,
    work_files: null,
    instagram_caption: null,
    strategies: null,
    created_at: "2026-11-16T00:00:00.000Z",
    updated_at: "2026-11-16T00:00:00.000Z",
    ...overrides,
  };
}

describe("timeline constants", () => {
  it("exports the expected scale and step constants", () => {
    expect(TIMELINE_PX_PER_MINUTE).toBe(6);
    expect(TIMELINE_STEP_MINUTES).toBe(5);
    expect(TIMELINE_MIN_DURATION_MINUTES).toBe(10);
    expect(TIMELINE_TOTAL_MINUTES).toBe(1440);
  });
});

describe("getActionStartMinutes & getActionDurationMinutes", () => {
  it("extracts minutes since 00:00 using parseU", () => {
    expect(getActionStartMinutes("2026-11-16 00:00:00")).toBe(0);
    expect(getActionStartMinutes("2026-11-16 09:30:00")).toBe(570);
    expect(getActionStartMinutes("2026-11-16 23:55:00")).toBe(1435);
  });

  it("returns valid duration with a 10-minute minimum", () => {
    expect(getActionDurationMinutes(null)).toBe(10);
    expect(getActionDurationMinutes(undefined)).toBe(10);
    expect(getActionDurationMinutes(0)).toBe(10);
    expect(getActionDurationMinutes(-15)).toBe(10);
    expect(getActionDurationMinutes(3)).toBe(10);
    expect(getActionDurationMinutes(5)).toBe(10);
    expect(getActionDurationMinutes(10)).toBe(10);
    expect(getActionDurationMinutes(45)).toBe(45);
  });
});

describe("snapMinutesToStep", () => {
  it("snaps minutes to 5-minute steps by default", () => {
    expect(snapMinutesToStep(0)).toBe(0);
    expect(snapMinutesToStep(2)).toBe(0);
    expect(snapMinutesToStep(3)).toBe(5);
    expect(snapMinutesToStep(17)).toBe(15);
    expect(snapMinutesToStep(18)).toBe(20);
  });

  it("supports custom step sizes", () => {
    expect(snapMinutesToStep(22, 15)).toBe(15);
    expect(snapMinutesToStep(23, 15)).toBe(30);
  });
});

describe("moveTimelineInterval", () => {
  it("snaps delta and keeps duration unchanged", () => {
    expect(moveTimelineInterval(600, 30, 17)).toEqual({
      startMin: 615,
      durationMin: 30,
    });
  });

  it("clamps at 00:00 when moved before start of day", () => {
    expect(moveTimelineInterval(20, 30, -40)).toEqual({
      startMin: 0,
      durationMin: 30,
    });
  });

  it("clamps at 24:00 - durationMin when moved past end of day", () => {
    expect(moveTimelineInterval(1380, 60, 120)).toEqual({
      startMin: 1380,
      durationMin: 60,
    });
    expect(moveTimelineInterval(1400, 30, 50)).toEqual({
      startMin: 1410,
      durationMin: 30,
    });
  });
});

describe("resizeTimelineStart", () => {
  it("snaps start, adjusts duration, and keeps end fixed", () => {
    expect(resizeTimelineStart(60, 30, 12)).toEqual({
      startMin: 70,
      durationMin: 20,
    });
    expect(resizeTimelineStart(60, 30, -15)).toEqual({
      startMin: 45,
      durationMin: 45,
    });
  });

  it("clamps start >= 0 and enforces minimum 10-minute duration", () => {
    expect(resizeTimelineStart(10, 30, -50)).toEqual({
      startMin: 0,
      durationMin: 40,
    });
    expect(resizeTimelineStart(60, 30, 40)).toEqual({
      startMin: 80,
      durationMin: 10,
    });
  });
});

describe("resizeTimelineDuration", () => {
  it("snaps duration and keeps start fixed", () => {
    expect(resizeTimelineDuration(600, 30, 13)).toEqual({
      startMin: 600,
      durationMin: 45,
    });
  });

  it("enforces minimum 10-minute duration and end <= 1440", () => {
    expect(resizeTimelineDuration(600, 15, -30)).toEqual({
      startMin: 600,
      durationMin: 10,
    });
    expect(resizeTimelineDuration(1400, 30, 60)).toEqual({
      startMin: 1400,
      durationMin: 40,
    });
  });
});

describe("applyTimelineMinutesToDate", () => {
  it("preserves the calendar day and updates hour/minute", () => {
    expect(
      applyTimelineMinutesToDate("2026-11-16 09:00:00", 14 * 60 + 35),
    ).toBe("2026-11-16 14:35:00");
    expect(applyTimelineMinutesToDate("2026-11-16 22:15:00", 0)).toBe(
      "2026-11-16 00:00:00",
    );
    expect(applyTimelineMinutesToDate("2026-11-16 10:00:00", 1440)).toBe(
      "2026-11-16 23:59:00",
    );
  });
});

describe("assignTimelineLanes", () => {
  it("stacks overlapping intervals into separate lanes and reuses freed lanes", () => {
    const result = assignTimelineLanes([
      { id: "b", startMin: 600, durationMin: 30 },
      { id: "a", startMin: 580, durationMin: 60 },
      { id: "c", startMin: 630, durationMin: 20 },
      { id: "d", startMin: 610, durationMin: 30 },
    ]);

    expect(result.laneCount).toBe(3);
    expect(result.items.map((item) => [item.id, item.lane])).toEqual([
      ["a", 0], // 580-640 -> lane 0
      ["b", 1], // 600-630 -> lane 1
      ["d", 2], // 610-640 -> lane 2
      ["c", 1], // 630-650 -> reuses lane 1 (ended at 630)
    ]);
  });

  it("returns laneCount 1 for empty list", () => {
    expect(assignTimelineLanes([])).toEqual({ items: [], laneCount: 1 });
  });
});

describe("getTimelinePeopleRows", () => {
  const admin = makePerson("u1", "Admin", true);
  const memberA = makePerson("u2", "Alice", false);
  const memberB = makePerson("u3", "Bruno", false);
  const people = [memberA, admin, memberB];

  const actions = [
    makeAction({ id: "a1", user_id: "u1", responsibles: ["u2", "u3"] }),
    makeAction({ id: "a2", user_id: "u2", responsibles: [] }),
    makeAction({ id: "a3", user_id: "u1", responsibles: ["u1"] }),
  ];

  it("returns only currentPerson for non-admins and ignores selectedUserIds", () => {
    const rows = getTimelinePeopleRows(people, actions, memberA, ["u1", "u3"]);
    expect(rows.map((r) => r.person.user_id)).toEqual(["u2"]);
    expect(rows[0]?.actions.map((a) => a.id)).toEqual(["a1", "a2"]);
  });

  it("returns empty array when currentPerson is null", () => {
    expect(getTimelinePeopleRows(people, actions, null)).toEqual([]);
  });

  it("orders admin first and filters by selectedUserIds when provided", () => {
    const allRows = getTimelinePeopleRows(people, actions, admin);
    expect(allRows.map((r) => r.person.user_id)).toEqual(["u1", "u2", "u3"]);
    expect(allRows[0]?.actions.map((a) => a.id)).toEqual(["a3"]);
    expect(allRows[1]?.actions.map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(allRows[2]?.actions.map((a) => a.id)).toEqual(["a1"]);

    const filteredRows = getTimelinePeopleRows(people, actions, admin, [
      "u3",
      "u1",
    ]);
    expect(filteredRows.map((r) => r.person.user_id)).toEqual(["u1", "u3"]);
  });
});
