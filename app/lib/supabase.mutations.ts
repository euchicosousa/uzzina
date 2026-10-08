import type { Action } from "~/types";
import { format } from "date-fns";
import { createSupabaseBrowserClient } from "./supabase.client";
import {
  ActionCreateSchema,
  ActionPatchSchema,
  type ActionCreateInput,
  type ActionPatchInput,
} from "~/utils/validation";
import { PHASES } from "./CONSTANTS";
import type { Tables, TablesInsert, TablesUpdate } from "types/database";
export type ActionComment = Tables<"action_comments">;
export type AugmentedComment = ActionComment & {
  author_image: string | null;
};

// ─── Action Mutations ────────────────────────────────────────────────────────

/**
 * Create a new action directly via browser Supabase client.
 * Runs Zod validation before inserting.
 */
export async function createActionClient(
  actionData: ActionCreateInput,
): Promise<Action> {
  const result = ActionCreateSchema.safeParse(actionData);
  if (!result.success) {
    throw new Error(
      `Validação falhou: ${JSON.stringify(result.error.flatten().fieldErrors)}`,
    );
  }
  const supabase = createSupabaseBrowserClient();
  let userId = result.data.user_id;
  if (!userId) {
    const { data: authData } = await supabase.auth.getUser();
    userId = authData.user?.id;
  }
  // The current schema requires initial timestamps; updates use the database version.
  const now = new Date().toISOString();
  const insertData: TablesInsert<"actions"> = {
    ...result.data,
    color: result.data.color ?? undefined,
    time: result.data.time ?? undefined,
    strategies: result.data.strategies as TablesInsert<"actions">["strategies"],
    created_at: now,
    updated_at: now,
    ...(userId ? { user_id: userId } : {}),
  };
  const { data, error } = await supabase
    .from("actions")
    .insert(insertData)
    .select()
    .single();
  if (error) {
    console.error("Erro ao criar ação no Supabase:", error);
    throw new Error(error.message || "Erro ao criar ação no banco de dados.");
  }
  return data as Action;
}

export async function readActionClient(id: string): Promise<Action> {
  const { data, error } = await createSupabaseBrowserClient()
    .from("actions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  if (!data) throw new Error("A ação não está disponível.");
  return data as Action;
}

export class ActionConflictError extends Error {
  readonly code = "ACTION_CONFLICT";
  constructor(message = "Esta ação mudou. Recarregue antes de salvar") {
    super(message);
    this.name = "ActionConflictError";
  }
}

/**
 * Update an existing action directly via browser Supabase client with optimistic concurrency.
 * Uses ActionPatchSchema so omitted fields remain untouched on the database.
 * Requires expectedUpdatedAt canonical version string.
 * Applies the same business rules as the server:
 *   - phase = finished → sprints = null
 *   - archived = true   → sprints = null
 */
export async function updateActionClient(
  id: string,
  actionData: ActionPatchInput,
  expectedUpdatedAt: string,
): Promise<Action> {
  if (!id || typeof id !== "string") {
    throw new Error("ID da ação é obrigatório para atualização.");
  }
  if (!expectedUpdatedAt || typeof expectedUpdatedAt !== "string") {
    throw new Error(
      "expectedUpdatedAt é obrigatório para atualização de ação.",
    );
  }

  const result = ActionPatchSchema.safeParse(actionData);
  if (!result.success) {
    throw new Error(
      `Validação falhou: ${JSON.stringify(result.error.flatten().fieldErrors)}`,
    );
  }
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(result.data)) {
    if (value !== undefined && key !== "updated_at" && key !== "created_at") {
      updateData[key] = value;
    }
  }

  if (updateData.phase === PHASES.finished.slug) {
    updateData.sprints = null;
  }
  if (updateData.archived === true) {
    updateData.sprints = null;
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .update(updateData as TablesUpdate<"actions">)
    .eq("id", id)
    .eq("updated_at", expectedUpdatedAt)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new ActionConflictError();
    }
    throw error;
  }
  if (!data) {
    throw new ActionConflictError();
  }
  return data as Action;
}

/**
 * Duplicate an action: fetch original, strip id/timestamps, insert as new.
 */
export async function duplicateActionClient(
  id: string,
  beforeWrite?: () => void,
): Promise<Action> {
  const supabase = createSupabaseBrowserClient();
  const { data: original, error: fetchError } = await supabase
    .from("actions")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  beforeWrite?.();
  const { id: _id, created_at, updated_at, ...rest } = original as Action;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("actions")
    .insert({
      ...rest,
      title: `${rest.title} (Cópia)`,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Action;
}

/**
 * Delete (archive) an action by ID.
 */
export async function deleteActionClient(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("actions").delete().eq("id", id);
  if (error) throw error;
}

export type BulkActionResult = {
  succeededIds: string[];
  failed: { id: string; reason: string }[];
  conflicts: { id: string }[];
};

// Every item uses the same validated, version-checked update as individual editing.
async function updateBulkActions(
  actions: Action[],
  patch: (action: Action) => ActionPatchInput,
  onConfirmed?: (action: Action) => void,
  beforeWrite?: () => void,
): Promise<BulkActionResult> {
  const result: BulkActionResult = {
    succeededIds: [],
    failed: [],
    conflicts: [],
  };
  const unique = [
    ...new Map(actions.map((action) => [action.id, action])).values(),
  ];
  for (const action of unique) {
    try {
      beforeWrite?.();
      const confirmed = await updateActionClient(
        action.id,
        patch(action),
        action.updated_at,
      );
      result.succeededIds.push(confirmed.id);
      onConfirmed?.(confirmed);
    } catch (error) {
      if (error instanceof ActionConflictError)
        result.conflicts.push({ id: action.id });
      else
        result.failed.push({
          id: action.id,
          reason:
            error instanceof Error
              ? error.message
              : typeof error === "object" &&
                  error !== null &&
                  "message" in error
                ? String(error.message)
                : "Não foi possível salvar esta ação.",
        });
    }
  }
  return result;
}

export function bulkUpdateActionsClient(
  actions: Action[],
  updates: ActionPatchInput,
  onConfirmed?: (action: Action) => void,
  beforeWrite?: () => void,
) {
  return updateBulkActions(actions, () => updates, onConfirmed, beforeWrite);
}

export function bulkUpdateDateOnlyClient(
  actions: Action[],
  newDate: string,
  onConfirmed?: (action: Action) => void,
  beforeWrite?: () => void,
) {
  return updateBulkActions(
    actions,
    (action) => ({
      date: `${newDate} ${format(new Date(action.date.replace(" ", "T")), "HH:mm:ss")}`,
    }),
    onConfirmed,
    beforeWrite,
  );
}

export function bulkUpdateTimeOnlyClient(
  actions: Action[],
  newTime: string,
  onConfirmed?: (action: Action) => void,
  beforeWrite?: () => void,
) {
  return updateBulkActions(
    actions,
    (action) => ({
      date: `${format(new Date(action.date.replace(" ", "T")), "yyyy-MM-dd")} ${newTime}:00`,
    }),
    onConfirmed,
    beforeWrite,
  );
}
