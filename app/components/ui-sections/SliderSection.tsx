import { useState } from "react";
import {
  PrismSlider,
  PrismSliderTrack,
  PrismSliderThumb,
  PrismSliderFill,
  PrismSliderOutput,
  PrismLabel,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

export function SliderSection() {
  const [value, setValue] = useState(3);

  return (
    <div id="prism-slider">
      <GallerySection>
        <GallerySectionHeader
          approved
          title="Slider"
          description="Controle deslizante contínuo ou discreto baseado em React Aria. Usado para seleção de frequência e valores numéricos com resposta imediata e acessibilidade completa por teclado."
        />
        <GallerySectionContent>
          <div className="grid w-full max-w-md gap-6">
            <PrismSlider
              aria-label="Conteúdos por semana"
              maxValue={7}
              minValue={1}
              onChange={(val) => {
                if (typeof val === "number") setValue(val);
              }}
              value={value}
            >
              <div className="flex items-center justify-between gap-4">
                <PrismLabel>Conteúdos por semana</PrismLabel>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <PrismSliderOutput />
                  <span className="text-muted-foreground">por semana</span>
                </div>
              </div>
              <PrismSliderTrack>
                <PrismSliderFill />
                <PrismSliderThumb />
              </PrismSliderTrack>
            </PrismSlider>

            <PrismSlider
              aria-label="Exemplo desabilitado"
              defaultValue={4}
              isDisabled
              maxValue={10}
              minValue={1}
            >
              <div className="flex items-center justify-between gap-4">
                <PrismLabel>Desabilitado</PrismLabel>
                <PrismSliderOutput className="text-muted-foreground" />
              </div>
              <PrismSliderTrack>
                <PrismSliderFill />
                <PrismSliderThumb />
              </PrismSliderTrack>
            </PrismSlider>
          </div>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
