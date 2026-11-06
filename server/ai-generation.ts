import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output, type ModelMessage } from "ai";
import {
  aiOutputLimits,
  defaultAIModelId,
  findAIModel,
} from "./ai-model-catalog.js";

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

function field(value: unknown, key: string): unknown {
  return typeof value === "object" && value !== null && key in value
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/**
 * Anthropic reports uncached input separately from cache reads and writes.
 * Convert to the prompt-total convention the metering already uses, so cost and
 * ledger code stay provider-agnostic. Missing fields stay missing: the call is
 * then recorded as incomplete instead of being priced from guesses.
 */
function anthropicUsage(usage: unknown): unknown {
  const input = field(usage, "input_tokens");
  const output = field(usage, "output_tokens");
  const cacheWrite = field(usage, "cache_creation_input_tokens");
  const cacheRead = field(usage, "cache_read_input_tokens");
  if (!isCount(input) || !isCount(output)) return undefined;
  if (!isCount(cacheWrite) || !isCount(cacheRead))
    return { completion_tokens: output };
  const prompt = input + cacheWrite + cacheRead;
  return {
    prompt_tokens: prompt,
    completion_tokens: output,
    total_tokens: prompt + output,
    prompt_tokens_details: {
      cached_tokens: cacheRead,
      cache_write_tokens: cacheWrite,
    },
  };
}

// Claude has no JSON mode here; models may fence the object they were asked for.
function unfence(text: string): string {
  const match = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/i.exec(text);
  return match ? match[1] : text;
}

export async function generateAI(
  messages: ModelMessage[],
  options: {
    intent: keyof typeof aiOutputLimits;
    json?: boolean;
    timeout?: number;
    model?: string;
  },
): Promise<AIGeneration> {
  const selected = findAIModel(options.model ?? defaultAIModelId);
  if (!selected || !selected.intents.includes(options.intent))
    throw new Error("AI model unavailable for this command");
  const limit = aiOutputLimits[options.intent];

  if (selected.provider === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    const result = await generateText({
      model: anthropic(selected.id),
      messages,
      allowSystemInMessages: true,
      maxOutputTokens: limit,
      maxRetries: 0,
      timeout: options.timeout,
      include: { responseBody: true },
    });
    const body = result.finalStep.response.body;
    const rawText = result.finishReason === "length" ? "" : result.text;
    const text = options.json ? unfence(rawText) : rawText;
    if (typeof body !== "object" || body === null)
      return { text, usage: undefined };
    const usage = field(body, "usage");
    const id = field(body, "id");
    const model = field(body, "model");
    const tier = field(usage, "service_tier");
    return {
      text,
      usage: anthropicUsage(usage),
      id: typeof id === "string" ? id : undefined,
      model: typeof model === "string" ? model : undefined,
      // Anthropic's "standard" is the base-rate tier the catalog prices.
      service_tier:
        typeof tier === "string"
          ? tier === "standard"
            ? "default"
            : tier
          : undefined,
    };
  }

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
  });
  const result = await generateText({
    model: openai.chat(selected.id),
    messages,
    allowSystemInMessages: true,
    output: options.json ? jsonText : undefined,
    providerOptions: {
      openai: {
        serviceTier: "default",
        promptCacheOptions: { ttl: "30m" },
        systemMessageMode: "system",
        maxCompletionTokens: limit,
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
