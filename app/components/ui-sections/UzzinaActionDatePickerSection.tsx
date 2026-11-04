import { useState } from "react";
import { ActionDatePicker } from "~/components/features/action-drawer/ActionDatePicker";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundSelect,
  PlaygroundBoolean,
} from "./PropsPlayground";

const SIZES = ["sm", "default", "lg"] as const;
type ActionDatePickerSize = (typeof SIZES)[number];

const DISPLAY_KEYS = [
  "Relative",
  "DateTime",
  "DateMonthTime",
  "DayDateMonthTime",
  "DayDate",
  "TimeOnly",
  "DateOnly",
] as const satisfies readonly (keyof typeof DATE_TIME_DISPLAY)[];
type DisplayKey = (typeof DISPLAY_KEYS)[number];

export function ActionDatePickerPlayground() {
  const [size, setSize] = useState<ActionDatePickerSize>("sm");
  const [displayKey, setDisplayKey] = useState<DisplayKey>("DayDateMonthTime");
  const [isLate, setIsLate] = useState(false);
  const [date, setDate] = useState(() => {
    const initial = new Date();
    initial.setHours(14, 30, 0, 0);
    return initial;
  });

  return (
    <PropsPlayground
      caption={date.toLocaleString("pt-BR")}
      preview={
        <ActionDatePicker
          date={date}
          dateTimeDisplay={DATE_TIME_DISPLAY[displayKey]}
          isLate={isLate}
          onSelect={setDate}
          size={size}
        />
      }
      title="ActionDatePicker"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundSelect
        label="Formato"
        onChange={setDisplayKey}
        options={DISPLAY_KEYS}
        prop="dateTimeDisplay"
        value={displayKey}
      />
      <PlaygroundBoolean
        label="Atrasada"
        onChange={setIsLate}
        prop="isLate"
        value={isLate}
      />
    </PropsPlayground>
  );
}

export function UzzinaActionDatePickerSection() {
  return (
    <div id="uzzina-action-date-picker">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Data e hora da ação na gaveta: gatilho em link e popover com calendário e horário."
          title="ActionDatePicker"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="ActionDatePicker">
            <ActionDatePickerPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
