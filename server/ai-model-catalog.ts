// Nano-USD per token keeps the per-call calculation exact before aggregation.
// Id, name, provider, level and default flag live once in the public registry
// (`app/lib/ai-model-registry.ts`); this catalog adds server-only data.
import {
  findPublicAIModel,
  publicAIModels,
  type PublicAIModel,
} from "../app/lib/ai-model-registry.js";

export type { AIProvider } from "../app/lib/ai-model-registry.js";
export type AIIntent =
  | "ai-strategy"
  | "ai-content"
  | "ai-caption"
  | "ai-transcribe"
  | "ai-interpret";

export type AITariff = {
  readonly version: string;
  readonly effectiveFrom: string;
  readonly source: string;
  readonly maxInputTokens: number;
  readonly input: number;
  readonly cacheRead: number;
  readonly cacheWrite: number;
  readonly output: number;
};

export type AIModel = PublicAIModel & {
  readonly capabilities: readonly string[];
  // Commands this model may serve. Models enter other commands only after
  // their output has been validated for that command.
  readonly intents: readonly AIIntent[];
  readonly tariffs: readonly AITariff[];
  readonly reservationRates: {
    readonly input: number;
    readonly output: number;
  };
};

export const lunaModel = {
  ...findPublicAIModel("gpt-6-luna"),
  capabilities: ["chat-completions", "text", "json", "reasoning", "vision"],
  intents: [
    "ai-strategy",
    "ai-content",
    "ai-caption",
    "ai-transcribe",
    "ai-interpret",
  ],
  reservationRates: { input: 250, output: 750 },
  tariffs: [
    {
      version: "openai-luna-standard-short-2026-11-05",
      effectiveFrom: "2026-11-05",
      source: "https://developers.openai.com/api/docs/models/gpt-6-luna",
      maxInputTokens: 272000,
      input: 100,
      cacheRead: 10,
      cacheWrite: 125,
      output: 500,
    },
    {
      version: "openai-luna-standard-long-2026-11-05",
      effectiveFrom: "2026-11-05",
      source: "https://developers.openai.com/api/docs/models/gpt-6-luna",
      maxInputTokens: 1050000,
      input: 200,
      cacheRead: 20,
      cacheWrite: 250,
      output: 750,
    },
  ],
} as const satisfies AIModel;

const terraModel = {
  ...findPublicAIModel("gpt-6.1-terra"),
  capabilities: ["chat-completions", "text", "json", "reasoning", "vision"],
  intents: ["ai-strategy", "ai-content", "ai-caption", "ai-interpret"],
  reservationRates: { input: 2500, output: 7500 },
  tariffs: [
    {
      version: "openai-gpt-6.1-terra-standard-short-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: "https://developers.openai.com/api/docs/models/gpt-6.1-terra",
      maxInputTokens: 272000,
      input: 1000,
      cacheRead: 50,
      cacheWrite: 1250,
      output: 5000,
    },
    {
      version: "openai-gpt-6.1-terra-standard-long-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: "https://developers.openai.com/api/docs/models/gpt-6.1-terra",
      maxInputTokens: 1050000,
      input: 2000,
      cacheRead: 100,
      cacheWrite: 2500,
      output: 7500,
    },
  ],
} as const satisfies AIModel;

