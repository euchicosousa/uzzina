import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/lib/helpers";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const { intent, id, ...values } = formData;

  const { supabase } = await getUserId(request);

  if (intent === INTENT.update_action) {
    if (id) {
      supabase.from("actions").update({}).eq("id", String(id));
    }
  }

  return null;
};
