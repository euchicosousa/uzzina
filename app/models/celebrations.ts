import type { Database } from "types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Celebration } from "~/types";

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

export async function updateCelebration(
  supabase: SupabaseClient<Database>,
  id: string,
  title: string,
  date: string,
): Promise<Celebration> {
  const { data, error } = await supabase
    .from("celebrations")
    .update({ title, date })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  if (!data)
    throw new Error("The server did not confirm the celebration update.");
  return data;
}
