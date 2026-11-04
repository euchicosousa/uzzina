import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  UCalendarToolbar,
  type UCalendarToolbarSize,
  type UCalendarToolbarVariant,
} from "~/components/uzzina/UCalendarToolbar";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundBoolean,
} from "./PropsPlayground";

const DAYS_OPTIONS = ["1", "3", "7"] as const;
type DaysOption = (typeof DAYS_OPTIONS)[number];

const VARIANT_OPTIONS: readonly UCalendarToolbarVariant[] = [
  "outline",
  "default",
  "ghost",
  "secondary",
] as const;

const SIZE_OPTIONS: readonly UCalendarToolbarSize[] = [
  "xs",
  "sm",
  "default",
  "lg",
] as const;

export function CalendarToolbarPlayground() {
  const [currentDay, setCurrentDay] = useState(() => new Date());
  const [daysOption, setDaysOption] = useState<DaysOption>("1");
  const [showDate, setShowDate] = useState(false);
  const [variant, setVariant] = useState<UCalendarToolbarVariant>("outline");
  const [size, setSize] = useState<UCalendarToolbarSize>("default");

  const daysCount = Number(daysOption);

  return (
    <PropsPlayground
      caption={`${format(currentDay, "EEEE, dd/MM/yyyy", { locale: ptBR })} • variant="${variant}" • size="${size}"`}
      preview={
        <UCalendarToolbar
          currentDay={currentDay}
          days={daysCount}
          setCurrentDay={setCurrentDay}
          showDate={showDate}
          size={size}
          variant={variant}
        />
      }
      title="UCalendarToolbar"
    >
      <PlaygroundRadio
        label="Passo (dias)"
        onChange={setDaysOption}
        options={DAYS_OPTIONS}
        prop="days"
        value={daysOption}
      />
      <PlaygroundRadio
        label="Variante"
        onChange={setVariant}
        options={VARIANT_OPTIONS}
        prop="variant"
        value={variant}
      />
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={SIZE_OPTIONS}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Mostrar mês"
        onChange={setShowDate}
        prop="showDate"
        value={showDate}
      />
    </PropsPlayground>
  );
}

export function UzzinaCalendarToolbarSection() {
  return (
    <div id="uzzina-calendar-toolbar">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Navegação de datas da Home e de Hoje: anterior, próximo e calendário em popover."
          title="UCalendarToolbar"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UCalendarToolbar">
            <CalendarToolbarPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
