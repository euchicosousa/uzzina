import type { AIModelOption } from "~/components/uzzina/UAIModelSelect";
import { publicAIModels, type PublicAIModelId } from "./ai-model-registry";

export type ActionAIModelId = PublicAIModelId;

export type ActionAIModelOption = AIModelOption & {
  readonly id: ActionAIModelId;
};

export const actionAIModels: readonly ActionAIModelOption[] =
  publicAIModels.map((model) => ({
    id: model.id,
    name: model.name,
    provider: model.provider,
    level: model.level,
  }));

export const lunaModelId = publicAIModels[0].id;

export function isActionAIModelId(value: unknown): value is ActionAIModelId {
  return (
    typeof value === "string" &&
    publicAIModels.some((model) => model.id === value)
  );
}

export function getAvailableAIModels(
  allowedIds?: readonly ActionAIModelId[],
): readonly ActionAIModelOption[] {
  if (!allowedIds || allowedIds.length === 0) {
    return actionAIModels;
  }
  const set = new Set<string>(allowedIds);
  const filtered = actionAIModels.filter((model) => set.has(model.id));
  return filtered.length > 0
    ? filtered
    : actionAIModels.filter((model) => model.id === lunaModelId);
}
