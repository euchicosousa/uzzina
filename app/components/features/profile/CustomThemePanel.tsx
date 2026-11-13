import { LayersIcon, PipetteIcon, RotateCcwIcon } from "lucide-react";
import {
  PrismButton,
  PrismLabel,
  PrismSlider,
  PrismSliderTrack,
} from "~/components/prism";
import { UColorPickerDropdown } from "~/components/uzzina/UColorPickerDropdown";
import { UPreferenceSwitch } from "~/components/uzzina/UPreferenceSwitch";
import type {
  CustomThemeOptionKey,
  ThemeColorKey,
  ThemeMode,
} from "~/lib/custom-theme";
import type { CustomTheme } from "~/lib/preferences";

const MODES: { mode: ThemeMode; title: string }[] = [
  { mode: "light", title: "Modo claro" },
  { mode: "dark", title: "Modo escuro" },
];

const FIELDS: { key: ThemeColorKey; label: string }[] = [
  { key: "primaryHex", label: "Cor principal" },
  { key: "primaryFgHex", label: "Texto sobre a cor principal" },
  { key: "bgHex", label: "Fundo" },
  { key: "fgHex", label: "Texto" },
];

const SHADOW_FIELDS = {
  light: {
    color: "shadowColor",
    opacity: "shadowOpacity",
    defaultOpacity: 10,
  },
  dark: {
    color: "darkShadowColor",
    opacity: "darkShadowOpacity",
    defaultOpacity: 25,
  },
} as const;

