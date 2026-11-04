import { createActionClient } from "~/lib/supabase.mutations";
import type { ActionCreateInput } from "~/utils/validation";
import { saveSocialPlan } from "./storage";
import type { PlanFormat, SocialPlan } from "./types";

function mapFormatToCategory(format: PlanFormat): string {
  switch (format) {
    case "reels":
      return "reels";
    case "carousel":
      return "carousel";
    case "static":
      return "post";
    default:
      return "post";
  }
}

export interface FinalizeResult {
  createdCount: number;
  errorCount: number;
  alreadyFinalized?: boolean;
  errors: string[];
}

export async function finalizeSocialPlan({
  plan,
  userId,
}: {
  plan: SocialPlan;
  userId: string;
}): Promise<FinalizeResult> {
  if (plan.status === "finalized") {
    return {
      createdCount: 0,
      errorCount: 0,
      alreadyFinalized: true,
      errors: [],
    };
  }

  const approvedSuggestions = plan.suggestions.filter(
    (suggestion) => suggestion.status === "approved",
  );

  if (approvedSuggestions.length === 0) {
    throw new Error(
      "Nenhuma sugestão aprovada para finalizar. Aprove ao menos uma sugestão antes de concluir.",
    );
  }

  let createdCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const suggestion of approvedSuggestions) {
    // Idempotency: skip suggestions that already have an associated action id
    if (suggestion.created_action_id) {
      continue;
    }

    if (!suggestion.scheduled_date) {
      errorCount++;
      errors.push(
        `Sugestão "${suggestion.title}" não possui data prevista definida e não pôde ser convertida.`,
      );
      continue;
    }

    try {
      const scheduledDate = suggestion.scheduled_date;

      const description = suggestion.objective
        ? `${suggestion.briefing}\n\nObjetivo: ${suggestion.objective}`
        : suggestion.briefing;

      const payload: ActionCreateInput = {
        title: suggestion.title,
        date: scheduledDate,
        category: mapFormatToCategory(suggestion.format),
        priority: "medium",
        partners: [plan.partner_slug],
        description,
        content_description: suggestion.briefing,
        phase: "idea",
        user_id: userId,
        responsibles: [userId],
      };

      const createdAction = await createActionClient(payload);
      suggestion.created_action_id = createdAction.id;
      createdCount++;
    } catch (error) {
      console.error(
        `Erro ao criar ação para sugestão "${suggestion.title}":`,
        error,
      );
      errorCount++;
      errors.push(
        `Falha ao criar ação para "${suggestion.title}": ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
    }
  }

  // Only mark whole plan as finalized if there were no errors
  if (errorCount === 0) {
    plan.status = "finalized";
  }

  saveSocialPlan(plan);

  return { createdCount, errorCount, errors };
}
