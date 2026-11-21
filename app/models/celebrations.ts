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

export interface CelebrationPartnerSyncDiff {
  toAdd: string[];
  toRemove: string[];
  desiredActiveIds: string[];
  preservedInactiveIds: string[];
}

export function computeActivePartnerSyncDiff(
  currentPartnerIds: string[],
  activePartnerIds: string[],
  selectedActivePartnerIds: string[],
): CelebrationPartnerSyncDiff {
  const activeSet = new Set(activePartnerIds);
  const currentSet = new Set(currentPartnerIds);
  const desiredActiveIds = Array.from(
    new Set(selectedActivePartnerIds.filter((id) => activeSet.has(id))),
  );
  const desiredActiveSet = new Set(desiredActiveIds);

  const toAdd = desiredActiveIds.filter((id) => !currentSet.has(id));
  const toRemove = Array.from(currentSet).filter(
    (id) => activeSet.has(id) && !desiredActiveSet.has(id),
  );
  const preservedInactiveIds = Array.from(currentSet).filter(
    (id) => !activeSet.has(id),
  );

  return { toAdd, toRemove, desiredActiveIds, preservedInactiveIds };
}

export async function getCelebrationPartnerIds(
  supabase: SupabaseClient<Database>,
  celebrationId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("partner_holidays")
    .select("partner_id")
    .eq("celebration_id", celebrationId);
  if (error) throw error;
  return (data ?? []).map((row) => row.partner_id);
}

export interface CelebrationPartnerSyncResult {
  added: string[];
  removed: string[];
  linkedActiveIds: string[];
  preservedInactiveIds: string[];
}

export async function syncCelebrationActivePartners(
  supabase: SupabaseClient<Database>,
  celebrationId: string,
  activePartnerIds: string[],
  selectedActivePartnerIds: string[],
): Promise<CelebrationPartnerSyncResult> {
  const currentPartnerIds = await getCelebrationPartnerIds(
    supabase,
    celebrationId,
  );
  const { toAdd, toRemove, desiredActiveIds, preservedInactiveIds } =
    computeActivePartnerSyncDiff(
      currentPartnerIds,
      activePartnerIds,
      selectedActivePartnerIds,
    );

  if (toAdd.length > 0) {
    const { error } = await supabase.from("partner_holidays").upsert(
      toAdd.map((partner_id) => ({
        partner_id,
        celebration_id: celebrationId,
      })),
      { onConflict: "partner_id,celebration_id", ignoreDuplicates: true },
    );
    if (error) throw error;
  }

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("partner_holidays")
      .delete()
      .eq("celebration_id", celebrationId)
      .in("partner_id", toRemove);
    if (error) throw error;
  }

  return {
    added: toAdd,
    removed: toRemove,
    linkedActiveIds: desiredActiveIds,
    preservedInactiveIds,
  };
}
