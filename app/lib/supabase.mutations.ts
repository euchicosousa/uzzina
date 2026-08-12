import type { Action } from "~/types";
import { format } from "date-fns";
import { createSupabaseBrowserClient } from "./supabase.client";
import { ActionFormSchema, type ActionFormInput } from "~/utils/validation";
import { PHASES } from "./CONSTANTS";
import type { Tables, TablesInsert, TablesUpdate } from "types/database";
export type ActionComment = Tables<"action_comments">;
export type AugmentedComment = ActionComment & {
  author_image: string | null;
};

// ─── Action Mutations ────────────────────────────────────────────────────────

/**
 * Create a new action directly via browser Supabase client.
 * Runs Zod validation (same schema as the server) before inserting.
 */
export async function createActionClient(
  actionData: ActionFormInput,
): Promise<Action> {
  const result = ActionFormSchema.safeParse(actionData);
  if (!result.success) {
    throw new Error(
      `Validação falhou: ${JSON.stringify(result.error.flatten().fieldErrors)}`,
    );
  }
  const insertData = {
    ...result.data,
  };
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .insert(insertData as TablesInsert<"actions">)
    .select()
    .single();
  if (error) throw error;
  return data as Action;
}

/**
 * Update an existing action directly via browser Supabase client.
 * Applies the same business rules as the server:
 *   - phase = finished → sprints = null
 *   - archived = true   → sprints = null
 */
export async function updateActionClient(
  id: string,
  actionData: ActionFormInput,
): Promise<Action> {
  const result = ActionFormSchema.safeParse(actionData);
  if (!result.success) {
    throw new Error(
      `Validação falhou: ${JSON.stringify(result.error.flatten().fieldErrors)}`,
    );
  }
  const { strategies, ...rest } = result.data;
  const updateData = {
    ...rest,
    ...(strategies !== undefined ? { strategies } : {}),
    updated_at: new Date().toISOString(),
  } as TablesUpdate<"actions">;
  if (updateData.phase === PHASES.finished.slug) {
    updateData.sprints = null;
  }
  if (updateData.archived === true) {
    updateData.sprints = null;
  }
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Action;
}

/**
 * Duplicate an action: fetch original, strip id/timestamps, insert as new.
 */
export async function duplicateActionClient(id: string): Promise<Action> {
  const supabase = createSupabaseBrowserClient();
  const { data: original, error: fetchError } = await supabase
    .from("actions")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  const { id: _id, created_at, updated_at, ...rest } = original as Action;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("actions")
    .insert({
      ...rest,
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

/**
 * Bulk update multiple actions with arbitrary fields.
 */
export async function bulkUpdateActionsClient(
  ids: string[],
  updates: Partial<Action>,
): Promise<Action[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .select();
  if (error) throw error;
  return data as Action[];
}

/**
 * Change only the DATE part of N actions, preserving each action's original time.
 * @param newDate - "yyyy-MM-dd"
 */
export async function bulkUpdateDateOnlyClient(
  ids: string[],
  newDate: string,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .select("id, date")
    .in("id", ids);
  if (error) throw error;
  await Promise.all(
    (
      data as {
        id: string;
        date: string;
      }[]
    ).map(({ id, date }) => {
      const existingTime = format(new Date(date.replace(" ", "T")), "HH:mm:ss");
      return supabase
        .from("actions")
        .update({
          date: `${newDate} ${existingTime}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }),
  );
}

/**
 * Change only the TIME part of N actions, preserving each action's original date.
 * @param newTime - "HH:mm"
 */
export async function bulkUpdateTimeOnlyClient(
  ids: string[],
  newTime: string,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .select("id, date")
    .in("id", ids);
  if (error) throw error;
  await Promise.all(
    (
      data as {
        id: string;
        date: string;
      }[]
    ).map(({ id, date }) => {
      const existingDate = format(
        new Date(date.replace(" ", "T")),
        "yyyy-MM-dd",
      );
      return supabase
        .from("actions")
        .update({
          date: `${existingDate} ${newTime}:00`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    }),
  );
}
