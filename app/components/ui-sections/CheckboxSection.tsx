import { useState } from "react";
import { PrismCheckbox, PrismCheckboxGroup } from "~/components/prism";
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

const CHECKBOX_SIZES = ["sm", "default", "lg"] as const;
type CheckboxSize = (typeof CHECKBOX_SIZES)[number];

function CheckboxPlayground() {
  const [size, setSize] = useState<CheckboxSize>("default");
  const [checked, setChecked] = useState(true);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [text, setText] = useState("Aceito os termos");

  return (
    <PropsPlayground
      caption={`size="${size}" · ${checked ? "checked" : "unchecked"}${isIndeterminate ? " · indeterminate" : ""}`}
      preview={
        <PrismCheckbox
          isDisabled={isDisabled}
          isIndeterminate={isIndeterminate}
          isInvalid={isInvalid}
          isSelected={checked}
          onChange={setChecked}
          size={size}
        >
          {text}
        </PrismCheckbox>
      }
      title="Checkbox"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={CHECKBOX_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Selecionado"
        onChange={setChecked}
        prop="isSelected"
        value={checked}
      />
      <PlaygroundBoolean
        label="Indeterminado"
        onChange={setIsIndeterminate}
        prop="isIndeterminate"
        value={isIndeterminate}
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
      <PlaygroundText
        label="Texto"
        onChange={setText}
        prop="children"
        value={text}
      />
    </PropsPlayground>
  );
}

function CheckboxGroupPlayground() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [count, setCount] = useState(3);
  const [groupValues, setGroupValues] = useState<string[]>(["opcao-1"]);

  const options = Array.from({ length: count }, (_, i) => ({
    id: `opcao-${i + 1}`,
    label: `Opção ${i + 1}`,
  }));

  return (
    <PropsPlayground
      caption={`Selecionados: [${groupValues.join(", ")}]`}
      preview={
        <PrismCheckboxGroup
          aria-label="Exemplo de grupo"
          isDisabled={isDisabled}
          isInvalid={isInvalid}
          onChange={setGroupValues}
          value={groupValues}
        >
          {options.map((opt) => (
            <PrismCheckbox key={opt.id} value={opt.id}>
              {opt.label}
            </PrismCheckbox>
          ))}
        </PrismCheckboxGroup>
      }
      title="CheckboxGroup"
    >
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
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

export function CheckboxSection() {
  return (
    <div id="prism-checkbox">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Caixas de seleção acessíveis nativas do React Aria com suporte a tamanhos, estados selecionado, indeterminado e desativado."
          title="Checkbox"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Checkbox">
            <CheckboxPlayground />
          </GalleryItem>
          <GalleryItem label="CheckboxGroup">
            <CheckboxGroupPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
