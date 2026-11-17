import { PHASES } from "~/lib/CONSTANTS";
import { PALLETE, type PaletteConfig } from "~/lib/palettes";

export type PhaseSlug = keyof typeof PHASES;
import {
  formatOklchString,
  hexToOklch,
  oklchToHex,
  parseOklchString,
  type OklchColor,
} from "~/utils/color";

export type ThemePreviewMode = "light" | "dark" | "split";

export type PriorityKey = "low" | "medium" | "high";

export type DeltaKey =
  | "cardLDelta"
  | "popoverLDelta"
  | "inputLDelta"
  | "borderLDelta"
  | "actionLDelta"
  | "actionHoverLDelta";

export type PaletteColorKey = "bg" | "fg" | "primary" | "primaryFg" | "ring";

export const PHASE_ORDER: readonly PhaseSlug[] = [
  "idea",
  "do",
  "doing",
  "review",
  "done",
  "finished",
] as const;

export const ORIGINAL_PRIORITIES: Record<
  "light" | "dark",
  Record<PriorityKey, OklchColor>
> = {
  light: {
    low: { l: 0.7, c: 0.17, h: 150 },
    medium: { l: 0.82, c: 0.16, h: 90 },
    high: { l: 0.65, c: 0.22, h: 25 },
  },
  dark: {
    low: { l: 0.75, c: 0.16, h: 150 },
    medium: { l: 0.85, c: 0.15, h: 95 },
    high: { l: 0.7, c: 0.2, h: 25 },
  },
};

export const DEFAULT_MODE_DELTAS: Record<
  "light" | "dark",
  Record<DeltaKey, number>
> = {
  light: {
    cardLDelta: -0.02,
    popoverLDelta: 0,
    borderLDelta: -0.05,
    inputLDelta: -0.05,
    actionLDelta: 0.02,
    actionHoverLDelta: 0.04,
  },
  dark: {
    cardLDelta: 0.05,
    popoverLDelta: -0.03,
    borderLDelta: 0.2,
    inputLDelta: 0.05,
    actionLDelta: 0.1,
    actionHoverLDelta: 0.2,
  },
};

export type PhasesColorMap = Record<PhaseSlug, OklchColor>;
export type PrioritiesColorMap = Record<
  "light" | "dark",
  Record<PriorityKey, OklchColor>
>;

export interface ThemeChangeEntry {
  token: string;
  label: string;
  mode: "Claro" | "Escuro" | "Ambos";
  oldValue: string;
  newValue: string;
  file: string;
  keyPath: string;
}

const STORAGE_KEY = "uzzina:admin-theme-editor-draft:v1";

export interface StoredThemeDraft {
  paletteId: string;
  palette: PaletteConfig;
  phases: PhasesColorMap;
  priorities: PrioritiesColorMap;
}

export function clonePaletteConfig(palette: PaletteConfig): PaletteConfig {
  return {
    ...palette,
    light: {
      ...palette.light,
      primary: { ...palette.light.primary },
      primaryFg: palette.light.primaryFg
        ? { ...palette.light.primaryFg }
        : undefined,
      bg: { ...palette.light.bg },
      fg: { ...palette.light.fg },
      ring: { ...palette.light.ring },
    },
    dark: {
      ...palette.dark,
      primary: { ...palette.dark.primary },
      primaryFg: palette.dark.primaryFg
        ? { ...palette.dark.primaryFg }
        : undefined,
      bg: { ...palette.dark.bg },
      fg: { ...palette.dark.fg },
      ring: { ...palette.dark.ring },
    },
  };
}

export function getOriginalPhasesMap(): PhasesColorMap {
  const map = {} as PhasesColorMap;
  for (const slug of PHASE_ORDER) {
    map[slug] = hexToOklch(PHASES[slug].color);
  }
  return map;
}

export function getOriginalPrioritiesMap(): PrioritiesColorMap {
  return {
    light: {
      low: { ...ORIGINAL_PRIORITIES.light.low },
      medium: { ...ORIGINAL_PRIORITIES.light.medium },
      high: { ...ORIGINAL_PRIORITIES.light.high },
    },
    dark: {
      low: { ...ORIGINAL_PRIORITIES.dark.low },
      medium: { ...ORIGINAL_PRIORITIES.dark.medium },
      high: { ...ORIGINAL_PRIORITIES.dark.high },
    },
  };
}

export function getPaletteById(paletteId: string): PaletteConfig {
  return PALLETE.find((p) => p.id === paletteId) ?? PALLETE[0];
}

export function getModePrimaryFgFallback(
  mode: "light" | "dark",
  primary: OklchColor,
): OklchColor {
  return mode === "light"
    ? { l: 0.97, c: 0, h: primary.h }
    : { l: 0.97, c: 0.014, h: primary.h };
}

