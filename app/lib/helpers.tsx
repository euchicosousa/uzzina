import { type SubmitFunction } from "react-router";

export * from "~/utils/date";
export * from "~/utils/format";
export * from "~/utils/validation";
export * from "~/utils/factory";
export * from "~/utils/sort";
// export * from "~/services/auth.server";
export * from "~/components/uzzina/UZZIIcons";

export const handleAction = async (data: any, submit: SubmitFunction) => {
  await submit(
    {
      ...data,
    },
    {
      method: "post",
      action: "/action/handle-action",
      navigate: false,
    },
  );
};

export { createSupabaseClient } from "./supabase";
