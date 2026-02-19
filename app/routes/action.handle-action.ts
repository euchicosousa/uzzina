import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/services/auth.server";
import {
  createAction,
  getActionById,
  updateAction,
} from "~/models/actions.server";
import { ActionFormSchema } from "~/utils/validation";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const { intent, id, ...values } = formData as any;

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
        const data = await getActionById(supabase, String(id));
        // TODO: implement actual duplication logic
      } catch (error) {
        console.error("Error fetching action for duplication:", error);
      }
    }
  }

  return null;
};