export function getEffectivePrimaryFg(
  palette: PaletteConfig,
  mode: "light" | "dark",
): OklchColor {
  return (
    palette[mode].primaryFg ??
    getModePrimaryFgFallback(mode, palette[mode].primary)
  );
}

export function getEffectiveDelta(
  palette: PaletteConfig,
  mode: "light" | "dark",
  key: DeltaKey,
): number {
  return palette[mode][key] ?? DEFAULT_MODE_DELTAS[mode][key];
}

export function getShadowOklch(
  palette: PaletteConfig,
  mode: "light" | "dark",
): OklchColor {
  const raw = palette[mode].shadowColor;
  return parseOklchString(raw) ?? { l: 0.2, c: 0.01, h: 200 };
}

function oklchEquals(a: OklchColor, b: OklchColor): boolean {
  return (
    Math.abs(a.l - b.l) < 0.0005 &&
    Math.abs(a.c - b.c) < 0.0005 &&
    Math.abs(a.h - b.h) < 0.05
  );
}

const PALETTE_COLOR_META: Record<
  PaletteColorKey,
  { label: string; token: string }
> = {
  bg: { label: "Fundo", token: "--background" },
  fg: { label: "Texto", token: "--foreground" },
  primary: { label: "Principal", token: "--primary" },
  primaryFg: {
    label: "Texto sobre a principal",
    token: "--primary-foreground",
  },
  ring: { label: "Anel de foco", token: "--ring" },
};

const DELTA_META: Record<DeltaKey, { label: string; token: string }> = {
  cardLDelta: { label: "Cartão (ajuste de luz)", token: "--card-l-delta" },
  popoverLDelta: {
    label: "Menus e diálogos (ajuste de luz)",
    token: "--popover-l-delta",
  },
  inputLDelta: { label: "Campos (ajuste de luz)", token: "--input-l-delta" },
  borderLDelta: { label: "Bordas (ajuste de luz)", token: "--border-l-delta" },
  actionLDelta: {
    label: "Cartão de ação (ajuste de luz)",
    token: "--action-l-delta",
  },
  actionHoverLDelta: {
    label: "Cartão de ação · mouse (ajuste de luz)",
    token: "--action-hover-l-delta",
  },
};

const PRIORITY_LABELS: Record<PriorityKey, string> = {
  low: "Prioridade Baixa",
  medium: "Prioridade Média",
  high: "Prioridade Alta",
};

export function computeThemeChanges(
  paletteId: string,
  draftPalette: PaletteConfig,
  draftPhases: PhasesColorMap,
  draftPriorities: PrioritiesColorMap,
): ThemeChangeEntry[] {
  const original = getPaletteById(paletteId);
  const originalPhases = getOriginalPhasesMap();
  const originalPriorities = getOriginalPrioritiesMap();
  const changes: ThemeChangeEntry[] = [];

  if ((draftPalette.relief !== false) !== (original.relief !== false)) {
    changes.push({
      token: "relief",
      label: "Relevo dos cartões",
      mode: "Ambos",
      oldValue: String(original.relief !== false),
      newValue: String(draftPalette.relief !== false),
      file: "app/lib/palettes.ts",
      keyPath: `PALLETE.${original.id}.relief`,
    });
  }

  for (const mode of ["light", "dark"] as const) {
    const modeLabel = mode === "light" ? "Claro" : "Escuro";

    for (const key of ["bg", "fg", "primary", "primaryFg", "ring"] as const) {
      const oldColor =
        key === "primaryFg"
          ? getEffectivePrimaryFg(original, mode)
          : original[mode][key];
      const newColor =
        key === "primaryFg"
          ? getEffectivePrimaryFg(draftPalette, mode)
          : draftPalette[mode][key];

      if (!oklchEquals(oldColor, newColor)) {
        changes.push({
          token: PALETTE_COLOR_META[key].token,
          label: PALETTE_COLOR_META[key].label,
          mode: modeLabel,
          oldValue: formatOklchString(oldColor),
          newValue: formatOklchString(newColor),
          file: "app/lib/palettes.ts",
          keyPath: `PALLETE.${original.id}.${mode}.${key}`,
        });
      }
    }

    for (const deltaKey of Object.keys(DELTA_META) as DeltaKey[]) {
      const oldDelta = getEffectiveDelta(original, mode, deltaKey);
      const newDelta = getEffectiveDelta(draftPalette, mode, deltaKey);
      if (Math.abs(oldDelta - newDelta) >= 0.0005) {
        changes.push({
          token: DELTA_META[deltaKey].token,
          label: DELTA_META[deltaKey].label,
          mode: modeLabel,
          oldValue: oldDelta.toFixed(3),
          newValue: newDelta.toFixed(3),
          file: "app/lib/palettes.ts",
          keyPath: `PALLETE.${original.id}.${mode}.${deltaKey}`,
        });
      }
    }

    const oldShadow = getShadowOklch(original, mode);
    const newShadow = getShadowOklch(draftPalette, mode);
    if (!oklchEquals(oldShadow, newShadow)) {
      changes.push({
        token: "--shadow-tint",
        label: "Cor da sombra",
        mode: modeLabel,
        oldValue: formatOklchString(oldShadow),
        newValue: formatOklchString(newShadow),
        file: "app/lib/palettes.ts",
        keyPath: `PALLETE.${original.id}.${mode}.shadowColor`,
      });
    }

    if (original[mode].shadowOpacity !== draftPalette[mode].shadowOpacity) {
      changes.push({
        token: "--shadow-alpha",
        label: "Força da sombra",
        mode: modeLabel,
        oldValue: `${original[mode].shadowOpacity}%`,
        newValue: `${draftPalette[mode].shadowOpacity}%`,
        file: "app/lib/palettes.ts",
        keyPath: `PALLETE.${original.id}.${mode}.shadowOpacity`,
      });
    }
  }

  for (const slug of PHASE_ORDER) {
    const oldPhase = originalPhases[slug];
    const newPhase = draftPhases[slug];
    if (!oklchEquals(oldPhase, newPhase)) {
      const oldHex = PHASES[slug].color.toUpperCase();
      const newHex = oklchToHex(newPhase.h, newPhase.c, newPhase.l);
      changes.push({
        token: `PHASES.${slug}.color`,
        label: `Fase ${PHASES[slug].title}`,
        mode: "Ambos",
        oldValue: `${oldHex} (${formatOklchString(oldPhase)})`,
        newValue: `${newHex} (${formatOklchString(newPhase)})`,
        file: "app/lib/CONSTANTS.ts",
        keyPath: `PHASES.${slug}.color`,
      });
    }
  }

  for (const mode of ["light", "dark"] as const) {
    const modeLabel = mode === "light" ? "Claro" : "Escuro";
    for (const prioKey of ["low", "medium", "high"] as const) {
      const oldPrio = originalPriorities[mode][prioKey];
      const newPrio = draftPriorities[mode][prioKey];
      if (!oklchEquals(oldPrio, newPrio)) {
        changes.push({
          token: `--priority-${prioKey}`,
          label: PRIORITY_LABELS[prioKey],
          mode: modeLabel,
          oldValue: formatOklchString(oldPrio),
          newValue: formatOklchString(newPrio),
          file: "app/tailwind.css",
          keyPath: `${mode === "light" ? ":root" : ':root[class~="dark"]'} → --priority-${prioKey}`,
        });
      }
    }
  }

  return changes;
}

