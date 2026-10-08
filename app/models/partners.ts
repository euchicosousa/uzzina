import type { SupabaseClient } from "@supabase/supabase-js";
import type { Partner } from "~/types";

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
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("title", { ascending: true });
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

export async function getOperationalPartners(supabase: SupabaseClient, userId: string, isAdmin: boolean) {
  if (!isAdmin) return getPartnersByUserId(supabase,userId);
  const {data,error} = await supabase.from("partners").select("*")
    .eq("archived",false).order("title",{ascending:true});
  if (error) throw error;
  return data as Partner[];
}

export async function partnerSlugExists(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase
    .from("partners")
    .select("id")
    .eq("slug", slug)
    .single();
  return Boolean(data);
}

export async function createPartner(
  supabase: SupabaseClient,
  partner: Omit<Partner, "id" | "created_at">,
) {
  const { error } = await supabase.from("partners").insert(partner);
  if (error) throw error;
}

export async function updatePartnerBySlug(
  supabase: SupabaseClient,
  slug: string,
  partner: Omit<Partner, "id" | "created_at">,
) {
  const { error } = await supabase
    .from("partners")
    .update(partner)
    .eq("slug", slug);
  if (error) throw error;
}
