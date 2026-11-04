import { useState, useRef, useMemo, Fragment } from "react";
import { parseColor, type Color } from "react-aria-components";
import { cn } from "cnfast";
import { ChevronDownIcon } from "lucide-react";
import {
  PrismButton,
  PrismColorArea,
  PrismColorField,
  PrismColorSlider,
  PrismMenu,
  PrismMenuContent,
  PrismMenuItem,
  PrismPopover,
  PrismPopoverTrigger,
  PrismToggleGroup,
  PrismToggleGroupItem,
  PrismSeparator as Separator,
} from "~/components/prism";
import {
  UComboboxTrigger,
  getTriggerContentSizeClass,
  type UComboboxTriggerProps,
} from "~/components/uzzina/UComboboxTrigger";
import { safeColor } from "~/utils/uzzina-utils";
import type { Partner } from "~/types";

export type ColorFormat = "hex" | "rgb" | "hsl" | "hsb";

export interface ColorSwatchGroup {
  id: string;
  label?: string;
  colors: string[];
}

export interface UColorPickerDropdownProps {
  /** Cor confirmada (ex: #2563EB) */
  value?: string;
  defaultValue?: string;
  /** Chamado apenas quando uma cor válida diferente da anterior for confirmada */
  onChange?: (color: string) => void;
  /** Grupos de swatches por parceiro ou categoria */
  groups?: ColorSwatchGroup[];
  /** Parceiros da ação (atalho de conveniência que gera os grupos automaticamente) */
  partners?: Partner[];
  /** Trigger personalizado (se não informado, usa UComboboxTrigger) */
  trigger?: React.ReactNode;
  variant?: UComboboxTriggerProps["variant"];
  size?: UComboboxTriggerProps["size"];
  popoverSize?: "sm" | "default" | "lg";
  disabled?: boolean;
  tabIndex?: number;
  "aria-label"?: string;
  className?: string;
}

const COLOR_FORMATS: readonly ColorFormat[] = [
  "hex",
  "rgb",
  "hsl",
  "hsb",
] as const;

function getParsedColor(hexStr?: string | null): Color {
  if (!hexStr) return parseColor("#666666");
  try {
    const normalized = safeColor(hexStr);
    return parseColor(normalized);
  } catch {
    return parseColor("#666666");
  }
}

/**
 * Normaliza qualquer cor válida do React Aria para o formato #RRGGBB em caixa alta,
 * sem canal alfa.
 */
function toHexRgbString(color: Color): string {
  try {
    const hex = color.toString("hex");
    if (hex.length >= 7) {
      return hex.slice(0, 7).toUpperCase();
    }
    return hex.toUpperCase();
  } catch {
    return "#2563EB";
  }
}

