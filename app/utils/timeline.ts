import { format } from "date-fns";
import { PHASES } from "~/lib/CONSTANTS";
import type { Action, Person } from "~/types";
import { parseU } from "~/utils/date";

export const TIMELINE_PX_PER_MINUTE = 6;
export const TIMELINE_STEP_MINUTES = 5;
export const TIMELINE_MIN_DURATION_MINUTES = 10;
export const TIMELINE_TOTAL_MINUTES = 24 * 60;

export const TIMELINE_AUTOSCROLL_EDGE_PX = 64;
export const TIMELINE_AUTOSCROLL_MIN_SPEED_PX_PER_SEC = 180;
export const TIMELINE_AUTOSCROLL_MAX_SPEED_PX_PER_SEC = 1080;

const TIMELINE_HALF_HOUR_MARKS = [30] as const;
const TIMELINE_QUARTER_HOUR_MARKS = [15, 30, 45] as const;
const TIMELINE_TEN_MINUTE_MARKS = [10, 20, 30, 40, 50] as const;
const TIMELINE_EMPTY_MINUTE_MARKS = [] as const;

export interface TimelineInterval {
  startMin: number;
  durationMin: number;
}

export interface TimelinePersonRow {
  person: Person;
  actions: Action[];
}

export function getActionStartMinutes(dateStr: string): number {
  const parsed = parseU(dateStr);
  if (Number.isNaN(parsed.getTime())) return 0;
  return parsed.getHours() * 60 + parsed.getMinutes();
}

export function getActionDurationMinutes(time?: number | null): number {
  if (typeof time !== "number" || !Number.isFinite(time) || time <= 0) {
    return TIMELINE_MIN_DURATION_MINUTES;
  }
  return Math.max(TIMELINE_MIN_DURATION_MINUTES, Math.round(time));
}

export function snapMinutesToStep(
  minutes: number,
  step: number = TIMELINE_STEP_MINUTES,
): number {
  const safeStep =
    Number.isFinite(step) && step > 0 ? step : TIMELINE_STEP_MINUTES;
  const snapped = Math.round(minutes / safeStep) * safeStep;
  return snapped === 0 ? 0 : snapped;
}

export function moveTimelineInterval(
  startMin: number,
  durationMin: number,
  deltaMin: number,
): TimelineInterval {
  const clampedDuration = Math.max(
    TIMELINE_MIN_DURATION_MINUTES,
    Math.min(TIMELINE_TOTAL_MINUTES, durationMin),
  );
  const maxStart = Math.max(0, TIMELINE_TOTAL_MINUTES - clampedDuration);
  const nextStart = Math.max(
    0,
    Math.min(maxStart, snapMinutesToStep(startMin + deltaMin)),
  );
  return {
    startMin: nextStart,
    durationMin: clampedDuration,
  };
}

export function resizeTimelineStart(
  startMin: number,
  durationMin: number,
  deltaMin: number,
): TimelineInterval {
  const endMin = Math.min(TIMELINE_TOTAL_MINUTES, startMin + durationMin);
  const maxStart = Math.max(0, endMin - TIMELINE_MIN_DURATION_MINUTES);
  const nextStart = Math.max(
    0,
    Math.min(maxStart, snapMinutesToStep(startMin + deltaMin)),
  );
  return {
    startMin: nextStart,
    durationMin: Math.max(TIMELINE_MIN_DURATION_MINUTES, endMin - nextStart),
  };
}

export function resizeTimelineDuration(
  startMin: number,
  durationMin: number,
  deltaMin: number,
): TimelineInterval {
  const clampedStart = Math.max(
    0,
    Math.min(TIMELINE_TOTAL_MINUTES - TIMELINE_MIN_DURATION_MINUTES, startMin),
  );
  const maxDuration = TIMELINE_TOTAL_MINUTES - clampedStart;
  const nextDuration = Math.max(
    TIMELINE_MIN_DURATION_MINUTES,
    Math.min(maxDuration, snapMinutesToStep(durationMin + deltaMin)),
  );
  return {
    startMin: clampedStart,
    durationMin: nextDuration,
  };
}

export function applyTimelineMinutesToDate(
  dateStr: string,
  newStartMin: number,
): string {
  const base = parseU(dateStr);
  const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
  const clampedMinutes = Math.max(
    0,
    Math.min(TIMELINE_TOTAL_MINUTES - 1, Math.round(newStartMin)),
  );
  const hours = Math.floor(clampedMinutes / 60);
  const minutes = clampedMinutes % 60;
  const updated = new Date(
    safeBase.getFullYear(),
    safeBase.getMonth(),
    safeBase.getDate(),
    hours,
    minutes,
    0,
    0,
  );
  return format(updated, "yyyy-MM-dd HH:mm:ss");
}

