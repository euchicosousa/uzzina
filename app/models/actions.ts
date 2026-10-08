import type { SupabaseClient } from "@supabase/supabase-js";
import type { Action } from "~/types";

export async function getActionById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as Action;
}

export async function getActionTitle(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("actions")
    .select("title")
    .eq("id", id)
    .single();
  return data?.title ?? null;
}

export async function searchActionsByTitle(
  supabase: SupabaseClient,
  {
    query,
    partnerSlugs,
    activePartnerSlug,
    limit = 10,
  }: {
    query: string;
    partnerSlugs: string[];
    activePartnerSlug?: string | null;
    limit?: number;
  },
) {
  let baseQuery = supabase
    .from("actions")
    .select("*")
    .ilike("title", `%${query}%`)
    .overlaps("partners", partnerSlugs);
  if (activePartnerSlug) {
    baseQuery = baseQuery.contains("partners", [activePartnerSlug]);
  }
  const { data, error } = await baseQuery.limit(limit);
  if (error) throw error;
  return (data as unknown as Action[]) || [];
}
