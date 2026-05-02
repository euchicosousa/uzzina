
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { INTENT, STATES } from "~/lib/CONSTANTS";
import { getUserId } from "~/services/auth.server";
import { finishAttributes } from "~/utils/factory";
import {
  createAction,
  deleteAction,
  getActionById,
  updateAction,
  bulkUpdateActions,
} from "~/models/actions.server";
import {
  createComment,
  deleteComment,
  getAllCommentsByAction,
  updateComment,
} from "~/models/action_comments.server";
import { ActionFormSchema } from "~/utils/validation";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const actionId = url.searchParams.get("actionId");
  if (!actionId) return Response.json({ error: "Action ID is required" }, { status: 400 });

  const { supabase } = await getUserId(request);
  const comments = await getAllCommentsByAction(supabase, actionId);

  return Response.json({ comments });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries(await request.formData());
  const { intent, id, ...values } = payload as any;

  const { supabase, user_id } = await getUserId(request);

  if (intent === INTENT.create_action) {
    const result = ActionFormSchema.safeParse(values);
    if (!result.success) {
      console.error("Zod Validation Errors:", result.error.flatten());
      return Response.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    try {
      const data = await createAction(supabase, result.data);
      return data;
    } catch (error) {
      console.error("Error creating action:", error);
      return null;
    }
  } else if (intent === INTENT.update_action) {
    if (id) {
      const result = ActionFormSchema.safeParse(values);
      if (!result.success) {
        console.error("Zod Validation Errors:", result.error.flatten());
        return Response.json(
          { errors: result.error.flatten().fieldErrors },
          { status: 400 },
        );
      }

      const updateData = { ...result.data };

      // Se o estado for 'finished', garante que todos os atributos também fiquem 'finished'
      if (updateData.state === STATES.finished.slug) {
        let currentAttributes = updateData.attributes;

        // Se os atributos não vieram no payload, buscamos do banco para não perder dados ou ter inconsistência
        if (!currentAttributes) {
          try {
            const original = await getActionById(supabase, String(id));
            currentAttributes = original?.attributes as Record<string, string>;
          } catch (e) {
            console.error("Error fetching original action for attributes update:", e);
          }
        }

        if (currentAttributes) {
          updateData.attributes = finishAttributes(currentAttributes);
        }
      }

      try {
        await updateAction(supabase, String(id), updateData);
      } catch (error) {
        console.error("Error updating action:", error);
      }
    }
  } else if (intent === INTENT.duplicate_action) {
    if (id) {
      try {
        const original = await getActionById(supabase, String(id));
        const { id: _, created_at, updated_at, ...rest } = original;
        const now = new Date().toISOString();
        return await createAction(supabase, {
          ...rest,
          created_at: now,
          updated_at: now,
        });
      } catch (error) {
        console.error("Error duplicating action:", error);
      }
    }
  } else if (intent === INTENT.delete_action) {
    if (id) {
      try {
        await deleteAction(supabase, String(id));
      } catch (error) {
        console.error("Error deleting action:", error);
      }
    }
  } else if (intent === INTENT.bulk_update_actions) {
    const ids = Array.isArray(values.ids) ? values.ids : JSON.parse(values.ids || "[]");
    if (ids.length > 0) {
      const { ids: _removed, ...updates } = values;
      try {
        await bulkUpdateActions(supabase, ids, updates);
      } catch (error) {
        console.error("Error bulk updating actions:", error);
        return Response.json({ error: "Failed to bulk update updates" }, { status: 500 });
      }
    }
  } else if (intent === INTENT.create_comment) {
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
