import { useState } from "react";
import { TagGroup, TagList } from "react-aria-components";
import {
  PrismButton,
  PrismCombobox,
  PrismComboboxInput,
  PrismComboboxContent,
  PrismComboboxList,
  PrismComboboxItem,
  PrismComboboxChips,
  PrismComboboxChip,
  PrismComboboxChipsInput,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

const COMBOBOX_SIZES: { size: "sm" | "default" | "lg"; label: string }[] = [
  { size: "sm", label: "sm · h-8 / 32px" },
  { size: "default", label: "default · h-10 / 40px" },
  { size: "lg", label: "lg · h-12 / 48px" },
];

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

function ChipsComboboxDemo({
  size = "default",
}: {
  size?: "sm" | "default" | "lg";
}) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    "design",
    "copy",
  ]);
  const [inputValue, setInputValue] = useState("");
  const availableTags = [
    { id: "design", label: "Design" },
    { id: "copy", label: "Copywriting" },
    { id: "video", label: "Vídeo" },
    { id: "motion", label: "Motion" },
    { id: "estrategia", label: "Estratégia" },
  ];

  const selectedTags = availableTags.filter((t) => selectedKeys.includes(t.id));

  return (
    <div className="w-80 sm:w-96">
      <PrismCombobox
        aria-label={`Combobox com Chips ${size}`}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSelectionChange={(key) => {
          if (key && !selectedKeys.includes(String(key))) {
            setSelectedKeys([...selectedKeys, String(key)]);
            setInputValue("");
          }
        }}
      >
        <PrismComboboxChips size={size}>
          <TagGroup
            aria-label="Tags selecionadas"
            className="contents"
            onRemove={(keys) => {
              const key = Array.from(keys)[0];
              setSelectedKeys(selectedKeys.filter((k) => k !== key));
            }}
          >
            <TagList className="contents" items={selectedTags}>
              {(item) => (
                <PrismComboboxChip
                  id={item.id}
                  size={size}
                  textValue={item.label}
                >
                  {item.label}
                </PrismComboboxChip>
              )}
            </TagList>
          </TagGroup>
          <PrismComboboxChipsInput placeholder="Adicionar tag..." />
        </PrismComboboxChips>
        <PrismComboboxContent>
          <PrismComboboxList>
            {availableTags
              .filter((t) => !selectedKeys.includes(t.id))
              .map((tag) => (
                <PrismComboboxItem key={tag.id} id={tag.id}>
                  {tag.label}
                </PrismComboboxItem>
              ))}
          </PrismComboboxList>
        </PrismComboboxContent>
      </PrismCombobox>
    </div>
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
        <GallerySectionContent className="flex flex-col gap-10">
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

          <GalleryItem label="Chips Standalone (PrismComboboxChip) · Todos os tamanhos">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  sm:
                </span>
                <TagGroup
                  aria-label="Chips sm"
                  className="flex items-center gap-1.5"
                >
                  <TagList className="flex items-center gap-1.5">
                    <PrismComboboxChip id="sm1" size="sm">
                      Design
                    </PrismComboboxChip>
                    <PrismComboboxChip id="sm2" size="sm">
                      Copywriting
                    </PrismComboboxChip>
                  </TagList>
                </TagGroup>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  default:
                </span>
                <TagGroup
                  aria-label="Chips default"
                  className="flex items-center gap-2"
                >
                  <TagList className="flex items-center gap-2">
                    <PrismComboboxChip id="def1" size="default">
                      Design
                    </PrismComboboxChip>
                    <PrismComboboxChip id="def2" size="default">
                      Copywriting
                    </PrismComboboxChip>
                  </TagList>
                </TagGroup>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  lg:
                </span>
                <TagGroup
                  aria-label="Chips lg"
                  className="flex items-center gap-2"
                >
                  <TagList className="flex items-center gap-2">
                    <PrismComboboxChip id="lg1" size="lg">
                      Design
                    </PrismComboboxChip>
                    <PrismComboboxChip id="lg2" size="lg">
                      Copywriting
                    </PrismComboboxChip>
                  </TagList>
                </TagGroup>
              </div>
            </div>
          </GalleryItem>

          <GalleryItem label="Combobox de Chips no Input · Tamanhos sm, default e lg">
            <div className="flex flex-wrap items-start gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  sm · h-8 (32px)
                </span>
                <ChipsComboboxDemo size="sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  default · h-10 (40px)
                </span>
                <ChipsComboboxDemo size="default" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  lg · h-12 (48px)
                </span>
                <ChipsComboboxDemo size="lg" />
              </div>
            </div>
          </GalleryItem>

          <GalleryItem label="Combobox Múltiplo (Tags/Frutas)">
            <FruitsMultiSelect />
          </GalleryItem>

          <GalleryItem label="Tamanhos · combobox ao lado de PrismButton do mesmo tamanho">
            <div className="grid gap-3">
              {COMBOBOX_SIZES.map(({ size, label }) => (
                <div className="flex flex-wrap items-center gap-4" key={size}>
                  <span className="w-44 text-xs text-muted-foreground">
                    {label}
                  </span>
                  <PrismButton size={size} variant="outline">
                    Botão
                  </PrismButton>
                  <PrismCombobox className="w-64">
                    <PrismComboboxInput
                      placeholder="Selecione um animal..."
                      size={size}
                    />
                    <PrismComboboxContent>
                      <PrismComboboxList>
                        <PrismComboboxItem id="cat">🐱 Gato</PrismComboboxItem>
                        <PrismComboboxItem id="dog">
                          🐶 Cachorro
                        </PrismComboboxItem>
                      </PrismComboboxList>
                    </PrismComboboxContent>
                  </PrismCombobox>
                </div>
              ))}
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
