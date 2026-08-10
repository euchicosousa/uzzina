import type { Action } from "~/types";
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

export async function fetchFlowActions(
  partnerSlugs: string[],
  endDateISO: string,
  startDateISO?: string,
) {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("actions")
    .select("*")
    .or("archived.is.false,archived.is.null")
    .overlaps("partners", partnerSlugs)
    .neq("phase", "finished")
    .lte("date", endDateISO);

  if (startDateISO) {
    query = query.gte("date", startDateISO);
  }

  const { data, error } = await query.order("date", { ascending: true });

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
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("visible", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Person[];
}

/**
 * Fetch actions for public review page by IDs (no auth required).
 * Returns only fields needed for the approval document.
 */
export async function fetchReviewActions(ids: string[]): Promise<Action[]> {
  if (ids.length === 0) return [];
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("actions")
    .select("id, title, content_description, instagram_caption, category, date, partners")
    .in("id", ids)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as Action[];
}

/**
 * Fetch a partner by slug for the public review page.
 */
export async function fetchPartnerBySlug(slug: string): Promise<Partner | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, title, slug, image, colors, short")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Partner;
}
