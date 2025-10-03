import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/lib/helpers";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const { intent, id, ...values } = formData;

  const { supabase } = await getUserId(request);

  if (intent === INTENT.update_action) {
    if (id) {
      if (values.content_files) {
        delete values.content_files;
      }
      if (values.work_files) {
        delete values.work_files;
      }
      if (values.topics === "null") {
        delete values.topics;
      }

      let valuesToUpdate = {
        ...values,
        responsibles: String(values.responsibles).split(","),
        partners: String(values.partners).split(","),
      };

      // console.log(valuesToUpdate);

      const { data, error } = await supabase
        .from("actions")
        .update({ ...valuesToUpdate })
        .eq("id", String(id));

      // console.log(data, error);
    }
  }

  return null;
};
