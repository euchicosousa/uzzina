import { useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  AlertTriangleIcon,
  CircleCheckIcon,
  InfoIcon,
  CalendarIcon,
  CopyIcon,
  MoonIcon,
  OctagonAlertIcon,
  PlusIcon,
  SunIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "cnfast";
import { ActionItem } from "~/components/features/ActionItem";
import {
  PrismAlert,
  PrismAlertDescription,
  PrismAlertTitle,
  PrismBadge,
  PrismButton,
  PrismInput,
} from "~/components/prism";
import { useAppContext } from "~/contexts/AppContext";
import {
  CATEGORIES,
  DATE_TIME_DISPLAY,
  PHASES,
  PRIORITIES,
  VARIANT,
} from "~/lib/CONSTANTS";
import { UIcons } from "~/components/uzzina/UIcons";
import { applyPaletteVars, applySharedColorVars } from "~/lib/palette-vars";
import {
  oklchToCss,
  type PaletteConfig,
  type SharedColors,
} from "~/lib/palettes";
import type { Action } from "~/types";
import { formatOklchString, oklchToHex } from "~/utils/color";
import {
  CATEGORY_ORDER,
  PHASE_ORDER,
  type PhaseSlug,
  type PhasesColorMap,
  type PrioritiesColorMap,
  type PriorityKey,
} from "./theme-editor-model";

interface ThemePreviewPaneProps {
  mode: "light" | "dark";
  palette: PaletteConfig;
  phases: PhasesColorMap;
  priorities: PrioritiesColorMap;
  /** Draft of the shared block (formulas are written on the preview scope). */
  shared: SharedColors;
  hoveredTarget: string | null;
}

const BUTTON_DEMO_ROWS: ReadonlyArray<{
  label: string;
  variant:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "error"
    | "ghost-error"
    | "success";
  actionLabel: string;
  hoverClass: string;
  focusClass: string;
  targets: string[];
}> = [
  {
    label: "Principal",
    variant: "default",
    actionLabel: "Salvar",
    hoverClass: "border-primary-hover bg-primary-hover",
    focusClass: "outline-3 outline-primary",
    targets: ["primary", "primaryFg", "primaryHover", "ring", "ringHalo"],
  },
  {
    label: "Secundário",
    variant: "secondary",
    actionLabel: "Filtrar",
    hoverClass: "border-secondary-hover bg-secondary-hover",
    focusClass: "outline-3 outline-primary",
    targets: ["secondary", "fg", "ring", "ringHalo"],
  },
  {
    label: "Contorno",
    variant: "outline",
    actionLabel: "Duplicar",
    hoverClass: "bg-secondary",
    focusClass: "outline-3 outline-primary",
    targets: ["border", "secondary", "fg", "ring", "ringHalo"],
  },
  {
    label: "Fantasma",
    variant: "ghost",
    actionLabel: "Cancelar",
    hoverClass: "bg-secondary",
    focusClass: "outline-3 outline-primary",
    targets: ["secondary", "fg", "ring", "ringHalo"],
  },
  {
    label: "Erro",
    variant: "error",
    actionLabel: "Excluir",
    hoverClass: "bg-error-background",
    focusClass: "outline-3 outline-primary",
    targets: ["error", "ringHalo"],
  },
  {
    label: "Fantasma erro",
    variant: "ghost-error",
    actionLabel: "Remover",
    hoverClass: "bg-error-background text-error-foreground border-error",
    focusClass:
      "border-error outline-3 outline-primary text-error-foreground bg-error-background",
    targets: ["error"],
  },
  {
    label: "Sucesso",
    variant: "success",
    actionLabel: "Concluir",
    hoverClass: "bg-success-strong-hover",
    focusClass: "outline-3 outline-primary",
    targets: ["success"],
  },
];

const PRIORITY_ITEMS: ReadonlyArray<{
  key: PriorityKey;
  label: string;
  varName: string;
}> = [
  { key: "low", label: PRIORITIES.low.title, varName: "--priority-low" },
  {
    key: "medium",
    label: PRIORITIES.medium.title,
    varName: "--priority-medium",
  },
  { key: "high", label: PRIORITIES.high.title, varName: "--priority-high" },
];

export function ThemePreviewPane({
  mode,
  palette,
  phases,
  priorities,
  shared,
  hoveredTarget,
}: ThemePreviewPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null);
  const { partners, person } = useAppContext();

  useLayoutEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    applyPaletteVars(palette, el);
    applySharedColorVars(el, shared);
    el.style.setProperty(
      "--priority-low",
      formatOklchString(priorities[mode].low),
    );
    el.style.setProperty(
      "--priority-medium",
      formatOklchString(priorities[mode].medium),
    );
    el.style.setProperty(
      "--priority-high",
      formatOklchString(priorities[mode].high),
    );
  }, [palette, priorities, mode, shared]);

  const isHighlighted = (targets: string[]) =>
    hoveredTarget !== null && targets.includes(hoveredTarget)
      ? "outline-2 outline-dashed outline-primary outline-offset-2"
      : "";

  const demoPartnerSlug = partners[0]?.slug ?? "cnvt";

  const demoActions = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const base = {
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      user_id: person.user_id,
      description: "",
      time: 30,
      category: "post",
      priority: "medium",
      responsibles: [person.user_id],
      partners: [demoPartnerSlug],
      color: "#6366f1",
      topic_id: null,
      archived: false,
      content_description: null,
      content_files: null,
      instagram_caption: null,
      sprints: null,
      strategies: null,
      work_files: null,
    } satisfies Omit<Action, "id" | "title" | "date" | "phase">;

    const blockAction: Action = {
      ...base,
      id: `preview-block-${mode}`,
      title: "Campanha Dia dos Pais",
      date: tomorrow.toISOString(),
      phase: "doing",
    };

    const lineAction: Action = {
      ...base,
      id: `preview-line-${mode}`,
      title: "Roteiro institucional",
      date: tomorrow.toISOString(),
      phase: "review",
      category: "reels",
    };

    const lateAction: Action = {
      ...base,
      id: `preview-late-${mode}`,
      title: "Carrossel de outono",
      date: twoDaysAgo.toISOString(),
      phase: "do",
      category: "carousel",
    };

    const byPhase = {} as Record<PhaseSlug, Action>;
    for (const slug of PHASE_ORDER) {
      byPhase[slug] = {
        ...base,
        id: `preview-phase-${slug}-${mode}`,
        title: PHASES[slug].title,
        date: tomorrow.toISOString(),
        phase: slug,
      };
    }

    return { blockAction, lineAction, lateAction, byPhase };
  }, [demoPartnerSlug, mode, person.user_id]);

  const noopClick = () => {};

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary-foreground">
        {mode === "light" ? (
          <SunIcon className="size-3.5" />
        ) : (
          <MoonIcon className="size-3.5" />
        )}
        <span>{mode === "light" ? "Claro" : "Escuro"}</span>
      </div>

      <div
        ref={paneRef}
        data-theme-preview={mode}
        className={cn(
          mode === "dark" && "dark",
          "flex flex-col gap-10 rounded-2xl border border-border bg-background p-6 text-foreground shadow-sm squircle [&>*+*]:border-t [&>*+*]:border-border [&>*+*]:pt-10",
          isHighlighted(["bg"]),
        )}
      >
        {/* 1. Card, menu, cinza e campos: cada exemplo com a sua legenda */}
        <div className="grid grid-cols-2 items-start gap-x-8 gap-y-10">
          <section className="flex flex-col gap-5">
            <h5 className="text-foreground">Card</h5>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "w-fit text-sm font-medium text-foreground",
                    isHighlighted(["fg"]),
                  )}
                >
                  Texto principal
                </span>
                <span
                  className={cn(
                    "w-fit text-xs text-secondary-foreground",
                    isHighlighted(["secondaryFg"]),
                  )}
                >
                  Texto secundário a 65%
                </span>
              </div>

              <div
                className={cn(
                  "rounded-2xl border border-border bg-card p-3 squircle",
                  isHighlighted(["card", "border"]),
                )}
              >
                <div className="text-xs font-medium text-foreground">Card</div>
                <div className="text-xs text-secondary-foreground">
                  Fundo do card com borda
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <h5 className="text-foreground">Menu</h5>
            <div className="flex flex-col gap-0.5 self-start rounded-2xl border border-popover-border bg-popover p-1 shadow-lg squircle">
              <div className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-foreground squircle">
                <CopyIcon className="size-3.5 opacity-60" />
                <span>Duplicar</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-foreground squircle">
                <PlusIcon className="size-3.5 opacity-60" />
                <span>Nova ação</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-error-foreground squircle",
                  isHighlighted(["error"]),
                )}
              >
                <Trash2Icon className="size-3.5 opacity-60" />
                <span>Excluir</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <h5 className="text-foreground">Cinza</h5>
            <div className="flex flex-col gap-0.5 self-start">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl bg-secondary px-2.5 py-1.5 text-xs text-foreground squircle",
                  isHighlighted(["secondary"]),
                )}
              >
                <CalendarIcon className="size-3.5 opacity-60" />
                <span>Mudar data</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <h5 className="text-foreground">Campos</h5>
            <div className="flex flex-col gap-2">
              <PrismInput
                aria-label="Campo normal de prévia"
                className={cn("pointer-events-none", isHighlighted(["input"]))}
                readOnly
                size="sm"
                tabIndex={-1}
                value="Buscar ação"
              />
              <PrismInput
                aria-label="Campo em foco de prévia"
                className={cn(
                  "pointer-events-none outline-3 outline-primary",
                  isHighlighted(["input", "ring", "ringHalo"]),
                )}
                readOnly
                size="sm"
                tabIndex={-1}
                value="Campo em foco"
              />
              <PrismInput
                aria-invalid="true"
                aria-label="Campo com erro de prévia"
                className={cn(
                  "pointer-events-none",
                  isHighlighted(["error", "input"]),
                )}
                readOnly
                size="sm"
                tabIndex={-1}
                value="Campo com erro"
              />
            </div>
          </section>
        </div>

        {/* 2. Ação */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h5 className="text-foreground">Ação</h5>
            <p className="text-sm text-secondary-foreground">repouso e hover</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <span className="text-xs text-secondary-foreground">Repouso</span>
            <span className="text-xs text-secondary-foreground">Hover</span>

            <span className="col-span-2 text-xs text-secondary-foreground">
              Bloco
            </span>
            <div
              className={cn(
                "pointer-events-none",
                isHighlighted(["action", "relief", "shadow"]),
              )}
            >
              <ActionItem
                action={demoActions.blockAction}
                phaseColorMode="off"
                onClick={noopClick}
                variant={VARIANT.block}
              />
            </div>
            <div
              className={cn(
                "pointer-events-none",
                isHighlighted(["actionHover", "relief", "shadow"]),
              )}
            >
              <ActionItem
                action={demoActions.blockAction}
                phaseColorMode="off"
                className="bg-action-hover shadow-action-hover"
                onClick={noopClick}
                variant={VARIANT.block}
              />
            </div>

            <span className="col-span-2 text-xs text-secondary-foreground">
              Linha
            </span>
            <div
              className={cn(
                "pointer-events-none",
                isHighlighted(["action", "relief"]),
              )}
            >
              <ActionItem
                action={demoActions.lineAction}
                phaseColorMode="off"
                onClick={noopClick}
                variant={VARIANT.line}
              />
            </div>
            <div
              className={cn(
                "pointer-events-none",
                isHighlighted(["actionHover", "relief"]),
              )}
            >
              <ActionItem
                action={demoActions.lineAction}
                phaseColorMode="off"
                className="bg-action-hover shadow-action-hover"
                onClick={noopClick}
                variant={VARIANT.line}
              />
            </div>

            <span className="col-span-2 text-xs text-secondary-foreground">
              Atrasado (cor do estado Erro)
            </span>
            <div
              className={cn("pointer-events-none", isHighlighted(["error"]))}
            >
              <ActionItem
                action={demoActions.lateAction}
                phaseColorMode="off"
                displayFlags={{ showLate: true }}
                onClick={noopClick}
                variant={VARIANT.block}
              />
            </div>
            <div
              className={cn("pointer-events-none", isHighlighted(["error"]))}
            >
              <ActionItem
                action={demoActions.lateAction}
                phaseColorMode="off"
                className="bg-error-background shadow-action-hover"
                displayFlags={{ showLate: true }}
                onClick={noopClick}
                variant={VARIANT.block}
              />
            </div>
          </div>
        </section>

        {/* 3. Fases */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h5 className="text-foreground">Fases</h5>
            <p className="text-sm text-secondary-foreground">
              suave e viva, repouso e hover
            </p>
          </div>

          <div className="grid grid-cols-[76px_repeat(4,minmax(0,1fr))] items-center gap-1.5">
            <span />
            <span className="text-xs text-secondary-foreground">Suave</span>
            <span className="text-xs text-secondary-foreground">
              Suave · hover
            </span>
            <span className="text-xs text-secondary-foreground">Viva</span>
            <span className="text-xs text-secondary-foreground">
              Viva · hover
            </span>

            {PHASE_ORDER.map((slug) => {
              const phaseColor = phases[slug];
              const phaseHex = oklchToHex(
                phaseColor.h,
                phaseColor.c,
                phaseColor.l,
              );
              const phaseStyle = {
                "--phase-color": phaseHex,
              } as CSSProperties;
              const phaseAction = demoActions.byPhase[slug];

              return (
                <div key={slug} className="contents">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-xs text-foreground",
                      isHighlighted([`ph-${slug}`]),
                    )}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: phaseHex }}
                    />
                    <span className="truncate">{PHASES[slug].title}</span>
                  </div>

                  <div
                    className={cn(
                      "pointer-events-none min-w-0",
                      isHighlighted([`ph-${slug}`]),
                    )}
                    style={phaseStyle}
                  >
                    <ActionItem
                      action={phaseAction}
                      className="px-2 py-1"
                      phaseColorMode="soft"
                      phaseColorOverride={phaseHex}
                      dateTimeDisplay={DATE_TIME_DISPLAY.Null}
                      onClick={noopClick}
                      displayFlags={{
                        showCategory: false,
                        showPartner: false,
                        showPriority: false,
                        showResponsibles: false,
                      }}
                      variant={VARIANT.line}
                    />
                  </div>
                  <div
                    className={cn(
                      "pointer-events-none min-w-0",
                      isHighlighted([`ph-${slug}`]),
                    )}
                    style={phaseStyle}
                  >
                    <ActionItem
                      action={phaseAction}
                      className="bg-action-hover px-2 py-1 shadow-action-hover"
                      phaseColorMode="soft"
                      phaseColorOverride={phaseHex}
                      dateTimeDisplay={DATE_TIME_DISPLAY.Null}
                      onClick={noopClick}
                      displayFlags={{
                        showCategory: false,
                        showPartner: false,
                        showPriority: false,
                        showResponsibles: false,
                      }}
                      variant={VARIANT.line}
                    />
                  </div>
                  <div
                    className={cn(
                      "pointer-events-none min-w-0",
                      isHighlighted([`ph-${slug}`]),
                    )}
                    style={phaseStyle}
                  >
                    <ActionItem
                      action={phaseAction}
                      className="px-2 py-1"
                      phaseColorMode="vivid"
                      phaseColorOverride={phaseHex}
                      dateTimeDisplay={DATE_TIME_DISPLAY.Null}
                      onClick={noopClick}
                      displayFlags={{
                        showCategory: false,
                        showPartner: false,
                        showPriority: false,
                        showResponsibles: false,
                      }}
                      variant={VARIANT.line}
                    />
                  </div>
                  <div
                    className={cn(
                      "pointer-events-none min-w-0",
                      isHighlighted([`ph-${slug}`]),
                    )}
                    style={phaseStyle}
                  >
                    <ActionItem
                      action={phaseAction}
                      className="bg-action-hover px-2 py-1 shadow-action-hover"
                      phaseColorMode="vivid"
                      phaseColorOverride={phaseHex}
                      dateTimeDisplay={DATE_TIME_DISPLAY.Null}
                      onClick={noopClick}
                      displayFlags={{
                        showCategory: false,
                        showPartner: false,
                        showPriority: false,
                        showResponsibles: false,
                      }}
                      variant={VARIANT.line}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Categorias */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h5 className="text-foreground">Categorias</h5>
            <p className="text-sm text-secondary-foreground">
              ícone com a cor da categoria
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {CATEGORY_ORDER.map((slug) => {
              const color = oklchToCss(shared.categories[slug]);
              return (
                <div
                  key={slug}
                  className={cn(
                    "flex min-w-0 items-center gap-3 text-sm text-foreground",
                    isHighlighted([`cat-${slug}`, "categoryIcon"]),
                  )}
                >
                  <UIcons
                    className="size-5 shrink-0"
                    color={color}
                    slug={slug}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {CATEGORIES[slug].title}
                  </span>
                  <UIcons
                    className="size-10 shrink-0"
                    color={color}
                    slug={slug}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Botões */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h5 className="text-foreground">Botões</h5>
            <p className="text-sm text-secondary-foreground">tamanho pequeno</p>
          </div>

          <div className="grid grid-cols-[88px_repeat(3,minmax(0,1fr))] items-center gap-2">
            <span />
            <span className="text-xs text-secondary-foreground">Repouso</span>
            <span className="text-xs text-secondary-foreground">Hover</span>
            <span className="text-xs text-secondary-foreground">Foco</span>

            {BUTTON_DEMO_ROWS.map((row) => (
              <div key={row.variant} className="contents">
                <span className="truncate text-xs text-secondary-foreground">
                  {row.label}
                </span>
                <PrismButton
                  className={cn(
                    "pointer-events-none w-full",
                    isHighlighted(row.targets),
                  )}
                  excludeFromTabOrder
                  size="sm"
                  variant={row.variant}
                >
                  {row.actionLabel}
                </PrismButton>
                <PrismButton
                  className={cn(
                    "pointer-events-none w-full",
                    row.hoverClass,
                    isHighlighted(row.targets),
                  )}
                  excludeFromTabOrder
                  size="sm"
                  variant={row.variant}
                >
                  {row.actionLabel}
                </PrismButton>
                <PrismButton
                  className={cn(
                    "pointer-events-none w-full",
                    row.focusClass,
                    isHighlighted(row.targets),
                  )}
                  excludeFromTabOrder
                  size="sm"
                  variant={row.variant}
                >
                  {row.actionLabel}
                </PrismButton>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Avisos */}
        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h5 className="text-foreground">Avisos</h5>
            <p className="text-sm text-secondary-foreground">
              Selos e alertas de cada estado
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <PrismBadge variant="default">Padrão</PrismBadge>
            <PrismBadge variant="secondary">Secundário</PrismBadge>
            <PrismBadge variant="outline">Contorno</PrismBadge>
            <PrismBadge className={isHighlighted(["error"])} variant="error">
              Erro
            </PrismBadge>
            <PrismBadge
              className={isHighlighted(["warning"])}
              variant="warning"
            >
              Atenção
            </PrismBadge>
            <PrismBadge
              className={isHighlighted(["success"])}
              variant="success"
            >
              Sucesso
            </PrismBadge>
            <PrismBadge className={isHighlighted(["info"])} variant="info">
              Informação
            </PrismBadge>
          </div>

          <div className="flex flex-col gap-4">
            <PrismAlert className="p-3">
              <InfoIcon />
              <PrismAlertTitle className="text-base">Padrão</PrismAlertTitle>
              <PrismAlertDescription className="text-sm">
                Aviso neutro, sem estado.
              </PrismAlertDescription>
            </PrismAlert>
            <PrismAlert
              className={cn("p-3", isHighlighted(["error"]))}
              variant="error"
            >
              <OctagonAlertIcon />
              <PrismAlertTitle className="text-base">Erro</PrismAlertTitle>
              <PrismAlertDescription className="text-sm">
                Não foi possível salvar a alteração.
              </PrismAlertDescription>
            </PrismAlert>
            <PrismAlert
              className={cn("p-3", isHighlighted(["warning"]))}
              variant="warning"
            >
              <AlertTriangleIcon />
              <PrismAlertTitle className="text-base">Atenção</PrismAlertTitle>
              <PrismAlertDescription className="text-sm">
                Confira o contraste no escuro.
              </PrismAlertDescription>
            </PrismAlert>
            <PrismAlert
              className={cn("p-3", isHighlighted(["success"]))}
              variant="success"
            >
              <CircleCheckIcon />
              <PrismAlertTitle className="text-base">Sucesso</PrismAlertTitle>
              <PrismAlertDescription className="text-sm">
                Alteração salva.
              </PrismAlertDescription>
            </PrismAlert>
            <PrismAlert
              className={cn("p-3", isHighlighted(["info"]))}
              variant="info"
            >
              <InfoIcon />
              <PrismAlertTitle className="text-base">
                Informação
              </PrismAlertTitle>
              <PrismAlertDescription className="text-sm">
                As ações mudam no hover.
              </PrismAlertDescription>
            </PrismAlert>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_ITEMS.map((prio) => (
              <div
                key={prio.key}
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-medium text-foreground squircle",
                  isHighlighted([`prio-${prio.key}`]),
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(${prio.varName})` }}
                />
                <span>{prio.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
