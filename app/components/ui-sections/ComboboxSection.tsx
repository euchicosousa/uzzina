import { useState } from "react";
import {
  PrismButton,
  PrismCombobox,
  PrismComboboxInput,
  PrismComboboxContent,
  PrismComboboxList,
  PrismComboboxItem,
  PrismComboboxChips,
  PrismComboboxChip,
  PrismComboboxChipList,
  PrismComboboxChipsInput,
} from "~/components/prism";
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
  PlaygroundNumber,
  PlaygroundText,
} from "./PropsPlayground";

const COMBOBOX_SIZES = ["sm", "default", "lg"] as const;
type ComboboxSize = (typeof COMBOBOX_SIZES)[number];

const ANIMAL_ITEMS = [
  { id: "cat", label: "🐱 Gato" },
  { id: "dog", label: "🐶 Cachorro" },
  { id: "lion", label: "🦁 Leão" },
  { id: "rabbit", label: "🐰 Coelho" },
  { id: "panda", label: "🐼 Panda" },
] as const;

function ComboboxPlayground() {
  const [size, setSize] = useState<ComboboxSize>("default");
  const [showTrigger, setShowTrigger] = useState(true);
  const [showClear, setShowClear] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [compareButton, setCompareButton] = useState(false);
  const [placeholder, setPlaceholder] = useState("Buscar animal...");

  return (
    <PropsPlayground
      caption={`size="${size}"`}
      preview={
        <div className="flex items-center gap-4">
          <PrismCombobox className="w-64" isDisabled={disabled}>
            <PrismComboboxInput
              disabled={disabled}
              placeholder={placeholder}
              showClear={showClear}
              showTrigger={showTrigger}
              size={size}
            />
            <PrismComboboxContent>
              <PrismComboboxList>
                {ANIMAL_ITEMS.map((animal) => (
                  <PrismComboboxItem id={animal.id} key={animal.id}>
                    {animal.label}
                  </PrismComboboxItem>
                ))}
              </PrismComboboxList>
            </PrismComboboxContent>
          </PrismCombobox>
          {compareButton && (
            <PrismButton size={size} variant="default">
              Botão
            </PrismButton>
          )}
        </div>
      }
      title="Combobox"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={COMBOBOX_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Botão de abrir"
        onChange={setShowTrigger}
        prop="showTrigger"
        value={showTrigger}
      />
      <PlaygroundBoolean
        label="Botão de limpar"
        onChange={setShowClear}
        prop="showClear"
        value={showClear}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setDisabled}
        prop="disabled"
        value={disabled}
      />
      <PlaygroundBoolean
        label="Comparar com botão"
        onChange={setCompareButton}
        prop="compareButton"
        value={compareButton}
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

function ChipsComboboxDemo({
  size = "default",
  initialCount = 2,
}: {
  size?: "sm" | "default" | "lg";
  initialCount?: number;
}) {
  const availableTags = [
    { id: "design", label: "Design" },
    { id: "copy", label: "Copywriting" },
    { id: "video", label: "Vídeo" },
    { id: "motion", label: "Motion" },
    { id: "estrategia", label: "Estratégia" },
  ];

  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    availableTags.slice(0, initialCount).map((t) => t.id),
  );
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="w-80 sm:w-96">
      <PrismCombobox
        items={availableTags}
        aria-label={`Combobox com Chips ${size}`}
        inputValue={inputValue}
        onInputChange={setInputValue}
        selectionMode="multiple"
        value={selectedKeys}
        onChange={(keys) => setSelectedKeys(keys.map(String))}
      >
        <PrismComboboxChips size={size}>
          <PrismComboboxChipList<{ id: string; label: string }>>
            {(item) => (
              <PrismComboboxChip
                id={item.id}
                size={size}
                textValue={item.label}
              >
                {item.label}
              </PrismComboboxChip>
            )}
          </PrismComboboxChipList>
          <PrismComboboxChipsInput placeholder="Adicionar tag..." />
        </PrismComboboxChips>
        <PrismComboboxContent>
          <PrismComboboxList items={availableTags}>
            {(tag) => (
              <PrismComboboxItem id={tag.id} key={tag.id}>
                {tag.label}
              </PrismComboboxItem>
            )}
          </PrismComboboxList>
        </PrismComboboxContent>
      </PrismCombobox>
    </div>
  );
}

function ComboboxChipsPlayground() {
  const [size, setSize] = useState<ComboboxSize>("default");
  const [count, setCount] = useState(2);

  return (
    <PropsPlayground
      caption={`size="${size}" · ${count} selecionados`}
      preview={
        <ChipsComboboxDemo
          initialCount={count}
          key={`${size}-${count}`}
          size={size}
        />
      }
      title="ComboboxChips"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={COMBOBOX_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundNumber
        label="Quantidade selecionada"
        max={5}
        min={0}
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

export function ComboboxSection() {
  return (
    <div id="prism-combobox">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Inputs de seleção com preenchimento automático filtrado (Combobox/Autocomplete) e chips com alto contraste nos tamanhos sm, default e lg."
          title="Combobox"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Combobox">
            <ComboboxPlayground />
          </GalleryItem>
          <GalleryItem label="ComboboxChips">
            <ComboboxChipsPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
