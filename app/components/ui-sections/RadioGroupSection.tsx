import { useState } from "react";
import { PrismRadio, PrismRadioGroup } from "~/components/prism";
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
} from "./PropsPlayground";

const RADIO_SIZES = ["sm", "default", "lg"] as const;
type RadioSize = (typeof RADIO_SIZES)[number];
const RADIO_ORIENTATIONS = ["vertical", "horizontal"] as const;
type RadioOrientation = (typeof RADIO_ORIENTATIONS)[number];

const RADIO_ORIENTATION_LABELS: Record<RadioOrientation, string> = {
  vertical: "Vertical",
  horizontal: "Horizontal",
};

function RadioGroupPlayground() {
  const [size, setSize] = useState<RadioSize>("default");
  const [orientation, setOrientation] = useState<RadioOrientation>("vertical");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [count, setCount] = useState(3);
  const [value, setValue] = useState("opcao-1");

  const options = Array.from({ length: count }, (_, i) => ({
    id: `opcao-${i + 1}`,
    label: `Opção ${i + 1}`,
  }));

  const handleCountChange = (newCount: number) => {
    setCount(newCount);
    const maxIdx = newCount;
    const currentNum = parseInt(value.replace("opcao-", ""), 10);
    if (isNaN(currentNum) || currentNum > maxIdx) {
      setValue("opcao-1");
    }
  };

  return (
    <PropsPlayground
      caption={`size="${size}" · orientation="${orientation}" · Selecionado: "${value}"`}
      preview={
        <PrismRadioGroup
          aria-label="Exemplo de grupo de opções"
          className={
            orientation === "horizontal"
              ? "flex flex-row flex-wrap gap-4"
              : "flex flex-col gap-2"
          }
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          onChange={setValue}
          orientation={orientation}
          value={value}
        >
          {options.map((opt) => (
            <PrismRadio key={opt.id} size={size} value={opt.id}>
              {opt.label}
            </PrismRadio>
          ))}
        </PrismRadioGroup>
      }
      title="RadioGroup"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={RADIO_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Orientação"
        onChange={setOrientation}
        optionLabels={RADIO_ORIENTATION_LABELS}
        options={RADIO_ORIENTATIONS}
        prop="orientation"
        value={orientation}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Inválido"
        onChange={setIsInvalid}
        prop="isInvalid"
        value={isInvalid}
      />
      <PlaygroundNumber
        label="Quantidade de opções"
        max={5}
        min={2}
        onChange={handleCountChange}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

export function RadioGroupSection() {
  return (
    <div id="prism-radio-group">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Botões de rádio acessíveis baseados no React Aria Components com suporte a tamanhos, foco com anel OKLCH e estados ativados/desativados."
          title="Radio Group"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="RadioGroup">
            <RadioGroupPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
