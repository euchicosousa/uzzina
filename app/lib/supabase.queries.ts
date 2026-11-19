import type { Action } from "~/types";
import { getAllPeople, getVisiblePeople } from "~/models/people";
import { createSupabaseBrowserClient } from "./supabase.client";
import { format } from "date-fns";
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
  partnerSlugs: string[],
) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_home_actions", {
    p_user_id: userId,
    p_start_date: startDateISO,
    p_end_date: endDateISO,
    p_today_end: todayEndISO,
    p_partner_slugs: partnerSlugs,
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
    .neq("phase", "finished")
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

/**
 * Fetch all leads client-side
 */
export async function fetchLeads() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Lead[];
}

export type Person = Tables<"people">;

export async function fetchPeople() {
  return getVisiblePeople(createSupabaseBrowserClient());
}

export async function fetchAllPeople() {
  return getAllPeople(createSupabaseBrowserClient());
}
