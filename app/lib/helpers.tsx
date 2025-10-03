import { redirect } from "react-router";
import { createSupabaseClient } from "./supabase";
import { STATE } from "./CONSTANTS";
import { addMinutes, isBefore, subMinutes } from "date-fns";
import { MoonIcon, SunIcon, ComputerIcon } from "lucide-react";
import { cn } from "./utils";
import { Theme } from "remix-themes";

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
    return isLateAction(action);
  });
}

export function isLateAction(action: Action) {
  return action.state !== STATE.finished && isBefore(action.date, new Date());
}

export function isAlmostLateAction(action: Action, minutes = 5) {
  return (
    action.state !== STATE.finished &&
    isBefore(action.date, addMinutes(new Date(), minutes))
  );
}

export const getThemeIcon = (theme: Theme | null, className?: string) => {
  switch (theme) {
    case Theme.DARK:
      return <MoonIcon className={cn(className)} />;
    case Theme.LIGHT:
      return <SunIcon className={cn(className)} />;
    default:
      return <ComputerIcon className={cn(className)} />;
  }
};
