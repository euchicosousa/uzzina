import { useState } from "react";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import type { ComboboxTriggerProps } from "~/components/features/ComboboxTrigger";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import { GalleryAppProviders } from "./gallery-mocks";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundBoolean,
} from "./PropsPlayground";

type TriggerVariant = NonNullable<ComboboxTriggerProps["variant"]>;
type TriggerSize = NonNullable<ComboboxTriggerProps["size"]>;

const CATEGORY_VARIANTS = [
  "ghost",
  "outline",
  "secondary",
  "link",
  "default",
] as const;

const CATEGORY_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;

function CategoriesComboboxPlayground() {
  const [variant, setVariant] = useState<TriggerVariant>("ghost");
  const [size, setSize] = useState<TriggerSize>("sm");
  const [isMulti, setIsMulti] = useState(false);
  const [showInstagramGroup, setShowInstagramGroup] = useState(false);
  const [showText, setShowText] = useState(true);

  const [selected, setSelected] = useState<string[]>(
    isMulti ? ["all"] : ["post"],
  );

  const handleIsMultiChange = (multi: boolean) => {
    setIsMulti(multi);
    setSelected(multi ? ["all"] : ["post"]);
  };

  return (
    <GalleryAppProviders>
      <PropsPlayground
        caption={`Selecionados: [${selected.join(", ")}]`}
        key={String(isMulti)}
        preview={
          <div className="flex w-fit items-center justify-center p-4">
            <CategoriesCombobox
              isMulti={isMulti}
              onSelect={({ category, categories }) => {
                setSelected(isMulti ? categories : [category]);
              }}
              selectedCategories={selected}
              showInstagramGroup={showInstagramGroup}
              showText={showText}
              size={size}
              variant={variant}
            />
          </div>
        }
        title="CategoriesCombobox"
      >
        <PlaygroundSelect
          label="Variante"
          onChange={setVariant}
          options={CATEGORY_VARIANTS}
          prop="variant"
          value={variant}
        />
        <PlaygroundSelect
          label="Tamanho"
          onChange={setSize}
          options={CATEGORY_SIZES}
          prop="size"
          value={size}
        />
        <PlaygroundBoolean
          label="Seleção múltipla"
          onChange={handleIsMultiChange}
          prop="isMulti"
          value={isMulti}
        />
        <PlaygroundBoolean
          label="Grupo Instagram"
          onChange={setShowInstagramGroup}
          prop="showInstagramGroup"
          value={showInstagramGroup}
        />
        <PlaygroundBoolean
          label="Mostrar nome"
          onChange={setShowText}
          prop="showText"
          value={showText}
        />
      </PropsPlayground>
    </GalleryAppProviders>
  );
}

export function UzzinaCategoriesComboboxSection() {
  return (
    <div id="uzzina-categories-combobox">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Seletor de categorias da ação, com seleção única ou múltipla."
          title="CategoriesCombobox"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="CategoriesCombobox">
            <CategoriesComboboxPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
