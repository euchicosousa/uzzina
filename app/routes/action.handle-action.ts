import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/services/auth.server";
import {
  createAction,
  deleteAction,
  getActionById,
  updateAction,
  bulkUpdateActions,
} from "~/models/actions.server";
import { ActionFormSchema } from "~/utils/validation";

export const action = async ({ request }: ActionFunctionArgs) => {
  const contentType = request.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries(await request.formData());
  const { intent, id, ...values } = payload as any;

  const { supabase } = await getUserId(request);

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

      try {
        await updateAction(supabase, String(id), result.data);
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
  }

  return null;
};
