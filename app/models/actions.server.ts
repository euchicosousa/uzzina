import { format } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "types/database";

export type Action = Tables<"actions">;

/**
 * Get actions for a specific partner/slug
 */
export async function getActionsByPartner(
  supabase: SupabaseClient,
  partnerSlug: string,
  userId: string,
  isAdmin: boolean,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .is("archived", false)
    .contains("responsibles", isAdmin ? [] : [userId])
    .overlaps("partners", [partnerSlug])
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) throw error;

  return data as Action[];
}

/**
 * Get all open (non-finished, non-archived) actions for a specific partner/slug
 * without date range restrictions — used by the print page.
 */
export async function getOpenActionsByPartner(
  supabase: SupabaseClient,
  partnerSlug: string,
  userId: string,
  isAdmin: boolean,
) {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .or("archived.is.false,archived.is.null")
    .contains("responsibles", isAdmin ? [] : [userId])
    .overlaps("partners", [partnerSlug])
    .neq("phase", "concluido")
    .order("date", { ascending: true });

  if (error) throw error;

  return data as Action[];
}

/**
 * Get all overdue actions for a specific partner/slug
 * (without date range restrictions)
 */
export async function getLateActionsByPartner(
  supabase: SupabaseClient,
  partnerSlug: string,
  userId: string,
  isAdmin: boolean,
) {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .or("archived.is.false,archived.is.null")
    .contains("responsibles", isAdmin ? [] : [userId])
    .overlaps("partners", [partnerSlug])
    .neq("phase", "concluido")
    .lt("date", format(new Date(), "yyyy-MM-dd HH:mm:ss"))
    .order("date", { ascending: false });

  if (error) throw error;

  return data as Action[];
}

/**
 * Get all overdue actions for all partners the user has access to
 */
export async function getAllLateActions(
  supabase: SupabaseClient,
  userId: string,
  isAdmin: boolean,
  partnerSlugs: string[],
) {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .or("archived.is.false,archived.is.null")
    .contains("responsibles", isAdmin ? [] : [userId])
    .overlaps("partners", partnerSlugs)
    .neq("phase", "concluido")
    .lt("date", format(new Date(), "yyyy-MM-dd HH:mm:ss"))
    .order("date", { ascending: false });

  if (error) throw error;

  return data as Action[];
}

/**
 * Get home actions using RPC
 */
export async function getHomeActions(
  supabase: SupabaseClient,
  userId: string,
  startDateISO: string,
  endDateISO: string,
  todayEndISO: string,
) {
  const { data, error } = await supabase.rpc("get_home_actions", {
    p_user_id: userId,
    p_start_date: startDateISO,
    p_end_date: endDateISO,
    p_today_end: todayEndISO,
  });

  if (error) throw error;
  return data as Action[];
}

/**
 * Create a new action
 */
export async function createAction(supabase: SupabaseClient, actionData: any) {
  const { data, error } = await supabase
    .from("actions")
    .insert(actionData)
    .select()
    .single();

  if (error) throw error;
  return data as Action;
}

/**
 * Update an existing action
 */
export async function updateAction(
  supabase: SupabaseClient,
  id: string,
  actionData: any,
) {
  const { data, error } = await supabase
    .from("actions")
    .update(actionData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Action;
}

/**
 * Delete an action by ID
 */
export async function deleteAction(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("actions").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Get a single action by ID
 */
export async function getActionById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Action;
}

/**
 * Update multiple existing actions at once
 */
export async function bulkUpdateActions(
  supabase: SupabaseClient,
  ids: string[],
  actionData: Partial<Action>,
) {
  const { data, error } = await supabase
    .from("actions")
    .update(actionData)
    .in("id", ids)
    .select();

  if (error) throw error;
  return data as Action[];
}

/**
 * Change only the DATE part of N actions, preserving each action's original time.
 * @param newDate - "yyyy-MM-dd"
 */
export async function bulkUpdateDateOnly(
  supabase: SupabaseClient,
  ids: string[],
  newDate: string,
) {
  const { data, error } = await supabase
    .from("actions")
    .select("id, date")
    .in("id", ids);

  if (error) throw error;

  await Promise.all(
    (data as { id: string; date: string }[]).map(({ id, date }) => {
      // Extrai a hora existente — o campo é "yyyy-MM-dd HH:mm:ss"
      const existingTime = format(new Date(date.replace(" ", "T")), "HH:mm:ss");
      return supabase
        .from("actions")
        .update({ date: `${newDate} ${existingTime}` })
        .eq("id", id);
    }),
  );
}

/**
 * Change only the TIME part of N actions, preserving each action's original date.
 * @param newTime - "HH:mm"
 */
export async function bulkUpdateTimeOnly(
  supabase: SupabaseClient,
  ids: string[],
  newTime: string,
) {
  const { data, error } = await supabase
    .from("actions")
    .select("id, date")
    .in("id", ids);

  if (error) throw error;

  await Promise.all(
    (data as { id: string; date: string }[]).map(({ id, date }) => {
      // Extrai a data existente — o campo é "yyyy-MM-dd HH:mm:ss"
      const existingDate = format(new Date(date.replace(" ", "T")), "yyyy-MM-dd");
      return supabase
        .from("actions")
        .update({ date: `${existingDate} ${newTime}:00` })
        .eq("id", id);
    }),
  );
}

/**
 * Get actions for planning board (by date range, handling admin and visibility)
 */
export async function getActionsForPlanning(
  supabase: SupabaseClient,
  userId: string,
  isAdmin: boolean,
  partnerSlugs: string[],
  startDate: string,
  endDate: string,
) {
  let query = supabase
    .from("actions")
    .select("*")
    .or("archived.is.false,archived.is.null")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (!isAdmin) {
    query = query.overlaps("partners", partnerSlugs);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Action[];
}
