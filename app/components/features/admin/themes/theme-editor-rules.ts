import { CATEGORIES, PHASES } from "~/lib/CONSTANTS";
import type { PaletteConfig, SharedColors } from "~/lib/palettes";

/*
 * Plain-language explanation of every item of the theme editor (blocks 1–10).
 * `code` is the rule as written today in app/tailwind.css (or in the file named
 * in the text). `calc` shows the live arithmetic with the open palette.
 */

type Mode = "light" | "dark";

export interface ThemeRuleEntry {
  title: string;
  rule: string;
  code: string;
  calc?: (palette: PaletteConfig, mode: Mode, shared: SharedColors) => string;
}

/** 0.96 → "0,96"; 0.512 → "0,512" (Portuguese decimal comma). */
function fmt(value: number, digits = 3): string {
  return String(Number(value.toFixed(digits))).replace(".", ",");
}

function signed(value: number): string {
  return `${value >= 0 ? "+" : "−"} ${fmt(Math.abs(value))}`;
}

function clampL(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Page background plus a delta of the palette (neutral layers). */
function layerCalc(
  palette: PaletteConfig,
  mode: Mode,
  key: keyof PaletteConfig["light"],
): string {
  const bg = palette[mode].bg;
  const delta = palette[mode][key] as number;
  return `Fundo ${fmt(bg.l)} ${signed(delta)} = ${fmt(clampL(bg.l + delta))}`;
}

function layerCode(
  name: string,
  lightDefault: string,
  darkDefault: string,
): string {
  return [
    `Claro: oklch(from var(--background) calc(l + var(--${name}-l-delta, ${lightDefault})) c h)`,
    `Escuro: oklch(from var(--background) calc(l + var(--dark-${name}-l-delta, ${darkDefault})) c h)`,
  ].join("\n");
}

const RULES: Record<string, ThemeRuleEntry> = {
  // 1. Base
  bg: {
    title: "Fundo",
    rule: "Cor da página inteira. Todas as camadas de cinza são o fundo com um ajuste de luz, por isso ele é a base de tudo.",
    code: "Claro: --background: var(--background-override, oklch(1 0 0));\nEscuro: --background: var(--dark-background-override, oklch(0.4 0.01 285.823));",
    calc: (palette, mode) => {
      const bg = palette[mode].bg;
      return `Luz ${fmt(bg.l)} · saturação ${fmt(bg.c)} · matiz ${fmt(bg.h, 1)}`;
    },
  },
  fg: {
    title: "Texto",
    rule: "Cor do texto principal: o fundo com um ajuste de luz e sem cor (saturação 0). Preto no claro, branco no escuro.",
    code: "Claro: --foreground: var(--foreground-override, oklch(from var(--background) calc(l + var(--foreground-l-delta, -0.96)) 0 h));\nEscuro: --foreground: var(--dark-foreground-override, oklch(from var(--background) calc(l + var(--dark-foreground-l-delta, 0.8)) 0 h));",
    calc: (palette, mode) => layerCalc(palette, mode, "fgLDelta"),
  },
  primary: {
    title: "Principal",
    rule: "Cor do botão principal e de itens selecionados.",
    code: "Claro: --primary: oklch(var(--primary-l) var(--primary-c) var(--primary-h));\nEscuro: --primary: oklch(var(--dark-primary-l) var(--dark-primary-c) var(--dark-primary-h));",
  },
  primaryFg: {
    title: "Texto sobre a principal",
    rule: "Cor do texto em cima da cor principal. É a principal com deslocamento de luz, saturação e matiz (ΔL, ΔC, ΔH), para que o contraste fique legível em cada paleta.",
    code: "Claro: --primary-foreground: var(--primary-foreground-override, oklch(from var(--primary) calc(l + var(--primary-fg-l-delta)) max(0, calc(c + var(--primary-fg-c-delta))) calc(h + var(--primary-fg-h-delta))));\nEscuro: o mesmo com --dark-primary-fg-*-delta",
    calc: (palette, mode) => {
      const p = palette[mode].primary;
      const d = palette[mode].primaryFgDelta;
      return `Luz ${fmt(p.l)} ${signed(d.l)} = ${fmt(Math.max(0, Math.min(1, p.l + d.l)))} · saturação ${fmt(p.c)} ${signed(d.c)} = ${fmt(Math.max(0, p.c + d.c))} · matiz ${fmt(p.h, 1)} ${d.h >= 0 ? "+" : "−"} ${fmt(Math.abs(d.h), 1)}°`;
    },
  },
  accent: {
    title: "Destaque",
    rule: "Cor de destaque da paleta. O anel de foco do teclado usa esta cor.",
    code: "Claro: --accent: var(--accent-override, oklch(var(--primary-l) var(--primary-c) var(--primary-h)));\nEscuro: --accent: var(--dark-accent-override, oklch(var(--dark-primary-l) var(--dark-primary-c) var(--dark-primary-h)));",
  },

  // 2. Camadas
  popover: {
    title: "Flutuante",
    rule: "Fundo de tudo que flutua: menus, diálogos e caixas de opção. É o fundo com um ajuste de luz.",
    code: layerCode("popover", "0.02", "-0.03"),
    calc: (palette, mode) => layerCalc(palette, mode, "popoverLDelta"),
  },
  popoverBorder: {
    title: "Borda de flutuante",
    rule: "Linha de 1 px em volta de menus, diálogos, caixas de opção, dicas e da barra de formatação. É a cor do Flutuante com um ajuste de luz, sem transparência.",
    code: "Claro: --popover-border: oklch(from var(--popover) calc(l + var(--popover-border-l-delta)) c h);\nEscuro: o mesmo com --dark-popover-border-l-delta\n(classe border-popover-border)",
    calc: (palette, mode) => {
      const c = palette[mode];
      const base = clampL(c.bg.l + c.popoverLDelta);
      return `Flutuante ${fmt(base)} ${signed(c.popoverBorderLDelta)} = ${fmt(clampL(base + c.popoverBorderLDelta))}`;
    },
  },
  card: {
    title: "Card",
    rule: "Fundo fixo que informa ou sinaliza e não é clicável: card de informação, aviso, nota, selo, atalho de teclado, avatar vazio, alvo ao arrastar. É o fundo com um ajuste de luz.",
    code: layerCode("card", "-0.02", "0.05"),
    calc: (palette, mode) => layerCalc(palette, mode, "cardLDelta"),
  },
  input: {
    title: "Campo",
    rule: "Fundo de campos de texto, seleção e rádio, e do trilho de barras de progresso e controles deslizantes.",
    code: layerCode("input", "-0.04", "-0.06"),
    calc: (palette, mode) => layerCalc(palette, mode, "inputLDelta"),
  },
  secondary: {
    title: "Cinza",
    rule: "Fundo de tudo que é clicável: botão cinza, item de menu ou lista e hover de item. Nunca fica sobre ação, cor de fase ou imagem.",
    code: layerCode("secondary", "-0.06", "0.12"),
    calc: (palette, mode) => layerCalc(palette, mode, "secondaryLDelta"),
  },
  secondaryHover: {
    title: "Cinza · hover",
    rule: "Cor do cinza e do card no hover.",
    code: layerCode("secondary-hover", "-0.08", "0.15"),
    calc: (palette, mode) => layerCalc(palette, mode, "secondaryHoverLDelta"),
  },
  border: {
    title: "Borda",
    rule: "Linha de 1 px e divisores.",
    code: layerCode("border", "-0.09", "0.15"),
    calc: (palette, mode) => layerCalc(palette, mode, "borderLDelta"),
  },

  // 3. Ação
  action: {
    title: "Ação",
    rule: "Cor própria da ação (o item de uma lista, em bloco ou em linha). Não há cinza dentro dela.",
    code: layerCode("action", "0.02", "0.1"),
    calc: (palette, mode) => layerCalc(palette, mode, "actionLDelta"),
  },
  actionHover: {
    title: "Ação · hover",
    rule: "Cor da ação no hover.",
    code: layerCode("action-hover", "0.1", "0.2"),
    calc: (palette, mode) => layerCalc(palette, mode, "actionHoverLDelta"),
  },
  relief: {
    title: "Relevo",
    rule: "Liga a borda de luz no topo das ações e a sombra delas. Desligado, as ações ficam chapadas.",
    code: "palette-vars.ts: relief === false → --action-relief: 0; --action-top-border-override: transparent",
  },

  // 4. Estados
  error: {
    title: "Erro",
    rule: "Avisos de erro, campo com erro e selo de atraso. A cor e o texto são os de Erro; o fundo é a cor misturada ao fundo da página (Fundo dos avisos).",
    code: "--color-error: var(--shared-error-color); --error-foreground: var(--shared-error-text); --color-error-background: color-mix(in oklab, var(--color-error) var(--state-background-mix), var(--background))",
  },
  warning: {
    title: "Atenção",
    rule: "Avisos de atenção e prioridade média. Mesma regra do Erro: cor, texto e fundo misturado.",
    code: "--color-warning: var(--shared-warning-color); --warning-foreground: var(--shared-warning-text); --color-warning-background: color-mix(in oklab, var(--color-warning) var(--state-background-mix), var(--background))",
  },
  success: {
    title: "Sucesso",
    rule: "Avisos de sucesso e prioridade baixa. Mesma regra do Erro: cor, texto e fundo misturado.",
    code: "--color-success: var(--shared-success-color); --color-success-foreground: var(--shared-success-text); --color-success-background: color-mix(in oklab, var(--color-success) var(--state-background-mix), var(--background))",
  },
  info: {
    title: "Informação",
    rule: "Avisos de informação. Mesma regra do Erro: cor, texto e fundo misturado.",
    code: "--color-info: var(--shared-info-color); --info-foreground: var(--shared-info-text); --color-info-background: color-mix(in oklab, var(--color-info) var(--state-background-mix), var(--background))",
  },
  successStrongHalo: {
    title: "Sucesso forte · halo de foco",
    rule: "Anel do foco do teclado no botão de sucesso forte: a cor do Sucesso forte com a transparência indicada.",
    code: "--success-strong-halo: color-mix(in srgb, var(--success-strong) var(--shared-success-strong-halo-alpha), transparent);\n(classe ring-success-strong-halo)",
    calc: (palette, mode, shared) =>
      `Transparência: ${shared.formulas.successStrongHaloAlpha[mode]}% do Sucesso forte`,
  },
  successStrong: {
    title: "Sucesso forte",
    rule: "Botão de sucesso, com texto branco. Mesmo matiz do Sucesso, com luz e saturação próprias, e a versão do hover.",
    code: "--success-strong: oklch(from var(--color-success) var(--shared-success-strong-l) var(--shared-success-strong-c) h); --success-strong-hover: oklch(from var(--color-success) var(--shared-success-strong-hover-l) var(--shared-success-strong-hover-c) h)",
  },
  stateMix: {
    title: "Fundo dos avisos",
    rule: "Quanto da cor do aviso entra no fundo da página. É a mesma regra para Erro, Atenção, Sucesso e Informação, com uma porcentagem para o claro e outra para o escuro.",
    code: "color-mix(in oklab, var(--color-error) var(--state-background-mix), var(--background)); --state-background-mix: var(--shared-background-mix) (escuro: --shared-dark-background-mix)",
  },

  // 5. Prioridades (read-only until stage 2; values follow the app today)
  "prio-low": {
    title: "Baixa",
    rule: "Cor da prioridade baixa no Quadro de Hoje. No app ela é a cor de Sucesso.",
    code: "--priority-low: var(--color-success);",
  },
  "prio-medium": {
    title: "Média",
    rule: "Cor da prioridade média no Quadro de Hoje. No app ela é a cor de Atenção.",
    code: "--priority-medium: var(--color-warning);",
  },
  "prio-high": {
    title: "Alta",
    rule: "Cor da prioridade alta no Quadro de Hoje. No app ela é a cor de Erro.",
    code: "--priority-high: var(--color-error);",
  },

  // 6. Derivações das fases (DS36, stage 5)
  categoryIcon: {
    title: "Ícone da categoria",
    rule: "O ícone de cada categoria (nas ações, filtros e seletores) usa a cor da categoria em duas camadas: o contorno, com uma opacidade, e o fundo do desenho, com outra. Em cada modo você ajusta as duas opacidades e quanto da saturação da cor é mantido.",
    code: "UIcons: color: oklch(from <cor> l calc(c * var(--category-icon-chroma)) h / var(--category-icon-stroke-alpha)); fill: oklch(from <cor> l calc(c * var(--category-icon-chroma)) h / var(--category-icon-fill-alpha))",
  },
  phaseSoft: {
    title: "Suave · cor",
    rule: "Ação suave de cada fase: a cor da fase misturada ao fundo. No hover, a mistura sobe.",
    code: "@utility phase-surface: --action: color-mix(in oklab, var(--phase-color) var(--phase-mix), var(--background)); hover: var(--phase-mix-hover)",
  },
  phaseSoftText: {
    title: "Suave · texto",
    rule: "Cor do texto sobre a ação suave: a matiz da fase com luz e saturação próprias.",
    code: "--phase-fg: oklch(from var(--phase-color) L C h)",
  },
  phaseSoftRing: {
    title: "Suave · anel",
    rule: "Borda fina em volta da ação suave: a cor da fase com uma opacidade. É só a opacidade; a cor vem da fase.",
    code: "--action-ring: color-mix(in srgb, var(--phase-color) var(--phase-ring-alpha), transparent)",
  },
  phaseSoftShadow: {
    title: "Suave · sombra",
    rule: "Sombra da ação suave, feita da cor da fase. No escuro, um brilho difuso embaixo.",
    code: "--phase-shadow: oklch(from var(--phase-color) L C h); --phase-shadow-alpha; escuro: --phase-diffuse",
  },
  phaseVividText: {
    title: "Vivo · texto",
    rule: "Texto e ícones sobre a cor viva da fase. Existem dois tons, escolhidos em Minha Conta, em Texto na cor viva: escuro (padrão) e claro. Cada um é a matiz da fase com luz e saturação próprias.",
    code: '--vivid-ink: oklch(from var(--phase-color) L C h)  /* [data-vivid-text="light"] usa o tom claro */',
  },
  phaseVivid: {
    title: "Vivo · ação",
    rule: "Ação preenchida com a cor cheia da fase. No hover a luz sobe; a borda é a cor da ação com menos luz; o brilho do topo é a ação misturada com branco.",
    code: "--action-hover: oklch(from var(--vivid-fill) calc(l + dL) ...); --action-ring: oklch(from var(--vivid-fill) calc(l - edgeDL) c h); --action-top-border: color-mix(white top-light%)",
  },
  phaseVividDim: {
    title: "Vivo · atenuada (escuro)",
    rule: "Só no tema escuro e só quando, em Minha Conta, a Cor viva no escuro está em Atenuada. O fundo da ação viva deixa de ser a cor pura da fase: ganha uma luz fixa (a mesma para todas as fases) e mantém uma parte da saturação. O hover, a borda e o brilho do topo seguem esse fundo. O texto não muda.",
    code: '--vivid-fill: oklch(from var(--phase-color) var(--shared-phase-dim-l) calc(c * var(--shared-phase-dim-c-factor)) h)  /* .dark[data-vivid-dark="dim"] */',
  },
  phaseVividShadow: {
    title: "Vivo · sombra",
    rule: "Sombra da ação viva no hover.",
    code: "@utility phase-vivid: --vivid-shadow: oklch(from var(--phase-color) L C h)",
  },

  // 8. Texto
  support: {
    title: "Texto de apoio",
    rule: "Texto secundário, com menos destaque que o texto principal. Vem do fundo, com ajuste de luz e de saturação.",
    code: "Claro: --secondary-foreground: oklch(from var(--background) calc(l + var(--shared-support-l-delta)) max(0, calc(c + var(--shared-support-c-delta))) h);\nEscuro: --secondary-foreground: oklch(from var(--background) calc(l + var(--shared-dark-support-l-delta)) max(0, calc(c + var(--shared-dark-support-c-delta))) h);",
    calc: (palette, mode, shared) => {
      const bg = palette[mode].bg;
      const f = shared.formulas.support;
      const dl = f.lDelta[mode];
      const dc = f.cDelta[mode];
      return `Luz: fundo ${fmt(bg.l)} ${signed(dl)} = ${fmt(clampL(bg.l + dl))} · saturação: ${fmt(bg.c)} ${signed(dc)} = ${fmt(Math.max(0, bg.c + dc))}`;
    },
  },
  marker: {
    title: "Marca-texto",
    rule: "Cor do texto dentro de um trecho marcado no editor de texto. O fundo da marca é a cor de Atenção; o texto é a cor de Atenção com a luz indicada.",
    code: ".tiptap.ProseMirror mark { background-color: var(--color-warning); color: var(--marker-text); } --marker-text: oklch(from var(--color-warning) calc(l + var(--shared-marker-l-delta)) var(--shared-marker-c) h)",
    calc: (palette, mode, shared) =>
      `Luz da Atenção ${signed(shared.markerText.lDelta[mode])} · saturação ${fmt(shared.markerText.c)}`,
  },

  // 9. Interação
  primaryHover: {
    title: "Principal · hover",
    rule: "Cor do botão principal no hover: a principal misturada com o fundo, na porcentagem indicada.",
    code: "--primary-hover: color-mix(in oklab, var(--primary), var(--background) var(--shared-primary-hover-mix));\n(classes hover:bg-primary-hover e hover:border-primary-hover)",
    calc: (palette, mode, shared) =>
      `Mistura: ${shared.formulas.primaryHoverMix[mode]}% do fundo`,
  },
  ringHalo: {
    title: "Halo de foco",
    rule: "Anel do foco do teclado: a cor de destaque com a transparência indicada. Aparece ao navegar com o teclado.",
    code: "--ring-halo: color-mix(in srgb, var(--ring) var(--shared-ring-halo-alpha), transparent);\n(classe ring-ring-halo)",
    calc: (palette, mode, shared) =>
      `Transparência: ${shared.formulas.ringHaloAlpha[mode]}% da cor de destaque`,
  },

  skeleton: {
    title: "Esqueleto de carregamento",
    rule: "Fundo dos blocos cinza que aparecem enquanto o conteúdo carrega: a cor do texto com a opacidade indicada.",
    code: "--skeleton: color-mix(in srgb, var(--foreground) var(--shared-skeleton-alpha), transparent);\n(classe bg-skeleton)",
    calc: (palette, mode, shared) =>
      `Opacidade: ${shared.formulas.skeletonAlpha[mode]}% do texto`,
  },

  // 10. Sombras e brilho
  shadow: {
    title: "Sombra",
    rule: "Sombra de menus, diálogos, avisos e ações. É o fundo misturado com a cor principal, escurecido. A mesma regra vale para todas as paletas (DS29).",
    code: "--shadow-color: oklch(from color-mix(in oklab, var(--background), var(--primary) var(--shared-shadow-mix)) var(--shared-shadow-l) c h);\n--shadow-alpha: var(--shared-shadow-alpha); (escuro: --shared-dark-*)",
    calc: (palette, mode, shared) => {
      const bg = palette[mode].bg;
      const mix = shared.shadow.mix[mode];
      const l = shared.shadow.l[mode];
      const alpha = shared.shadow.alpha[mode];
      return `Mistura ${mix}% da principal · luz ${fmt(l)} · força ${alpha}% (fundo ${fmt(bg.l)})`;
    },
  },
  actionCardShadow: {
    title: "Ação · anel e sombra",
    rule: "Força (opacidade) da cor da sombra, a mesma da regra de Sombra, em três pontos da ação: o anel fino em volta, a sombra em repouso e a sombra no hover. Cada valor vale para o claro e para o escuro.",
    code: "--action-ring: color-mix(in srgb, var(--shadow-color) var(--shared-action-ring-alpha), transparent)\n--action-shadow: 0 1px 2px 0 color-mix(... var(--shared-action-shadow-alpha) ...)\n--action-hover-shadow: 0 10px 15px -3px / 0 4px 6px -4px color-mix(... var(--shared-action-hover-shadow-alpha) ...)",
  },
  lateShadow: {
    title: "Sombra da ação atrasada",
    rule: "Sombra das ações atrasadas. Usa a cor de Erro; no escuro, um vermelho mais fundo.",
    code: "@utility late-surface: --action-shadow: 0 1px 2px 0 color-mix(in srgb, var(--error-foreground) var(--shared-late-alpha), transparent); escuro: --late-shadow: oklch(from var(--color-error) var(--shared-dark-late-l) var(--shared-dark-late-c) h)",
    calc: (palette, mode, shared) =>
      mode === "light"
        ? `Força ${shared.lateShadow.light.alpha}% · no hover ${shared.lateShadow.light.alphaHover}%`
        : `Luz ${fmt(shared.lateShadow.dark.l)} · saturação ${fmt(shared.lateShadow.dark.c)} · força ${shared.lateShadow.dark.alpha}% · no hover ${shared.lateShadow.dark.alphaHover}%`,
  },
  lateBg: {
    title: "Ação atrasada · fundo",
    rule: "Fundo de uma ação atrasada. Vem do estado Erro: o fundo do Erro (a cor do Erro misturada ao fundo da página, em Fundo dos avisos) com a opacidade indicada; no hover ele fica cheio. O anel e o texto da ação são a cor e o texto do Erro.",
    code: "ActionItem: late-surface bg-late text-error-foreground ring ring-error hover:bg-error-background\n--late-bg: color-mix(in srgb, var(--color-error-background) var(--shared-late-bg-alpha), transparent)",
    calc: (palette, mode, shared) =>
      `Opacidade do fundo: ${shared.formulas.lateBgAlpha[mode]}% (hover: 100%)`,
  },
  topHighlight: {
    title: "Brilho da borda da ação",
    rule: "Linha de luz no topo da ação padrão e da ação suave, quando o relevo está ligado. É branco com a opacidade indicada. O ação viva não usa este valor: o brilho dele é a mistura do preenchimento com branco, em Vivo · ação → Brilho do topo.",
    code: "--action-top-border: var(--action-top-border-override, color-mix(in srgb, white var(--shared-top-highlight-alpha), transparent));\nEscuro: color-mix(in srgb, white var(--shared-dark-top-highlight-alpha), transparent)",
    calc: (palette, mode, shared) =>
      `Opacidade: ${shared.formulas.topHighlightAlpha[mode]}% de branco`,
  },
};

/** Looks up the explanation of an editor item by its id. */
export function getThemeRule(id: string): ThemeRuleEntry | undefined {
  if (id.startsWith("ph-")) {
    const slug = id.slice(3) as keyof typeof PHASES;
    return {
      title: PHASES[slug]?.title ?? slug,
      rule: "Cor da fase na ação e no calendário. Hoje vem do arquivo de constantes; os tons suave e vivo saem dela no CSS.",
      code: `app/lib/palettes.ts → SHARED_COLORS.phases.${slug} (CONSTANTS.ts: PHASES.${slug}.color)`,
    };
  }
  if (id.startsWith("cat-")) {
    const slug = id.slice(4) as keyof typeof CATEGORIES;
    return {
      title: CATEGORIES[slug]?.title ?? slug,
      rule: "Cor da categoria de ação (por exemplo, Post ou Reels). Aparece no ícone da categoria, na ação.",
      code: `app/lib/palettes.ts → SHARED_COLORS.categories.${slug} (CONSTANTS.ts: CATEGORIES.${slug}.color)`,
    };
  }
  return RULES[id];
}
