import { randomUUID } from "node:crypto";
import { lunaModel } from "./ai-model-catalog.js";
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
  response?: { id?: string; model?: string; service_tier?: string | null },
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
  const cacheWriteValue =
    typeof details === "object" &&
    details !== null &&
    "cache_write_tokens" in details
      ? details.cache_write_tokens
      : undefined;
  const cacheWriteTokens =
    cacheWriteValue === undefined ? 0 : tokenCount(cacheWriteValue);
  const promptTokens = tokenCount(values.prompt_tokens);
  const completionTokens = tokenCount(values.completion_tokens);
  const totalTokens = tokenCount(values.total_tokens);
  const actualModel = response?.model ?? model;
  const providerId = response?.id || null;
  const tier = response?.service_tier ?? "default";
  const tariff =
    promptTokens === null
      ? undefined
      : lunaModel.tariffs.find((band) => promptTokens <= band.maxInputTokens);
  const completionDetails = values.completion_tokens_details;
  const reasoningTokens = tokenCount(
    typeof completionDetails === "object" &&
      completionDetails !== null &&
      "reasoning_tokens" in completionDetails
      ? completionDetails.reasoning_tokens
      : undefined,
  );
  const costNanos =
    actualModel === lunaModel.id &&
    tier === "default" &&
    promptTokens !== null &&
    tariff !== undefined &&
    completionTokens !== null &&
    totalTokens === promptTokens + completionTokens &&
    cachedTokens !== null &&
    cacheWriteTokens !== null &&
    cachedTokens + cacheWriteTokens <= promptTokens
      ? (promptTokens - cachedTokens - cacheWriteTokens) * tariff.input +
        cachedTokens * tariff.cacheRead +
        cacheWriteTokens * tariff.cacheWrite +
        completionTokens * tariff.output
      : null;
  const eventId = "leaseId" in context ? context.leaseId : randomUUID();
  const args = {
    p_event_id: eventId,
    p_user_id: "userId" in context ? context.userId : undefined,
    p_intent: context.intent,
    p_model: actualModel,
    p_meter: {
      provider: lunaModel.provider,
      provider_id: providerId,
      service_tier: tier,
      cache_write_tokens:
        cacheWriteValue === undefined ? null : cacheWriteTokens,
      reasoning_tokens: reasoningTokens,
      tariff: costNanos === null ? null : tariff,
      cost_nanos: costNanos,
    },
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
