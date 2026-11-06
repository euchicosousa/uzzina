import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output, type ModelMessage } from "ai";
import { aiOutputLimits, lunaModel } from "./ai-model-catalog.js";

export type AIGeneration = {
  text: string;
  usage: unknown;
  id?: string;
  model?: string;
  service_tier?: string;
};

// Request JSON mode while leaving parsing to the existing intent contracts.
// Usage must be recorded even if the returned text is invalid or truncated.
const jsonText = {
  ...Output.text(),
  responseFormat: Output.json().responseFormat,
};

export async function generateAI(
  messages: ModelMessage[],
  options: {
    intent: keyof typeof aiOutputLimits;
    json?: boolean;
    timeout?: number;
  },
): Promise<AIGeneration> {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
  });
  const result = await generateText({
    model: openai.chat(lunaModel.id),
    messages,
    allowSystemInMessages: true,
    output: options.json ? jsonText : undefined,
    providerOptions: {
      openai: {
        serviceTier: "default",
        systemMessageMode: "system",
        maxCompletionTokens: aiOutputLimits[options.intent],
      },
    },
    maxRetries: 0,
    timeout: options.timeout,
    include: { responseBody: true },
  });

  // Normalized usage omits billing details and may synthesize a response ID.
  const body = result.finalStep.response.body;
  const text = result.finishReason === "length" ? "" : result.text;
  if (typeof body !== "object" || body === null)
    return { text, usage: undefined };
  return {
    text,
    usage: "usage" in body ? body.usage : undefined,
    id: "id" in body && typeof body.id === "string" ? body.id : undefined,
    model:
      "model" in body && typeof body.model === "string"
        ? body.model
        : undefined,
    service_tier:
      "service_tier" in body && typeof body.service_tier === "string"
        ? body.service_tier
        : undefined,
  };
}
