import { createSupabaseBrowserClient } from "./supabase.client";
import { format } from "date-fns";
import type { Action } from "~/models/actions.server";
import type { Tables } from "types/database";

export type Celebration = Tables<"celebrations">;

/**
 * Fetch home actions via RPC client-side
 */
export async function fetchHomeActions(
  userId: string,
  startDateISO: string,
  endDateISO: string,
  todayEndISO: string,
) {
  const supabase = createSupabaseBrowserClient();
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
 * Fetch actions for a partner client-side
 */
export async function fetchPartnerActions(
  partnerSlug: string,
  userId: string,
  isAdmin: boolean,
  startDate: string,
  endDate: string,
) {
  const supabase = createSupabaseBrowserClient();
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
 * Fetch open actions for a partner (without date range) client-side
 */
export async function fetchOpenActionsByPartner(
  partnerSlug: string,
  userId: string,
  isAdmin: boolean,
) {
  const supabase = createSupabaseBrowserClient();
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
 * Fetch late actions for a partner client-side
 */
export async function fetchLateActionsByPartner(
  partnerSlug: string,
  userId: string,
  isAdmin: boolean,
) {
  const supabase = createSupabaseBrowserClient();
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
 * Fetch all late actions for all partners the user has access to
 */
export async function fetchAllLateActions(
  userId: string,
  isAdmin: boolean,
  partnerSlugs: string[],
) {
  const supabase = createSupabaseBrowserClient();
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
 * Fetch celebrations client-side
 */
export async function fetchCelebrations() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("celebrations")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Celebration[];
}
