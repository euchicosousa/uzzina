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

export async function createCelebration(
  supabase: SupabaseClient,
  title: string,
  date: string,
) {
  const { data, error } = await supabase
    .from("celebrations")
    .insert([{ title, date }])
    .select()
    .single();

  if (error) throw error;
  return data as Celebration;
}

export async function deleteCelebration(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("celebrations").delete().eq("id", id);
  if (error) throw error;
  return true;
}
