import type { SupabaseClient } from "@supabase/supabase-js";

export async function getPartnerBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .match({ slug })
    .single();

  if (error) throw error;
  return data as Partner;
}

export async function getAllPartners(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("partners").select("*");
  if (error) throw error;
  return data as Partner[];
}

export async function getPartnersByUserId(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("archived", false)
    .contains("users_ids", [userId])
    .order("title", { ascending: true });

  if (error) throw error;
  return data as Partner[];
}
