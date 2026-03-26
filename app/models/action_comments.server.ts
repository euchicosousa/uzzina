import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "types/database";

export type ActionComment = Tables<"action_comments">;
export type AugmentedComment = ActionComment & { author_image: string | null };

async function attachAuthorsImages(
  supabase: SupabaseClient,
  comments: ActionComment[],
): Promise<AugmentedComment[]> {
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

  usersRes.data?.forEach((u) => {
    if (u.image) imageMap.set(u.user_id, u.image);
  });

  clientsRes.data?.forEach((c) => {
    if (c.image) imageMap.set(c.id, c.image);
  });

  return comments.map((c) => ({
    ...c,
    author_image: imageMap.get(c.author_id) || null,
  }));
}

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
  return attachAuthorsImages(supabase, data as ActionComment[]);
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
  return attachAuthorsImages(supabase, data as ActionComment[]);
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
    is_user?: boolean;
  },
) {
  const { error } = await supabase.from("action_comments").insert({
    action_id: data.action_id,
    author_id: data.author_id,
    author_name: data.author_name,
    content: data.content,
    is_internal: data.is_internal ?? false,
    is_user: data.is_user ?? false,
  });

  if (error) throw error;
}

/** Atualiza o conteúdo de um comentário. */
export async function updateComment(
  supabase: SupabaseClient,
  commentId: string,
  content: string,
  authorId: string,
  isUser: boolean,
) {
  const { error } = await supabase
    .from("action_comments")
    .update({ content })
    .eq("id", commentId)
    .eq("author_id", authorId)
    .eq("is_user", isUser);

  if (error) throw error;
}

/** Deleta um comentário. */
export async function deleteComment(
  supabase: SupabaseClient,
  commentId: string,
  authorId: string,
  isUser: boolean,
) {
  const { error } = await supabase
    .from("action_comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", authorId)
    .eq("is_user", isUser);

  if (error) throw error;
}
