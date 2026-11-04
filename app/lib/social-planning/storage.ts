import type { PlanSuggestion, SocialPlan } from "./types";

export interface PlanStorageScope {
  userId?: string;
  partnerSlug?: string;
}

const STORAGE_PREFIX = "uzzina_social_plans";

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function resolveScope(scope?: PlanStorageScope | string): PlanStorageScope {
  if (!scope) return {};
  if (typeof scope === "string") {
    return { partnerSlug: scope };
  }
  return scope;
}

export function getScopedStorageKey(
  scope?: PlanStorageScope | string,
): string | null {
  const { userId, partnerSlug } = resolveScope(scope);
  if (!partnerSlug) return null;
  const safeUser = userId ? userId.trim() : "default";
  const safePartner = partnerSlug.trim();
  return `${STORAGE_PREFIX}_${safeUser}_${safePartner}`;
}

function isSocialPlan(item: unknown): item is SocialPlan {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.partner_slug === "string" &&
    (candidate.mode === "theme" || candidate.mode === "period") &&
    Array.isArray(candidate.suggestions)
  );
}

/**
 * Lists persisted social plans scoped to a specific partner (and optionally user).
 * Never lists globally without a partner, preventing cross-tenant data exposure.
 */
export function listSocialPlans(
  scope?: PlanStorageScope | string,
): SocialPlan[] {
  const storage = getStorage();
  if (!storage) return [];

  const { userId, partnerSlug } = resolveScope(scope);
  if (!partnerSlug) {
    // Cross-partner listing is strictly forbidden (C01 requirement)
    return [];
  }

  const primaryKey = getScopedStorageKey({ userId, partnerSlug });
  const plans: SocialPlan[] = [];

  const readFromKey = (key: string) => {
    try {
      const raw = storage.getItem(key);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      for (const item of parsed) {
        if (isSocialPlan(item) && item.partner_slug === partnerSlug) {
          if (!plans.some((p) => p.id === item.id)) {
            plans.push(item);
          }
        }
      }
    } catch {
      // Ignore JSON parse errors for corrupt keys
    }
  };

  if (primaryKey) {
    readFromKey(primaryKey);
  }

  // If scoped by partner only (or default user), also read any keys matching that partner
  if (!userId) {
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (
          key &&
          key.startsWith(STORAGE_PREFIX) &&
          key.endsWith(`_${partnerSlug}`) &&
          key !== primaryKey
        ) {
          readFromKey(key);
        }
      }
    } catch {
      // Ignore enumeration errors
    }
  }

  return plans.sort((a, b) => {
    const timeA = new Date(a.created_at || a.updated_at).getTime();
    const timeB = new Date(b.created_at || b.updated_at).getTime();
    return (
      (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
    );
  });
}

/**
 * Retrieves a single social plan by its ID within scope (or searched across scoped keys).
 */
export function getSocialPlan(
  id: string,
  scope?: PlanStorageScope | string,
): SocialPlan | null {
  const storage = getStorage();
  if (!storage) return null;

  const { partnerSlug } = resolveScope(scope);
  if (partnerSlug) {
    const plans = listSocialPlans(scope);
    return plans.find((plan) => plan.id === id) ?? null;
  }

  // Fallback search across storage keys starting with prefix
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = storage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const match = parsed.find(
                (p: unknown) => isSocialPlan(p) && p.id === id,
              );
              if (match) return match as SocialPlan;
            }
          } catch {
            // Continue
          }
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

export interface SavePlanResult {
  success: boolean;
  plan: SocialPlan;
  error?: string;
}

/**
 * Saves or updates a social plan in durable scoped local storage.
 * Enforces partnerSlug requirement, versioning, and provides explicit error status.
 */
export function saveSocialPlan(
  plan: SocialPlan,
  options?: { expectedVersion?: number },
): SavePlanResult {
  if (!plan.partner_slug) {
    return {
      success: false,
      plan,
      error: "O plano precisa estar associado a um parceiro válido.",
    };
  }

  const storage = getStorage();
  if (!storage) {
    return {
      success: false,
      plan,
      error: "Armazenamento local indisponível.",
    };
  }

  const key = getScopedStorageKey({
    userId: plan.user_id,
    partnerSlug: plan.partner_slug,
  });

  if (!key) {
    return {
      success: false,
      plan,
      error: "Chave de armazenamento inválida para este parceiro.",
    };
  }

  try {
    const currentPlans = listSocialPlans({
      userId: plan.user_id,
      partnerSlug: plan.partner_slug,
    });
    const existingIndex = currentPlans.findIndex((p) => p.id === plan.id);

    if (existingIndex >= 0 && options?.expectedVersion !== undefined) {
      const existing = currentPlans[existingIndex];
      const currentVersion = existing.version ?? 1;
      if (currentVersion !== options.expectedVersion) {
        return {
          success: false,
          plan,
          error:
            "Conflito de edição: o plano foi alterado em outra sessão. Recarregue antes de salvar.",
        };
      }
    }

    const nextVersion = (plan.version ?? 0) + 1;
    const planToSave: SocialPlan = {
      ...plan,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    };

    let updatedList: SocialPlan[];
    if (existingIndex >= 0) {
      updatedList = [...currentPlans];
      updatedList[existingIndex] = planToSave;
    } else {
      updatedList = [planToSave, ...currentPlans];
    }

    storage.setItem(key, JSON.stringify(updatedList));
    return { success: true, plan: planToSave };
  } catch (error) {
    console.error("Failed to persist social plan in storage:", error);
    return {
      success: false,
      plan,
      error:
        "Limite de armazenamento excedido ou falha ao gravar proposta. O rascunho local foi preservado.",
    };
  }
}

/**
 * Updates a specific suggestion within a persisted plan.
 */
export function updatePlanSuggestion(
  planId: string,
  suggestionId: string,
  patch: Partial<PlanSuggestion>,
  scope?: PlanStorageScope | string,
): SocialPlan | null {
  const plan = getSocialPlan(planId, scope);
  if (!plan) return null;

  const suggestionIndex = plan.suggestions.findIndex(
    (s) => s.id === suggestionId,
  );
  if (suggestionIndex === -1) return null;

  const currentSuggestion = plan.suggestions[suggestionIndex];
  const updatedSuggestion: PlanSuggestion = {
    ...currentSuggestion,
    ...patch,
  };

  const updatedSuggestions = [...plan.suggestions];
  updatedSuggestions[suggestionIndex] = updatedSuggestion;

  const updatedPlan: SocialPlan = {
    ...plan,
    suggestions: updatedSuggestions,
  };

  const saveRes = saveSocialPlan(updatedPlan);
  if (!saveRes.success) return null;
  return saveRes.plan;
}

/**
 * Deletes a social plan by ID from storage.
 */
export function deleteSocialPlan(
  id: string,
  scope?: PlanStorageScope | string,
): boolean {
  const storage = getStorage();
  if (!storage) return false;

  const plan = getSocialPlan(id, scope);
  if (!plan) return false;

  const key = getScopedStorageKey({
    userId: plan.user_id,
    partnerSlug: plan.partner_slug,
  });
  if (!key) return false;

  try {
    const allPlans = listSocialPlans({
      userId: plan.user_id,
      partnerSlug: plan.partner_slug,
    });
    const filtered = allPlans.filter((p) => p.id !== id);
    if (filtered.length === allPlans.length) return false;

    storage.setItem(key, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete social plan:", error);
    return false;
  }
}
