import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "types/database";

const agencyAIUsageSchema = z.object({
  period: z.string().min(1),
  percentage: z.number().finite().min(0).max(100),
  total_units: z.number().finite().nonnegative(),
  reference_units: z.number().finite().positive(),
  total_generations: z.number().int().nonnegative(),
  incomplete_generations: z.number().int().nonnegative(),
  measurement_started_at: z.string().datetime({ offset: true }),
  partial_period: z.boolean(),
  updated_at: z.string().datetime({ offset: true }),
});
export type AgencyAIUsage = z.infer<typeof agencyAIUsageSchema>;

export async function getAgencyAIUsage(
  supabase: SupabaseClient<Database>,
): Promise<AgencyAIUsage> {
  const { data, error } = await supabase.rpc("get_agency_ai_usage");
  if (error) throw new Error("Não foi possível consultar o consumo de IA.");
  const result = agencyAIUsageSchema.safeParse(data);
  if (!result.success)
    throw new Error("A medição de IA está temporariamente indisponível.");
  return result.data;
}
