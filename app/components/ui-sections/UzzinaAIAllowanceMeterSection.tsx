import { useState } from "react";
import { UAIAllowanceMeter } from "~/components/uzzina/UAIAllowanceMeter";
import {
  PrismLabel,
  PrismSlider,
  PrismSliderFill,
  PrismSliderThumb,
  PrismSliderTrack,
} from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import { PropsPlayground } from "./PropsPlayground";

export function UzzinaAIAllowanceMeterSection() {
  const [percentage, setPercentage] = useState(74);

  return (
    <div id="uzzina-ai-allowance-meter">
      <GallerySection>
        <GallerySectionHeader
          title="UAIAllowanceMeter"
          description="Simule o percentual de consumo de Minha Conta."
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Playground">
            <PropsPlayground
              title="UAIAllowanceMeter"
              caption={`percentage={${percentage}}`}
              preview={
                <div className="w-full max-w-md">
                  <UAIAllowanceMeter percentage={percentage} />
                </div>
              }
            >
              <PrismSlider
                minValue={0}
                maxValue={100}
                step={1}
                value={percentage}
                onChange={(value) => {
                  if (typeof value === "number") setPercentage(value);
                }}
              >
                <PrismLabel>Percentual simulado</PrismLabel>
                <PrismSliderTrack>
                  <PrismSliderFill />
                  <PrismSliderThumb />
                </PrismSliderTrack>
              </PrismSlider>
            </PropsPlayground>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
