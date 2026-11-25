import { SearchIcon, XIcon } from "lucide-react";
import {
  PrismBadge,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupButton,
  PrismInputGroupInput,
  PrismAccordion,
  PrismAccordionContent,
  PrismAccordionItem,
  PrismAccordionTrigger,
  PrismToggleGroup,
  PrismToggleGroupItem,
  PrismTab,
  PrismTabList,
  PrismTabPanel,
  PrismTabs,
} from "~/components/prism";
import { Children, Fragment, isValidElement, useState } from "react";
import { UPreferenceSwitch } from "~/components/uzzina/UPreferenceSwitch";
import { CATEGORIES, PHASES } from "~/lib/CONSTANTS";
import {
  oklchToCss,
  type PaletteConfig,
  type PhaseSlug,
  type CategorySlug,
  type SharedColors,
} from "~/lib/palettes";
import {
  formatOklchString,
  getOklchContrastRatio,
  oklchToHex,
  type OklchColor,
} from "~/utils/color";
import {
  ColorGroup,
  formatDelta,
  LockedRow,
  RowHeader,
  RuleInfo,
  SwatchPair,
  ValueGroup,
  ValueSetGroup,
  type ValueRowSpec,
} from "./ThemeEditorControls";
import {
  PHASE_SAMPLE_KIND,
  PhaseSampleTiles,
  phaseSampleStyles,
} from "./ThemePhaseSamples";
import {
  CATEGORY_ORDER,
  derivePriorities,
  getEffectiveDelta,
  getEffectivePrimaryFg,
  getFormulaValue,
  getLateValue,
  getOriginalShared,
  getPaletteById,
  getPhaseFormula,
  getSharedNumber,
  getStateColor,
  getPaletteFg,
  matchesSearch,
  PHASE_ORDER,
  type DeltaKey,
  type FormulaKey,
  type LateKey,
  type PaletteColorKey,
  type PhaseFormulaKey,
  type SharedNumberKey,
  type StateKey,
  type StatePart,
} from "./theme-editor-model";
import cn from "cnfast";

type InspectorTab = "tema" | "estados" | "fases" | "formulas";

const TAB_TITLES: Record<InspectorTab, string> = {
  tema: "Tema",
  estados: "Estados",
  fases: "Fases e categorias",
  formulas: "Fórmulas",
};

/** Extra search words per item id, besides its label and hint. */
const ITEM_KEYWORDS: Record<string, string> = {
  bg: "bg background fundo pagina",
  fg: "fg foreground texto",
  primary: "primary principal botao",
  primaryFg: "primary-foreground texto principal",
  accent: "accent ring foco destaque",
  popover: "popover flutuante menu dialogo",
  popoverBorder: "popover border borda flutuante",
  card: "card cartao",
  input: "input campo",
  secondary: "secondary cinza",
  secondaryHover: "secondary hover cinza",
  border: "border borda bordas",
  action: "action acao",
  actionHover: "action hover acao",
  relief: "relief relevo",
  error: "error erro vermelho",
  warning: "warning atencao aviso",
  success: "success sucesso",
  info: "info informacao",
  successStrong: "success sucesso forte",
  stateMix: "state mix avisos",
  lateBg: "late atrasada erro error",
  "prio-low": "prioridade baixa success sucesso",
  "prio-medium": "prioridade media warning atencao",
  "prio-high": "prioridade alta error erro",
  support: "support apoio texto",
  marker: "marker marca texto",
  primaryHover: "primary hover principal",
  ringHalo: "ring halo foco",
  successStrongHalo: "success halo foco",
  skeleton: "skeleton esqueleto carregamento",
  shadow: "shadow sombra sombras",
  actionCardShadow: "action shadow sombra anel ring",
  lateShadow: "late shadow sombra atrasada",
  topHighlight: "highlight brilho borda",
  categoryIcon: "category icon categoria icone",
};

interface ThemeColorInspectorProps {
  /** Initial search text (the field starts empty in the editor). */
  defaultSearch?: string;
  palette: PaletteConfig;
  /** Colors shared by every palette: states, phases and categories. */
  shared: SharedColors;
  onChangePaletteColor: (
    mode: "light" | "dark",
    key: PaletteColorKey,
    color: OklchColor,
  ) => void;
  onChangeDelta: (mode: "light" | "dark", key: DeltaKey, value: number) => void;
  onChangeRelief: (relief: boolean) => void;
  onChangePhase: (slug: PhaseSlug, color: OklchColor) => void;
  onChangeCategory: (slug: CategorySlug, color: OklchColor) => void;
  onChangeFormula: (
    key: FormulaKey,
    mode: "light" | "dark",
    value: number,
  ) => void;
  onChangeLate: (key: LateKey, mode: "light" | "dark", value: number) => void;
  onChangePhaseFormula: (
    key: PhaseFormulaKey,
    mode: "light" | "dark",
    value: number,
  ) => void;
  onChangePrimaryFgDelta: (
    mode: "light" | "dark",
    part: "l" | "c" | "h",
    value: number,
  ) => void;
  onChangeState: (
    key: StateKey,
    part: StatePart,
    mode: "light" | "dark",
    color: OklchColor,
  ) => void;
  onChangeSharedNumber: (
    key: SharedNumberKey,
    mode: "light" | "dark",
    value: number,
  ) => void;
  onHoverTarget: (target: string | null) => void;
}

function computeModeCardColor(
  palette: PaletteConfig,
  mode: "light" | "dark",
  deltaKey: DeltaKey,
): string {
  const bg = palette[mode].bg;
  const delta = getEffectiveDelta(palette, mode, deltaKey);
  // The floating border is relative to the popover, not to the page background.
  const base =
    deltaKey === "popoverBorderLDelta"
      ? Math.max(0, Math.min(1, bg.l + palette[mode].popoverLDelta))
      : bg.l;
  return formatOklchString({
    l: Math.max(0, Math.min(1, base + delta)),
    c: bg.c,
    h: bg.h,
  });
}

const BOX =
  "flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card squircle";

const MODES = [
  { mode: "light" as const, title: "Claro" },
  { mode: "dark" as const, title: "Escuro" },
];

