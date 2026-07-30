import { SunIcon, MoonIcon, PaletteIcon } from "lucide-react";
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

const COLOR_SWATCHES = [
  { name: "Card", bg: "bg-card", fg: "text-card-foreground" },
  { name: "Popover", bg: "bg-popover", fg: "text-popover-foreground" },
  { name: "Input", bg: "bg-input", fg: "text-foreground" },
  { name: "Muted", bg: "bg-muted", fg: "text-muted-foreground" },
  { name: "Primary", bg: "bg-primary", fg: "text-primary-foreground" },
  { name: "Secondary", bg: "bg-secondary", fg: "text-secondary-foreground" },
  { name: "Accent", bg: "bg-accent", fg: "text-accent-foreground" },
  { name: "Border", bg: "bg-border", fg: "text-foreground" },
  { name: "Action", bg: "bg-action", fg: "text-foreground" },
  { name: "Late", bg: "bg-late", fg: "text-late-foreground" },
  { name: "Error", bg: "bg-error-background", fg: "text-error" },
  { name: "Success", bg: "bg-success-background", fg: "text-success" },
  { name: "Warning", bg: "bg-warning-background", fg: "text-warning" },
  { name: "Info", bg: "bg-info-background", fg: "text-info" },
];

export function TokensColorsSection() {
  const { theme, setTheme, primaryColorIndex, setPrimaryColorIndex } =
    useAppThemeContext();

  return (
    <div id="colors">
      <GallerySection>
        {/* Cabeçalho com Seletor Interativo de Tema e Paletas */}
        <div className="flex flex-col gap-6 pb-6 border-b">
          <GallerySectionHeader
            title="Cores Semânticas OKLCH"
            description="Sistema de cores dinâmico adaptável aos modos Light/Dark e paletas de cores primárias do Uzzina."
          />

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4">
            {/* 1. Modo Light / Dark */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Modo:
              </span>
              <PrismToggleGroup
                aria-label="Modo de Tema"
                selectedKeys={[theme]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as Theme;
                  if (selected) setTheme(selected);
                }}
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

            {/* 2. Paletas de Cores Primárias (OKLCH Knobs) */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <PaletteIcon className="size-3.5" /> Paleta:
              </span>
              <PrismToggleGroup
                aria-label="Paleta de Cores"
                selectedKeys={[String(primaryColorIndex)]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected !== undefined)
                    setPrimaryColorIndex(Number(selected));
                }}
                size="sm"
              >
                {PALLETE.map((item, idx) => (
                  <PrismToggleGroupItem id={String(idx)} key={item.id}>
                    {item.label}
                  </PrismToggleGroupItem>
                ))}
              </PrismToggleGroup>
            </div>
          </div>
        </div>

        {/* 1. Grid Limpo de Cores Semânticas (Swatches sem descrições) */}
        <GallerySectionContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-6">
          {COLOR_SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-xs"
            >
              <div
                className={`size-7 rounded-lg border border-border/40 shrink-0 ${swatch.bg}`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate">
                  {swatch.name}
                </span>
                <code className="text-[10px] text-muted-foreground truncate">
                  {swatch.bg}
                </code>
              </div>
            </div>
          ))}
        </GallerySectionContent>

        {/* 2. Aplicação no Mundo Real */}
        <div className="pt-10 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Aplicação no Mundo Real (Componentes com Cores Ativas)
          </h4>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card Exemplo 1: Card, Input e Controles */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Superfície (bg-card) & Controles
                </span>
                <PrismBadge variant="default">Primary</PrismBadge>
              </div>
              <div className="flex flex-col gap-1">
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
                  <PrismButton size="sm">Primary</PrismButton>
                </div>
              </div>
            </div>

            {/* Card Exemplo 2: Popover, Accent e Muted */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Popover (bg-popover) & Accent
              </span>
              <div className="rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Exemplo de Popover</span>
                  <span className="text-[10px] rounded-full bg-accent px-2 py-0.5 text-accent-foreground font-medium">
                    bg-accent
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Painel flutuante renderizado com a cor semântica <code className="text-foreground">bg-popover</code>.
                </p>
              </div>
              <div className="rounded-xl bg-action p-3 text-xs flex items-center justify-between border border-border/40">
                <span>Estado de Ação (<code className="font-mono">bg-action</code>)</span>
                <span className="rounded-md bg-late px-2 py-0.5 text-[10px] text-late-foreground font-bold">
                  Late (Atrasado)
                </span>
              </div>
            </div>

            {/* Card Exemplo 3: Alertas & Badges Semânticos */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Estados Semânticos & Cores
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
                  Falha de comunicação.
                </PrismAlertDescription>
              </PrismAlert>
            </div>
          </div>
        </div>
      </GallerySection>
    </div>
  );
}

