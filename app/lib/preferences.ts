export type CustomThemeColors = {
  primaryHex: string;
  primaryFgHex: string;
  bgHex: string;
  fgHex: string;
};

export type CustomTheme = {
  light: CustomThemeColors;
  dark: CustomThemeColors;
};

export type UserPreferences = {
  theme: "light" | "dark" | "system";
  themeColorIndex: number;
  followPartnerColor: boolean;
  defaultViewVariant: "line" | "block" | "content";
  showInstagramSidebar: boolean;
  customTheme: CustomTheme | null;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  themeColorIndex: 0,
  followPartnerColor: false,
  defaultViewVariant: "line",
  showInstagramSidebar: true,
  customTheme: null,
};

export type SerializedPreferences = {
  theme?: string;
  themeColorIndex?: number;
  followPartnerColor?: boolean;
  defaultViewVariant?: string;
  showInstagramSidebar?: boolean;
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
  } | null;
};

export function getUserPreferences(person?: { preferences?: unknown }): UserPreferences {
  const prefs = person?.preferences as SerializedPreferences | null | undefined;
  if (!prefs || typeof prefs !== "object") {
    return DEFAULT_PREFERENCES;
  }
  
  let customTheme: CustomTheme | null = null;
  if (prefs.customTheme && typeof prefs.customTheme === "object") {
    const light = prefs.customTheme.light;
    const dark = prefs.customTheme.dark;
    if (
      light && typeof light === "object" &&
      dark && typeof dark === "object" &&
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
      };
    }
  }

  return {
    theme:
      prefs.theme === "light" || prefs.theme === "dark" || prefs.theme === "system"
        ? prefs.theme
        : DEFAULT_PREFERENCES.theme,
    themeColorIndex:
      typeof prefs.themeColorIndex === "number" && prefs.themeColorIndex >= -1
        ? prefs.themeColorIndex
        : DEFAULT_PREFERENCES.themeColorIndex,
    followPartnerColor:
      typeof prefs.followPartnerColor === "boolean"
        ? prefs.followPartnerColor
        : DEFAULT_PREFERENCES.followPartnerColor,
    defaultViewVariant:
      prefs.defaultViewVariant === "line" ||
      prefs.defaultViewVariant === "block" ||
      prefs.defaultViewVariant === "content"
        ? prefs.defaultViewVariant
        : DEFAULT_PREFERENCES.defaultViewVariant,
    showInstagramSidebar:
      typeof prefs.showInstagramSidebar === "boolean"
        ? prefs.showInstagramSidebar
        : DEFAULT_PREFERENCES.showInstagramSidebar,
    customTheme,
  };
}

