import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "types/database";

export type Celebration = Tables<"celebrations">;

export async function getAllCelebrations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("celebrations")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Celebration[];
}
