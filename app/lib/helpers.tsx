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

// ─── toggleSprintAction ──────────────────────────────────────────────────────
// Removed: use useActionMutations() hook instead.

export { createSupabaseClient } from "./supabase";


