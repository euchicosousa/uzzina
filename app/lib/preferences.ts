import {
  isActionAIModelId,
  lunaModelId,
  type ActionAIModelId,
} from "./action-ai-models";
import { publicAIModels } from "./ai-model-registry";
import type { PhaseColorMode } from "./CONSTANTS";
import { DEFAULT_PALETTE_ID, getPaletteById } from "./palettes";

export type TodayViewMode =
  "kanban" | "feed" | "categories" | "partners" | "priority" | "timeline";

export function isTodayViewMode(value: unknown): value is TodayViewMode {
  return (
    value === "kanban" ||
    value === "feed" ||
    value === "categories" ||
    value === "partners" ||
    value === "priority" ||
    value === "timeline"
  );
}

export function isPhaseColorMode(value: unknown): value is PhaseColorMode {
  return value === "off" || value === "soft" || value === "vivid";
}

export type VividDarkTone = "pure" | "dim";
export type VividTextTone = "dark" | "light";

export function isVividDarkTone(value: unknown): value is VividDarkTone {
  return value === "pure" || value === "dim";
}

export function isVividTextTone(value: unknown): value is VividTextTone {
  return value === "dark" || value === "light";
}

/** Mirrors the vivid phase color preferences on <html> for the CSS to read. */
export function applyVividPreferences(
  root: HTMLElement,
  tones: { vividDarkTone: VividDarkTone; vividTextTone: VividTextTone },
) {
  root.dataset.vividDark = tones.vividDarkTone;
  root.dataset.vividText = tones.vividTextTone;
}

export const DEFAULT_TASK_AI_MODELS: readonly ActionAIModelId[] =
  publicAIModels.map((m) => m.id);

export function parseTaskModels(value: unknown): ActionAIModelId[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_TASK_AI_MODELS];
  }
  const filtered = value.filter(isActionAIModelId);
  const unique = Array.from(new Set(filtered));
  return unique.length > 0 ? unique : [lunaModelId];
}

function resolveDefaultModel(
  rawCandidate: unknown,
  allowedModels: readonly ActionAIModelId[],
): ActionAIModelId {
  if (isActionAIModelId(rawCandidate) && allowedModels.includes(rawCandidate)) {
    return rawCandidate;
  }
  if (allowedModels.includes(lunaModelId)) {
    return lunaModelId;
  }
  return allowedModels[0] ?? lunaModelId;
}

export type UserPreferences = {
  theme: "light" | "dark" | "system";
  /** Id of the chosen palette (stable when palettes are removed or reordered). */
  themeColor: string;
  defaultViewVariant: "line" | "block" | "content";
  defaultTodayView: TodayViewMode;
  showInstagramSidebar: boolean;
  /** Phase color of every action card in the app: off, soft tint or vivid fill. */
  phaseColor: PhaseColorMode;
  /** Dark mode fill of the "Viva" phase color: full phase color or dimmed. */
  vividDarkTone: VividDarkTone;
  /** Text tone on the "Viva" phase color. */
  vividTextTone: VividTextTone;
  defaultStrategyModel?: ActionAIModelId;
  defaultContentModel?: ActionAIModelId;
  defaultCaptionModel?: ActionAIModelId;
  strategyModels: ActionAIModelId[];
  contentModels: ActionAIModelId[];
  captionModels: ActionAIModelId[];
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  themeColor: DEFAULT_PALETTE_ID,
  defaultViewVariant: "line",
  defaultTodayView: "partners",
  showInstagramSidebar: true,
  phaseColor: "off",
  vividDarkTone: "pure",
  vividTextTone: "dark",
  strategyModels: [...DEFAULT_TASK_AI_MODELS],
  contentModels: [...DEFAULT_TASK_AI_MODELS],
  captionModels: [...DEFAULT_TASK_AI_MODELS],
  defaultStrategyModel: lunaModelId,
  defaultContentModel: lunaModelId,
  defaultCaptionModel: lunaModelId,
};

