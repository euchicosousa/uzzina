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

const personalAIAllowanceSchema = z.object({
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  percentage: z.number().finite().min(0).max(100),
  total_generations: z.number().int().nonnegative(),
  incomplete_generations: z.number().int().nonnegative(),
  has_pending: z.boolean(),
});

export async function getMyAIAllowance(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("get_my_ai_allowance");
  if (error) throw new Error("Não foi possível consultar o consumo de IA.");
  const result = personalAIAllowanceSchema.safeParse(data);
  if (!result.success)
    throw new Error("A medição de IA está temporariamente indisponível.");
  const period = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${result.data.period}-01T00:00:00Z`));
  return { ...result.data, period };
}
