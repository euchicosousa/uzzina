import {
  isActionAIModelId,
  lunaModelId,
  type ActionAIModelId,
} from "./action-ai-models";
import { publicAIModels } from "./ai-model-registry";

export type TodayViewMode = "kanban" | "feed" | "categories" | "partners";

export function isTodayViewMode(value: unknown): value is TodayViewMode {
  return (
    value === "kanban" ||
    value === "feed" ||
    value === "categories" ||
    value === "partners"
  );
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

export type CustomThemeColors = {
  primaryHex: string;
  primaryFgHex: string;
  bgHex: string;
  fgHex: string;
};

export type CustomTheme = {
  light: CustomThemeColors;
  dark: CustomThemeColors;
  relief?: boolean;
  /** Light-mode shadow color; also used in dark mode when no dark color is set. */
  shadowColor?: string;
  darkShadowColor?: string;
  /** Shadow opacity in percent (1–100) per mode. */
  shadowOpacity?: number;
  darkShadowOpacity?: number;
  topBorderColor?: string;
};

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
  themeColorIndex: number;
  defaultViewVariant: "line" | "block" | "content";
  defaultTodayView: TodayViewMode;
  showInstagramSidebar: boolean;
  /** Dark mode fill of the "Viva" phase color: full phase color or dimmed. */
  vividDarkTone: VividDarkTone;
  /** Text tone on the "Viva" phase color. */
  vividTextTone: VividTextTone;
  customTheme: CustomTheme | null;
  defaultStrategyModel?: ActionAIModelId;
  defaultContentModel?: ActionAIModelId;
  defaultCaptionModel?: ActionAIModelId;
  strategyModels: ActionAIModelId[];
  contentModels: ActionAIModelId[];
  captionModels: ActionAIModelId[];
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  themeColorIndex: 0,
  defaultViewVariant: "line",
  defaultTodayView: "partners",
  showInstagramSidebar: true,
  vividDarkTone: "pure",
  vividTextTone: "dark",
  customTheme: null,
  strategyModels: [...DEFAULT_TASK_AI_MODELS],
  contentModels: [...DEFAULT_TASK_AI_MODELS],
  captionModels: [...DEFAULT_TASK_AI_MODELS],
  defaultStrategyModel: lunaModelId,
  defaultContentModel: lunaModelId,
  defaultCaptionModel: lunaModelId,
};

export type SerializedPreferences = {
  theme?: string;
  themeColorIndex?: number;
  defaultViewVariant?: string;
  defaultTodayView?: unknown;
  showInstagramSidebar?: boolean;
  vividDarkTone?: unknown;
  vividTextTone?: unknown;
  defaultStrategyModel?: unknown;
  defaultContentModel?: unknown;
  defaultCaptionModel?: unknown;
  strategyModels?: unknown;
  contentModels?: unknown;
  captionModels?: unknown;
  customTheme?: {
    light?: {
      primaryHex?: string;
      primaryFgHex?: string;
      bgHex?: string;
      fgHex?: string;
    };
    dark?: {
      primaryHex?: string;
      primaryFgHex?: string;
      bgHex?: string;
      fgHex?: string;
    };
    relief?: boolean;
    shadowColor?: string;
    darkShadowColor?: string;
    shadowOpacity?: number;
    darkShadowOpacity?: number;
    topBorderColor?: string;
  } | null;
};

function parseShadowOpacity(value: unknown): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 100
    ? value
    : undefined;
}

export function getUserPreferences(person?: {
  preferences?: unknown;
}): UserPreferences {
  const prefs = person?.preferences as SerializedPreferences | null | undefined;
  if (!prefs || typeof prefs !== "object") {
    return DEFAULT_PREFERENCES;
  }

  let customTheme: CustomTheme | null = null;
  if (prefs.customTheme && typeof prefs.customTheme === "object") {
    const light = prefs.customTheme.light;
    const dark = prefs.customTheme.dark;
    if (
      light &&
      typeof light === "object" &&
      dark &&
      typeof dark === "object" &&
      typeof light.primaryHex === "string" &&
      typeof light.primaryFgHex === "string" &&
      typeof light.bgHex === "string" &&
      typeof light.fgHex === "string" &&
      typeof dark.primaryHex === "string" &&
      typeof dark.primaryFgHex === "string" &&
      typeof dark.bgHex === "string" &&
      typeof dark.fgHex === "string"
    ) {
      customTheme = {
        light: {
          primaryHex: light.primaryHex,
          primaryFgHex: light.primaryFgHex,
          bgHex: light.bgHex,
          fgHex: light.fgHex,
        },
        dark: {
          primaryHex: dark.primaryHex,
          primaryFgHex: dark.primaryFgHex,
          bgHex: dark.bgHex,
          fgHex: dark.fgHex,
        },
        relief:
          typeof prefs.customTheme.relief === "boolean"
            ? prefs.customTheme.relief
            : true,
        shadowColor:
          typeof prefs.customTheme.shadowColor === "string" &&
          prefs.customTheme.shadowColor.trim().length > 0
            ? prefs.customTheme.shadowColor
            : undefined,
        darkShadowColor:
          typeof prefs.customTheme.darkShadowColor === "string" &&
          prefs.customTheme.darkShadowColor.trim().length > 0
            ? prefs.customTheme.darkShadowColor
            : undefined,
        shadowOpacity: parseShadowOpacity(prefs.customTheme.shadowOpacity),
        darkShadowOpacity: parseShadowOpacity(
          prefs.customTheme.darkShadowOpacity,
        ),
        topBorderColor:
          typeof prefs.customTheme.topBorderColor === "string" &&
          prefs.customTheme.topBorderColor.trim().length > 0
            ? prefs.customTheme.topBorderColor
            : undefined,
      };
    }
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
    themeColorIndex:
      typeof prefs.themeColorIndex === "number" && prefs.themeColorIndex >= -1
        ? prefs.themeColorIndex
        : DEFAULT_PREFERENCES.themeColorIndex,
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
    customTheme,
  };
}