export function formatTimelineMinutes(totalMinutes: number): string {
  const clamped = Math.max(
    0,
    Math.min(TIMELINE_TOTAL_MINUTES, Math.round(totalMinutes)),
  );
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${String(hours).padStart(2, "0")}h${String(minutes).padStart(2, "0")}`;
}

export function assignTimelineLanes<T extends TimelineInterval>(
  items: T[],
): { items: Array<T & { lane: number }>; laneCount: number } {
  const sorted = [...items].sort(
    (a, b) => a.startMin - b.startMin || b.durationMin - a.durationMin,
  );
  const laneEnds: number[] = [];
  const lanedItems: Array<T & { lane: number }> = [];

  for (const item of sorted) {
    let assignedLane = laneEnds.findIndex((end) => end <= item.startMin);
    if (assignedLane === -1) {
      assignedLane = laneEnds.length;
      laneEnds.push(item.startMin + item.durationMin);
    } else {
      laneEnds[assignedLane] = item.startMin + item.durationMin;
    }
    lanedItems.push({ ...item, lane: assignedLane });
  }

  return {
    items: lanedItems,
    laneCount: Math.max(1, laneEnds.length),
  };
}

export function getTimelinePeopleRows(
  people: Person[],
  actions: Action[],
  currentPerson: Person | null,
  selectedUserIds?: string[],
): TimelinePersonRow[] {
  let orderedPeople: Person[];

  if (!currentPerson?.admin) {
    orderedPeople = currentPerson ? [currentPerson] : [];
  } else {
    const selectedSet =
      selectedUserIds !== undefined ? new Set(selectedUserIds) : null;
    const currentInPeople = people.find(
      (p) => p.user_id === currentPerson.user_id,
    );
    const others = people.filter((p) => p.user_id !== currentPerson.user_id);
    const combined = currentInPeople
      ? [currentInPeople, ...others]
      : [currentPerson, ...others];
    orderedPeople = selectedSet
      ? combined.filter((p) => selectedSet.has(p.user_id))
      : combined;
  }

  const actionsByUserId = new Map<string, Action[]>();
  for (const action of actions) {
    const targetUserIds =
      action.responsibles && action.responsibles.length > 0
        ? action.responsibles
        : [action.user_id];

    for (const userId of new Set(targetUserIds)) {
      const list = actionsByUserId.get(userId);
      if (list) {
        list.push(action);
      } else {
        actionsByUserId.set(userId, [action]);
      }
    }
  }

  return orderedPeople.map((person) => ({
    person,
    actions: actionsByUserId.get(person.user_id) ?? [],
  }));
}

/**
 * Selects a single minute-label cadence per zoom band so minute marks stay
 * subordinate to hour labels without overlapping at any width or zoom level.
 */
export function getTimelineMinuteMarks(hourWidth: number): readonly number[] {
  if (!Number.isFinite(hourWidth) || hourWidth <= 0) {
    return TIMELINE_EMPTY_MINUTE_MARKS;
  }
  if (hourWidth / 6 >= 64) {
    return TIMELINE_TEN_MINUTE_MARKS;
  }
  if (hourWidth / 4 >= 56) {
    return TIMELINE_QUARTER_HOUR_MARKS;
  }
  if (hourWidth / 2 >= 56) {
    return TIMELINE_HALF_HOUR_MARKS;
  }
  return TIMELINE_EMPTY_MINUTE_MARKS;
}

export function isTimelineLabelOverlappingNow(
  labelLeftPx: number,
  labelWidthPx: number,
  nowLeftPx: number,
  nowHalfWidthPx = 50,
): boolean {
  return (
    labelLeftPx < nowLeftPx + nowHalfWidthPx &&
    labelLeftPx + labelWidthPx > nowLeftPx - nowHalfWidthPx
  );
}

/**
 * Returns horizontal auto-scroll speed (px/s) while dragging near the visible
 * track edges. Negative scrolls left, positive scrolls right, 0 means idle.
 */
export function getTimelineAutoScrollSpeed(
  pointerClientX: number,
  visibleLeftPx: number,
  visibleRightPx: number,
): number {
  const visibleWidth = visibleRightPx - visibleLeftPx;
  if (!Number.isFinite(visibleWidth) || visibleWidth <= 0) {
    return 0;
  }

  const edgeZone = Math.min(TIMELINE_AUTOSCROLL_EDGE_PX, visibleWidth / 4);
  if (edgeZone <= 0) {
    return 0;
  }

  const leftBoundary = visibleLeftPx + edgeZone;
  if (pointerClientX < leftBoundary) {
    const ratio = Math.min(
      1,
      Math.max(0, (leftBoundary - pointerClientX) / edgeZone),
    );
    return -(
      TIMELINE_AUTOSCROLL_MIN_SPEED_PX_PER_SEC +
      (TIMELINE_AUTOSCROLL_MAX_SPEED_PX_PER_SEC -
        TIMELINE_AUTOSCROLL_MIN_SPEED_PX_PER_SEC) *
        ratio *
        ratio
    );
  }

  const rightBoundary = visibleRightPx - edgeZone;
  if (pointerClientX > rightBoundary) {
    const ratio = Math.min(
      1,
      Math.max(0, (pointerClientX - rightBoundary) / edgeZone),
    );
    return (
      TIMELINE_AUTOSCROLL_MIN_SPEED_PX_PER_SEC +
      (TIMELINE_AUTOSCROLL_MAX_SPEED_PX_PER_SEC -
        TIMELINE_AUTOSCROLL_MIN_SPEED_PX_PER_SEC) *
        ratio *
        ratio
    );
  }

  return 0;
}

/**
 * Selects timeline items considered by "Fit camera". When `includeFinished` is
 * false, excludes actions in `finished` phase (keeping `done` among open work)
 * and falls back to all items if every visible action is already `finished`.
 */
export function getTimelineFitActions<
  T extends { action: Pick<Action, "phase"> },
>(items: readonly T[], includeFinished: boolean): T[] {
  if (includeFinished || items.length === 0) {
    return [...items];
  }
  const openItems = items.filter(
    (item) => item.action.phase !== PHASES.finished.slug,
  );
  return openItems.length > 0 ? openItems : [...items];
}
