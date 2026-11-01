import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

export interface AgencyAIUsage {
  period: string;
  percentage: number;
  total_units: number;
  reference_units: number;
  total_generations: number;
  updated_at: string;
}

export async function getAgencyAIUsage(
  supabase: SupabaseClient<Database>,
): Promise<AgencyAIUsage | null> {
  const { data, error } = await supabase.rpc("get_agency_ai_usage");
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    if (error) console.error("Error fetching agency AI usage:", error);
    return null;
  }
  return data as unknown as AgencyAIUsage;
}
