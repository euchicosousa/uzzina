import {
  aiInputSchema,
  aiResultSchema,
  type AIPayload as ValidAIPayload,
  type AIResult,
} from "~/lib/ai-contract";
import { AIRequestError, postAI } from "./ai-request";

export { AIRequestError };
export type AIPayload = Omit<ValidAIPayload, "intent"> & { intent: string };
export type { AIResult };
export async function callAI(payload: AIPayload): Promise<AIResult> {
  const parsed = aiInputSchema.safeParse(payload);
  if (!parsed.success) throw new AIRequestError(400);
  const result = aiResultSchema.safeParse(
    await postAI(JSON.stringify(parsed.data)),
  );
  if (!result.success || result.data.intent !== parsed.data.intent)
    throw new AIRequestError(502);
  return result.data;
}