export function buildThemeChangesMarkdown(
  palette: PaletteConfig,
  changes: ThemeChangeEntry[],
): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Instruções de atualização de cores — UZZINA (${palette.label})`,
    "",
    `- **Repositório / App:** UZZINA`,
    `- **Data:** ${today}`,
    `- **Paleta:** ${palette.label} (\`${palette.id}\`)`,
    `- **Total de alterações:** ${changes.length}`,
    "",
    "> **Regra:** Aplique somente estas mudanças; não altere fórmulas nem outros valores.",
    "",
    "## Tabela de alterações",
    "",
    "| Item | Token | Modo | Valor antigo | Valor novo | Arquivo | Chave exata |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const c of changes) {
    lines.push(
      `| ${c.label} | \`${c.token}\` | ${c.mode} | \`${c.oldValue}\` | \`${c.newValue}\` | \`${c.file}\` | \`${c.keyPath}\` |`,
    );
  }

  lines.push(
    "",
    "## Dados estruturados (JSON)",
    "",
    "```json",
    JSON.stringify(
      {
        app: "UZZINA",
        date: today,
        paletteId: palette.id,
        paletteLabel: palette.label,
        changes,
      },
      null,
      2,
    ),
    "```",
    "",
    "## Passos de aplicação e verificação",
    "",
    "1. Edite apenas as chaves listadas na tabela acima nos arquivos indicados (`app/lib/palettes.ts`, `app/lib/CONSTANTS.ts` e/ou `app/tailwind.css`). Não altere fórmulas de cálculo nem outros valores.",
    "2. Rode `bun run typecheck` para validar tipos.",
    "3. Formate os arquivos alterados com Prettier (`./node_modules/.bin/prettier --write <arquivos>`).",
    "4. Confira visualmente no app em `/ui` → **Tokens de Design → Cores Semânticas** e em `/app/admin/themes` nos modos **Claro** e **Escuro**.",
    "5. Aguarde o aceite visual do proprietário antes de realizar commit ou push.",
    "",
  );

  return lines.join("\n");
}

export function loadDraftFromStorage(): StoredThemeDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredThemeDraft;
    if (!parsed || typeof parsed.paletteId !== "string" || !parsed.palette) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraftToStorage(draft: StoredThemeDraft): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage quota or privacy-mode errors.
  }
}

export function clearDraftFromStorage(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
