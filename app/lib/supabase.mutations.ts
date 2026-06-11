import { format } from "date-fns";
import { createSupabaseBrowserClient } from "./supabase.client";
import { ActionFormSchema, type ActionFormInput } from "~/utils/validation";
import { PHASES } from "./CONSTANTS";
import type { Action } from "~/models/actions.server";
import type { Tables, TablesInsert, TablesUpdate } from "types/database";

export type ActionComment = Tables<"action_comments">;
export type AugmentedComment = ActionComment & { author_image: string | null };

// ─── Action Mutations ────────────────────────────────────────────────────────

/**
 * Create a new action directly via browser Supabase client.
 * Runs Zod validation (same schema as the server) before inserting.
 */
export async function createActionClient(actionData: ActionFormInput): Promise<Action> {
  const result = ActionFormSchema.safeParse(actionData);
  if (!result.success) {
    throw new Error(
      "Validação falhou: " +
        JSON.stringify(result.error.flatten().fieldErrors),
    );
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .insert(result.data as TablesInsert<"actions">)
    .select()
    .single();

  if (error) throw error;
  return data as Action;
}

/**
 * Update an existing action directly via browser Supabase client.
 * Applies the same business rules as the server:
 *   - phase = concluido → sprints = null
 *   - archived = true   → sprints = null
 */
export async function updateActionClient(
  id: string,
  actionData: ActionFormInput,
): Promise<Action> {
  const result = ActionFormSchema.safeParse(actionData);
  if (!result.success) {
    throw new Error(
      "Validação falhou: " +
        JSON.stringify(result.error.flatten().fieldErrors),
    );
  }

  const updateData = { ...result.data };

  if (updateData.phase === PHASES.concluido.slug) {
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
    .insert({ ...rest, created_at: now, updated_at: now })
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
    .update(updates)
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
    (data as { id: string; date: string }[]).map(({ id, date }) => {
      const existingTime = format(new Date(date.replace(" ", "T")), "HH:mm:ss");
      return supabase
        .from("actions")
        .update({ date: `${newDate} ${existingTime}` })
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
    (data as { id: string; date: string }[]).map(({ id, date }) => {
      const existingDate = format(
        new Date(date.replace(" ", "T")),
        "yyyy-MM-dd",
      );
      return supabase
        .from("actions")
        .update({ date: `${existingDate} ${newTime}:00` })
        .eq("id", id);
    }),
  );
}

// ─── Comment Mutations ───────────────────────────────────────────────────────

/**
 * Fetch all comments for an action, augmented with author images.
 */
export async function fetchAllCommentsByActionClient(
  actionId: string,
): Promise<AugmentedComment[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("action_comments")
    .select("*")
    .eq("action_id", actionId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const comments = data as ActionComment[];
  if (!comments.length) return [];

  const userIds = comments.filter((c) => c.is_user).map((c) => c.author_id);
  const clientIds = comments.filter((c) => !c.is_user).map((c) => c.author_id);

  const [usersRes, clientsRes] = await Promise.all([
    userIds.length > 0
      ? supabase.from("people").select("user_id, image").in("user_id", userIds)
      : Promise.resolve({ data: [] }),
    clientIds.length > 0
      ? supabase.from("clients").select("id, image").in("id", clientIds)
      : Promise.resolve({ data: [] }),
  ]);

  const imageMap = new Map<string, string | null>();
  (usersRes.data ?? []).forEach((u) => {
    if (u.image) imageMap.set(u.user_id, u.image);
  });
  (clientsRes.data ?? []).forEach((c) => {
    if (c.image) imageMap.set(c.id, c.image);
  });

  return comments.map((c) => ({
    ...c,
    author_image: imageMap.get(c.author_id) ?? null,
  }));
}

/**
 * Create a new comment on an action.
 */
export async function createCommentClient(data: {
  action_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_internal?: boolean;
  is_user?: boolean;
}): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("action_comments").insert({
    action_id: data.action_id,
    author_id: data.author_id,
    author_name: data.author_name,
    content: data.content,
    is_internal: data.is_internal ?? false,
    is_user: data.is_user ?? true,
  });
  if (error) throw error;
}

/**
 * Update the content of a comment.
 */
export async function updateCommentClient(
  commentId: string,
  content: string,
  authorId: string,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("action_comments")
    .update({ content })
    .eq("id", commentId)
    .eq("author_id", authorId)
    .eq("is_user", true);
  if (error) throw error;
}

/**
 * Delete a comment.
 */
export async function deleteCommentClient(
  commentId: string,
  authorId: string,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("action_comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", authorId)
    .eq("is_user", true);
  if (error) throw error;
}
