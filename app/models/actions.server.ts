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
