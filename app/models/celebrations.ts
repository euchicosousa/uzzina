import type { Database } from "types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Celebration } from "~/types";

export async function getAllCelebrations(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("celebrations")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Celebration[];
}

export async function getHolidayCelebrations(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase
    .from("celebrations")
    .select("*")
    .eq("is_holiday", true)
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Celebration[];
}

export async function createCelebration(
  supabase: SupabaseClient<Database>,
  title: string,
  date: string,
  is_holiday: boolean = false,
) {
  const { data, error } = await supabase
    .from("celebrations")
    .insert([{ title, date, is_holiday }])
    .select()
    .single();

  if (error) throw error;
  return data as Celebration;
}

export async function deleteCelebration(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { error } = await supabase.from("celebrations").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateCelebration(
  supabase: SupabaseClient<Database>,
  id: string,
  title: string,
  date: string,
  is_holiday?: boolean,
): Promise<Celebration> {
  const updatePayload: { title: string; date: string; is_holiday?: boolean } = {
    title,
    date,
  };
  if (typeof is_holiday === "boolean") {
    updatePayload.is_holiday = is_holiday;
  }
  const { data, error } = await supabase
    .from("celebrations")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  if (!data)
    throw new Error("The server did not confirm the celebration update.");
  return data;
}
