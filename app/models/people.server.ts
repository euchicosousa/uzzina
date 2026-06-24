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


