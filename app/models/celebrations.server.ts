import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAllCelebrations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("celebrations")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Celebration[];
}
