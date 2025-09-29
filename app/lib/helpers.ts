import { redirect } from "react-router";
import { createSupabaseClient } from "./supabase";
import { STATE } from "./CONSTANTS";
import { isBefore } from "date-fns";

export async function getUserId(request: Request) {
  const { supabase } = await createSupabaseClient(request);

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    throw redirect("/login");
  }

  const user_id = data.claims.sub;

  return { user_id, supabase };
}

export function getLateActions(actions: Action[]) {
  return actions.filter((action) => {
    return action.state !== STATE.finished && isBefore(action.date, new Date());
  });
}
