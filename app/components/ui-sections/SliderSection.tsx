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
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundBoolean,
  PlaygroundNumber,
} from "./PropsPlayground";

function SliderPlayground() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(7);
  const [step, setStep] = useState(1);
  const [value, setValue] = useState(3);

  const handleMinChange = (newMin: number) => {
    setMin(newMin);
    setValue((v) => Math.min(Math.max(v, newMin), max));
  };

  const handleMaxChange = (newMax: number) => {
    setMax(newMax);
    setValue((v) => Math.min(Math.max(v, min), newMax));
  };

  return (
    <PropsPlayground
      caption={`value={${value}} · min={${min}} · max={${max}} · step={${step}}`}
      preview={
        <div className="w-full max-w-md">
          <PrismSlider
            aria-label="Conteúdos por semana"
            isDisabled={isDisabled}
            maxValue={max}
            minValue={min}
            onChange={(val) => {
              if (typeof val === "number") setValue(val);
            }}
            step={step}
            value={value}
          >
            <div className="flex items-center justify-between gap-4">
              <PrismLabel>Conteúdos por semana</PrismLabel>
              {showOutput && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <PrismSliderOutput />
                  <span className="text-secondary-foreground">por semana</span>
                </div>
              )}
            </div>
            <PrismSliderTrack>
              <PrismSliderFill />
              <PrismSliderThumb />
            </PrismSliderTrack>
          </PrismSlider>
        </div>
      }
      title="Slider"
    >
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Mostrar valor"
        onChange={setShowOutput}
        prop="PrismSliderOutput"
        value={showOutput}
      />
      <PlaygroundNumber
        label="Mínimo"
        max={5}
        min={0}
        onChange={handleMinChange}
        prop="minValue"
        step={1}
        value={min}
      />
      <PlaygroundNumber
        label="Máximo"
        max={20}
        min={6}
        onChange={handleMaxChange}
        prop="maxValue"
        step={1}
        value={max}
      />
      <PlaygroundNumber
        label="Passo"
        max={3}
        min={1}
        onChange={setStep}
        prop="step"
        step={1}
        value={step}
      />
    </PropsPlayground>
  );
}

export function SliderSection() {
  return (
    <div id="prism-slider">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Controle deslizante contínuo ou discreto baseado em React Aria. Usado para seleção de frequência e valores numéricos com resposta imediata e acessibilidade completa por teclado."
          title="Slider"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Slider">
            <SliderPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
