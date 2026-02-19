import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/services/auth.server";
import {
  createAction,
  getActionById,
  updateAction,
} from "~/models/actions.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const { intent, id, ...values } = formData as any;

  const { supabase } = await getUserId(request);

  if (intent === INTENT.create_action) {
    if (
      values.content_files === "" ||
      values.content_files === "null" ||
      !values.content_files
    ) {
      // @ts-ignore
      values.content_files = null;
    } else {
      // @ts-ignore
      values.content_files = String(values.content_files)
        .split(",")
        .filter(Boolean);
    }
    if (
      values.work_files === "" ||
      values.work_files === "null" ||
      !values.work_files
    ) {
      // @ts-ignore
      values.work_files = null;
    } else {
      // @ts-ignore
      values.work_files = String(values.work_files).split(",").filter(Boolean);
    }
    if (values.topics === "null" || values.topics === "") {
      delete values.topics;
    }
    if (
      values.instagram_content === "null" ||
      values.instagram_content === ""
    ) {
      delete values.instagram_content;
    }
    if (
      values.instagram_caption === "null" ||
      values.instagram_caption === ""
    ) {
      delete values.instagram_caption;
    }

    if (values.sprints && values.sprints !== "null" && values.sprints !== "") {
      //@ts-ignore
      values.sprints = values.sprints.toString().split(",").filter(Boolean);
    } else {
      // @ts-ignore
      values.sprints = null;
    }

    let valuesToInsert = {
      ...values,
      responsibles: String(values.responsibles).split(","),
      partners: String(values.partners).split(","),
    };

    try {
      const data = await createAction(supabase, valuesToInsert);
      return data;
    } catch (error) {
      console.error("Error creating action:", error);
      return null;
    }
  } else if (intent === INTENT.update_action) {
    if (id) {
      if (
        values.content_files === "" ||
        values.content_files === "null" ||
        !values.content_files
      ) {
        values.content_files = null;
      } else {
        // @ts-ignore
        values.content_files = String(values.content_files)
          .split(",")
          .filter(Boolean);
      }
      if (
        values.work_files === "" ||
        values.work_files === "null" ||
        !values.work_files
      ) {
        values.work_files = null;
      } else {
        // @ts-ignore
        values.work_files = String(values.work_files)
          .split(",")
          .filter(Boolean);
      }
      if (values.topics === "null" || values.topics === "") {
        delete values.topics;
      }
      if (
        values.instagram_content === "null" ||
        values.instagram_content === ""
      ) {
        delete values.instagram_content;
      }
      if (
        values.instagram_caption === "null" ||
        values.instagram_caption === ""
      ) {
        delete values.instagram_caption;
      }
      if (
        values.sprints &&
        values.sprints !== "null" &&
        values.sprints !== ""
      ) {
        //@ts-ignore
        values.sprints = values.sprints.toString().split(",").filter(Boolean);
      } else {
        // @ts-ignore
        values.sprints = null;
      }

      // console.log(values);

      let valuesToUpdate = {
        ...values,
        responsibles: String(values.responsibles).split(","),
        partners: String(values.partners).split(","),
      };

      try {
        await updateAction(supabase, String(id), valuesToUpdate);
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
