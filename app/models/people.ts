import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "types/database";
import type { Person } from "~/types";

export async function getPersonByUserId(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .match({ user_id: userId })
    .single();

  if (error) throw error;
  return data as Person;
}

export async function getPersonName(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("people")
    .select("name")
    .eq("user_id", userId)
    .single();
  return data?.name ?? null;
}

export async function updateOwnProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: {
    name: string;
    surname: string;
    initials: string;
    short: string;
    image: string | null;
  },
) {
  const { error } = await supabase
    .from("people")
    .update(profile)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function insertPerson(
  supabase: SupabaseClient,
  person: Omit<Person, "id" | "created_at" | "preferences">,
) {
  const { error } = await supabase.from("people").insert(person);
  if (error) throw error;
}

export async function getVisiblePeople(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("visible", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Person[];
}

export async function getAllPeople(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Person[];
}

/** Merges a preference patch through the authorized RPC and returns the stored record. */
export async function updateMyPreferences(
  supabase: SupabaseClient,
  patch: Record<string, unknown>,
): Promise<Record<string, Json | undefined>> {
  const { data, error } = await supabase.rpc("update_my_preferences", {
    p_patch: patch,
  });
  if (error) throw error;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid preferences confirmation");
  }
  return data as Record<string, Json | undefined>;
}
