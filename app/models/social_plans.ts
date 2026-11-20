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
 * RLS limits access to active administrators and operational partners.
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
 * RLS requires an active administrator whose user_id matches auth.uid().
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

export interface SocialPlanActionLink {
  suggestionId: string;
  actionId: string;
}

export type FinalizeSocialPlanResult =
  | {
      status: "success";
      plan: SocialPlan;
      /** Actions created by this call; empty when everything was already converted. */
      created: SocialPlanActionLink[];
      /** Every suggestion of the proposal that has an action, canonical. */
      links: SocialPlanActionLink[];
    }
  | { status: "conflict"; currentVersion?: number }
  | {
      status: "error";
      /** False when the outcome is unknown (network): retrying is safe and never duplicates. */
      certain: boolean;
      message: string;
    };

const FINALIZE_ERRORS: Record<string, string> = {
  PLANNING_ADMIN_REQUIRED:
    "Somente administradores ativos podem finalizar propostas.",
  PLANNING_PROPOSAL_UNAVAILABLE: "Esta proposta não está mais disponível.",
  PLANNING_PARTNER_UNAVAILABLE: "O parceiro desta proposta está arquivado.",
  PLANNING_NOTHING_APPROVED:
    "Nenhuma sugestão aprovada para finalizar. Aprove ao menos uma sugestão.",
  PLANNING_SUGGESTION_UNDATED:
    "Há sugestão aprovada sem data válida. Defina a data e finalize de novo.",
  PLANNING_SUGGESTION_INVALID:
    "Há sugestão aprovada sem título ou formato válido. Revise e finalize de novo.",
  PLANNING_NOT_FINALIZED: "Esta sugestão não tem ação criada para liberar.",
};

function parseLinks(value: unknown): SocialPlanActionLink[] | null {
  if (!Array.isArray(value)) return null;
  const links: SocialPlanActionLink[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const { suggestion_id: suggestionId, action_id: actionId } = item as Record<
      string,
      unknown
    >;
    if (typeof suggestionId !== "string" || typeof actionId !== "string")
      return null;
    links.push({ suggestionId, actionId });
  }
  return links;
}

/**
 * Converts the approved suggestions of a proposal into actions with the
 * `finalize_social_plan` RPC: one transaction, at most one action per
 * suggestion. The database derives actor, partner, suggestions, dates and
 * defaults; the client sends only the proposal and the version it shows.
 */
export async function finalizeSocialPlanClient(
  supabase: SupabaseClient,
  id: string,
  expectedVersion: number,
): Promise<FinalizeSocialPlanResult> {
  const { data, error } = await supabase.rpc("finalize_social_plan", {
    p_plan_id: id,
    p_expected_version: expectedVersion,
  });

  if (error) {
    const message = error.message ?? "";
    if (error.code === "P0001" || message.includes("VERSION_CONFLICT")) {
      const hinted = Number(error.hint);
      return {
        status: "conflict",
        currentVersion: Number.isInteger(hinted) ? hinted : undefined,
      };
    }
    const known = Object.keys(FINALIZE_ERRORS).find((code) =>
      message.includes(code),
    );
    if (known) {
      return {
        status: "error",
        certain: true,
        message: FINALIZE_ERRORS[known],
      };
    }
    console.error("Erro ao finalizar proposta:", error);
    return {
      status: "error",
      // A database error code means the transaction was rolled back.
      certain: Boolean(error.code),
      message: error.code
        ? "Não foi possível finalizar. Nenhuma ação foi criada."
        : "Não foi possível confirmar a finalização. Tente de novo: ações já criadas não se repetem.",
    };
  }

  const result =
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)
      : null;
  const created = parseLinks(result?.created);
  const links = parseLinks(result?.links);
  if (!result || !isSocialPlan(result.plan) || !created || !links) {
    return {
      status: "error",
      certain: false,
      message:
        "Resposta inesperada ao finalizar. Reabra a proposta para conferir.",
    };
  }
  return { status: "success", plan: result.plan, created, links };
}

export type ReleaseSocialPlanSuggestionResult =
  | { status: "success"; plan: SocialPlan }
  | { status: "conflict"; currentVersion?: number }
  | { status: "error"; message: string };

/**
 * Frees one finalized suggestion so it can be finalized again. Only the
 * suggestion's link goes away; the action it created is not touched.
 */
export async function releaseSocialPlanSuggestionClient(
  supabase: SupabaseClient,
  id: string,
  suggestionId: string,
  expectedVersion: number,
): Promise<ReleaseSocialPlanSuggestionResult> {
  const { data, error } = await supabase.rpc("release_social_plan_suggestion", {
    p_plan_id: id,
    p_suggestion_id: suggestionId,
    p_expected_version: expectedVersion,
  });

  if (error) {
    const message = error.message ?? "";
    if (error.code === "P0001" || message.includes("VERSION_CONFLICT")) {
      const hinted = Number(error.hint);
      return {
        status: "conflict",
        currentVersion: Number.isInteger(hinted) ? hinted : undefined,
      };
    }
    const known = Object.keys(FINALIZE_ERRORS).find((code) =>
      message.includes(code),
    );
    if (known) return { status: "error", message: FINALIZE_ERRORS[known] };
    console.error("Erro ao liberar sugestão:", error);
    return {
      status: "error",
      message: "Não foi possível liberar a sugestão. Tente de novo.",
    };
  }

  const result =
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)
      : null;
  if (!result || !isSocialPlan(result.plan)) {
    return {
      status: "error",
      message:
        "Resposta inesperada ao liberar. Reabra a proposta para conferir.",
    };
  }
  return { status: "success", plan: result.plan };
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
