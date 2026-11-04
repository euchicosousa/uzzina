import { useState } from "react";
import {
  PrismDateRangePicker,
  type DateRangeValue,
  type CalendarCellSize,
} from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundBoolean,
  PlaygroundNumber,
  PlaygroundText,
} from "./PropsPlayground";

const PICKER_SIZES = ["sm", "default", "lg"] as const;
type PickerSize = (typeof PICKER_SIZES)[number];

const CELL_SIZES = ["sm", "default", "lg"] as const;

function DateRangePickerPlayground() {
  const [size, setSize] = useState<PickerSize>("default");
  const [cellSize, setCellSize] = useState<CalendarCellSize>("default");
  const [hasPeriod, setHasPeriod] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [placeholder, setPlaceholder] = useState("Selecione o período");

  const [range, setRange] = useState<DateRangeValue>(() => {
    const start = new Date();
    const end = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
    return {
      start,
      end,
      startDateString: start.toISOString().split("T")[0] ?? "",
      endDateString: end.toISOString().split("T")[0] ?? "",
    };
  });

  return (
    <PropsPlayground
      caption={`size="${size}" · cellSize="${cellSize}" · numberOfMonths={${numberOfMonths}}`}
      preview={
        <div className="w-full max-w-sm">
          <PrismDateRangePicker
            aria-label="Seletor de período"
            cellSize={cellSize}
            isDisabled={isDisabled}
            numberOfMonths={numberOfMonths}
            onChange={setRange}
            placeholder={placeholder}
            size={size}
            value={hasPeriod ? range : null}
          />
        </div>
      }
      title="DateRangePicker"
    >
      <PlaygroundRadio
        label="Tamanho do gatilho"
        onChange={setSize}
        options={PICKER_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Tamanho das células"
        onChange={setCellSize}
        options={CELL_SIZES}
        prop="cellSize"
        value={cellSize}
      />
      <PlaygroundBoolean
        label="Com período"
        onChange={setHasPeriod}
        prop="value"
        value={hasPeriod}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundNumber
        label="Meses visíveis"
        max={2}
        min={1}
        onChange={setNumberOfMonths}
        prop="numberOfMonths"
        step={1}
        value={numberOfMonths}
      />
      <PlaygroundText
        label="Placeholder"
        onChange={setPlaceholder}
        prop="placeholder"
        value={placeholder}
      />
    </PropsPlayground>
  );
}

export function DateRangePickerSection() {
  return (
    <div id="prism-date-range-picker">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Seletor de período com calendário em popover. Suporta controle independente do tamanho do campo de disparo (size: sm, default, lg) e do tamanho das células do calendário (cellSize: sm, default, lg)."
          title="DateRangePicker"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="DateRangePicker">
            <DateRangePickerPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
