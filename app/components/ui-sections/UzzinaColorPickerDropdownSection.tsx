import { useState } from "react";
import { UColorPickerDropdown } from "~/components/uzzina/UColorPickerDropdown";
import type { Partner } from "~/types";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundRadio,
  PlaygroundBoolean,
} from "./PropsPlayground";

const MOCK_PARTNERS: Partner[] = [
  {
    archived: false,
    colors: ["#2563EB", "#7C3AED", "#059669"],
    context: null,
    created_at: "2026-11-01T00:00:00.000Z",
    id: "p-alfa",
    image: null,
    instagram_caption_tail: null,
    short: "Alfa",
    slug: "alfa",
    sow: "marketing",
    title: "Agência Alfa",
    users_ids: ["u1"],
    voice: null,
  },
  {
    archived: false,
    // Compartilha #2563EB com a Alfa para validar preservação de origem e separação visual
    colors: ["#2563EB", "#EA580C", "#DB2777"],
    context: null,
    created_at: "2026-11-01T00:00:00.000Z",
    id: "p-beta",
    image: null,
    instagram_caption_tail: null,
    short: "Beta",
    slug: "beta",
    sow: "marketing",
    title: "Estúdio Beta",
    users_ids: ["u2"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#EAB308", "#06B6D4", "#84CC16"],
    context: null,
    created_at: "2026-11-01T00:00:00.000Z",
    id: "p-gama",
    image: null,
    instagram_caption_tail: null,
    short: "Gama",
    slug: "gama",
    sow: "marketing",
    title: "Marca Gama",
    users_ids: ["u3"],
    voice: null,
  },
  {
    archived: false,
    colors: ["#6366F1", "#EC4899", "#14B8A6", "#F97316"],
    context: null,
    created_at: "2026-11-01T00:00:00.000Z",
    id: "p-delta",
    image: null,
    instagram_caption_tail: null,
    short: "Delta",
    slug: "delta",
    sow: "marketing",
    title: "Holding Delta",
    users_ids: ["u4"],
    voice: null,
  },
];

const VARIANTS = ["ghost", "outline", "secondary", "link", "default"] as const;
type ColorPickerVariant = (typeof VARIANTS)[number];

const SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;
type ColorPickerSize = (typeof SIZES)[number];

const PARTNER_COUNTS = ["0", "1", "2", "3", "4"] as const;
type PartnerCount = (typeof PARTNER_COUNTS)[number];

export function ColorPickerDropdownPlayground() {
  const [variant, setVariant] = useState<ColorPickerVariant>("outline");
  const [size, setSize] = useState<ColorPickerSize>("default");
  const [partnerCount, setPartnerCount] = useState<PartnerCount>("2");
  const [disabled, setDisabled] = useState(false);
  const [color, setColor] = useState("#2563EB");
  const [callCount, setCallCount] = useState(0);

  const count = Number(partnerCount);
  const activePartners = MOCK_PARTNERS.slice(0, count);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setCallCount((c) => c + 1);
  };

  return (
    <PropsPlayground
      caption={`${variant} / ${size} · ${color} · ${callCount} confirmações`}
      preview={
        <div className="flex flex-col items-center gap-3">
          <UColorPickerDropdown
            disabled={disabled}
            onChange={handleColorChange}
            partners={activePartners}
            size={size}
            value={color}
            variant={variant}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Cor confirmada:</span>
            <span
              className="inline-block size-3.5 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
            <code className="font-mono font-semibold text-foreground">
              {color}
            </code>
          </div>
        </div>
      }
      title="UColorPickerDropdown"
    >
      <PlaygroundSelect
        label="Variante"
        onChange={setVariant}
        options={VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Qtd. de Parceiros"
        onChange={setPartnerCount}
        options={PARTNER_COUNTS}
        prop="partners"
        value={partnerCount}
      />
      <PlaygroundBoolean
        label="Desativado"
        onChange={setDisabled}
        prop="disabled"
        value={disabled}
      />
    </PropsPlayground>
  );
}

export function UzzinaColorPickerDropdownSection() {
  return (
    <div id="uzzina-color-picker-dropdown">
      <GallerySection>
        <GallerySectionHeader
          description="Seletor de cor universal: amostras compactas com separadores verticais, área de cor HSB, slider hue e formatos HEX/RGB/HSL/HSB."
          title="UColorPickerDropdown"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UColorPickerDropdown">
            <ColorPickerDropdownPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}

