import {
  addMinutes,
  format,
  isToday,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns";
import { PHASES, PRIORITIES } from "~/lib/CONSTANTS";
import type { Action } from "~/types";
import { DEFAULT_ACTION_COLOR } from "~/utils/uzzina-utils";

export const getCleanAction = ({
  user_id,
  date,
  partners,
}: {
  user_id: string;
  date?: Date;
  partners?: string[];
}) => {
  const now = new Date();
  const targetDate = date ? new Date(date) : now;

  let finalDate: Date;

  if (isToday(targetDate)) {
    if (now.getHours() < 11) {
      finalDate = setMilliseconds(
        setSeconds(setMinutes(setHours(targetDate, 11), 0), 0),
        0,
      );
    } else {
      finalDate = addMinutes(now, 10);
    }
  } else {
    finalDate = setMilliseconds(
      setSeconds(setMinutes(setHours(targetDate, 11), 0), 0),
      0,
    );
  }

  const _date = format(finalDate, "yyyy-MM-dd HH:mm:ss");

  return {
    title: "",
    description: "",
    phase: PHASES.idea.slug,
    priority: PRIORITIES.medium.slug,
    category: "post",
    responsibles: [user_id],
    color: DEFAULT_ACTION_COLOR,
    date: _date,
    partners: partners || [],
    time: 10,
    archived: false,
  };
};

/**
 * Resolves which partners a new action draft starts with: the partner of the
 * current route wins, then a single active partner filter, otherwise none.
 */
export function resolveDraftPartners({
  routeSlug,
  pathname,
  partnerFilters,
}: {
  routeSlug?: string | null;
  pathname?: string;
  partnerFilters: string[];
}): string[] {
  const pathSlug = pathname?.startsWith("/app/partner/")
    ? pathname
        .replace(/^\/app\/partner\//, "")
        .split("/")[0]
        ?.split("?")[0]
    : undefined;
  const slug = routeSlug || pathSlug;
  if (slug) return [slug];
  return partnerFilters.length === 1 ? [partnerFilters[0]] : [];
}

/**
 * Single entry point for "Nova ação" drafts. A draft has no `id`, `created_at`
 * or `updated_at`; the drawer fills the timestamps locally and the server
 * assigns the canonical row. The cast is confined here on purpose.
 */
export function createActionDraft({
  userId,
  date,
  partners,
  responsibles,
  category,
}: {
  userId: string;
  date?: Date;
  partners?: string[];
  responsibles?: string[];
  category?: string;
}): Action {
  const base = getCleanAction({ user_id: userId, date, partners });
  return {
    ...base,
    ...(responsibles ? { responsibles } : {}),
    ...(category ? { category } : {}),
  } as unknown as Action;
}
