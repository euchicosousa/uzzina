import { useState } from "react";
import { parseColor, type Color } from "react-aria-components";
import { toHex } from "~/components/features/ActionForm/PartnerColorPicker";
import {
  PrismButton,
  PrismColorArea,
  PrismColorField,
  PrismColorSlider,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { cn } from "~/lib/utils";
import { getGridCols } from "~/lib/uzzina-utils";
interface BulkColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerColors: string[];
  selectedCount: number;
  onApply: (color: string) => void;
}
export function BulkColorDialog({
  open,
  onOpenChange,
  partnerColors,
  selectedCount,
  onApply,
}: BulkColorDialogProps) {
  const normalizedColors = Array.from(
    new Set(partnerColors.map((c) => toHex(c))),
  );
  const getInitialColor = () => {
    const first = normalizedColors[0];
    if (first) {
      try {
        return parseColor(first);
      } catch {
        // fallback
      }
    }
    return parseColor("#3b82f6");
  };
  const [colorValue, setColorValue] = useState<Color>(getInitialColor);
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setColorValue(getInitialColor());
    }
    onOpenChange(isOpen);
  };
  const handleApply = () => {
    if (!colorValue) return;
    onApply(colorValue.toString("hex"));
    onOpenChange(false);
  };
  if (!open) return null;
  const activeHex = colorValue.toString("hex").toLowerCase();
  const handleColorChange = (newColor: Color | null) => {
    if (newColor) {
      setColorValue(newColor);
    }
  };
  return (
    <PrismDialog
      className="w-72 overflow-hidden"
      isDismissable
      isOpen={open}
      onOpenChange={handleOpenChange}
    >
      <PrismDialogHeader className="border-b">
        <PrismDialogTitle>Alterar Cor</PrismDialogTitle>
        <PrismDialogDescription>
          Escolha uma cor para as {selectedCount} ação(ões) selecionada(s).
        </PrismDialogDescription>
      </PrismDialogHeader>

      <div className="px-5 py-4">
        {normalizedColors.length > 0 ? (
          <PrismToggleGroup
            aria-label="Seleção de Cor dos Parceiros"
            className={cn(
              "grid gap-3 w-full justify-start",
              getGridCols(normalizedColors.length, 8),
            )}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string | undefined;
              if (selected) {
                try {
                  setColorValue(parseColor(selected));
                } catch {
                  // ignore
                }
              }
            }}
            selectedKeys={
              activeHex
                ? normalizedColors.filter((c) => c.toLowerCase() === activeHex)
                : []
            }
            selectionMode="single"
          >
            {normalizedColors.map((hex) => (
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
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma cor encontrada para os parceiros das ações selecionadas.
          </p>
        )}
      </div>

      <div className="border-t px-5 py-4 flex flex-col gap-3">
        <PrismColorArea onChange={handleColorChange} value={colorValue} />
        <PrismColorSlider onChange={handleColorChange} value={colorValue} />
      </div>

      <div className="border-t px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="shrink-0 text-xs font-semibold text-muted-foreground uppercase">
            Nova cor
          </span>
          <PrismColorField
            aria-label="Código da Cor"
            className="w-36"
            onChange={handleColorChange}
            value={colorValue}
          />
        </div>
      </div>

      <PrismDialogFooter className="border-t">
        <PrismButton
          onClick={() => onOpenChange(false)}
          size="sm"
          variant="ghost"
        >
          Cancelar
        </PrismButton>
        <PrismButton isDisabled={!colorValue} onClick={handleApply} size="sm">
          Aplicar
        </PrismButton>
      </PrismDialogFooter>
    </PrismDialog>
  );
}
