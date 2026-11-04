import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { useState } from "react";
import type { RangeValue } from "react-aria-components";
import {
  PrismCalendar,
  PrismRangeCalendar,
  type CalendarCellSize,
} from "~/components/prism";
import { cn } from "~/lib/utils";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundRadio,
  PlaygroundBoolean,
  PlaygroundNumber,
} from "./PropsPlayground";

const CALENDAR_MODES = ["single", "range"] as const;
type CalendarMode = (typeof CALENDAR_MODES)[number];
const CALENDAR_MODE_LABELS: Record<CalendarMode, string> = {
  single: "Data",
  range: "Intervalo",
};

const CELL_SIZES = ["sm", "default", "lg"] as const;

const CAPTION_LAYOUTS = ["label", "dropdown"] as const;
type CaptionLayout = (typeof CAPTION_LAYOUTS)[number];
const CAPTION_LAYOUT_LABELS: Record<CaptionLayout, string> = {
  label: "Texto",
  dropdown: "Seletores",
};

const BUTTON_VARIANTS = ["ghost", "outline", "secondary", "default"] as const;
type CalendarButtonVariant = (typeof BUTTON_VARIANTS)[number];

const PANEL_WIDTHS = ["auto", "max-w-xs", "max-w-md", "max-w-xl"] as const;
type PanelWidth = (typeof PANEL_WIDTHS)[number];
const PANEL_WIDTH_LABELS: Record<PanelWidth, string> = {
  auto: "Automático (auto)",
  "max-w-xs": "Estreito (~320px)",
  "max-w-md": "Médio (~448px)",
  "max-w-xl": "Largo (~576px)",
};

function CalendarPlayground() {
  const [mode, setMode] = useState<CalendarMode>("single");
  const [cellSize, setCellSize] = useState<CalendarCellSize>("default");
  const [captionLayout, setCaptionLayout] = useState<CaptionLayout>("label");
  const [buttonVariant, setButtonVariant] =
    useState<CalendarButtonVariant>("ghost");
  const [showWeekNumber, setShowWeekNumber] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [panelWidth, setPanelWidth] = useState<PanelWidth>("auto");

  const now = today(getLocalTimeZone());
  const [singleValue, setSingleValue] = useState<CalendarDate>(now);
  const [rangeValue, setRangeValue] = useState<RangeValue<CalendarDate>>({
    start: now,
    end: now.add({ days: 4 }),
  });

  const isFluid = panelWidth !== "auto";

  return (
    <PropsPlayground
      caption={`mode="${mode}" · cellSize="${cellSize}" · numberOfMonths={${numberOfMonths}}`}
      preview={
        <div
          className={cn(
            "w-full transition-all",
            panelWidth === "auto" ? "w-fit" : `${panelWidth} w-full`,
          )}
        >
          {mode === "single" ? (
            <PrismCalendar
              aria-label="Calendário simples"
              buttonVariant={buttonVariant}
              captionLayout={captionLayout}
              cellSize={cellSize}
              className={isFluid ? "w-full" : undefined}
              isDisabled={isDisabled}
              numberOfMonths={numberOfMonths}
              onChange={setSingleValue}
              showWeekNumber={showWeekNumber}
              value={singleValue}
            />
          ) : (
            <PrismRangeCalendar
              aria-label="Calendário de intervalo"
              buttonVariant={buttonVariant}
              captionLayout={captionLayout}
              cellSize={cellSize}
              className={isFluid ? "w-full" : undefined}
              isDisabled={isDisabled}
              numberOfMonths={numberOfMonths}
              onChange={setRangeValue}
              showWeekNumber={showWeekNumber}
              value={rangeValue}
            />
          )}
        </div>
      }
      title="Calendar"
    >
      <PlaygroundRadio
        label="Modo"
        onChange={setMode}
        optionLabels={CALENDAR_MODE_LABELS}
        options={CALENDAR_MODES}
        prop="componente"
        value={mode}
      />
      <PlaygroundRadio
        label="Tamanho das células"
        onChange={setCellSize}
        options={CELL_SIZES}
        prop="cellSize"
        value={cellSize}
      />
      <PlaygroundRadio
        label="Cabeçalho"
        onChange={setCaptionLayout}
        optionLabels={CAPTION_LAYOUT_LABELS}
        options={CAPTION_LAYOUTS}
        prop="captionLayout"
        value={captionLayout}
      />
      <PlaygroundSelect
        label="Variante dos botões"
        onChange={setButtonVariant}
        options={BUTTON_VARIANTS}
        prop="buttonVariant"
        value={buttonVariant}
      />
      <PlaygroundBoolean
        label="Número da semana"
        onChange={setShowWeekNumber}
        prop="showWeekNumber"
        value={showWeekNumber}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundNumber
        label="Meses visíveis"
        max={3}
        min={1}
        onChange={setNumberOfMonths}
        prop="numberOfMonths"
        step={1}
        value={numberOfMonths}
      />
      <PlaygroundSelect
        label="Largura do painel"
        onChange={setPanelWidth}
        optionLabels={PANEL_WIDTH_LABELS}
        options={PANEL_WIDTHS}
        prop="contêiner"
        value={panelWidth}
      />
    </PropsPlayground>
  );
}

export function CalendarSection() {
  return (
    <div id="prism-calendar">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Calendário acessível baseado em React Aria Components com opções de tamanho de célula (sm, default, lg) para ajustar escala de coluna, células e tipografia, sem moldura externa."
          title="Calendar"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Calendar">
            <CalendarPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
