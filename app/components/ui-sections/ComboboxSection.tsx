import { useState } from "react";
import {
  PrismCombobox,
  PrismComboboxInput,
  PrismComboboxContent,
  PrismComboboxList,
  PrismComboboxItem,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

function FruitsMultiSelect() {
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const fruitItems = [
    { id: "apple", label: "🍎 Maçã" },
    { id: "banana", label: "🍌 Banana" },
    { id: "grape", label: "🍇 Uva" },
    { id: "strawberry", label: "🍓 Morango" },
    { id: "watermelon", label: "🍉 Melancia" },
  ];
  const filteredItems = fruitItems.filter(
    (item) =>
      !selectedFruits.includes(item.id) &&
      item.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="flex w-80 flex-col gap-2">
      <PrismCombobox
        inputValue={query}
        onInputChange={setQuery}
        onSelectionChange={(key) => {
          if (key) {
            setSelectedFruits([...selectedFruits, key as string]);
            setQuery("");
          }
        }}
      >
        <PrismComboboxInput placeholder="Selecione frutas..." />
        <PrismComboboxContent>
          <PrismComboboxList>
            {filteredItems.map((item) => (
              <PrismComboboxItem key={item.id} id={item.id}>
                {item.label}
              </PrismComboboxItem>
            ))}
          </PrismComboboxList>
        </PrismComboboxContent>
      </PrismCombobox>

      {selectedFruits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-xl border bg-muted/20 p-1 squircle">
          {selectedFruits.map((fruitId) => {
            const fruit = fruitItems.find((f) => f.id === fruitId);
            return (
              <button
                key={fruitId}
                className="flex items-center gap-1 rounded-lg border bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/80"
                onClick={() =>
                  setSelectedFruits(
                    selectedFruits.filter((id) => id !== fruitId),
                  )
                }
                type="button"
              >
                <span>{fruit?.label}</span>
                <span className="text-muted-foreground hover:text-foreground">
                  ×
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ComboboxSection() {
  return (
    <div id="prism-combobox">
      <GallerySection>
        <GallerySectionHeader
          description="Inputs de seleção com preenchimento automático filtrado (Combobox/Autocomplete)."
          title="PrismCombobox"
        />
        <GallerySectionContent>
          <GalleryItem label="Combobox Simples">
            <PrismCombobox className="w-64">
              <PrismComboboxInput placeholder="Selecione um animal..." />
              <PrismComboboxContent>
                <PrismComboboxList>
                  <PrismComboboxItem id="cat">🐱 Gato</PrismComboboxItem>
                  <PrismComboboxItem id="dog">🐶 Cachorro</PrismComboboxItem>
                  <PrismComboboxItem id="lion">🦁 Leão</PrismComboboxItem>
                </PrismComboboxList>
              </PrismComboboxContent>
            </PrismCombobox>
          </GalleryItem>
          <GalleryItem label="Combobox Múltiplo (Tags/Frutas)">
            <FruitsMultiSelect />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
