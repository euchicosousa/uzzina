import { SunIcon, MoonIcon, CheckIcon } from "lucide-react";
import { useAppThemeContext, Theme } from "~/hooks/useAppTheme";
import { PALLETE } from "~/lib/palettes";
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
        <div className="flex flex-col gap-6 border-b pb-6">
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
              <div className="flex flex-wrap items-center gap-2">
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
                        "relative flex size-7 items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-110 focus:outline-none dark:border-white/20",
                        isSelected &&
                          "scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background",
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
        <GallerySectionContent className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-3 md:grid-cols-5">
          {COLOR_SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              className="flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 shadow-xs"
            >
              <div
                className={`size-7 shrink-0 rounded-lg border border-border/40 ${swatch.bg}`}
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-semibold">
                  {swatch.name}
                </span>
                <code className="truncate font-mono text-[10px] text-muted-foreground">
                  {swatch.bg}
                </code>
              </div>
            </div>
          ))}
        </GallerySectionContent>

        {/* 2. Demonstração dos Componentes Vivos sobre bg-background (Canvas Real) */}
        <div className="space-y-6 pt-10">
          <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Aplicação no Mundo Real (Montados sobre o Canvas bg-background)
          </h4>

          {/* Container simulando a superfície da página (bg-background) */}
          <div className="space-y-8 rounded-3xl border border-border/60 bg-background p-8 shadow-inner">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Bloco 1: Estruturas de Superfície (bg-card sobre bg-background) */}
              <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
              <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Popover (bg-popover) & Actions
                </span>
                <div className="space-y-2 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">
                      Painel Popover
                    </span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                      bg-accent
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Elemento flutuante de camada{" "}
                    <code className="font-mono text-foreground">
                      bg-popover
                    </code>
                    .
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-action p-3 text-xs">
                  <span>
                    Ação (<code className="font-mono">bg-action</code>)
                  </span>
                  <span className="rounded-md bg-late px-2 py-0.5 text-[10px] font-bold text-late-foreground">
                    Late (Atrasado)
                  </span>
                </div>
              </div>

              {/* Bloco 3: Feedback Semântico */}
              <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