const solModel = {
  ...findPublicAIModel("gpt-6.1-sol"),
  capabilities: ["chat-completions", "text", "json", "reasoning"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
  reservationRates: { input: 5000, output: 15000 },
  tariffs: [
    {
      version: "openai-gpt-6.1-sol-standard-short-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: "https://developers.openai.com/api/docs/models/gpt-6.1-sol",
      maxInputTokens: 272000,
      input: 2000,
      cacheRead: 100,
      cacheWrite: 2500,
      output: 10000,
    },
    {
      version: "openai-gpt-6.1-sol-standard-long-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: "https://developers.openai.com/api/docs/models/gpt-6.1-sol",
      maxInputTokens: 1050000,
      input: 4000,
      cacheRead: 200,
      cacheWrite: 5000,
      output: 15000,
    },
  ],
} as const satisfies AIModel;

const astraModel = {
  ...findPublicAIModel("gpt-6-astra"),
  capabilities: ["chat-completions", "text", "json", "reasoning"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
  reservationRates: { input: 25000, output: 75000 },
  tariffs: [
    {
      version: "openai-gpt-6-astra-standard-short-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: "https://developers.openai.com/api/docs/models/gpt-6-astra",
      maxInputTokens: 272000,
      input: 10000,
      cacheRead: 1000,
      cacheWrite: 12500,
      output: 50000,
    },
    {
      version: "openai-gpt-6-astra-standard-long-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: "https://developers.openai.com/api/docs/models/gpt-6-astra",
      maxInputTokens: 1050000,
      input: 20000,
      cacheRead: 2000,
      cacheWrite: 25000,
      output: 75000,
    },
  ],
} as const satisfies AIModel;

const claudePricing =
  "https://platform.claude.com/docs/en/about-claude/pricing";

// Standard processing, 5-minute cache writes (the app does not request 1-hour
// caching). Haiku 5.5 reprices the whole request when the prompt, including
// cache reads and writes, exceeds 100,000 tokens.
export const claudeHaikuModel = {
  ...findPublicAIModel("claude-haiku-5-5"),
  capabilities: ["messages", "text"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
  reservationRates: { input: 625, output: 2500 },
  tariffs: [
    {
      version: "anthropic-haiku-5-5-standard-short-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: claudePricing,
      maxInputTokens: 100000,
      input: 100,
      cacheRead: 10,
      cacheWrite: 125,
      output: 500,
    },
    {
      version: "anthropic-haiku-5-5-standard-long-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: claudePricing,
      maxInputTokens: 1000000,
      input: 500,
      cacheRead: 50,
      cacheWrite: 625,
      output: 2500,
    },
  ],
} as const satisfies AIModel;

export const claudeSonnetModel = {
  ...findPublicAIModel("claude-sonnet-5-5"),
  capabilities: ["messages", "text"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
  reservationRates: { input: 2500, output: 10000 },
  tariffs: [
    {
      version: "anthropic-sonnet-5-5-standard-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: claudePricing,
      maxInputTokens: 1000000,
      input: 2000,
      cacheRead: 100,
      cacheWrite: 2500,
      output: 10000,
    },
  ],
} as const satisfies AIModel;

export const claudeOpusModel = {
  ...findPublicAIModel("claude-opus-5-5"),
  capabilities: ["messages", "text"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
  reservationRates: { input: 5000, output: 20000 },
  tariffs: [
    {
      version: "anthropic-opus-5-5-standard-2026-11-06",
      effectiveFrom: "2026-11-06",
      source: claudePricing,
      maxInputTokens: 1000000,
      input: 4000,
      cacheRead: 200,
      cacheWrite: 5000,
      output: 20000,
    },
  ],
} as const satisfies AIModel;

export const aiModels: readonly AIModel[] = [
  lunaModel,
  terraModel,
  solModel,
  astraModel,
  claudeHaikuModel,
  claudeSonnetModel,
  claudeOpusModel,
];

// Every public model needs server data and vice versa; fail loudly at load time.
if (
  aiModels.length !== publicAIModels.length ||
  publicAIModels.some((model, index) => aiModels[index]?.id !== model.id)
) {
  throw new Error("AI model catalog is out of sync with the public registry");
}

export const defaultAIModel = lunaModel;
export const defaultAIModelId = lunaModel.id;
export const lunaModelId = defaultAIModelId;

export function findAIModel(id: string): AIModel | undefined {
  return aiModels.find((model) => model.id === id);
}

export const aiOutputLimits = {
  "ai-strategy": 8192,
  "ai-content": 8192,
  "ai-caption": 2048,
  "ai-transcribe": 8192,
  "ai-interpret": 4096,
} as const;

// File reading (IA-M08): the model pair lives here only. Transcription always
// uses Luna; interpretation uses Luna, or Terra when careful reading is on.
export const fileReadModels = {
  transcribe: lunaModel.id,
  interpret: lunaModel.id,
  interpretCareful: terraModel.id,
} as const;
