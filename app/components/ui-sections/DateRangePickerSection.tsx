import { useState } from "react";
import { PrismDateRangePicker, type DateRangeValue } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

const DATE_RANGE_SIZES: { size: "sm" | "default" | "lg"; label: string }[] = [
  { size: "sm", label: "sm · h-8 / 32px" },
  { size: "default", label: "default · h-10 / 40px" },
  { size: "lg", label: "lg · h-12 / 48px" },
];

const CELL_SIZE_DEMOS: {
  cellSize: "sm" | "default" | "lg";
  label: string;
  description: string;
}[] = [
  {
    cellSize: "sm",
    label: "Campo default · cellSize='sm'",
    description: "Input h-10 com popover compacto (28px / text-xs)",
  },
  {
    cellSize: "default",
    label: "Campo default · cellSize='default'",
    description: "Input h-10 com popover padrão (32px / text-sm)",
  },
  {
    cellSize: "lg",
    label: "Campo default · cellSize='lg'",
    description: "Input h-10 com popover expandido (40px / text-base)",
  },
];

export function DateRangePickerSection() {
  const [range, setRange] = useState<DateRangeValue>({
    start: new Date(),
    end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    startDateString: "",
    endDateString: "",
  });

  return (
    <div id="prism-date-range-picker">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Seletor de período com calendário em popover. Suporta controle independente do tamanho do campo de disparo (size: sm, default, lg) e do tamanho das células do calendário (cellSize: sm, default, lg)."
          title="DateRangePicker"
        />
        <div className="flex flex-col gap-10">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Tamanhos do Campo (Trigger Size)
            </h4>
            <div className="grid max-w-sm gap-4">
              {DATE_RANGE_SIZES.map(({ size, label }) => (
                <div className="grid gap-2" key={size}>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <PrismDateRangePicker
                    aria-label={`Período ${size}`}
                    onChange={setRange}
                    size={size}
                    value={range}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Tamanho de Célula no Popover (Cell Size)
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              O campo mantém o tamanho padrão (size=&quot;default&quot; · h-10)
              enquanto o calendário interno ajusta sua escala de células e
              tipografia.
            </p>
            <div className="grid max-w-sm gap-4">
              {CELL_SIZE_DEMOS.map(({ cellSize, label, description }) => (
                <div className="grid gap-2" key={cellSize}>
                  <span className="text-xs font-medium text-foreground">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                  <PrismDateRangePicker
                    aria-label={label}
                    cellSize={cellSize}
                    onChange={setRange}
                    size="default"
                    value={range}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </GallerySection>
    </div>
  );
}
