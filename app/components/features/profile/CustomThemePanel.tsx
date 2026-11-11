import { LayersIcon, PipetteIcon, RotateCcwIcon } from "lucide-react";
import { PrismButton, PrismLabel } from "~/components/prism";
import { UPreferenceSwitch } from "~/components/uzzina/UPreferenceSwitch";
import type {
  CustomThemeOptionKey,
  ThemeColorKey,
  ThemeMode,
} from "~/lib/custom-theme";
import type { CustomTheme } from "~/lib/preferences";

const MODES: { mode: ThemeMode; title: string }[] = [
  { mode: "light", title: "Modo Claro" },
  { mode: "dark", title: "Modo Escuro" },
];

const FIELDS: { key: ThemeColorKey; label: string }[] = [
  { key: "primaryHex", label: "Cor Primária (Primary)" },
  { key: "primaryFgHex", label: "Texto na Cor Primária (Primary Fg)" },
  { key: "bgHex", label: "Fundo (Background)" },
  { key: "fgHex", label: "Texto (Foreground)" },
];

export function CustomThemePanel({
  theme,
  onChange,
  onOptionChange,
}: {
  theme: CustomTheme;
  onChange: (mode: ThemeMode, key: ThemeColorKey, value: string) => void;
  onOptionChange: <K extends CustomThemeOptionKey>(
    key: K,
    value: CustomTheme[K],
  ) => void;
}) {
  const isRelief = theme.relief !== false;

  return (
    <div className="flex flex-col gap-6 border-t border-border/40 pt-5">
      {/* Cabeçalho da seção */}
      <div className="flex items-center gap-2">
        <PipetteIcon className="size-4 text-primary" />
        <span className="text-sm font-semibold">Editar Cores do Tema</span>
      </div>

      {/* Grade de cores modo claro / escuro */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {MODES.map(({ mode, title }) => (
          <div className="flex flex-col gap-3" key={mode}>
            <span className="text-xs font-semibold text-secondary-foreground">
              {title}
            </span>
            <div className="grid gap-3">
              {FIELDS.map(({ key, label }) => (
                <div className="flex flex-col gap-1.5" key={key}>
                  <PrismLabel className="text-xs text-secondary-foreground">
                    {label}
                  </PrismLabel>
                  <label className="group flex cursor-pointer items-center gap-2">
                    <div
                      className="size-8 rounded-lg border border-border shadow-sm transition duration-200 squircle group-hover:scale-105"
                      style={{ backgroundColor: theme[mode][key] }}
                    />
                    <input
                      className="sr-only"
                      onChange={(e) => onChange(mode, key, e.target.value)}
                      type="color"
                      value={theme[mode][key]}
                    />
                    <span className="font-mono text-xs text-secondary-foreground select-none group-hover:text-foreground">
                      {theme[mode][key]}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Controles de Relevo e Acabamento dos Cartões (DS06) */}
      <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
        <div className="flex items-center gap-2">
          <LayersIcon className="size-4 text-primary" />
          <span className="text-sm font-semibold">
            Relevo e Acabamento das Ações
          </span>
        </div>

        <UPreferenceSwitch
          checked={isRelief}
          description="Mantém profundidade com sombra e realce superior nos cartões de ação. Quando desativado, adota estilo plano moderno com borda transparente."
          id="custom-theme-relief"
          label="Relevo dos cartões de ação"
          onCheckedChange={(checked) => onOptionChange("relief", checked)}
        />

        {/* Cores de intenção visual para tokens derivados de acabamento */}
        {isRelief && (
          <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
            {/* Cor de sombra e borda */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <PrismLabel className="text-xs font-medium">
                  Sombra e contorno base
                </PrismLabel>
                {theme.shadowColor && (
                  <PrismButton
                    aria-label="Restaurar sombra padrão"
                    className="h-auto p-0 text-[11px] text-secondary-foreground hover:text-foreground"
                    onPress={() => onOptionChange("shadowColor", undefined)}
                    size="xs"
                    variant="ghost"
                  >
                    Restaurar
                    <RotateCcwIcon className="size-3" />
                  </PrismButton>
                )}
              </div>
              <p className="text-[11px] text-secondary-foreground">
                Tonalidade para sombras e anel dos cartões (ideal em paletas
                saturadas).
              </p>
              <label className="group flex cursor-pointer items-center gap-2 pt-1">
                <div
                  className="size-8 rounded-lg border border-border shadow-sm transition duration-200 squircle group-hover:scale-105"
                  style={{
                    backgroundColor: theme.shadowColor || "rgba(0, 0, 0, 0.4)",
                  }}
                />
                <input
                  className="sr-only"
                  onChange={(e) =>
                    onOptionChange("shadowColor", e.target.value)
                  }
                  type="color"
                  value={
                    theme.shadowColor?.startsWith("#")
                      ? theme.shadowColor
                      : "#000000"
                  }
                />
                <span className="font-mono text-xs text-secondary-foreground select-none group-hover:text-foreground">
                  {theme.shadowColor || "Automático (padrão)"}
                </span>
              </label>
            </div>

            {/* Cor do realce superior */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <PrismLabel className="text-xs font-medium">
                  Realce superior (borda de topo)
                </PrismLabel>
                {theme.topBorderColor && (
                  <PrismButton
                    aria-label="Restaurar realce padrão"
                    className="h-auto p-0 text-[11px] text-secondary-foreground hover:text-foreground"
                    onPress={() => onOptionChange("topBorderColor", undefined)}
                    size="xs"
                    variant="ghost"
                  >
                    Restaurar
                    <RotateCcwIcon className="size-3" />
                  </PrismButton>
                )}
              </div>
              <p className="text-[11px] text-secondary-foreground">
                Cor do fio de luz superior dos cartões (padrão branco).
              </p>
              <label className="group flex cursor-pointer items-center gap-2 pt-1">
                <div
                  className="size-8 rounded-lg border border-border shadow-sm transition duration-200 squircle group-hover:scale-105"
                  style={{
                    backgroundColor: theme.topBorderColor || "#ffffff",
                  }}
                />
                <input
                  className="sr-only"
                  onChange={(e) =>
                    onOptionChange("topBorderColor", e.target.value)
                  }
                  type="color"
                  value={
                    theme.topBorderColor?.startsWith("#")
                      ? theme.topBorderColor
                      : "#ffffff"
                  }
                />
                <span className="font-mono text-xs text-secondary-foreground select-none group-hover:text-foreground">
                  {theme.topBorderColor || "#ffffff (padrão)"}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Pré-visualização com cartão de ação e elementos derivados */}
      <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
        <span className="text-[11px] font-semibold tracking-wider text-secondary-foreground uppercase">
          Pré-visualização em Tempo Real
        </span>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Cartão de ação simulando ActionItem */}
          <div className="flex flex-col justify-between rounded-2xl border-t border-action-top-border bg-action p-3.5 shadow-action ring ring-action-ring transition-all squircle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Cartão de Ação</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {isRelief ? "Com Relevo" : "Estilo Plano"}
              </span>
            </div>
            <p className="mt-2 text-xs text-secondary-foreground">
              {isRelief
                ? "Borda de brilho superior e sombra de profundidade ativas."
                : "Borda de topo transparente e sombras de relevo desligadas."}
            </p>
          </div>

          {/* Cards derivados menores */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col justify-between rounded-xl border bg-primary p-2.5 text-primary-foreground squircle">
              <span className="text-xs font-semibold">Botão Destaque</span>
              <span className="text-[10px] opacity-80">Primary Fg</span>
            </div>
            <div className="flex flex-col justify-between rounded-xl border bg-card p-2.5 text-foreground squircle">
              <span className="text-xs font-semibold">Card & Popover</span>
              <span className="text-[10px] text-secondary-foreground">
                Fundo derivado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
