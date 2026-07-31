import { SunIcon, MoonIcon, CheckIcon } from "lucide-react";
import { useAppThemeContext, Theme } from "~/hooks/useAppTheme";
import { PALLETE } from "~/lib/CONSTANTS";
import {
  PrismButton,
  PrismInput,
  PrismCheckbox,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
  PrismToggleGroup,
  PrismToggleGroupItem,
  PrismBadge,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
} from "./GalleryHelperComponents";
import { cn } from "cnfast";

// 1. Definição das Camadas Semânticas de Cores do Sistema
const COLOR_SWATCHES = [
  // Camada 1: Superfícies e Estrutura
  {
    name: "Background",
    bg: "bg-background",
    fg: "text-foreground",
    group: "Superfícies",
  },
  {
    name: "Card",
    bg: "bg-card",
    fg: "text-card-foreground",
    group: "Superfícies",
  },
  {
    name: "Popover",
    bg: "bg-popover",
    fg: "text-popover-foreground",
    group: "Superfícies",
  },
  {
    name: "Input",
    bg: "bg-input",
    fg: "text-foreground",
    group: "Superfícies",
  },
  {
    name: "Muted",
    bg: "bg-muted",
    fg: "text-muted-foreground",
    group: "Superfícies",
  },
  // Camada 2: Marca, Interação e Workflow
  {
    name: "Primary",
    bg: "bg-primary",
    fg: "text-primary-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Secondary",
    bg: "bg-secondary",
    fg: "text-secondary-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Accent",
    bg: "bg-accent",
    fg: "text-accent-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Border",
    bg: "bg-border",
    fg: "text-foreground",
    group: "Marca & Ações",
  },
  {
    name: "Action",
    bg: "bg-action",
    fg: "text-foreground",
    group: "Marca & Ações",
  },
  // Camada 3: Status e Feedbacks
  {
    name: "Late",
    bg: "bg-late",
    fg: "text-late-foreground",
    group: "Status & Feedback",
  },
  {
    name: "Error",
    bg: "bg-error-background",
    fg: "text-error",
    group: "Status & Feedback",
  },
  {
    name: "Success",
    bg: "bg-success-background",
    fg: "text-success",
    group: "Status & Feedback",
  },
  {
    name: "Warning",
    bg: "bg-warning-background",
    fg: "text-warning",
    group: "Status & Feedback",
  },
  {
    name: "Info",
    bg: "bg-info-background",
    fg: "text-info",
    group: "Status & Feedback",
  },
];
export function TokensColorsSection() {
  const { theme, setTheme, primaryColorIndex, setPrimaryColorIndex } =
    useAppThemeContext();
  return (
    <div id="colors">
      <GallerySection>
        {/* Cabeçalho Limpo + Seletor Elegante de Tema e Cores em Swatches Círculos */}
        <div className="flex flex-col gap-6 pb-6 border-b">
          <GallerySectionHeader
            description="Organização das camadas de superfície, marca e feedbacks com alternância dinâmica de modo e paletas."
            title="Cores Semânticas OKLCH"
          />

          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
            {/* Seletor Compacto Light / Dark */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Modo:
              </span>
              <PrismToggleGroup
                aria-label="Modo de Tema"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as Theme;
                  if (selected) setTheme(selected);
                }}
                selectedKeys={[theme]}
                size="sm"
              >
                <PrismToggleGroupItem id={Theme.LIGHT}>
                  <SunIcon className="size-4" /> Claro
                </PrismToggleGroupItem>
                <PrismToggleGroupItem id={Theme.DARK}>
                  <MoonIcon className="size-4" /> Escuro
                </PrismToggleGroupItem>
              </PrismToggleGroup>
            </div>

            {/* Seletor de Círculos / Bolinhas de Paletas OKLCH */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Paleta:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {PALLETE.map((item, idx) => {
                  const isSelected = primaryColorIndex === idx;
                  const isDark = theme === Theme.DARK;
                  const p = isDark ? item.dark.primary : item.light.primary;
                  // Calcula cor no formato OKLCH inline para o botão circular
                  const bgStyle = `oklch(${p.l} ${p.c} ${p.h})`;
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        "relative size-7 rounded-full transition-transform hover:scale-110 focus:outline-none flex items-center justify-center border border-black/10 dark:border-white/20",
                        isSelected &&
                          "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105",
                      )}
                      onClick={() => setPrimaryColorIndex(idx)}
                      style={{
                        backgroundColor: bgStyle,
                      }}
                      title={item.label}
                      type="button"
                    >
                      {isSelected && (
                        <CheckIcon
                          className={cn(
                            "size-3.5 stroke-3",
                            p.l > 0.6 ? "text-black" : "text-white",
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 1. Grid Limpo de Amostras de Cores Semânticas */}
        <GallerySectionContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-6">
          {COLOR_SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 shadow-xs"
            >
              <div
                className={`size-7 rounded-lg border border-border/40 shrink-0 ${swatch.bg}`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate">
                  {swatch.name}
                </span>
                <code className="text-[10px] text-muted-foreground truncate font-mono">
                  {swatch.bg}
                </code>
              </div>
            </div>
          ))}
        </GallerySectionContent>

        {/* 2. Demonstração dos Componentes Vivos sobre bg-background (Canvas Real) */}
        <div className="pt-10 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Aplicação no Mundo Real (Montados sobre o Canvas bg-background)
          </h4>

          {/* Container simulando a superfície da página (bg-background) */}
          <div className="rounded-3xl border border-border/60 bg-background p-8 space-y-8 shadow-inner">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Bloco 1: Estruturas de Superfície (bg-card sobre bg-background) */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Card (bg-card) & Forms
                  </span>
                  <PrismBadge variant="default">Primary</PrismBadge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Input (bg-input)
                  </span>
                  <PrismInput placeholder="Digite algo..." />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <PrismCheckbox defaultSelected>Opção Ativa</PrismCheckbox>
                  <div className="flex items-center gap-2">
                    <PrismButton size="sm" variant="ghost">
                      Ghost
                    </PrismButton>
                    <PrismButton size="sm">Salvar</PrismButton>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Elementos Flutuantes, Accent & Workflow */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Popover (bg-popover) & Actions
                </span>
                <div className="rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">
                      Painel Popover
                    </span>
                    <span className="text-[10px] rounded-full bg-accent px-2 py-0.5 text-accent-foreground font-semibold">
                      bg-accent
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Elemento flutuante de camada{" "}
                    <code className="text-foreground font-mono">
                      bg-popover
                    </code>
                    .
                  </p>
                </div>
                <div className="rounded-xl bg-action p-3 text-xs flex items-center justify-between border border-border/40">
                  <span>
                    Ação (<code className="font-mono">bg-action</code>)
                  </span>
                  <span className="rounded-md bg-late px-2 py-0.5 text-[10px] text-late-foreground font-bold">
                    Late (Atrasado)
                  </span>
                </div>
              </div>

              {/* Bloco 3: Feedback Semântico */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Feedbacks Semânticos
                </span>
                <PrismAlert variant="success">
                  <PrismAlertTitle>Sucesso</PrismAlertTitle>
                  <PrismAlertDescription>
                    Operação concluída com sucesso.
                  </PrismAlertDescription>
                </PrismAlert>
                <PrismAlert variant="error">
                  <PrismAlertTitle>Erro detectado</PrismAlertTitle>
                  <PrismAlertDescription>
                    Falha na comunicação com a API.
                  </PrismAlertDescription>
                </PrismAlert>
              </div>
            </div>
          </div>
        </div>
      </GallerySection>
    </div>
  );
}
