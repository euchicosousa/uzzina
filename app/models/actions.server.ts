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


