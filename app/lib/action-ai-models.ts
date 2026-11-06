import type { AIModelOption } from "~/components/uzzina/UAIModelSelect";

export const actionAIModels = [
  { id: "gpt-6-luna", name: "GPT-6 Luna", provider: "openai", level: 1 },
  { id: "gpt-6.1-terra", name: "GPT-6.1 Terra", provider: "openai", level: 2 },
  { id: "gpt-6.1-sol", name: "GPT-6.1 Sol", provider: "openai", level: 3 },
  { id: "gpt-6-astra", name: "GPT-6 Astra", provider: "openai", level: 5 },
  {
    id: "claude-haiku-5-5",
    name: "Claude Haiku 5.5",
    provider: "anthropic",
    level: 1,
  },
  {
    id: "claude-sonnet-5-5",
    name: "Claude Sonnet 5.5",
    provider: "anthropic",
    level: 3,
  },
  {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    provider: "anthropic",
    level: 4,
  },
] as const satisfies readonly AIModelOption[];

export const lunaModelId = actionAIModels[0].id;

export type ActionAIModelId = (typeof actionAIModels)[number]["id"];

export function isActionAIModelId(value: unknown): value is ActionAIModelId {
  return actionAIModels.some((model) => model.id === value);
}
