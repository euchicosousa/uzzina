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

export async function finalizeSocialPlan({
  plan,
  userId,
}: {
  plan: SocialPlan;
  userId: string;
}): Promise<{ createdCount: number; errorCount: number }> {
  const approvedSuggestions = plan.suggestions.filter(
    (suggestion) => suggestion.status === "approved",
  );

  if (approvedSuggestions.length === 0) {
    throw new Error("Nenhuma sugestão aprovada para finalizar.");
  }

  let createdCount = 0;
  let errorCount = 0;

  for (const suggestion of approvedSuggestions) {
    try {
      const scheduledDate = suggestion.scheduled_date
        ? `${suggestion.scheduled_date} 10:00:00`
        : new Date().toISOString().slice(0, 10);

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
      };

      await createActionClient(payload);
      createdCount++;
    } catch (error) {
      console.error(
        `Erro ao criar ação para sugestão "${suggestion.title}":`,
        error,
      );
      errorCount++;
    }
  }

  plan.status = "finalized";
  saveSocialPlan(plan);

  return { createdCount, errorCount };
}
