export type UserPreferences = {
  theme: "light" | "dark" | "system";
  themeColorIndex: number;
  followPartnerColor: boolean;
  defaultViewVariant: "line" | "block" | "content";
  showInstagramSidebar: boolean;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  themeColorIndex: 0,
  followPartnerColor: false,
  defaultViewVariant: "line",
  showInstagramSidebar: true,
};

export function getUserPreferences(person?: { preferences?: any }): UserPreferences {
  const prefs = person?.preferences;
  if (!prefs || typeof prefs !== "object") {
    return DEFAULT_PREFERENCES;
  }
  return {
    theme:
      prefs.theme === "light" || prefs.theme === "dark" || prefs.theme === "system"
        ? prefs.theme
        : DEFAULT_PREFERENCES.theme,
    themeColorIndex:
      typeof prefs.themeColorIndex === "number" && prefs.themeColorIndex >= 0
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
  };
}
