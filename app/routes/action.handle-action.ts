import type { ActionFunctionArgs } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import { getUserId } from "~/lib/helpers";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());
  const { intent, id, ...values } = formData;

  const { supabase } = await getUserId(request);

  if (intent === INTENT.create_action) {
    if (
      values.content_files === "" ||
      values.content_files === "null" ||
      values.content_files
    ) {
      delete values.content_files;
    }
    if (
      values.work_files === "" ||
      values.work_files === "null" ||
      values.work_files
    ) {
      delete values.work_files;
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

    const { data, error } = await supabase
      .from("actions")
      // @ts-ignore
      .insert({ ...valuesToInsert })
      .select()
      .single();

    if (error) {
      console.log(valuesToInsert);
      console.log(data, error);
    }

    return data;
  } else if (intent === INTENT.update_action) {
    if (id) {
      if (
        values.content_files === "" ||
        values.content_files === "null" ||
        values.content_files
      ) {
        delete values.content_files;
      }
      if (
        values.work_files === "" ||
        values.work_files === "null" ||
        values.work_files
      ) {
        delete values.work_files;
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

      // console.log(valuesToUpdate);

      const { data, error } = await supabase
        .from("actions")
        .update({ ...valuesToUpdate })
        .eq("id", String(id));

      if (error) {
        console.log(valuesToUpdate);
        console.log(data, error);
      }
    }
  } else if (intent === INTENT.duplicate_action) {
    if (id) {
      const { data, error } = await supabase
        .from("actions")
        .select()
        .eq("id", String(id));
    }
  }

  return null;
};