export function UColorPickerDropdown({
  value,
  defaultValue,
  onChange,
  groups,
  partners,
  trigger,
  variant,
  size,
  popoverSize = "default",
  disabled,
  tabIndex,
  "aria-label": ariaLabel = "Seletor de cor",
  className,
}: UColorPickerDropdownProps) {
  const normalizedIncoming = useMemo(
    () => safeColor(value ?? defaultValue ?? "#2563EB"),
    [value, defaultValue],
  );

  const [colorValue, setColorValue] = useState<Color>(() =>
    getParsedColor(normalizedIncoming),
  );
  const [format, setFormat] = useState<ColorFormat>("hex");

  const prevIncomingRef = useRef(normalizedIncoming);
  const lastEmittedHexRef = useRef<string>(normalizedIncoming.toUpperCase());

  // Sincroniza quando o valor externo mudar
  if (normalizedIncoming !== prevIncomingRef.current) {
    prevIncomingRef.current = normalizedIncoming;
    lastEmittedHexRef.current = normalizedIncoming.toUpperCase();
    setColorValue(getParsedColor(normalizedIncoming));
  }

  const activeHex = toHexRgbString(colorValue).toLowerCase();

  // Grupos derivados de partners ou passados diretamente
  const effectiveGroups = useMemo<ColorSwatchGroup[]>(() => {
    if (groups) return groups;
    if (partners) {
      return partners
        .filter((p) => p.colors && p.colors.length > 0)
        .map((p) => ({
          id: p.id || p.slug,
          label: p.short || p.title || "Parceiro",
          colors: (p.colors ?? []).map((c) => safeColor(c)),
        }));
    }
    return [];
  }, [groups, partners]);

  // Grupos válidos (ignora parceiro sem cores)
  const validGroups = useMemo(
    () =>
      effectiveGroups
        .map((g) => ({
          ...g,
          colors: (g.colors ?? []).filter((c) => Boolean(c?.trim())),
        }))
        .filter((g) => g.colors.length > 0),
    [effectiveGroups],
  );

  // Chaves selecionadas no ToggleGroup correspondentes à cor ativa
  const matchingSelectedKeys = useMemo(
    () =>
      validGroups.flatMap((group) =>
        group.colors
          .map((c, idx) => ({
            id: `${group.id}__${idx}__${c}`,
            hex: c.toLowerCase(),
          }))
          .filter((item) => item.hex === activeHex)
          .map((item) => item.id),
      ),
    [validGroups, activeHex],
  );

  // Confirmação de cor: só emite se a cor for válida e diferente da última emitida
  const commitColor = (newColor: Color | null) => {
    if (!newColor) return;
    setColorValue(newColor);
    const hex = toHexRgbString(newColor);
    if (hex.toUpperCase() !== lastEmittedHexRef.current) {
      lastEmittedHexRef.current = hex.toUpperCase();
      onChange?.(hex);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && colorValue) {
      const hex = toHexRgbString(colorValue);
      if (hex.toUpperCase() !== lastEmittedHexRef.current) {
        lastEmittedHexRef.current = hex.toUpperCase();
        onChange?.(hex);
      }
    }
  };

  const isIconOnly = size ? size.startsWith("icon") : false;

  return (
    <PrismPopoverTrigger onOpenChange={handleOpenChange}>
      {trigger ? (
        trigger
      ) : (
        <UComboboxTrigger
          aria-label={ariaLabel}
          className={className}
          isDisabled={disabled}
          size={size}
          tabIndex={tabIndex}
          variant={variant}
        >
          {isIconOnly ? (
            <div
              className={cn(
                getTriggerContentSizeClass(size),
                "rounded-full border border-border shadow-xs",
              )}
              style={{
                backgroundColor: toHexRgbString(colorValue),
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  getTriggerContentSizeClass(size),
                  "rounded-full border border-border shadow-xs",
                )}
                style={{
                  backgroundColor: toHexRgbString(colorValue),
                }}
              />
              <span className="font-mono text-xs text-foreground uppercase">
                {toHexRgbString(colorValue)}
              </span>
            </div>
          )}
        </UComboboxTrigger>
      )}

      <PrismPopover className="p-2" size={popoverSize}>
        {/* 1. Amostras dos parceiros com botões compactos e separador vertical | entre marcas (sem títulos) */}
        {validGroups.length > 0 && (
          <PrismToggleGroup
            aria-label="Cores dos parceiros"
            className="w-full flex-wrap items-center"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string | undefined;
              if (selected) {
                const parts = selected.split("__");
                const hex = parts[parts.length - 1];
                if (hex) {
                  commitColor(getParsedColor(hex));
                }
              }
            }}
            selectedKeys={matchingSelectedKeys}
            selectionMode="single"
            size="icon-sm"
            spacing={1}
          >
            {validGroups.map((group, groupIdx) => (
              <Fragment key={group.id}>
                {groupIdx > 0 && (
                  <Separator
                    className="mx-1 h-5 self-center bg-border/60"
                    orientation="vertical"
                  />
                )}
                {group.colors.map((hex, idx) => {
                  const swatchId = `${group.id}__${idx}__${hex}`;
                  return (
                    <PrismToggleGroupItem
                      key={swatchId}
                      aria-label={`Cor ${hex}`}
                      id={swatchId}
                    >
                      <span
                        className="size-5 rounded-full border border-border"
                        style={{ backgroundColor: hex }}
                      />
                    </PrismToggleGroupItem>
                  );
                })}
              </Fragment>
            ))}
          </PrismToggleGroup>
        )}

        {/* 2. Área de Cor + Slider Hue */}
        <div className="flex flex-col gap-2">
          <PrismColorArea
            colorSpace="hsb"
            onChange={commitColor}
            value={colorValue}
            xChannel="saturation"
            yChannel="brightness"
          />
          <PrismColorSlider
            channel="hue"
            colorSpace="hsb"
            onChange={commitColor}
            trackClassName="h-2"
            value={colorValue}
          />
        </div>

        {/* 3. Seleção de Formato e Entradas dos Canais */}
        <div className="flex items-start gap-1.5 border-t border-border/40 pt-2">
          <PrismMenu>
            <PrismButton
              aria-label="Escolher formato de cor"
              className="h-8 shrink-0 gap-0.5 px-2 text-xs font-semibold uppercase"
              size="xs"
              variant="ghost"
            >
              {format}
              <ChevronDownIcon className="size-3 opacity-60" />
            </PrismButton>
            <PrismMenuContent className="min-w-20">
              {COLOR_FORMATS.map((fmt) => (
                <PrismMenuItem
                  key={fmt}
                  className="text-xs font-medium uppercase"
                  onAction={() => setFormat(fmt)}
                >
                  {fmt}
                </PrismMenuItem>
              ))}
            </PrismMenuContent>
          </PrismMenu>

          {/* HEX: campo único */}
          {format === "hex" && (
            <div className="min-w-0 flex-1">
              <PrismColorField
                aria-label="Código Hex da Cor"
                className="w-full"
                inputClassName="text-xs font-mono uppercase"
                onChange={commitColor}
                size="sm"
                value={colorValue}
              />
            </div>
          )}

          {/* RGB: 3 canais */}
          {format === "rgb" && (
            <div className="flex min-w-0 flex-1 items-start gap-1">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Vermelho (0 a 255)"
                  channel="red"
                  colorSpace="rgb"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  R
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Verde (0 a 255)"
                  channel="green"
                  colorSpace="rgb"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  G
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Azul (0 a 255)"
                  channel="blue"
                  colorSpace="rgb"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  B
                </span>
              </div>
            </div>
          )}

          {/* HSL: 3 canais */}
          {format === "hsl" && (
            <div className="flex min-w-0 flex-1 items-start gap-1">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Matiz (0 a 360°)"
                  channel="hue"
                  colorSpace="hsl"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  H
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Saturação (0 a 100%)"
                  channel="saturation"
                  colorSpace="hsl"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  S
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Luminosidade (0 a 100%)"
                  channel="lightness"
                  colorSpace="hsl"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  L
                </span>
              </div>
            </div>
          )}

          {/* HSB: 3 canais */}
          {format === "hsb" && (
            <div className="flex min-w-0 flex-1 items-start gap-1">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Matiz (0 a 360°)"
                  channel="hue"
                  colorSpace="hsb"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  H
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Saturação (0 a 100%)"
                  channel="saturation"
                  colorSpace="hsb"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  S
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <PrismColorField
                  aria-label="Brilho (0 a 100%)"
                  channel="brightness"
                  colorSpace="hsb"
                  inputClassName="px-1 text-center font-mono text-xs"
                  onChange={commitColor}
                  size="sm"
                  value={colorValue}
                />
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  B
                </span>
              </div>
            </div>
          )}
        </div>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
