// Public model registry: the only place that declares id, name, provider,
// level and default flag. It is shared by the app and the server catalog, so it
// must never hold prices or reservation values (those stay in `server/`).
export type AIProvider = "openai" | "anthropic";

export type PublicAIModel = {
  readonly id: string;
  readonly name: string;
  readonly provider: AIProvider;
  readonly level: 1 | 2 | 3 | 4 | 5;
  readonly isDefault?: boolean;
};

export const publicAIModels = [
  {
    id: "gpt-6-luna",
    name: "GPT-6 Luna",
    provider: "openai",
    level: 1,
    isDefault: true,
  },
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
] as const satisfies readonly PublicAIModel[];

export type PublicAIModelId = (typeof publicAIModels)[number]["id"];

export function findPublicAIModel<Id extends PublicAIModelId>(id: Id) {
  const model = publicAIModels.find((entry) => entry.id === id);
  if (!model) throw new Error(`Unknown public AI model: ${id}`);
  return model as Extract<(typeof publicAIModels)[number], { id: Id }>;
}
