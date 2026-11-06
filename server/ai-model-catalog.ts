// Nano-USD per token keeps the per-call calculation exact before aggregation.
export type AIProvider = "openai" | "anthropic";
export type AIIntent = "ai-strategy" | "ai-content" | "ai-caption";

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

export type AIModel = {
  readonly id: string;
  readonly name: string;
  readonly provider: AIProvider;
  readonly capabilities: readonly string[];
  // Commands this model may serve. Models enter other commands only after
  // their output has been validated for that command.
  readonly intents: readonly AIIntent[];
  readonly tariffs: readonly AITariff[];
};

export const lunaModel = {
  id: "gpt-6-luna",
  name: "GPT-6 Luna",
  provider: "openai",
  capabilities: ["chat-completions", "text", "json", "reasoning"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
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
  id: "gpt-6.1-terra",
  name: "GPT-6.1 Terra",
  provider: "openai",
  capabilities: ["chat-completions", "text", "json", "reasoning"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
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
  id: "gpt-6.1-sol",
  name: "GPT-6.1 Sol",
  provider: "openai",
  capabilities: ["chat-completions", "text", "json", "reasoning"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
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
  id: "gpt-6-astra",
  name: "GPT-6 Astra",
  provider: "openai",
  capabilities: ["chat-completions", "text", "json", "reasoning"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
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
  id: "claude-haiku-5-5",
  name: "Claude Haiku 5.5",
  provider: "anthropic",
  capabilities: ["messages", "text"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
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
  id: "claude-sonnet-5-5",
  name: "Claude Sonnet 5.5",
  provider: "anthropic",
  capabilities: ["messages", "text"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
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
  id: "claude-opus-5-5",
  name: "Claude Opus 5.5",
  provider: "anthropic",
  capabilities: ["messages", "text"],
  intents: ["ai-strategy", "ai-content", "ai-caption"],
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

export const defaultAIModelId = lunaModel.id;

export function findAIModel(id: string): AIModel | undefined {
  return aiModels.find((model) => model.id === id);
}

export const aiOutputLimits = {
  "ai-strategy": 8192,
  "ai-content": 8192,
  "ai-caption": 2048,
} as const;
