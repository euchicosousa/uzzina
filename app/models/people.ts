import type { SupabaseClient } from "@supabase/supabase-js";
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
