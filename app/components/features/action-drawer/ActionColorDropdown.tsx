import { cn } from "cnfast";
import type { Action, Partner } from "~/types";
import { useMemo, useState, useRef } from "react";
import { parseColor, type Color } from "react-aria-components";
import {
  PrismColorArea,
  PrismColorField,
  PrismColorSlider,
  PrismPopover,
  PrismPopoverTrigger,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import {
  ComboboxTrigger,
  getTriggerContentSizeClass,
  type ComboboxTriggerProps,
} from "~/components/features/ComboboxTrigger";
import { toHex } from "./PartnerColorPicker";
import { safeColor } from "~/utils/uzzina-utils";
interface ActionColorDropdownProps {
  action: Action;
  partners: Partner[];
  /** Chamado quando o usuário seleciona ou digita uma nova cor */
  onSelect?: (color: string) => void;
  tabIndex?: number;
  variant?: ComboboxTriggerProps["variant"];
  size?: ComboboxTriggerProps["size"];
}

/**
 * Dropdown/Popover de seleção de cor para uma ação individual.
 * Exibe a cor atual da ação e abre um painel com:
 * 1. Swatches das cores do parceiro (PrismToggleGroup)
 * 2. ColorArea + ColorSlider (React Aria / Prism)
 * 3. ColorField Hexadecimal
 */
export function ActionColorDropdown({
  action,
  partners,
  onSelect,
  variant,
  size,
}: ActionColorDropdownProps) {
  const normalizedActionColor = useMemo(
    () => safeColor(action.color),
    [action.color],
  );

  // Cores agregadas dos parceiros
  const partnerColors = useMemo(
    () =>
      Array.from(
        new Set(partners.flatMap((p) => (p.colors ?? []).map((c) => toHex(c)))),
      ),
    [partners],
  );
  const getParsedColor = (hexStr: string): Color => {
    try {
      return parseColor(hexStr);
    } catch {
      return parseColor("#666666");
    }
  };
  const [colorValue, setColorValue] = useState<Color>(() =>
    getParsedColor(normalizedActionColor),
  );
  const prevColorRef = useRef(normalizedActionColor);
  if (normalizedActionColor !== prevColorRef.current) {
    prevColorRef.current = normalizedActionColor;
    setColorValue(getParsedColor(normalizedActionColor));
  }
  const activeHex = colorValue.toString("hex").toLowerCase();
  const handleLocalColorChange = (newColor: Color | null) => {
    if (newColor) {
      setColorValue(newColor);
      const hex = newColor.toString("hex");
      if (hex !== normalizedActionColor) {
        onSelect?.(hex);
      }
    }
  };
  const handleOpenChange = (isOpen: boolean) => {
    // Quando o popover fechar, garante o commit final da cor se tiver alterado
    if (!isOpen && colorValue) {
      const hex = colorValue.toString("hex");
      if (hex !== normalizedActionColor) {
        onSelect?.(hex);
      }
    }
  };
  return (
    <PrismPopoverTrigger onOpenChange={handleOpenChange}>
      {/* Trigger unificado no estilo ComboboxTrigger dos outros campos do footer */}
      <ComboboxTrigger
        aria-label="Abrir seletor de cores"
        title="Cor da Ação"
        size={size}
        variant={variant}
      >
        <div
          className={cn(
            getTriggerContentSizeClass(size),
            "rounded-full border border-border",
          )}
          style={{
            backgroundColor: colorValue.toString("hex"),
          }}
        />
      </ComboboxTrigger>

      {/* Conteúdo do Popover */}
      <PrismPopover size="sm">
        {/* 1. Swatches do Parceiro */}
        {partnerColors.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Cores do Parceiro
            </span>
            <PrismToggleGroup
              aria-label="Cores do Parceiro"
              className="w-full flex-wrap"
              spacing={0}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                if (selected) {
                  handleLocalColorChange(getParsedColor(selected));
                }
              }}
              selectedKeys={
                activeHex
                  ? partnerColors.filter((c) => c.toLowerCase() === activeHex)
                  : []
              }
              selectionMode="single"
            >
              {partnerColors.map((hex) => (
                <PrismToggleGroupItem
                  key={hex}
                  aria-label={`Cor ${hex}`}
                  id={hex}
                >
                  <span
                    className="size-5 rounded-full border border-border"
                    style={{ backgroundColor: hex }}
                  />
                </PrismToggleGroupItem>
              ))}
            </PrismToggleGroup>
          </div>
        )}

        {/* 2. Área de Cor + Slider */}
        <div className="flex flex-col gap-2">
          <PrismColorArea
            onChange={handleLocalColorChange}
            value={colorValue}
          />
          <PrismColorSlider
            onChange={handleLocalColorChange}
            trackClassName="h-4"
            value={colorValue}
          />
        </div>

        {/* 3. Input Hexadecimal */}
        <div className="flex items-center justify-between gap-2 border-t pt-2">
          <span className="shrink-0 text-xs font-semibold text-muted-foreground uppercase">
            Hex
          </span>
          <PrismColorField
            aria-label="Código Hex da Cor"
            className="w-32"
            onChange={handleLocalColorChange}
            size="sm"
            value={colorValue}
          />
        </div>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
