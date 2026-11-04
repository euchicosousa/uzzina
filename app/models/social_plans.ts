import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanSuggestion, SocialPlan } from "~/lib/social-planning/types";

export interface UpdateSocialPlanResult {
  success: boolean;
  plan?: SocialPlan;
  conflict?: boolean;
  currentVersion?: number;
  error?: string;
}

export function isSocialPlan(data: unknown): data is SocialPlan {
  if (typeof data !== "object" || data === null) return false;
  const c = data as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.partner_slug === "string" &&
    (c.mode === "theme" || c.mode === "period") &&
    Array.isArray(c.suggestions)
  );
}

/**
 * Lists all social plans for a specific partner from Supabase.
 * RLS enforces that only authorized members/admins can read them.
 */
export async function listSocialPlansByPartner(
  supabase: SupabaseClient,
  partnerSlug: string,
): Promise<SocialPlan[]> {
  if (!partnerSlug) return [];

  const { data, error } = await supabase
    .from("social_plans")
    .select("*")
    .eq("partner_slug", partnerSlug)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar planos do banco:", error);
    throw error;
  }

  return (data || []).filter(isSocialPlan);
}

/**
 * Retrieves a single social plan by its ID from Supabase.
 */
export async function getSocialPlanById(
  supabase: SupabaseClient,
  id: string,
): Promise<SocialPlan | null> {
  const { data, error } = await supabase
    .from("social_plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar plano por ID:", error);
    throw error;
  }

  if (!data || !isSocialPlan(data)) return null;
  return data;
}

/**
 * Creates a new social plan in Supabase.
 * RLS enforces that the creator's user_id matches auth.uid().
 */
export async function createSocialPlanClient(
  supabase: SupabaseClient,
  plan: {
    partner_slug: string;
    partner_title?: string;
    mode: "theme" | "period";
    input: Record<string, unknown>;
    suggestions: PlanSuggestion[];
    user_id: string;
    status?: "draft" | "finalized";
  },
): Promise<SocialPlan> {
  const insertPayload = {
    partner_slug: plan.partner_slug,
    user_id: plan.user_id,
    mode: plan.mode,
    status: plan.status || "draft",
    input: plan.input,
    suggestions: plan.suggestions,
    version: 1,
  };

  const { data, error } = await supabase
    .from("social_plans")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("Erro ao inserir plano no Supabase:", error);
    throw error;
  }

  return data as SocialPlan;
}

/**
 * Updates a social plan using Compare-And-Swap (CAS) versioning.
 * Uses the database RPC `update_social_plan_versioned` or fallback CAS query.
 * Prevents silent overwriting between concurrent tabs/sessions.
 */
export async function updateSocialPlanClient(
  supabase: SupabaseClient,
  id: string,
  expectedVersion: number,
  patch: {
    mode?: "theme" | "period";
    status?: "draft" | "finalized";
    input?: Record<string, unknown>;
    suggestions?: PlanSuggestion[];
  },
): Promise<UpdateSocialPlanResult> {
  // 1. First attempt: call the dedicated atomic RPC function
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "update_social_plan_versioned",
    {
      p_id: id,
      p_expected_version: expectedVersion,
      p_mode: patch.mode ?? null,
      p_status: patch.status ?? null,
      p_input: patch.input ?? null,
      p_suggestions: patch.suggestions ?? null,
    },
  );

  if (!rpcError && rpcData) {
    return {
      success: true,
      plan: rpcData as SocialPlan,
    };
  }

  // Check if RPC reported a version conflict
  if (
    rpcError?.code === "P0001" ||
    rpcError?.message?.includes("VERSION_CONFLICT")
  ) {
    const current = await getSocialPlanById(supabase, id);
    return {
      success: false,
      conflict: true,
      currentVersion: current?.version,
      error: `Conflito de versão: o plano foi modificado (versão atual: ${current?.version || "desconhecida"}). Recarregue antes de salvar.`,
    };
  }

  // 2. Fallback attempt: direct CAS query
  const updatePayload: Record<string, unknown> = {
    version: expectedVersion + 1,
  };
  if (patch.mode) updatePayload.mode = patch.mode;
  if (patch.status) updatePayload.status = patch.status;
  if (patch.input) updatePayload.input = patch.input;
  if (patch.suggestions) updatePayload.suggestions = patch.suggestions;

  const { data, error } = await supabase
    .from("social_plans")
    .update(updatePayload)
    .eq("id", id)
    .eq("version", expectedVersion)
    .select()
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar plano.",
    };
  }

  if (!data) {
    // 0 rows updated means expectedVersion did not match current database row
    const current = await getSocialPlanById(supabase, id);
    return {
      success: false,
      conflict: true,
      currentVersion: current?.version,
      error: `Conflito de concorrência detectado. Versão esperada era ${expectedVersion}, mas o banco possui ${current?.version ?? "outra"}.`,
    };
  }

  return {
    success: true,
    plan: data as SocialPlan,
  };
}

/**
 * Deletes a social plan by ID.
 */
export async function deleteSocialPlanClient(
  supabase: SupabaseClient,
  id: string,
): Promise<boolean> {
  const { error } = await supabase.from("social_plans").delete().eq("id", id);
  if (error) {
    console.error("Erro ao deletar plano:", error);
    throw error;
  }
  return true;
}
