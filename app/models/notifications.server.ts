import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "types/database";

export type Notification = Tables<"notifications">;

/**
 * Cria registros de notificação para todos os usuários mencionados (exceto o próprio autor).
 */
export async function createNotificationsForMentions(
  supabase: SupabaseClient,
  params: {
    commentId: string;
    actionId: string;
    actionTitle: string;
    authorName: string;
    commentExcerpt: string;
    authorId: string; // user_id do autor
    mentionedIds: string[]; // array de IDs dos mencionados
  }
) {
  const { commentId, actionId, actionTitle, authorName, commentExcerpt, authorId, mentionedIds } = params;

  // Filtrar para não notificar a si próprio
  const recipients = mentionedIds.filter((id) => id !== authorId);

  if (recipients.length === 0) return;

  // Montar objetos de notificação
  const notificationsToInsert = recipients.map((recipientId) => ({
    recipient_id: recipientId,
    comment_id: commentId,
    action_id: actionId,
    type: "mention",
    author_name: authorName,
    action_title: actionTitle,
    comment_excerpt: commentExcerpt,
  }));

  const { error } = await supabase.from("notifications").insert(notificationsToInsert);
  if (error) throw error;
}

/**
 * Retorna a contagem de notificações não lidas do usuário.
 */
export async function getUnreadCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Lista as notificações de um usuário, ordenadas por mais recentes.
 */
export async function listNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 40
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Notification[];
}

/**
 * Marca notificações específicas como lidas.
 */
export async function markAsRead(
  supabase: SupabaseClient,
  notificationIds: string[],
  userId: string
) {
  if (notificationIds.length === 0) return;

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .in("id", notificationIds)
    .eq("recipient_id", userId);

  if (error) throw error;
}

/**
 * Marca todas as notificações do usuário como lidas.
 */
export async function markAllAsRead(
  supabase: SupabaseClient,
  userId: string
) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) throw error;
}
