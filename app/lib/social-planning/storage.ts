import type { PlanSuggestion, SocialPlan } from "./types";

const STORAGE_KEY = "uzzina_social_plans";

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
 * Lists all persisted social plans, optionally filtered by partner slug.
 * Plans are returned ordered from most recent to oldest.
 */
export function listSocialPlans(partnerSlug?: string): SocialPlan[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const plans = parsed.filter(isSocialPlan);

    const filtered = partnerSlug
      ? plans.filter((plan) => plan.partner_slug === partnerSlug)
      : plans;

    return filtered.sort((a, b) => {
      const timeA = new Date(a.created_at || a.updated_at).getTime();
      const timeB = new Date(b.created_at || b.updated_at).getTime();
      return (
        (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
      );
    });
  } catch (error) {
    console.warn("Error reading social plans from storage:", error);
    return [];
  }
}

/**
 * Retrieves a single social plan by its ID.
 */
export function getSocialPlan(id: string): SocialPlan | null {
  const storage = getStorage();
  if (!storage) return null;

  const plans = listSocialPlans();
  const match = plans.find((plan) => plan.id === id);
  return match ?? null;
}

/**
 * Saves or updates a social plan in durable local storage.
 * If the plan already exists, it is updated in place.
 * If new, it is inserted at the top of the collection.
 */
export function saveSocialPlan(plan: SocialPlan): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const allPlans = listSocialPlans();
    const existingIndex = allPlans.findIndex((p) => p.id === plan.id);

    const planToSave: SocialPlan = {
      ...plan,
      updated_at: new Date().toISOString(),
    };

    let updatedList: SocialPlan[];
    if (existingIndex >= 0) {
      updatedList = [...allPlans];
      updatedList[existingIndex] = planToSave;
    } else {
      updatedList = [planToSave, ...allPlans];
    }

    storage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error("Failed to persist social plan in storage:", error);
  }
}

/**
 * Updates a specific suggestion within a persisted plan (e.g. approve, reject, edit fields).
 * Returns the updated SocialPlan, or null if plan or suggestion was not found.
 */
export function updatePlanSuggestion(
  planId: string,
  suggestionId: string,
  patch: Partial<PlanSuggestion>,
): SocialPlan | null {
  const plan = getSocialPlan(planId);
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
    updated_at: new Date().toISOString(),
  };

  saveSocialPlan(updatedPlan);
  return updatedPlan;
}

/**
 * Deletes a social plan by ID from storage.
 */
export function deleteSocialPlan(id: string): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    const allPlans = listSocialPlans();
    const filtered = allPlans.filter((plan) => plan.id !== id);
    if (filtered.length === allPlans.length) return false;

    storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete social plan:", error);
    return false;
  }
}
