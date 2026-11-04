import { useState } from "react";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import {
  getTriggerAvatarSize,
  getTriggerContentSizeClass,
  type ComboboxTriggerProps,
} from "~/components/features/ComboboxTrigger";
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
  PlaygroundRadio,
  PlaygroundBoolean,
} from "./PropsPlayground";

type TriggerVariant = NonNullable<ComboboxTriggerProps["variant"]>;
type TriggerSize = NonNullable<ComboboxTriggerProps["size"]>;

const PARTNER_VARIANTS = [
  "ghost",
  "outline",
  "secondary",
  "link",
  "default",
] as const;

const PARTNER_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;

const PRESET_OPTIONS = ["0", "1", "3"] as const;
type PresetOption = (typeof PRESET_OPTIONS)[number];

const PRESETS: Record<PresetOption, string[]> = {
  "0": [],
  "1": ["alfa"],
  "3": ["alfa", "beta", "gama"],
};

const AVATAR_PX = { xs: 16, sm: 24, md: 32 } as const;

function getIconPx(contentClass: string): number {
  if (contentClass.includes("size-3")) return 12;
  if (contentClass.includes("size-4")) return 16;
  if (contentClass.includes("size-5")) return 20;
  return 20;
}

function PartnersComboboxPlayground() {
  const [variant, setVariant] = useState<TriggerVariant>("ghost");
  const [size, setSize] = useState<TriggerSize>("sm");
  const [preset, setPreset] = useState<PresetOption>("1");
  const [selected, setSelected] = useState<string[]>(PRESETS["1"]);
  const [showText, setShowText] = useState(true);
  const [allowAll, setAllowAll] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handlePresetChange = (newPreset: PresetOption) => {
    setPreset(newPreset);
    setSelected(PRESETS[newPreset]);
  };

  const avatarSize = getTriggerAvatarSize(size);
  const avatarMeasure = AVATAR_PX[avatarSize];
  const contentClass = getTriggerContentSizeClass(size);
  const iconMeasure = getIconPx(contentClass);

  return (
    <GalleryAppProviders>
      <PropsPlayground
        caption={`${variant} / ${size} · avatar ${avatarMeasure}px · ícone ${iconMeasure}px`}
        preview={
          <div className="flex w-fit items-center justify-center p-4">
            <PartnersCombobox
              allowAll={allowAll}
              disabled={disabled}
              onSelect={setSelected}
              selectedPartners={selected}
              showText={showText}
              size={size}
              variant={variant}
            />
          </div>
        }
        title="PartnersCombobox"
      >
        <PlaygroundSelect
          label="Variante"
          onChange={setVariant}
          options={PARTNER_VARIANTS}
          prop="variant"
          value={variant}
        />
        <PlaygroundSelect
          label="Tamanho"
          onChange={setSize}
          options={PARTNER_SIZES}
          prop="size"
          value={size}
        />
        <PlaygroundRadio
          label="Selecionados"
          onChange={handlePresetChange}
          options={PRESET_OPTIONS}
          prop="selectedPartners"
          value={preset}
        />
        <PlaygroundBoolean
          label="Mostrar nome"
          onChange={setShowText}
          prop="showText"
          value={showText}
        />
        <PlaygroundBoolean
          label="Todos os parceiros"
          onChange={setAllowAll}
          prop="allowAll"
          value={allowAll}
        />
        <PlaygroundBoolean
          label="Desabilitado"
          onChange={setDisabled}
          prop="disabled"
          value={disabled}
        />
      </PropsPlayground>
    </GalleryAppProviders>
  );
}

export function UzzinaPartnersComboboxSection() {
  return (
    <div id="uzzina-partners-combobox">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Seletor de parceiros com dados fictícios. Ajuste variante, tamanho e seleção à direita; a legenda mostra o tamanho real do avatar e do ícone."
          title="PartnersCombobox"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="PartnersCombobox">
            <PartnersComboboxPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