/** Swatch + value button that opens the color picker. */
function ColorTrigger({
  ariaLabel,
  color,
  label,
}: {
  ariaLabel: string;
  color: string;
  label: string;
}) {
  return (
    <PrismButton
      aria-label={ariaLabel}
      className="h-auto justify-start gap-3 px-0 text-sm font-normal text-inherit hover:bg-transparent"
      variant="ghost"
    >
      <span
        aria-hidden="true"
        className="size-8 shrink-0 rounded-lg border border-current/20 squircle"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono uppercase">{label}</span>
    </PrismButton>
  );
}

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

      <p className="-mt-3 text-sm text-secondary-foreground">
        Cada lado mostra o modo com as cores escolhidas. A sombra vale para
        menus, diálogos, avisos e cartões, mesmo com o relevo desligado.
      </p>

      {/* Cada modo é exibido com o próprio fundo e texto escolhidos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODES.map(({ mode, title }) => {
          const fields = SHADOW_FIELDS[mode];
          const ownColor = theme[fields.color];
          // Dark mode without its own shadow color falls back to the light one.
          const shadowColor =
            ownColor || (mode === "dark" ? theme.shadowColor : undefined);
          const opacity = theme[fields.opacity] ?? fields.defaultOpacity;
          const hasShadowChange =
            Boolean(ownColor) || theme[fields.opacity] !== undefined;

          return (
            <div
              className="flex flex-col gap-5 rounded-2xl border border-foreground/10 p-5 squircle"
              key={mode}
              style={{
                backgroundColor: theme[mode].bgHex,
                color: theme[mode].fgHex,
              }}
            >
              <span className="text-base font-semibold">{title}</span>

              <div className="grid gap-4">
                {FIELDS.map(({ key, label }) => (
                  <div className="flex flex-col gap-1.5" key={key}>
                    <span className="text-sm opacity-70">{label}</span>
                    <UColorPickerDropdown
                      aria-label={`${label}, ${title.toLowerCase()}`}
                      onChange={(value) => onChange(mode, key, value)}
                      trigger={
                        <ColorTrigger
                          ariaLabel={`${label}, ${title.toLowerCase()}: ${theme[mode][key]}`}
                          color={theme[mode][key]}
                          label={theme[mode][key]}
                        />
                      }
                      value={theme[mode][key]}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-current/15 pt-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Sombra</span>
                  {hasShadowChange && (
                    <PrismButton
                      aria-label={`Restaurar sombra do ${title.toLowerCase()}`}
                      className="h-auto p-0 text-sm text-inherit opacity-70 hover:bg-transparent hover:opacity-100"
                      onPress={() => {
                        onOptionChange(fields.color, undefined);
                        onOptionChange(fields.opacity, undefined);
                      }}
                      size="xs"
                      variant="ghost"
                    >
                      Restaurar
                      <RotateCcwIcon className="size-3.5" />
                    </PrismButton>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm opacity-70">Cor da sombra</span>
                  <UColorPickerDropdown
                    aria-label={`Cor da sombra, ${title.toLowerCase()}`}
                    onChange={(value) => onOptionChange(fields.color, value)}
                    trigger={
                      <ColorTrigger
                        ariaLabel={`Cor da sombra, ${title.toLowerCase()}`}
                        color={shadowColor || "#000000"}
                        label={shadowColor || "Neutra (padrão)"}
                      />
                    }
                    value={shadowColor || "#000000"}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-70">Opacidade da sombra</span>
                    <span className="font-mono">{opacity}%</span>
                  </div>
                  <PrismSlider
                    aria-label={`Opacidade da sombra, ${title.toLowerCase()}`}
                    maxValue={100}
                    minValue={1}
                    onChange={(value) => onOptionChange(fields.opacity, value)}
                    value={opacity}
                  >
                    <PrismSliderTrack className="bg-current/20" />
                  </PrismSlider>
                </div>
              </div>
            </div>
          );
        })}
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
            {/* Cor do realce superior */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <PrismLabel className="text-sm font-medium">
                  Realce superior (borda de topo)
                </PrismLabel>
                {theme.topBorderColor && (
                  <PrismButton
                    aria-label="Restaurar realce padrão"
                    className="h-auto p-0 text-sm text-secondary-foreground hover:text-foreground"
                    onPress={() => onOptionChange("topBorderColor", undefined)}
                    size="xs"
                    variant="ghost"
                  >
                    Restaurar
                    <RotateCcwIcon className="size-3" />
                  </PrismButton>
                )}
              </div>
              <p className="text-sm text-secondary-foreground">
                Cor do fio de luz superior dos cartões (padrão branco).
              </p>
              <UColorPickerDropdown
                aria-label="Cor do realce superior"
                onChange={(value) => onOptionChange("topBorderColor", value)}
                trigger={
                  <ColorTrigger
                    ariaLabel="Cor do realce superior"
                    color={theme.topBorderColor || "#ffffff"}
                    label={theme.topBorderColor || "#FFFFFF (padrão)"}
                  />
                }
                value={theme.topBorderColor || "#ffffff"}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pré-visualização com cartão de ação e elementos derivados */}
      <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
        <span className="text-sm font-semibold text-secondary-foreground">
          Pré-visualização
        </span>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Cartão de ação simulando ActionItem */}
          <div className="flex flex-col justify-between rounded-2xl border-t border-action-top-border bg-action p-3.5 shadow-action ring ring-action-ring transition-all squircle">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Cartão de ação</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {isRelief ? "Com Relevo" : "Estilo Plano"}
              </span>
            </div>
            <p className="mt-2 text-sm text-secondary-foreground">
              {isRelief
                ? "Borda de brilho superior e sombra de profundidade ativas."
                : "Borda de topo transparente e sombras de relevo desligadas."}
            </p>
          </div>

          {/* Cards derivados menores */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col justify-between rounded-xl border bg-primary p-2.5 text-primary-foreground squircle">
              <span className="text-sm font-semibold">Botão de destaque</span>
              <span className="text-xs opacity-80">
                Texto sobre a cor principal
              </span>
            </div>
            <div className="flex flex-col justify-between rounded-xl border bg-card p-2.5 text-foreground squircle">
              <span className="text-sm font-semibold">Cartão e menu</span>
              <span className="text-xs text-secondary-foreground">
                Fundo derivado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
