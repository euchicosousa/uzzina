import { PrismCalendar, PrismRangeCalendar } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

const CELL_SIZES: {
  size: "sm" | "default" | "lg";
  label: string;
  dimension: string;
}[] = [
  { size: "sm", label: "Pequeno (sm)", dimension: "28px · h-7 · text-xs" },
  {
    size: "default",
    label: "Padrão (default)",
    dimension: "32px · h-8 · text-sm",
  },
  { size: "lg", label: "Grande (lg)", dimension: "40px · h-10 · text-base" },
];

export function CalendarSection() {
  return (
    <div id="prism-calendar">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Calendário acessível baseado em React Aria Components com opções de tamanho de célula (sm, default, lg) para ajustar escala de coluna, células e tipografia, sem moldura externa."
          title="Calendar"
        />
        <div className="flex flex-col gap-10">
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Calendário Simples (PrismCalendar)
            </h4>
            <GallerySectionContent className="flex flex-wrap items-start gap-8">
              {CELL_SIZES.map(({ size, label, dimension }) => (
                <GalleryItem
                  key={`calendar-${size}`}
                  label={`${label} — ${dimension}`}
                >
                  <div className="w-fit">
                    <PrismCalendar
                      aria-label={`Data da ação (${size})`}
                      cellSize={size}
                    />
                  </div>
                </GalleryItem>
              ))}
            </GallerySectionContent>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Calendário de Intervalo (PrismRangeCalendar)
            </h4>
            <GallerySectionContent className="flex flex-wrap items-start gap-8">
              {CELL_SIZES.map(({ size, label, dimension }) => (
                <GalleryItem
                  key={`range-calendar-${size}`}
                  label={`${label} — ${dimension}`}
                >
                  <div className="w-fit">
                    <PrismRangeCalendar
                      aria-label={`Intervalo de datas (${size})`}
                      cellSize={size}
                    />
                  </div>
                </GalleryItem>
              ))}
            </GallerySectionContent>
          </div>
        </div>
      </GallerySection>
    </div>
  );
}
