import { describe, expect, test } from "bun:test";
import {
  actionAIModels,
  getAvailableAIModels,
  lunaModelId,
} from "../app/lib/action-ai-models";
import {
  DEFAULT_TASK_AI_MODELS,
  getUserPreferences,
  parseTaskModels,
} from "../app/lib/preferences";

describe("IA-M06: preferências de modelos de IA por tarefa", () => {
  test("parseTaskModels devolve todos os modelos quando a preferência não existe", () => {
    expect(parseTaskModels(undefined)).toEqual([...DEFAULT_TASK_AI_MODELS]);
    expect(parseTaskModels(null)).toEqual([...DEFAULT_TASK_AI_MODELS]);
    expect(parseTaskModels("invalid")).toEqual([...DEFAULT_TASK_AI_MODELS]);
    expect(parseTaskModels(123)).toEqual([...DEFAULT_TASK_AI_MODELS]);
  });

  test("parseTaskModels filtra IDs inválidos e deduplica", () => {
    const result = parseTaskModels([
      "claude-sonnet-5-5",
      "invalid-model",
      "claude-sonnet-5-5",
      "gpt-6-luna",
    ]);
    expect(result).toEqual(["claude-sonnet-5-5", "gpt-6-luna"]);
  });

  test("parseTaskModels cai no Luna quando a lista está vazia ou só tem modelos inválidos", () => {
    expect(parseTaskModels([])).toEqual([lunaModelId]);
    expect(parseTaskModels(["unknown-1", "unknown-2"])).toEqual([lunaModelId]);
  });

  test("getUserPreferences inicializa com todos os 7 modelos por padrão", () => {
    const prefs = getUserPreferences({});
    expect(prefs.strategyModels).toEqual([...DEFAULT_TASK_AI_MODELS]);
    expect(prefs.contentModels).toEqual([...DEFAULT_TASK_AI_MODELS]);
    expect(prefs.captionModels).toEqual([...DEFAULT_TASK_AI_MODELS]);
    expect(prefs.defaultStrategyModel).toBe(lunaModelId);
    expect(prefs.defaultContentModel).toBe(lunaModelId);
    expect(prefs.defaultCaptionModel).toBe(lunaModelId);
  });

  test("getUserPreferences preserva tarefas com modelos selecionados", () => {
    const prefs = getUserPreferences({
      preferences: {
        strategyModels: ["gpt-6.1-terra", "claude-opus-5-5"],
        contentModels: ["gpt-6.1-sol"],
        captionModels: ["claude-haiku-5-5", "claude-sonnet-5-5"],
        defaultStrategyModel: "claude-opus-5-5",
        defaultContentModel: "gpt-6.1-sol",
        defaultCaptionModel: "claude-sonnet-5-5",
      },
    });

    expect(prefs.strategyModels).toEqual(["gpt-6.1-terra", "claude-opus-5-5"]);
    expect(prefs.contentModels).toEqual(["gpt-6.1-sol"]);
    expect(prefs.captionModels).toEqual([
      "claude-haiku-5-5",
      "claude-sonnet-5-5",
    ]);
    expect(prefs.defaultStrategyModel).toBe("claude-opus-5-5");
    expect(prefs.defaultContentModel).toBe("gpt-6.1-sol");
    expect(prefs.defaultCaptionModel).toBe("claude-sonnet-5-5");
  });

  test("getUserPreferences ajusta o padrão para Luna se o modelo salvo não estiver entre os permitidos", () => {
    const prefs = getUserPreferences({
      preferences: {
        strategyModels: ["gpt-6-luna", "gpt-6.1-terra"],
        defaultStrategyModel: "claude-opus-5-5", // opus não está em strategyModels
      },
    });
    // Como Luna está nos permitidos, cai no Luna
    expect(prefs.defaultStrategyModel).toBe(lunaModelId);
  });

  test("getUserPreferences ajusta o padrão para a primeira opção se Luna não estiver permitido", () => {
    const prefs = getUserPreferences({
      preferences: {
        captionModels: ["claude-sonnet-5-5", "claude-opus-5-5"],
        defaultCaptionModel: "gpt-6-luna", // Luna não está em captionModels
      },
    });
    expect(prefs.defaultCaptionModel).toBe("claude-sonnet-5-5");
  });

  test("getAvailableAIModels filtra a lista preservando metadados dos modelos", () => {
    const subset = getAvailableAIModels(["claude-sonnet-5-5", "gpt-6.1-terra"]);
    expect(subset.map((m) => m.id)).toEqual([
      "gpt-6.1-terra",
      "claude-sonnet-5-5",
    ]);
    for (const m of subset) {
      const original = actionAIModels.find((orig) => orig.id === m.id);
      if (!original) throw new Error(`Model not found: ${m.id}`);
      expect(m.name).toBe(original.name);
      expect(m.provider).toBe(original.provider);
      expect(m.level).toBe(original.level);
    }
  });

  test("getAvailableAIModels cai em Luna se a lista de permitidos for inválida", () => {
    const fallback = getAvailableAIModels([]);
    expect(fallback.map((m) => m.id)).toEqual(actionAIModels.map((m) => m.id));
  });
});
