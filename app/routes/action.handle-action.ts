import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/services/auth.server";
import {
  createComment,
  deleteComment,
  getAllCommentsByAction,
  updateComment,
} from "~/models/action_comments.server";
import { createNotificationsForMentions } from "~/models/notifications.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const actionId = url.searchParams.get("actionId");
  if (!actionId) return Response.json({ error: "Action ID is required" }, { status: 400 });

  const { supabase } = await getUserId(request);
  const comments = await getAllCommentsByAction(supabase, actionId);

  return Response.json({ comments });
};

interface ActionPayload {
  intent?: string;
  actionId?: string;
  commentId?: string;
  content?: string;
  isInternal?: boolean | string;
  mentions?: string[] | string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = (contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries(await request.formData())) as ActionPayload;
  const { intent } = payload;

  const { supabase, user_id } = await getUserId(request);

  if (intent === INTENT.create_comment) {
    const actionId = payload.actionId;
    const content = payload.content;
    const isInternal = payload.isInternal === true || payload.isInternal === "true";
    let mentions: string[] = [];

    if (payload.mentions) {
      if (Array.isArray(payload.mentions)) {
        mentions = payload.mentions;
      } else if (typeof payload.mentions === "string") {
        try {
          mentions = JSON.parse(payload.mentions);
        } catch {
          // Ignora erros de parse
        }
      }
    }

    if (!actionId || !content)
      return Response.json({ error: "Action ID and Content are required" }, { status: 400 });

    const [personRes, actionRes] = await Promise.all([
      supabase.from("people").select("name").eq("user_id", user_id).single(),
      supabase.from("actions").select("title").eq("id", actionId).single(),
    ]);

    const authorName = personRes.data?.name || "Agência";
    const actionTitle = actionRes.data?.title || "Ação";

    const insertedComment = await createComment(supabase, {
      action_id: actionId,
      author_id: user_id,
      author_name: authorName,
      content,
      is_internal: isInternal,
      is_user: true,
      mentions,
    });

    if (mentions.length > 0) {
      // Resumo de até 100 caracteres (sem tags HTML)
      const plainText = content.replace(/<[^>]*>/g, "");
      const commentExcerpt = plainText.length > 100 ? `${plainText.substring(0, 100)}...` : plainText;
      await createNotificationsForMentions(supabase, {
        commentId: insertedComment.id,
        actionId,
        actionTitle,
        authorName,
        commentExcerpt,
        authorId: user_id,
        mentionedIds: mentions,
      });
    }

    return Response.json({ success: true, comment: insertedComment });
  } else if (intent === INTENT.update_comment) {
    const commentId = payload.commentId;
    const content = payload.content;

    if (!commentId || !content)
      return Response.json({ error: "Comment ID and Content are required" }, { status: 400 });

    await updateComment(supabase, commentId, content, user_id, true);
    return Response.json({ success: true });
  } else if (intent === INTENT.delete_comment) {
    const commentId = payload.commentId;
    if (!commentId) return Response.json({ error: "Comment ID is required" }, { status: 400 });

    await deleteComment(supabase, commentId, user_id, true);
    return Response.json({ success: true });
  }

  return null;
};
