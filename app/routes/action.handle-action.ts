import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/services/auth.server";
import {
  createComment,
  deleteComment,
  getAllCommentsByAction,
  updateComment,
} from "~/models/action_comments.server";

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

    if (!actionId || !content)
      return Response.json({ error: "Action ID and Content are required" }, { status: 400 });

    const { data: person } = await supabase
      .from("people")
      .select("name")
      .eq("user_id", user_id)
      .single();

    await createComment(supabase, {
      action_id: actionId,
      author_id: user_id,
      author_name: person?.name || "Agência",
      content,
      is_internal: isInternal,
      is_user: true,
    });
    return Response.json({ success: true });
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
