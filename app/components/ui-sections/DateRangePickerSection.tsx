import { useState } from "react";
import { PrismDateRangePicker, type DateRangeValue } from "~/components/prism";
import {
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

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
          title="PrismDateRangePicker"
          description="Seletor de período com calendário em popover. Utiliza PrismRangeCalendar com suporte a navegação por teclado e indicação clara do intervalo selecionado."
        />
        <GallerySectionContent>
          <div className="grid max-w-sm gap-4">
            <PrismDateRangePicker
              aria-label="Período de exemplo"
              onChange={setRange}
              value={range}
            />
          </div>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}

