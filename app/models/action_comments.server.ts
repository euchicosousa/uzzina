import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "types/database";

export type ActionComment = Tables<"action_comments">;

/** Retorna os comentários PÚBLICOS de uma ação, ordenados por data. */
export async function getCommentsByAction(
  supabase: SupabaseClient,
  actionId: string,
) {
  const { data, error } = await supabase
    .from("action_comments")
    .select("*")
    .eq("action_id", actionId)
    .eq("is_internal", false)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as ActionComment[];
}

/** Retorna TODOS os comentários de uma ação (incluindo internos) — para uso do time. */
export async function getAllCommentsByAction(
  supabase: SupabaseClient,
  actionId: string,
) {
  const { data, error } = await supabase
    .from("action_comments")
    .select("*")
    .eq("action_id", actionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as ActionComment[];
}

/** Cria um novo comentário. */
export async function createComment(
  supabase: SupabaseClient,
  data: {
    action_id: string;
    author_id: string;
    author_name: string;
    content: string;
    is_internal?: boolean;
  },
) {
  const { error } = await supabase.from("action_comments").insert({
    action_id: data.action_id,
    author_id: data.author_id,
    author_name: data.author_name,
    content: data.content,
    is_internal: data.is_internal ?? false,
  });

  if (error) throw error;
}
