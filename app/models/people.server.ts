import type { SupabaseClient } from "@supabase/supabase-js";

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

export async function getAllVisiblePeople(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("visible", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Person[];
}
