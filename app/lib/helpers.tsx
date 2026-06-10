import type { QueryClient } from "@tanstack/react-query";
import { INTENT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import {
  createActionClient,
  updateActionClient,
  duplicateActionClient,
  deleteActionClient,
  bulkUpdateActionsClient,
  bulkUpdateDateOnlyClient,
  bulkUpdateTimeOnlyClient,
} from "~/lib/supabase.mutations";
import { QUERY_KEYS } from "~/lib/query-keys";

export * from "~/utils/date";
export * from "~/utils/format";
export * from "~/utils/validation";
export * from "~/utils/factory";
export * from "~/utils/sort";
export * from "~/utils/filter";
export * from "~/components/uzzina/UIIcons";

// ─── Cache invalidation ───────────────────────────────────────────────────────

function invalidateActions(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.actions.all() });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lateActions.all() });
}

// ─── handleAction ─────────────────────────────────────────────────────────────

/**
 * Dispatch a single action mutation directly to Supabase (client-side).
 * Replaces the old server-route submit pattern.
 *
 * Supported intents: create_action, update_action, duplicate_action, delete_action.
 */
export async function handleAction(
  data: any,
  queryClient: QueryClient,
): Promise<void> {
  const { intent, id, ...values } = data as any;

  try {
    if (intent === INTENT.create_action) {
      await createActionClient(values);
    } else if (intent === INTENT.update_action) {
      if (id) await updateActionClient(String(id), values);
    } else if (intent === INTENT.duplicate_action) {
      if (id) await duplicateActionClient(String(id));
    } else if (intent === INTENT.delete_action) {
      if (id) await deleteActionClient(String(id));
    }
  } finally {
    invalidateActions(queryClient);
  }
}

// ─── handleBulkAction ────────────────────────────────────────────────────────

/**
 * Apply arbitrary field updates to a list of action IDs.
 */
export async function handleBulkAction(
  ids: string[],
  updates: Record<string, any>,
  queryClient: QueryClient,
): Promise<void> {
  if (ids.length === 0) return;
  try {
    await bulkUpdateActionsClient(ids, updates);
  } finally {
    invalidateActions(queryClient);
  }
}

/**
 * Bulk-update only the DATE part of N actions (preserving original time).
 * @param newDate - "yyyy-MM-dd"
 */
export async function handleBulkDateOnly(
  ids: string[],
  newDate: string,
  queryClient: QueryClient,
): Promise<void> {
  if (ids.length === 0) return;
  try {
    await bulkUpdateDateOnlyClient(ids, newDate);
  } finally {
    invalidateActions(queryClient);
  }
}

/**
 * Bulk-update only the TIME part of N actions (preserving original date).
 * @param newTime - "HH:mm"
 */
export async function handleBulkTimeOnly(
  ids: string[],
  newTime: string,
  queryClient: QueryClient,
): Promise<void> {
  if (ids.length === 0) return;
  try {
    await bulkUpdateTimeOnlyClient(ids, newTime);
  } finally {
    invalidateActions(queryClient);
  }
}

// ─── toggleSprintAction ──────────────────────────────────────────────────────

/**
 * Toggles the given userId in/out of the action's sprints array.
 */
export async function toggleSprintAction(
  action: Action,
  userId: string,
  queryClient: QueryClient,
): Promise<void> {
  let sprints: string[] | null = null;
  if (action.sprints) {
    if (action.sprints.includes(userId)) {
      sprints = action.sprints.filter((s) => s !== userId);
    } else {
      sprints = [...action.sprints, userId];
    }
  } else {
    sprints = [userId];
  }
  sprints = sprints.length > 0 ? sprints : null;

  await handleAction(
    { ...action, intent: INTENT.update_action, sprints },
    queryClient,
  );
}

/**
 * Archives an action (sets archived: true) instead of deleting it.
 */
export async function submitDeleteAction(
  action: Action,
  queryClient: QueryClient,
): Promise<void> {
  await handleAction(
    { ...action, intent: INTENT.update_action, archived: true },
    queryClient,
  );
}

export { createSupabaseClient } from "./supabase";

