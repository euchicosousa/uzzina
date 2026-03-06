import { type SubmitFunction } from "react-router";
import { INTENT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";

export * from "~/utils/date";
export * from "~/utils/format";
export * from "~/utils/validation";
export * from "~/utils/factory";
export * from "~/utils/sort";
// export * from "~/services/auth.server";
export * from "~/components/uzzina/UIIcons";

export const handleAction = (data: any, submit: SubmitFunction) =>
  submit(data, {
    method: "post",
    action: "/action/handle-action",
    navigate: false,
    encType: "application/json",
  });

/**
 * Toggles the given userId in/out of the action's sprints array.
 */
export function toggleSprintAction(
  action: Action,
  userId: string,
  submit: SubmitFunction,
) {
  let sprints: string[] | null = null;
  if (action.sprints) {
    if (action.sprints.includes(userId)) {
      sprints = action.sprints.filter((s) => s !== userId);
    } else {
      sprints = [...action.sprints, userId];
    }
  } else {
    sprints = [userId];
  }
  sprints = sprints.length > 0 ? sprints : null;
  handleAction({ ...action, intent: INTENT.update_action, sprints }, submit);
}

/**
 * Archives an action (sets archived: true) instead of deleting it.
 */
export function submitDeleteAction(action: Action, submit: SubmitFunction) {
  handleAction(
    { ...action, intent: INTENT.update_action, archived: true },
    submit,
  );
}

export { createSupabaseClient } from "./supabase";
