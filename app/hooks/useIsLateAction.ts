import { useEffect, useState } from "react";
import { PHASES } from "~/lib/CONSTANTS";
import type { Action } from "~/types";
import { isLateAction } from "~/utils";

// setTimeout overflows above 2^31 - 1 ms (~24.8 days)
const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * Returns whether the action is late and re-renders once its date passes,
 * so an action already on screen turns late without waiting for a refetch.
 */
export function useIsLateAction(action: Action) {
  const [, setTick] = useState(0);
  const isLate = isLateAction(action);
  const watch = !isLate && action.phase !== PHASES.finished.slug;

  useEffect(() => {
    if (!watch) return;
    const dueAt = new Date(action.date).getTime();
    if (Number.isNaN(dueAt)) return;
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const remaining = dueAt - Date.now();
      // Long delays are chunked; re-render only once the date has passed
      if (remaining >= MAX_TIMEOUT_MS) {
        timeout = setTimeout(schedule, MAX_TIMEOUT_MS);
        return;
      }
      // +1 ms because isLateAction requires the date to be strictly before now
      timeout = setTimeout(
        () => setTick((value) => value + 1),
        Math.max(remaining, 0) + 1,
      );
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [watch, action.date]);

  return isLate;
}
