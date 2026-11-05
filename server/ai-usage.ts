import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AIUsageContext =
  | { userId: string; intent: string }
  | { operationId: string; leaseId: string; intent: "ai-strategy" };

function tokenCount(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 2147483647
    ? value
    : null;
}

/** Record measured provider usage once; unavailable accounting must not fail generation. */
export async function recordAIUsage(
  client: SupabaseClient,
  context: AIUsageContext,
  usage: unknown,
  model: string,
): Promise<boolean> {
  const values =
    typeof usage === "object" && usage !== null
      ? (usage as Record<string, unknown>)
      : {};
  const details = values.prompt_tokens_details;
  const cachedTokens = tokenCount(
    typeof details === "object" &&
      details !== null &&
      "cached_tokens" in details
      ? details.cached_tokens
      : undefined,
  );
  const promptTokens = tokenCount(values.prompt_tokens);
  const completionTokens = tokenCount(values.completion_tokens);
  const totalTokens = tokenCount(values.total_tokens);
  const eventId = "operationId" in context ? context.operationId : randomUUID();
  const args = {
    p_event_id: eventId,
    p_user_id: "userId" in context ? context.userId : undefined,
    p_intent: context.intent,
    p_model: model,
    p_prompt_tokens: promptTokens,
    p_completion_tokens: completionTokens,
    p_total_tokens: totalTokens,
    p_cached_tokens: cachedTokens,
    p_operation_id: "operationId" in context ? context.operationId : undefined,
    p_lease_id: "leaseId" in context ? context.leaseId : undefined,
  };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { error } = await client.rpc("record_ai_generation", args);
      if (!error) return true;
      if (attempt === 1)
        console.error("AI usage recording unavailable", { code: error.code });
    } catch {
      if (attempt === 1)
        console.error("AI usage recording unavailable", { code: "TRANSPORT" });
    }
  }
  return false;
}
