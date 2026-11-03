import { CalendarDate } from "@internationalized/date";
import { useState } from "react";
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
  { size: "sm", label: "Pequeno (sm)", dimension: "32px · h-8 · text-sm" },
  {
    size: "default",
    label: "Padrão (default)",
    dimension: "40px · h-10 · text-sm",
  },
  { size: "lg", label: "Grande (lg)", dimension: "48px · h-12 · text-base" },
];

export function CalendarSection() {
  const [singleDate, setSingleDate] = useState<CalendarDate>(
    new CalendarDate(2026, 11, 3),
  );
  const [rangeDate, setRangeDate] = useState<{
    start: CalendarDate;
    end: CalendarDate;
  }>({
    start: new CalendarDate(2026, 11, 3),
    end: new CalendarDate(2026, 11, 7),
  });

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
              Calendário Simples (PrismCalendar — w-fit)
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
              Calendário de Intervalo (PrismRangeCalendar — w-fit)
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

          <div>
            <h4 className="mb-1 text-sm font-semibold text-foreground">
              Largura Total (w-full — Colunas Iguais que Acompanham o Container)
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              Sem <code>w-full</code>, o calendário mantém a largura natural de
              7 × <code>--cell-size</code>. Com <code>w-full</code>, as 7
              colunas dividem igualmente a largura disponível, cada uma com no
              mínimo <code>--cell-size</code>; o dia ocupa toda a largura da
              coluna e a altura continua <code>--cell-size</code>. Assim, o
              intervalo selecionado fica contínuo na linha e os dias da semana
              seguem alinhados às colunas. Em containers estreitos o resultado é
              igual ao calendário natural.
            </p>
            <GallerySectionContent className="flex flex-wrap items-start gap-8">
              <GalleryItem
                className="w-full max-w-xs"
                label="Painel Estreito / Lateral (max-w-xs · ~320px — igual a Datas Comemorativas)"
              >
                <div className="w-full rounded-2xl border bg-card/40 p-4 squircle">
                  <PrismCalendar
                    aria-label="Calendário em painel estreito"
                    className="w-full"
                    onChange={(val) => val && setSingleDate(val)}
                    value={singleDate}
                  />
                </div>
              </GalleryItem>

              <GalleryItem
                className="w-full max-w-md"
                label="Painel Médio (max-w-md · ~448px — formulários e diálogos)"
              >
                <div className="w-full rounded-2xl border bg-card/40 p-4 squircle">
                  <PrismCalendar
                    aria-label="Calendário em painel médio"
                    className="w-full"
                    onChange={(val) => val && setSingleDate(val)}
                    value={singleDate}
                  />
                </div>
              </GalleryItem>

              <GalleryItem
                className="w-full max-w-xl"
                label="Painel Amplo com Intervalo (max-w-xl · ~576px)"
              >
                <div className="w-full rounded-2xl border bg-card/40 p-4 squircle">
                  <PrismRangeCalendar
                    aria-label="Calendário de intervalo em painel amplo"
                    className="w-full"
                    onChange={(val) => val && setRangeDate(val)}
                    value={rangeDate}
                  />
                </div>
              </GalleryItem>
            </GallerySectionContent>
          </div>
        </div>
      </GallerySection>
    </div>
  );
}
