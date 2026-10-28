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
    selectedPartnerSlugs,
    includeArchived = false,
    limit = 10,
  }: {
    query: string;
    partnerSlugs: string[];
    selectedPartnerSlugs?: string[];
    includeArchived?: boolean;
    limit?: number;
  },
) {
  const scope = selectedPartnerSlugs?.length
    ? partnerSlugs.filter((slug) => selectedPartnerSlugs.includes(slug))
    : partnerSlugs;
  if (scope.length === 0) return [];
  let baseQuery = supabase
    .from("actions")
    .select("*")
    .ilike("title", `%${query}%`)
    .overlaps("partners", scope);
  if (!includeArchived) baseQuery = baseQuery.eq("archived", false);
  const { data, error } = await baseQuery.limit(limit);
  if (error) throw error;
  return (data as unknown as Action[]) || [];
}