export function ThemeColorInspector({
  defaultSearch = "",
  palette,
  shared,
  onChangePaletteColor,
  onChangeDelta,
  onChangeRelief,
  onChangePhase,
  onChangeCategory,
  onChangeFormula,
  onChangeLate,
  onChangePhaseFormula,
  onChangePrimaryFgDelta,
  onChangeState,
  onChangeSharedNumber,
  onHoverTarget,
}: ThemeColorInspectorProps) {
  const [samplePhase, setSamplePhase] = useState<PhaseSlug>("doing");
  const [search, setSearch] = useState(defaultSearch);
  const query = search.trim();
  const searching = query.length > 0;
  // Search state of this render: items register themselves while the four
  // tabs are built, so each tab knows how many items match.
  const found: Record<InspectorTab, number> = {
    tema: 0,
    estados: 0,
    fases: 0,
    formulas: 0,
  };
  const scope = {
    tab: "tema" as InspectorTab,
    tabHit: false,
    section: "",
    sectionHit: false,
  };
  const total = () => found.tema + found.estados + found.fases + found.formulas;
  const startTab = (tab: InspectorTab) => {
    scope.tab = tab;
    scope.tabHit = matchesSearch(query, TAB_TITLES[tab]);
  };
  /** True when the item shows; counts it for the current tab while searching. */
  const visible = (id: string, ...fields: Array<string | undefined>) => {
    if (!searching) return true;
    const hit =
      scope.tabHit ||
      scope.sectionHit ||
      matchesSearch(query, ...fields, id, ITEM_KEYWORDS[id]);
    if (hit) found[scope.tab] += 1;
    return hit;
  };
  const originalPalette = getPaletteById(palette.id);
  const originalShared = getOriginalShared();
  const phases = shared.phases;
  const priorities = derivePriorities(shared);

  const fgContrast = (["light", "dark"] as const).map((m) =>
    getOklchContrastRatio(getPaletteFg(palette, m), palette[m].bg),
  );
  const pFg = {
    light: getEffectivePrimaryFg(palette, "light"),
    dark: getEffectivePrimaryFg(palette, "dark"),
  };
  const primaryContrast = (["light", "dark"] as const).map((m) =>
    getOklchContrastRatio(pFg[m], palette[m].primary),
  );

  const solid = (c: OklchColor): React.CSSProperties => ({
    backgroundColor: formatOklchString(c),
  });

  const hover = (targetId: string) => ({
    onMouseEnter: () => onHoverTarget(targetId),
    onMouseLeave: () => onHoverTarget(null),
  });

  /** One accordion item: header (name, info, hint, swatches) and its open panel. */
  const item = (opts: {
    id: string;
    label: string;
    hint?: string;
    targetId: string;
    swatches: React.ReactNode;
    children: React.ReactNode;
  }) =>
    !visible(opts.id, opts.label, opts.hint, opts.targetId) ? null : (
      <PrismAccordionItem key={opts.id} id={opts.id} {...hover(opts.targetId)}>
        <PrismAccordionTrigger aria-label={opts.label} className="p-5" info>
          <RowHeader
            hint={opts.hint}
            info={<RuleInfo id={opts.id} palette={palette} shared={shared} />}
            label={opts.label}
            swatches={opts.swatches}
          />
        </PrismAccordionTrigger>
        <PrismAccordionContent>
          <div className="flex flex-col gap-8 pt-2">{opts.children}</div>
        </PrismAccordionContent>
      </PrismAccordionItem>
    );

  const colorItem = (opts: {
    id: string;
    label: string;
    hint: string;
    targetId: string;
    light: OklchColor;
    dark: OklchColor;
    origLight: OklchColor;
    origDark: OklchColor;
    onLight: (c: OklchColor) => void;
    onDark: (c: OklchColor) => void;
    swatchLabel?: string;
    lightStyle?: React.CSSProperties;
    darkStyle?: React.CSSProperties;
  }) =>
    item({
      id: opts.id,
      label: opts.label,
      hint: opts.hint,
      targetId: opts.targetId,
      swatches: (
        <SwatchPair
          dark={opts.darkStyle ?? solid(opts.dark)}
          label={opts.swatchLabel}
          light={opts.lightStyle ?? solid(opts.light)}
        />
      ),
      children: (
        <>
          <ColorGroup
            color={opts.light}
            mode="light"
            onChange={opts.onLight}
            original={opts.origLight}
            title="Claro"
          />
          <ColorGroup
            color={opts.dark}
            mode="dark"
            onChange={opts.onDark}
            original={opts.origDark}
            title="Escuro"
          />
        </>
      ),
    });

  const deltaItem = (opts: {
    id: string;
    label: string;
    hint: string;
    deltaKey: DeltaKey;
    targetId: string;
  }) =>
    item({
      id: opts.id,
      label: opts.label,
      hint: opts.hint,
      targetId: opts.targetId,
      swatches: (
        <SwatchPair
          dark={{
            backgroundColor: computeModeCardColor(
              palette,
              "dark",
              opts.deltaKey,
            ),
          }}
          light={{
            backgroundColor: computeModeCardColor(
              palette,
              "light",
              opts.deltaKey,
            ),
          }}
        />
      ),
      children: (
        <>
          <p className="text-base text-secondary-foreground">
            {opts.deltaKey === "popoverBorderLDelta"
              ? "Quanto a luz do Flutuante sobe (+) ou desce (−). A cor e a saturação vêm do Flutuante."
              : "Quanto a luz do fundo sobe (+) ou desce (−). A cor e a saturação vêm do Fundo."}
          </p>
          {MODES.map(({ mode, title }) => (
            <ValueGroup
              format={formatDelta}
              key={mode}
              max={opts.deltaKey === "fgLDelta" ? 1 : 0.35}
              min={opts.deltaKey === "fgLDelta" ? -1 : -0.35}
              mode={mode}
              name="Luz"
              onChange={(v) => onChangeDelta(mode, opts.deltaKey, v)}
              original={getEffectiveDelta(originalPalette, mode, opts.deltaKey)}
              step={0.005}
              title={title}
              value={getEffectiveDelta(palette, mode, opts.deltaKey)}
            />
          ))}
        </>
      ),
    });

  /** Read-only rules live in one box, one row each. */
  const lockedRow = (opts: {
    id: string;
    label: string;
    hint: string;
    light: string;
    dark: string;
  }) =>
    !visible(opts.id, opts.label, opts.hint) ? null : (
      <LockedRow key={opts.id} {...hover(opts.id)}>
        <RowHeader
          hint={opts.hint}
          info={<RuleInfo id={opts.id} palette={palette} shared={shared} />}
          label={opts.label}
          locked
          swatches={
            <SwatchPair
              dark={{ backgroundColor: opts.dark }}
              light={{ backgroundColor: opts.light }}
            />
          }
        />
      </LockedRow>
    );

  /** Block of the editor: title (h5) and a short explanation. */
  const section = (
    title: string,
    description: string,
    render: () => React.ReactNode,
  ) => {
    const before = total();
    // The "6. " prefix is not part of the name people search for.
    scope.section = title.replace(/^\d+\.\s*/, "");
    scope.sectionHit = searching && matchesSearch(query, scope.section);
    const children = render();
    scope.section = "";
    scope.sectionHit = false;
    if (searching && total() === before) return null;
    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h5>{title}</h5>
          <p className="text-base text-secondary-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </section>
    );
  };

  const hasContent = (node: React.ReactNode): boolean =>
    Children.toArray(node).some((child) =>
      isValidElement<{ children?: React.ReactNode }>(child) &&
      child.type === Fragment
        ? hasContent(child.props.children)
        : true,
    );

  const accordion = (children: React.ReactNode) =>
    !hasContent(children) ? null : (
      <PrismAccordion allowsMultipleExpanded variant="card">
        {children}
      </PrismAccordion>
    );

  const mix = (
    a: OklchColor,
    pct: number,
    b: OklchColor,
    space: "oklab" | "srgb" = "oklab",
  ) =>
    `color-mix(in ${space}, ${formatOklchString(a)} ${pct}%, ${formatOklchString(b)})`;

  const delta3 = (value: number) =>
    `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(3)}`;
  const percent = (value: number) => `${value}%`;

  type PhaseRow = {
    key: PhaseFormulaKey;
    name: string;
    min: number;
    max: number;
    step: number;
    /** pair: one value per mode; single: one value for both; dark: dark only. */
    scope: "pair" | "single" | "dark";
    format: (value: number) => string;
  };

  /**
   * Derivation item of a phase. Rows are grouped by mode (Claro, Escuro) so each
   * group lists everything that changes in that mode; rows shared by both modes
   * go in their own group.
   */
  const phaseFormulaItem = (opts: {
    id: string;
    label: string;
    hint: string;
    rows: PhaseRow[];
  }) => {
    const spec = (row: PhaseRow, mode: "light" | "dark"): ValueRowSpec => ({
      name: row.name,
      value: getPhaseFormula(shared, row.key, mode),
      original: getPhaseFormula(originalShared, row.key, mode),
      min: row.min,
      max: row.max,
      step: row.step,
      format: row.format,
      onChange: (v) => onChangePhaseFormula(row.key, mode, v),
    });
    const sampleKind = PHASE_SAMPLE_KIND[opts.id];
    const sampleStyles = sampleKind
      ? phaseSampleStyles(sampleKind, shared, palette, phases[samplePhase])
      : null;
    const sampleSwatches = sampleStyles ? (
      <SwatchPair
        dark={sampleStyles.dark}
        label="Aa"
        light={sampleStyles.light}
      />
    ) : null;
    const pairRows = opts.rows.filter((r) => r.scope === "pair");
    const darkRows = opts.rows.filter((r) => r.scope === "dark");
    const singleRows = opts.rows.filter((r) => r.scope === "single");
    return item({
      id: opts.id,
      label: opts.label,
      hint: opts.hint,
      targetId: opts.id,
      swatches: sampleSwatches,
      children: (
        <>
          {sampleKind && (
            <PhaseSampleTiles
              kind={sampleKind}
              palette={palette}
              phase={phases[samplePhase]}
              phaseTitle={PHASES[samplePhase].title}
              shared={shared}
            />
          )}
          {MODES.map(({ mode, title }) => {
            const rows = [
              ...pairRows.map((r) => spec(r, mode)),
              ...(mode === "dark" ? darkRows.map((r) => spec(r, "dark")) : []),
            ];
            return rows.length > 0 ? (
              <ValueSetGroup key={mode} mode={mode} rows={rows} title={title} />
            ) : null;
          })}
          {singleRows.length > 0 && (
            <ValueSetGroup
              rows={singleRows.map((r) => spec(r, "light"))}
              title="Claro e escuro"
            />
          )}
        </>
      ),
    });
  };

  /** Late card background: the Erro fill at its opacity over the page background. */
  const lateBgSwatch = (mode: "light" | "dark"): string => {
    const err = formatOklchString(shared.states.error.color[mode]);
    const bg = formatOklchString(palette[mode].bg);
    const fill = `color-mix(in oklab, ${err} ${shared.states.backgroundMix[mode]}%, ${bg})`;
    return `color-mix(in srgb, ${fill} ${getFormulaValue(shared, "lateBgAlpha", mode)}%, ${bg})`;
  };

  /** Spec of one numeric row inside a mode group. */
  type SetSpec = {
    name: string;
    min: number;
    max: number;
    step: number;
    format: (value: number) => string;
    /** pair: one value per mode; both: the same value for both modes. */
    scope: "pair" | "both";
    get: (mode: "light" | "dark") => number;
    original: (mode: "light" | "dark") => number;
    set: (mode: "light" | "dark", value: number) => void;
  };

  /**
   * Every numeric control of an item, grouped by mode: one "Claro" group and
   * one "Escuro" group listing all the rows, plus a group for values shared by
   * both modes. Replaces one-row groups that repeated Claro/Escuro.
   */
  const numberSets = (specs: SetSpec[]) => {
    const row = (spec: SetSpec, mode: "light" | "dark"): ValueRowSpec => ({
      name: spec.name,
      value: spec.get(mode),
      original: spec.original(mode),
      min: spec.min,
      max: spec.max,
      step: spec.step,
      format: spec.format,
      onChange: (v) => spec.set(mode, v),
    });
    const pairs = specs.filter((spec) => spec.scope === "pair");
    const both = specs.filter((spec) => spec.scope === "both");
    return (
      <>
        {pairs.length > 0 &&
          MODES.map(({ mode, title }) => (
            <ValueSetGroup
              key={mode}
              mode={mode}
              rows={pairs.map((spec) => row(spec, mode))}
              title={title}
            />
          ))}
        {both.length > 0 && (
          <ValueSetGroup
            rows={both.map((spec) => row(spec, "light"))}
            title="Claro e escuro"
          />
        )}
      </>
    );
  };

  const formulaSpec = (
    key: FormulaKey,
    name: string,
    min: number,
    max: number,
    step: number,
    format: (value: number) => string,
  ): SetSpec => ({
    name,
    min,
    max,
    step,
    format,
    scope: "pair",
    get: (mode) => getFormulaValue(shared, key, mode),
    original: (mode) => getFormulaValue(originalShared, key, mode),
    set: (mode, v) => onChangeFormula(key, mode, v),
  });

  const sharedSpec = (
    key: SharedNumberKey,
    name: string,
    min: number,
    max: number,
    step: number,
    format: (value: number) => string,
    scope: "pair" | "both" = "both",
  ): SetSpec => ({
    name,
    min,
    max,
    step,
    format,
    scope,
    get: (mode) => getSharedNumber(shared, key, mode),
    original: (mode) => getSharedNumber(originalShared, key, mode),
    set: (mode, v) => onChangeSharedNumber(key, mode, v),
  });

  const strongColor = (mode: "light" | "dark"): OklchColor => ({
    l: shared.states.successStrong.l,
    c: shared.states.successStrong.c,
    h: shared.states.success.color[mode].h,
  });

  /** Marker text of one mode: Atenção's L plus the delta, with the marker chroma. */
  const markerSwatch = (mode: "light" | "dark"): string => {
    const warning = shared.states.warning.color[mode];
    return formatOklchString({
      l: Math.max(
        0,
        Math.min(1, warning.l + getSharedNumber(shared, "markerLDelta", mode)),
      ),
      c: getSharedNumber(shared, "markerC", mode),
      h: warning.h,
    });
  };

  /** A state (aviso): fill and text, in light and dark, each as L-C-H. */
  const stateItem = (key: StateKey, label: string, hint: string) => {
    const parts: Array<{ part: StatePart; name: string }> = [
      { part: "color", name: "Cor" },
      { part: "text", name: "Texto" },
    ];
    return item({
      id: key,
      label,
      hint,
      targetId: key,
      swatches: (
        <SwatchPair
          dark={solid(getStateColor(shared, key, "color", "dark"))}
          light={solid(getStateColor(shared, key, "color", "light"))}
        />
      ),
      children: parts.flatMap(({ part, name }) =>
        MODES.map(({ mode, title }) => (
          <ColorGroup
            color={getStateColor(shared, key, part, mode)}
            key={`${key}-${part}-${mode}`}
            mode={mode}
            onChange={(c) => onChangeState(key, part, mode, c)}
            original={getStateColor(originalShared, key, part, mode)}
            title={`${name} · ${title}`}
          />
        )),
      ),
    });
  };

  startTab("tema");
  const tema = (
    <>
      {section(
        "1. Base",
        `Só da paleta ${palette.label} · claro e escuro`,
        () =>
          accordion(
            <>
              {colorItem({
                id: "bg",
                label: "Fundo",
                hint: "Fundo da página",
                targetId: "bg",
                light: palette.light.bg,
                dark: palette.dark.bg,
                origLight: originalPalette.light.bg,
                origDark: originalPalette.dark.bg,
                onLight: (c) => onChangePaletteColor("light", "bg", c),
                onDark: (c) => onChangePaletteColor("dark", "bg", c),
              })}
              {deltaItem({
                id: "fg",
                label: "Texto",
                hint: `Contraste ${fgContrast[0].toFixed(1)} · ${fgContrast[1].toFixed(1)}`,
                deltaKey: "fgLDelta",
                targetId: "fg",
              })}
              {colorItem({
                id: "primary",
                label: "Principal",
                hint: "Botão principal, seleção",
                targetId: "primary",
                light: palette.light.primary,
                dark: palette.dark.primary,
                origLight: originalPalette.light.primary,
                origDark: originalPalette.dark.primary,
                onLight: (c) => onChangePaletteColor("light", "primary", c),
                onDark: (c) => onChangePaletteColor("dark", "primary", c),
              })}
              {item({
                id: "primaryFg",
                label: "Texto sobre a principal",
                hint: `Contraste ${primaryContrast[0].toFixed(1)} · ${primaryContrast[1].toFixed(1)}`,
                targetId: "primaryFg",
                swatches: (
                  <SwatchPair
                    dark={{
                      ...solid(palette.dark.primary),
                      color: formatOklchString(pFg.dark),
                    }}
                    label="Aa"
                    light={{
                      ...solid(palette.light.primary),
                      color: formatOklchString(pFg.light),
                    }}
                  />
                ),
                children: numberSets(
                  (["l", "c", "h"] as const).map((axis) => ({
                    name:
                      axis === "l"
                        ? "Luz"
                        : axis === "c"
                          ? "Saturação"
                          : "Matiz",
                    min: axis === "l" ? -1 : axis === "c" ? -0.5 : -180,
                    max: axis === "l" ? 1 : axis === "c" ? 0.05 : 180,
                    step: axis === "l" ? 0.005 : axis === "c" ? 0.002 : 1,
                    format:
                      axis === "h"
                        ? (v: number) =>
                            `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(0)}°`
                        : formatDelta,
                    scope: "pair" as const,
                    get: (mode: "light" | "dark") =>
                      palette[mode].primaryFgDelta[axis],
                    original: (mode: "light" | "dark") =>
                      originalPalette[mode].primaryFgDelta[axis],
                    set: (mode: "light" | "dark", v: number) =>
                      onChangePrimaryFgDelta(mode, axis, v),
                  })),
                ),
              })}
              {colorItem({
                id: "accent",
                label: "Destaque",
                hint: "Anel de foco do teclado",
                targetId: "ring",
                light: palette.light.accent,
                dark: palette.dark.accent,
                origLight: originalPalette.light.accent,
                origDark: originalPalette.dark.accent,
                onLight: (c) => onChangePaletteColor("light", "accent", c),
                onDark: (c) => onChangePaletteColor("dark", "accent", c),
              })}
            </>,
          ),
      )}

      {section(
        "2. Camadas",
        "Luz somada ao fundo da página · cada camada tem um papel",
        () =>
          accordion(
            <>
              {deltaItem({
                id: "popover",
                label: "Flutuante",
                hint: "Menus, diálogos e caixas de opção",
                deltaKey: "popoverLDelta",
                targetId: "popover",
              })}
              {deltaItem({
                id: "popoverBorder",
                label: "Borda de flutuante",
                hint: "Linha de menus, diálogos e dicas",
                deltaKey: "popoverBorderLDelta",
                targetId: "popoverBorder",
              })}
              {deltaItem({
                id: "card",
                label: "Card",
                hint: "Objeto com conteúdo e realce de estado",
                deltaKey: "cardLDelta",
                targetId: "card",
              })}
              {deltaItem({
                id: "input",
                label: "Campo",
                hint: "Campo de texto, seleção e rádio",
                deltaKey: "inputLDelta",
                targetId: "input",
              })}
              {deltaItem({
                id: "secondary",
                label: "Cinza",
                hint: "Botão cinza e hover de item",
                deltaKey: "secondaryLDelta",
                targetId: "secondary",
              })}
              {deltaItem({
                id: "secondaryHover",
                label: "Cinza · hover",
                hint: "Hover de quem já é cinza ou card",
                deltaKey: "secondaryHoverLDelta",
                targetId: "secondaryHover",
              })}
              {deltaItem({
                id: "border",
                label: "Borda",
                hint: "Linhas e divisores",
                deltaKey: "borderLDelta",
                targetId: "border",
              })}
            </>,
          ),
      )}

      {section(
        "3. Ação",
        "Cor própria, sem cinza dentro, e o relevo das ações",
        () => (
          <>
            {accordion(
              <>
                {deltaItem({
                  id: "action",
                  label: "Ação",
                  hint: "Cor própria, sem cinza dentro",
                  deltaKey: "actionLDelta",
                  targetId: "action",
                })}
                {deltaItem({
                  id: "actionHover",
                  label: "Ação · hover",
                  hint: "Hover da ação",
                  deltaKey: "actionHoverLDelta",
                  targetId: "actionHover",
                })}
              </>,
            )}
            {visible(
              "relief",
              "Relevo",
              "Sombra e brilho no topo das ações",
            ) && (
              <div {...hover("relief")}>
                <UPreferenceSwitch
                  checked={palette.relief !== false}
                  description="Sombra e brilho no topo das ações"
                  id="theme-editor-relief"
                  label="Relevo"
                  onCheckedChange={onChangeRelief}
                />
              </div>
            )}
          </>
        ),
      )}
    </>
  );

  startTab("estados");
  const estados = (
    <>
      {section(
        "4. Estados",
        "Valem para todas as paletas · cor do aviso e do texto, claro e escuro",
        () =>
          accordion(
            <>
              {stateItem("error", "Erro", "Aviso de erro e selo de atraso")}
              {stateItem(
                "warning",
                "Atenção",
                "Aviso de atenção · prioridade média",
              )}
              {stateItem(
                "success",
                "Sucesso",
                "Aviso de sucesso · prioridade baixa",
              )}
              {stateItem("info", "Informação", "Aviso de informação")}
              {item({
                id: "successStrong",
                label: "Sucesso forte",
                hint: "Botão de sucesso, com texto branco",
                targetId: "successStrong",
                swatches: (
                  <SwatchPair
                    dark={solid(strongColor("dark"))}
                    light={solid(strongColor("light"))}
                  />
                ),
                children: numberSets([
                  sharedSpec("strongL", "Luz", 0, 1, 0.005, (v) =>
                    v.toFixed(3),
                  ),
                  sharedSpec("strongC", "Saturação", 0, 0.4, 0.002, (v) =>
                    v.toFixed(3),
                  ),
                  sharedSpec("strongHoverL", "Luz · hover", 0, 1, 0.005, (v) =>
                    v.toFixed(3),
                  ),
                  sharedSpec(
                    "strongHoverC",
                    "Saturação · hover",
                    0,
                    0.4,
                    0.002,
                    (v) => v.toFixed(3),
                  ),
                ]),
              })}
              {item({
                id: "stateMix",
                label: "Fundo dos avisos",
                hint: "Cor do aviso misturada ao fundo da página",
                targetId: "stateMix",
                swatches: null,
                children: MODES.map(({ mode, title }) => (
                  <ValueGroup
                    format={percent}
                    key={mode}
                    max={100}
                    min={0}
                    mode={mode}
                    name="Mistura"
                    onChange={(v) =>
                      onChangeSharedNumber("backgroundMix", mode, v)
                    }
                    original={getSharedNumber(
                      originalShared,
                      "backgroundMix",
                      mode,
                    )}
                    step={1}
                    title={title}
                    value={getSharedNumber(shared, "backgroundMix", mode)}
                  />
                )),
              })}
              {item({
                id: "lateBg",
                label: "Ação atrasada · fundo",
                hint: "Fundo do Erro com opacidade; no hover, cheio",
                targetId: "lateBg",
                swatches: (
                  <SwatchPair
                    dark={{
                      backgroundColor: lateBgSwatch("dark"),
                    }}
                    light={{
                      backgroundColor: lateBgSwatch("light"),
                    }}
                  />
                ),
                children: (
                  <>
                    <p className="text-base text-secondary-foreground">
                      A ação atrasada usa o estado Erro: o anel e o texto são a
                      cor e o texto do Erro, o fundo é o fundo do Erro (Fundo
                      dos avisos) com a opacidade abaixo, e a sombra está em
                      Fórmulas → Sombra da ação atrasada.
                    </p>
                    {numberSets([
                      formulaSpec(
                        "lateBgAlpha",
                        "Opacidade",
                        0,
                        100,
                        1,
                        percent,
                      ),
                    ])}
                  </>
                ),
              })}
            </>,
          ),
      )}

      {section(
        "5. Prioridades",
        "Só leitura · Quadro de Hoje: Baixa = Sucesso, Média = Atenção, Alta = Erro",
        () => (
          <div className={BOX}>
            {(
              [
                {
                  id: "prio-low",
                  label: "Baixa",
                  color: "success",
                  hint: "Sucesso",
                },
                {
                  id: "prio-medium",
                  label: "Média",
                  color: "warning",
                  hint: "Atenção",
                },
                {
                  id: "prio-high",
                  label: "Alta",
                  color: "error",
                  hint: "Erro",
                },
              ] as const
            ).map((p) =>
              lockedRow({
                id: p.id,
                label: p.label,
                hint: `Cor de ${p.hint}`,
                light: oklchToCss(shared.states[p.color].color.light),
                dark: oklchToCss(shared.states[p.color].color.dark),
              }),
            )}
          </div>
        ),
      )}
    </>
  );

  startTab("fases");
  const fasesECategorias = (
    <>
      {section(
        "6. Fases",
        "Valem para todas as paletas · Suave: 7% claro, 14% escuro. Viva: cor cheia.",
        () =>
          accordion(
            PHASE_ORDER.map((slug) => {
              const color = phases[slug];
              const hex = oklchToHex(color.h, color.c, color.l);
              return item({
                id: `ph-${slug}`,
                label: PHASES[slug].title,
                hint: hex,
                targetId: `ph-${slug}`,
                swatches: <SwatchPair light={solid(color)} />,
                children: (
                  <ColorGroup
                    color={color}
                    onChange={(c) => onChangePhase(slug, c)}
                    original={originalShared.phases[slug]}
                    title="Cor"
                  />
                ),
              });
            }),
          ),
      )}

      {section(
        "6. Fases · derivações",
        "Tons suave e vivo calculados a partir da cor de cada fase",
        () => {
          const list = accordion(
            <>
              {phaseFormulaItem({
                id: "phaseSoft",
                label: "Suave · cor",
                hint: "Cor misturada ao fundo, e no hover",
                rows: [
                  {
                    key: "mix",
                    name: "Mistura com o fundo",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "pair",
                    format: percent,
                  },
                  {
                    key: "mixHover",
                    name: "Mistura no hover",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "pair",
                    format: percent,
                  },
                ],
              })}
              {phaseFormulaItem({
                id: "phaseSoftText",
                label: "Suave · texto",
                hint: "Cor do texto sobre a ação suave",
                rows: [
                  {
                    key: "textL",
                    name: "Luz do texto",
                    min: 0,
                    max: 1,
                    step: 0.005,
                    scope: "pair",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "textC",
                    name: "Saturação do texto",
                    min: 0,
                    max: 0.4,
                    step: 0.002,
                    scope: "pair",
                    format: (v) => v.toFixed(3),
                  },
                ],
              })}
              {phaseFormulaItem({
                id: "phaseSoftRing",
                label: "Suave · anel",
                hint: "Borda colorida em volta da ação suave",
                rows: [
                  {
                    key: "ringAlpha",
                    name: "Opacidade do anel",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "pair",
                    format: percent,
                  },
                ],
              })}
              {phaseFormulaItem({
                id: "phaseSoftShadow",
                label: "Suave · sombra",
                hint: "Sombra e brilho difuso da ação suave",
                rows: [
                  {
                    key: "shadowL",
                    name: "Luz da sombra",
                    min: 0,
                    max: 1,
                    step: 0.005,
                    scope: "pair",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "shadowC",
                    name: "Saturação da sombra",
                    min: 0,
                    max: 0.4,
                    step: 0.002,
                    scope: "pair",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "shadowAlpha",
                    name: "Força da sombra",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "pair",
                    format: percent,
                  },
                  {
                    key: "diffuseL",
                    name: "Brilho difuso · luz",
                    min: 0,
                    max: 1,
                    step: 0.005,
                    scope: "dark",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "diffuseC",
                    name: "Brilho difuso · saturação",
                    min: 0,
                    max: 0.4,
                    step: 0.002,
                    scope: "dark",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "diffuseAlpha",
                    name: "Brilho difuso · força",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "dark",
                    format: percent,
                  },
                  {
                    key: "diffuseY",
                    name: "Brilho difuso · distância",
                    min: 0,
                    max: 60,
                    step: 1,
                    scope: "dark",
                    format: (v) => `${v}px`,
                  },
                  {
                    key: "diffuseBlur",
                    name: "Brilho difuso · desfoque",
                    min: 0,
                    max: 80,
                    step: 1,
                    scope: "dark",
                    format: (v) => `${v}px`,
                  },
                  {
                    key: "diffuseSpread",
                    name: "Brilho difuso · espalhamento",
                    min: -20,
                    max: 20,
                    step: 1,
                    scope: "dark",
                    format: (v) => `${v}px`,
                  },
                ],
              })}
              {phaseFormulaItem({
                id: "phaseVividText",
                label: "Vivo · texto",
                hint: "Texto e ícones sobre a cor viva, em tom escuro e em tom claro",
                rows: [
                  {
                    key: "inkL",
                    name: "Luz do texto escuro",
                    min: 0,
                    max: 1,
                    step: 0.005,
                    scope: "single",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "inkC",
                    name: "Saturação do texto escuro",
                    min: 0,
                    max: 0.4,
                    step: 0.002,
                    scope: "single",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "inkLightL",
                    name: "Luz do texto claro",
                    min: 0,
                    max: 1,
                    step: 0.005,
                    scope: "single",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "inkLightC",
                    name: "Saturação do texto claro",
                    min: 0,
                    max: 0.4,
                    step: 0.002,
                    scope: "single",
                    format: (v) => v.toFixed(3),
                  },
                ],
              })}
              {phaseFormulaItem({
                id: "phaseVivid",
                label: "Vivo · ação",
                hint: "Hover, borda e brilho do topo da ação viva",
                rows: [
                  {
                    key: "hoverDl",
                    name: "Luz a mais no hover",
                    min: -0.3,
                    max: 0.3,
                    step: 0.005,
                    scope: "single",
                    format: delta3,
                  },
                  {
                    key: "edgeDl",
                    name: "Luz da borda",
                    min: -0.3,
                    max: 0.3,
                    step: 0.005,
                    scope: "pair",
                    format: delta3,
                  },
                  {
                    key: "topLight",
                    name: "Brilho do topo (mistura com branco)",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "pair",
                    format: percent,
                  },
                  {
                    key: "hoverCLoss",
                    name: "Saturação perdida no hover",
                    min: 0,
                    max: 0.1,
                    step: 0.002,
                    scope: "single",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "dateOpacity",
                    name: "Opacidade da data",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "single",
                    format: percent,
                  },
                ],
              })}
              {phaseFormulaItem({
                id: "phaseVividDim",
                label: "Vivo · atenuada (escuro)",
                hint: "Opção Atenuada de Cor viva no escuro, em Minha Conta",
                rows: [
                  {
                    key: "dimL",
                    name: "Luz do fundo atenuado",
                    min: 0,
                    max: 1,
                    step: 0.005,
                    scope: "dark",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "dimCFactor",
                    name: "Saturação mantida",
                    min: 0,
                    max: 1,
                    step: 0.01,
                    scope: "dark",
                    format: (v) => v.toFixed(2),
                  },
                ],
              })}
              {phaseFormulaItem({
                id: "phaseVividShadow",
                label: "Vivo · sombra",
                hint: "Sombra da ação viva no hover",
                rows: [
                  {
                    key: "vividShadowL",
                    name: "Luz da sombra",
                    min: 0,
                    max: 1,
                    step: 0.005,
                    scope: "single",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "vividShadowC",
                    name: "Saturação da sombra",
                    min: 0,
                    max: 0.4,
                    step: 0.002,
                    scope: "single",
                    format: (v) => v.toFixed(3),
                  },
                  {
                    key: "vividShadowAlpha",
                    name: "Opacidade da sombra",
                    min: 0,
                    max: 100,
                    step: 1,
                    scope: "single",
                    format: percent,
                  },
                ],
              })}
            </>,
          );
          if (!list) return null;
          return (
            <>
              <span className="text-base text-foreground">Fase de amostra</span>
              {/* Only the buttons are sticky. z-30 keeps them above the info buttons (z-10) of the items. */}
              <div className="sticky top-0 z-30 -mx-6 -mt-2 px-6 py-3">
                <PrismToggleGroup
                  aria-label="Fase de amostra"
                  disallowEmptySelection
                  fullWidth
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0];
                    if (key !== undefined)
                      setSamplePhase(String(key) as PhaseSlug);
                  }}
                  selectedKeys={[samplePhase]}
                  size="sm"
                  variant="outline"
                >
                  {PHASE_ORDER.map((slug) => (
                    <PrismToggleGroupItem
                      aria-label={PHASES[slug].title}
                      id={slug}
                      key={slug}
                      className={"bg-background"}
                    >
                      <span
                        className="size-4 shrink-0 rounded-lg border border-foreground/15 squircle"
                        style={solid(phases[slug])}
                      />
                    </PrismToggleGroupItem>
                  ))}
                </PrismToggleGroup>
              </div>
              {list}
            </>
          );
        },
      )}

      {section(
        "7. Categorias",
        "Valem para todas as paletas · cor de cada categoria de ação",
        () => (
          <>
            {accordion(
              CATEGORY_ORDER.map((slug) => {
                const color = shared.categories[slug];
                const hex = oklchToHex(color.h, color.c, color.l);
                return item({
                  id: `cat-${slug}`,
                  label: CATEGORIES[slug].title,
                  hint: hex,
                  targetId: `cat-${slug}`,
                  swatches: <SwatchPair light={solid(color)} />,
                  children: (
                    <ColorGroup
                      color={color}
                      onChange={(c) => onChangeCategory(slug, c)}
                      original={originalShared.categories[slug]}
                      title="Cor"
                    />
                  ),
                });
              }),
            )}
            {accordion(
              item({
                id: "categoryIcon",
                label: "Ícone da categoria",
                hint: "Fundo e contorno do ícone, a partir da cor da categoria",
                targetId: "categoryIcon",
                swatches: null,
                children: (
                  <>
                    {MODES.map(({ mode, title }) => (
                      <ValueSetGroup
                        key={mode}
                        mode={mode}
                        rows={(
                          [
                            [
                              "categoryIconFill",
                              "Opacidade do fundo",
                              0,
                              100,
                              1,
                              percent,
                            ],
                            [
                              "categoryIconStroke",
                              "Opacidade do contorno",
                              0,
                              100,
                              1,
                              percent,
                            ],
                            [
                              "categoryIconChroma",
                              "Saturação mantida",
                              0,
                              1,
                              0.01,
                              (v: number) => v.toFixed(2),
                            ],
                          ] as const
                        ).map(([key, name, min, max, step, format]) => ({
                          name,
                          value: getFormulaValue(shared, key, mode),
                          original: getFormulaValue(originalShared, key, mode),
                          min,
                          max,
                          step,
                          format,
                          onChange: (v: number) =>
                            onChangeFormula(key, mode, v),
                        }))}
                        title={title}
                      />
                    ))}
                  </>
                ),
              }),
            )}
          </>
        ),
      )}
    </>
  );

  /** Support text color of one mode: the page background plus the two deltas. */
  const supportColor = (mode: "light" | "dark"): string => {
    const bg = palette[mode].bg;
    const f = shared.formulas.support;
    return formatOklchString({
      l: Math.max(0, Math.min(1, bg.l + f.lDelta[mode])),
      c: Math.max(0, bg.c + f.cDelta[mode]),
      h: bg.h,
    });
  };

  /** Shadow color of one mode: page background mixed with primary, darkened. */
  const shadowSwatch = (mode: "light" | "dark"): string => {
    const bg = formatOklchString(palette[mode].bg);
    const primary = formatOklchString(palette[mode].primary);
    const mix = getFormulaValue(shared, "shadowMix", mode);
    const l = getFormulaValue(shared, "shadowL", mode);
    return `oklch(from color-mix(in oklab, ${bg}, ${primary} ${mix}%) ${l} c h)`;
  };

  /** Late card color of one mode, over the page background. */
  const lateSwatch = (mode: "light" | "dark"): string => {
    const alpha = getLateValue(shared, "alpha", mode);
    const bg = formatOklchString(palette[mode].bg);
    if (mode === "light") {
      return `color-mix(in srgb, ${formatOklchString(shared.states.error.text.light)} ${alpha}%, ${bg})`;
    }
    const late = shared.lateShadow.dark;
    const color = `oklch(${late.l} ${late.c} ${shared.states.error.color.dark.h})`;
    return `color-mix(in srgb, ${color} ${alpha}%, ${bg})`;
  };

  /** Action card color of one mode (bottom layer of the highlight swatch). */
  const actionColor = (mode: "light" | "dark"): string => {
    const bg = palette[mode].bg;
    return formatOklchString({
      l: Math.max(
        0,
        Math.min(1, bg.l + getEffectiveDelta(palette, mode, "actionLDelta")),
      ),
      c: bg.c,
      h: bg.h,
    });
  };

  /** Formula item: one slider per mode (light, dark) for each variable. */
  const formulaItem = (opts: {
    id: string;
    label: string;
    hint: string;
    swatches: React.ReactNode;
    children: React.ReactNode;
  }) =>
    item({
      id: opts.id,
      label: opts.label,
      hint: opts.hint,
      targetId: opts.id,
      swatches: opts.swatches,
      children: opts.children,
    });

  startTab("formulas");
  const formulas = (
    <>
      {section("8. Texto", "Cores de texto que dependem do fundo", () =>
        accordion(
          <>
            {formulaItem({
              id: "support",
              label: "Texto de apoio",
              hint: "Texto secundário, derivado do fundo",
              swatches: (
                <SwatchPair
                  dark={{ backgroundColor: supportColor("dark") }}
                  light={{ backgroundColor: supportColor("light") }}
                />
              ),
              children: numberSets([
                formulaSpec("supportL", "Luz", -1, 1, 0.005, delta3),
                formulaSpec(
                  "supportC",
                  "Saturação",
                  -0.05,
                  0.05,
                  0.001,
                  delta3,
                ),
              ]),
            })}
            {formulaItem({
              id: "marker",
              label: "Marca-texto",
              hint: "Texto do trecho marcado",
              swatches: (
                <SwatchPair
                  dark={{ backgroundColor: markerSwatch("dark") }}
                  light={{ backgroundColor: markerSwatch("light") }}
                />
              ),
              children: numberSets([
                sharedSpec("markerLDelta", "Luz", -1, 1, 0.005, delta3, "pair"),
                sharedSpec("markerC", "Saturação", 0, 0.4, 0.002, (v) =>
                  v.toFixed(3),
                ),
              ]),
            })}
          </>,
        ),
      )}

      {section(
        "9. Interação",
        "Calculadas a partir da principal e do destaque",
        () =>
          accordion(
            <>
              {formulaItem({
                id: "primaryHover",
                label: "Principal · hover",
                hint: "Principal misturada com o fundo",
                swatches: (
                  <SwatchPair
                    dark={{
                      backgroundColor: mix(
                        palette.dark.bg,
                        getFormulaValue(shared, "primaryHoverMix", "dark"),
                        palette.dark.primary,
                      ),
                    }}
                    light={{
                      backgroundColor: mix(
                        palette.light.bg,
                        getFormulaValue(shared, "primaryHoverMix", "light"),
                        palette.light.primary,
                      ),
                    }}
                  />
                ),
                children: MODES.map(({ mode, title }) => (
                  <ValueGroup
                    format={percent}
                    key={mode}
                    max={100}
                    min={0}
                    mode={mode}
                    name="Mistura"
                    onChange={(v) =>
                      onChangeFormula("primaryHoverMix", mode, v)
                    }
                    original={getFormulaValue(
                      originalShared,
                      "primaryHoverMix",
                      mode,
                    )}
                    step={1}
                    title={title}
                    value={getFormulaValue(shared, "primaryHoverMix", mode)}
                  />
                )),
              })}
              {formulaItem({
                id: "ringHalo",
                label: "Halo de foco",
                hint: "Destaque com transparência",
                swatches: (
                  <SwatchPair
                    dark={{
                      backgroundColor: mix(
                        palette.dark.accent,
                        getFormulaValue(shared, "ringHaloAlpha", "dark"),
                        palette.dark.bg,
                      ),
                    }}
                    light={{
                      backgroundColor: mix(
                        palette.light.accent,
                        getFormulaValue(shared, "ringHaloAlpha", "light"),
                        palette.light.bg,
                      ),
                    }}
                  />
                ),
                children: MODES.map(({ mode, title }) => (
                  <ValueGroup
                    format={percent}
                    key={mode}
                    max={100}
                    min={0}
                    mode={mode}
                    name="Transparência"
                    onChange={(v) => onChangeFormula("ringHaloAlpha", mode, v)}
                    original={getFormulaValue(
                      originalShared,
                      "ringHaloAlpha",
                      mode,
                    )}
                    step={1}
                    title={title}
                    value={getFormulaValue(shared, "ringHaloAlpha", mode)}
                  />
                )),
              })}
              {formulaItem({
                id: "successStrongHalo",
                label: "Sucesso forte · halo de foco",
                hint: "Sucesso forte com transparência",
                swatches: (
                  <SwatchPair
                    dark={{
                      backgroundColor: mix(
                        strongColor("dark"),
                        getFormulaValue(
                          shared,
                          "successStrongHaloAlpha",
                          "dark",
                        ),
                        palette.dark.bg,
                      ),
                    }}
                    light={{
                      backgroundColor: mix(
                        strongColor("light"),
                        getFormulaValue(
                          shared,
                          "successStrongHaloAlpha",
                          "light",
                        ),
                        palette.light.bg,
                      ),
                    }}
                  />
                ),
                children: numberSets([
                  formulaSpec(
                    "successStrongHaloAlpha",
                    "Transparência",
                    0,
                    100,
                    1,
                    percent,
                  ),
                ]),
              })}
              {formulaItem({
                id: "skeleton",
                label: "Esqueleto de carregamento",
                hint: "Texto com transparência sobre o fundo",
                swatches: (
                  <SwatchPair
                    dark={{
                      backgroundColor: mix(
                        getPaletteFg(palette, "dark"),
                        getFormulaValue(shared, "skeletonAlpha", "dark"),
                        palette.dark.bg,
                      ),
                    }}
                    light={{
                      backgroundColor: mix(
                        getPaletteFg(palette, "light"),
                        getFormulaValue(shared, "skeletonAlpha", "light"),
                        palette.light.bg,
                      ),
                    }}
                  />
                ),
                children: numberSets([
                  formulaSpec("skeletonAlpha", "Opacidade", 0, 100, 1, percent),
                ]),
              })}
            </>,
          ),
      )}

      {section(
        "10. Sombras e brilho",
        "Compartilhado por todas as paletas",
        () =>
          accordion(
            <>
              {formulaItem({
                id: "shadow",
                label: "Sombra",
                hint: "Menus, diálogos, avisos e ações",
                swatches: (
                  <SwatchPair
                    dark={{ backgroundColor: shadowSwatch("dark") }}
                    light={{ backgroundColor: shadowSwatch("light") }}
                  />
                ),
                children: numberSets([
                  formulaSpec(
                    "shadowMix",
                    "Mistura com a principal",
                    0,
                    100,
                    1,
                    percent,
                  ),
                  formulaSpec("shadowL", "Luz", 0, 1, 0.005, (v) =>
                    v.toFixed(3),
                  ),
                  formulaSpec("shadowAlpha", "Força", 1, 100, 1, percent),
                ]),
              })}
              {formulaItem({
                id: "actionCardShadow",
                label: "Ação · anel e sombra",
                hint: "Força do anel, da sombra em repouso e no hover",
                swatches: null,
                children: numberSets([
                  formulaSpec("actionRingAlpha", "Anel", 0, 100, 1, percent),
                  formulaSpec(
                    "actionShadowAlpha",
                    "Sombra em repouso",
                    0,
                    100,
                    1,
                    percent,
                  ),
                  formulaSpec(
                    "actionHoverShadowAlpha",
                    "Sombra no hover",
                    0,
                    100,
                    1,
                    percent,
                  ),
                ]),
              })}
              {formulaItem({
                id: "lateShadow",
                label: "Sombra da ação atrasada",
                hint: "Vermelho do Erro; no escuro, um tom mais profundo",
                swatches: (
                  <SwatchPair
                    dark={{ backgroundColor: lateSwatch("dark") }}
                    light={{ backgroundColor: lateSwatch("light") }}
                  />
                ),
                children: (
                  <>
                    <ValueSetGroup
                      mode="light"
                      rows={(["alpha", "alphaHover"] as const).map((key) => ({
                        name: key === "alpha" ? "Força" : "Força · hover",
                        value: getLateValue(shared, key, "light"),
                        original: getLateValue(originalShared, key, "light"),
                        min: 0,
                        max: 100,
                        step: 1,
                        format: percent,
                        onChange: (v: number) => onChangeLate(key, "light", v),
                      }))}
                      title="Claro"
                    />
                    <ValueSetGroup
                      mode="dark"
                      rows={(
                        [
                          ["l", "Luz", 1, 0.005, (v: number) => v.toFixed(3)],
                          [
                            "c",
                            "Saturação",
                            0.4,
                            0.002,
                            (v: number) => v.toFixed(3),
                          ],
                          ["alpha", "Força", 100, 1, percent],
                          ["alphaHover", "Força · hover", 100, 1, percent],
                        ] as const
                      ).map(([key, name, max, step, format]) => ({
                        name,
                        value: getLateValue(shared, key, "dark"),
                        original: getLateValue(originalShared, key, "dark"),
                        min: 0,
                        max,
                        step,
                        format,
                        onChange: (v: number) => onChangeLate(key, "dark", v),
                      }))}
                      title="Escuro"
                    />
                  </>
                ),
              })}
              {formulaItem({
                id: "topHighlight",
                label: "Brilho da borda da ação",
                hint: "Linha de luz no topo da ação padrão e suave",
                swatches: (
                  <SwatchPair
                    dark={{
                      backgroundColor: `color-mix(in srgb, white ${getFormulaValue(shared, "topHighlightAlpha", "dark")}%, ${actionColor("dark")})`,
                    }}
                    light={{
                      backgroundColor: `color-mix(in srgb, white ${getFormulaValue(shared, "topHighlightAlpha", "light")}%, ${actionColor("light")})`,
                    }}
                  />
                ),
                children: (
                  <>
                    <p className="text-base text-secondary-foreground">
                      Vale para a ação padrão e para a suave. A ação viva tem o
                      próprio brilho, em Fases e categorias → Vivo · ação →
                      "Brilho do topo".
                    </p>
                    {numberSets([
                      formulaSpec(
                        "topHighlightAlpha",
                        "Opacidade",
                        0,
                        100,
                        1,
                        percent,
                      ),
                    ])}
                  </>
                ),
              })}
            </>,
          ),
      )}
    </>
  );

  const tabLabel = (tab: InspectorTab) => (
    <>
      <span className="min-w-0 truncate">{TAB_TITLES[tab]}</span>
      {searching && found[tab] > 0 && (
        <PrismBadge
          aria-label={`${found[tab]} encontrados`}
          className="shrink-0"
        >
          {found[tab]}
        </PrismBadge>
      )}
    </>
  );

  // Badges need room: tighter padding keeps the four tabs inside 440px.
  const tabClass = searching ? "px-2" : undefined;

  const panel = (tab: InspectorTab, content: React.ReactNode) => (
    <PrismTabPanel className="flex flex-col gap-12 py-8" id={tab}>
      {searching && found[tab] === 0 ? (
        <p className="text-base text-secondary-foreground">
          Nenhum item encontrado nesta aba.
        </p>
      ) : (
        content
      )}
    </PrismTabPanel>
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-6 pt-4 pb-3">
        <PrismInputGroup>
          <PrismInputGroupAddon>
            <SearchIcon />
          </PrismInputGroupAddon>
          <PrismInputGroupInput
            aria-label="Buscar nas abas do tema"
            autoComplete="off"
            autoFocus
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && search) {
                event.preventDefault();
                event.stopPropagation();
                setSearch("");
              }
            }}
            placeholder="Buscar cor, estado, fase, fórmula…"
            type="text"
            value={search}
          />
          {search && (
            <PrismInputGroupAddon align="inline-end">
              <PrismInputGroupButton
                aria-label="Limpar busca"
                onClick={() => setSearch("")}
              >
                <XIcon />
              </PrismInputGroupButton>
            </PrismInputGroupAddon>
          )}
        </PrismInputGroup>
      </div>
      <PrismTabs className="min-h-0 flex-1" defaultSelectedKey="tema">
        {/* The tab list stays outside the scroll and spans the whole panel. */}
        <PrismTabList aria-label="Partes do tema">
          <PrismTab className={tabClass} id="tema">
            {tabLabel("tema")}
          </PrismTab>
          <PrismTab className={tabClass} id="estados">
            {tabLabel("estados")}
          </PrismTab>
          <PrismTab className={tabClass} id="fases">
            {tabLabel("fases")}
          </PrismTab>
          <PrismTab className={tabClass} id="formulas">
            {tabLabel("formulas")}
          </PrismTab>
        </PrismTabList>
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {panel("tema", tema)}
          {panel("estados", estados)}
          {panel("fases", fasesECategorias)}
          {panel("formulas", formulas)}
        </div>
      </PrismTabs>
    </div>
  );
}
