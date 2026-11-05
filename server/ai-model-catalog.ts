// Nano-USD per token keeps the per-call calculation exact before aggregation.
export const lunaModel = {
  id: "gpt-6-luna",
  name: "GPT-6 Luna",
  provider: "openai",
  capabilities: ["chat-completions", "text", "json", "reasoning"],
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
} as const;