export type SerializedPreferences = {
  theme?: string;
  themeColor?: unknown;
  /** Legacy position in the old 11-palette order; read only, never written. */
  themeColorIndex?: unknown;
  defaultViewVariant?: string;
  defaultTodayView?: unknown;
  showInstagramSidebar?: boolean;
  phaseColor?: unknown;
  vividDarkTone?: unknown;
  vividTextTone?: unknown;
  defaultStrategyModel?: unknown;
  defaultContentModel?: unknown;
  defaultCaptionModel?: unknown;
  strategyModels?: unknown;
  contentModels?: unknown;
  captionModels?: unknown;
};

/**
 * Order of the 11 palettes when the choice was stored as a position
 * (`themeColorIndex`). Fixed forever: it only converts legacy values to ids.
 */
export const LEGACY_PALETTE_ORDER = [
  "default",
  "carbon",
  "red",
  "orange",
  "yellow",
  "energy",
  // "green" was removed from PALLETE on 22/11/2026 and resolves to the default palette.
  "green",
  "cyan",
  "blue",
  "purple",
  "magenta",
] as const;

/**
 * Palette id for a stored choice. A `themeColor` id that still exists wins;
 * otherwise a legacy numeric `themeColorIndex` is converted through
 * LEGACY_PALETTE_ORDER and used if that palette still exists. Anything else
 * (unknown id, removed palette, -1 of the old Personalizado theme, garbage)
 * falls back to the first palette, Ônix.
 */
export function resolvePaletteId(
  themeColor: unknown,
  legacyIndex?: unknown,
): string {
  const byId = getPaletteById(themeColor);
  if (byId) return byId.id;
  if (typeof legacyIndex === "number" && Number.isInteger(legacyIndex)) {
    const legacyId = LEGACY_PALETTE_ORDER[legacyIndex];
    const byLegacy = getPaletteById(legacyId);
    if (byLegacy) return byLegacy.id;
  }
  return DEFAULT_PALETTE_ID;
}

export function getUserPreferences(person?: {
  preferences?: unknown;
}): UserPreferences {
  const prefs = person?.preferences as SerializedPreferences | null | undefined;
  if (!prefs || typeof prefs !== "object") {
    return DEFAULT_PREFERENCES;
  }

  const strategyModels = parseTaskModels(prefs.strategyModels);
  const contentModels = parseTaskModels(prefs.contentModels);
  const captionModels = parseTaskModels(prefs.captionModels);

  return {
    theme:
      prefs.theme === "light" ||
      prefs.theme === "dark" ||
      prefs.theme === "system"
        ? prefs.theme
        : DEFAULT_PREFERENCES.theme,
    themeColor: resolvePaletteId(prefs.themeColor, prefs.themeColorIndex),
    defaultViewVariant:
      prefs.defaultViewVariant === "line" ||
      prefs.defaultViewVariant === "block" ||
      prefs.defaultViewVariant === "content"
        ? prefs.defaultViewVariant
        : DEFAULT_PREFERENCES.defaultViewVariant,
    defaultTodayView: isTodayViewMode(prefs.defaultTodayView)
      ? prefs.defaultTodayView
      : DEFAULT_PREFERENCES.defaultTodayView,
    showInstagramSidebar:
      typeof prefs.showInstagramSidebar === "boolean"
        ? prefs.showInstagramSidebar
        : DEFAULT_PREFERENCES.showInstagramSidebar,
    phaseColor: isPhaseColorMode(prefs.phaseColor)
      ? prefs.phaseColor
      : DEFAULT_PREFERENCES.phaseColor,
    vividDarkTone: isVividDarkTone(prefs.vividDarkTone)
      ? prefs.vividDarkTone
      : DEFAULT_PREFERENCES.vividDarkTone,
    vividTextTone: isVividTextTone(prefs.vividTextTone)
      ? prefs.vividTextTone
      : DEFAULT_PREFERENCES.vividTextTone,
    strategyModels,
    contentModels,
    captionModels,
    defaultStrategyModel: resolveDefaultModel(
      prefs.defaultStrategyModel,
      strategyModels,
    ),
    defaultContentModel: resolveDefaultModel(
      prefs.defaultContentModel,
      contentModels,
    ),
    defaultCaptionModel: resolveDefaultModel(
      prefs.defaultCaptionModel,
      captionModels,
    ),
  };
}
