import type { AIModelOption } from "~/components/uzzina/UAIModelSelect";
import { publicAIModels, type PublicAIModelId } from "./ai-model-registry";

export const actionAIModels: readonly AIModelOption[] = publicAIModels.map(
  (model) => ({
    id: model.id,
    name: model.name,
    provider: model.provider,
    level: model.level,
  }),
);

export const lunaModelId = publicAIModels[0].id;

export type ActionAIModelId = PublicAIModelId;

export function isActionAIModelId(value: unknown): value is ActionAIModelId {
  return (
    typeof value === "string" &&
    publicAIModels.some((model) => model.id === value)
  );
}
