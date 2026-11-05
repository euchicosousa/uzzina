import { lunaModel } from "./ai-model-catalog.js";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "../types/database";
import { aiInputSchema } from "../app/lib/ai-contract.js";
import { generateStrategies } from "./strategy-generation.js";
import { recordAIUsage } from "./ai-usage.js";

export class StrategyStoreError extends Error {
  constructor(public readonly code: string) {
    super("Strategy operation unavailable");
  }
}
type StrategyRPC =
  | "strategy_ready"
  | "accept_strategy_operation"
  | "read_strategy_operation"
  | "claim_strategy_operation"
  | "store_strategy_result"
  | "finish_strategy_operation"
  | "fail_strategy_operation"
  | "retry_strategy_result";
export async function strategyRPC(
  client: SupabaseClient,
  name: StrategyRPC,
  args: Record<string, Json | undefined> = {},
): Promise<unknown> {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new StrategyStoreError(error.code);
  return data;
}

/** One awaited lease per request; the persisted queue, not this process, owns recovery. */
export async function runStrategyWorker(client: SupabaseClient, limit: number) {
  const leaseId = randomUUID();
  const claimed: unknown = await strategyRPC(
    client,
    "claim_strategy_operation",
    { p_lease_id: leaseId, p_limit: limit },
  );
  if (claimed === null) return { processed: false };
  if (
    typeof claimed !== "object" ||
    !claimed ||
    !("id" in claimed) ||
    typeof claimed.id !== "string" ||
    !("payload" in claimed) ||
    !("result" in claimed)
  )
    throw new Error("Invalid operation claim");
  const operationId = claimed.id;
  let resultRetained = claimed.result !== null;
  let code = "PROVIDER_UNCERTAIN";
  try {
    if (!resultRetained) {
      const payload = aiInputSchema.parse(claimed.payload);
      const strategies = await generateStrategies(
        payload,
        undefined,
        (response) =>
          recordAIUsage(
            client,
            { operationId, leaseId, intent: "ai-strategy" },
            response.usage,
            lunaModel.id,
            response,
          ).then(() => undefined),
      );
      // This transaction commits the recoverable result before touching the action.
      await strategyRPC(client, "store_strategy_result", {
        p_operation_id: operationId,
        p_lease_id: leaseId,
        p_result: strategies,
      });
      resultRetained = true;
    }
    code = "SAVE_FAILED";
    await strategyRPC(client, "finish_strategy_operation", {
      p_operation_id: operationId,
      p_lease_id: leaseId,
    });
    return { processed: true };
  } catch (error) {
    if (resultRetained) code = "SAVE_FAILED";
    else if (error instanceof Error && error.name === "ZodError")
      code = "INVALID_RESULT";
    await strategyRPC(client, "fail_strategy_operation", {
      p_operation_id: operationId,
      p_lease_id: leaseId,
      p_code: code,
    });
    return { processed: true, recovery: code };
  }
}
