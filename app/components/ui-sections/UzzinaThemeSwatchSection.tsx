import { useState } from "react";
import { UThemeSwatch } from "~/components/uzzina/UThemeSwatch";
import { PALLETE } from "~/lib/palettes";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PlaygroundBoolean,
  PlaygroundRadio,
  PlaygroundSelect,
  PropsPlayground,
} from "./PropsPlayground";

const PALETTE_IDS = PALLETE.map((palette) => palette.id);
const PALETTE_LABELS = Object.fromEntries(
  PALLETE.map((palette) => [palette.id, palette.label]),
) as Record<string, string>;
const MODES = ["light", "dark"] as const;
const MODE_LABELS = { light: "Claro", dark: "Escuro" } as const;
const SIZES = ["sm", "md", "lg"] as const;

function ThemeSwatchPlayground() {
  const [paletteId, setPaletteId] = useState(PALLETE[0].id);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [selected, setSelected] = useState(false);

  const palette = PALLETE.find((item) => item.id === paletteId) ?? PALLETE[0];

  return (
    <div className="flex flex-col gap-6">
      <PropsPlayground
        caption={`${palette.label} · ${MODE_LABELS[mode]} · ${size}`}
        preview={
          <UThemeSwatch
            mode={mode}
            palette={palette}
            selected={selected}
            size={size}
          />
        }
        title="UThemeSwatch"
      >
        <PlaygroundSelect
          label="Paleta"
          onChange={setPaletteId}
          optionLabels={PALETTE_LABELS}
          options={PALETTE_IDS}
          prop="palette"
          value={paletteId}
        />
        <PlaygroundRadio
          label="Modo"
          onChange={setMode}
          optionLabels={MODE_LABELS}
          options={MODES}
          prop="mode"
          value={mode}
        />
        <PlaygroundRadio
          label="Tamanho"
          onChange={setSize}
          options={SIZES}
          prop="size"
          value={size}
        />
        <PlaygroundBoolean
          label="Selecionada"
          onChange={setSelected}
          prop="selected"
          value={selected}
        />
      </PropsPlayground>

      <div className="flex flex-wrap items-center justify-center gap-4 border-t pt-6">
        {PALLETE.map((item) => (
          <div className="flex items-center gap-2" key={item.id}>
            <UThemeSwatch mode={mode} palette={item} size={size} />
            <span className="text-xs text-secondary-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UzzinaThemeSwatchSection() {
  return (
    <div id="uzzina-theme-swatch">
      <GallerySection>
        <GallerySectionHeader
          description="Dois quadrados lado a lado ([ primary ] [ background ]) para identificar a cor principal e o fundo de cada tema do aplicativo."
          title="UThemeSwatch"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UThemeSwatch">
            <ThemeSwatchPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
