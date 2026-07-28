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
import { ComboboxTrigger } from "~/components/features/ComboboxTrigger";
import { toHex } from "~/components/features/ActionForm/PartnerColorPicker";
import { cn } from "cnfast";
import { getGridCols, safeColor } from "~/lib/uzzina-utils";
interface ActionColorDropdownProps {
  action: Action;
  partners: Partner[];
  /** Chamado quando o usuário seleciona ou digita uma nova cor */
  onSelect?: (color: string) => void;
  tabIndex?: number;
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
    }
  };
  const handleOpenChange = (isOpen: boolean) => {
    // Quando o popover fechar, faz o commit da cor selecionada chamando o onSelect uma única vez
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
        variant="form-inline"
      >
        <div
          className="size-5 rounded-full border border-black/5"
          style={{
            backgroundColor: colorValue.toString("hex"),
          }}
        />
      </ComboboxTrigger>

      {/* Conteúdo do Popover */}
      <PrismPopover className="w-64 p-3 flex flex-col gap-3">
        {/* 1. Swatches do Parceiro */}
        {partnerColors.length > 0 && (
          <div className="flex flex-col gap-1.5 pb-2 border-b">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Cores do Parceiro
            </span>
            <PrismToggleGroup
              aria-label="Cores do Parceiro"
              className={cn(
                "grid gap-2 w-full justify-start",
                getGridCols(partnerColors.length, 6),
              )}
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
                  className="h-5 min-w-0 rounded-2xl squircle border border-black/10 p-0 shrink-0 transition-all data-selected:ring-2 data-selected:ring-primary data-selected:ring-offset-2 data-selected:ring-offset-background data-selected:scale-110"
                  id={hex}
                  style={{
                    backgroundColor: hex,
                  }}
                />
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
        <div className="pt-2 border-t flex items-center justify-between gap-2">
          <span className="shrink-0 text-xs font-semibold text-muted-foreground uppercase">
            Hex
          </span>
          <PrismColorField
            aria-label="Código Hex da Cor"
            className="w-32"
            onChange={handleLocalColorChange}
            value={colorValue}
            size="sm"
          />
        </div>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
