import { useMemo, useState } from "react";
import {
  UAvatarSelector,
  type AvatarSelectorOption,
} from "~/components/uzzina/UAvatarSelector";
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
} from "./PropsPlayground";

const RAW_OPTIONS: readonly AvatarSelectorOption[] = [
  {
    id: "alfa",
    fallback: "AO",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    title: "Alfa Odontologia",
    subtitle: "marketing",
  },
  {
    id: "beta",
    fallback: "BS",
    backgroundColor: "#7c3aed",
    color: "#ffffff",
    title: "Beta Studio",
    subtitle: "marketing",
  },
  {
    id: "gama",
    fallback: "GC",
    backgroundColor: "#059669",
    color: "#ffffff",
    title: "Gama Clínica",
    subtitle: "marketing",
  },
  {
    id: "delta",
    fallback: "DF",
    backgroundColor: "#ea580c",
    color: "#ffffff",
    title: "Delta Foods",
    subtitle: "marketing",
  },
  {
    id: "epsilon",
    fallback: "EM",
    backgroundColor: "#db2777",
    color: "#ffffff",
    title: "Épsilon Moda",
    subtitle: "marketing",
  },
  {
    id: "zeta",
    fallback: "ZT",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    title: "Zeta Tech",
    subtitle: "marketing",
  },
  {
    id: "eta",
    fallback: "EC",
    backgroundColor: "#a16207",
    color: "#ffffff",
    title: "Eta Café",
    subtitle: "marketing",
  },
  {
    id: "teta",
    fallback: "TS",
    backgroundColor: "#0891b2",
    color: "#ffffff",
    title: "Teta Saúde",
    subtitle: "marketing",
  },
];

const PRESETS = ["none", "one", "all"] as const;
type Preset = (typeof PRESETS)[number];

const PRESET_LABELS: Record<Preset, string> = {
  none: "Nenhum",
  one: "Um",
  all: "Todos",
};

export function AvatarSelectorPlayground() {
  const [initialPreset, setInitialPreset] = useState<Preset>("one");
  const [withSubtitle, setWithSubtitle] = useState(true);
  const [count, setCount] = useState(5);
  const [minSelected, setMinSelected] = useState(0);

  const visibleOptions = useMemo(() => {
    return RAW_OPTIONS.slice(0, count).map((option) => ({
      ...option,
      subtitle: withSubtitle ? option.subtitle : undefined,
    }));
  }, [count, withSubtitle]);

  const initialSelectedIds = useMemo(() => {
    if (initialPreset === "none") return [];
    if (initialPreset === "one") {
      const first = visibleOptions[0];
      return first ? [first.id] : [];
    }
    return visibleOptions.map((opt) => opt.id);
  }, [initialPreset, visibleOptions]);

  const playgroundKey = `${count}-${initialPreset}-${minSelected}-${withSubtitle ? "sub" : "nosub"}`;

  return (
    <AvatarSelectorInner
      count={count}
      initialPreset={initialPreset}
      initialSelectedIds={initialSelectedIds}
      key={playgroundKey}
      minSelected={minSelected}
      options={visibleOptions}
      setCount={setCount}
      setInitialPreset={setInitialPreset}
      setMinSelected={setMinSelected}
      setWithSubtitle={setWithSubtitle}
      withSubtitle={withSubtitle}
    />
  );
}

function AvatarSelectorInner({
  options,
  initialSelectedIds,
  initialPreset,
  setInitialPreset,
  withSubtitle,
  setWithSubtitle,
  count,
  setCount,
  minSelected,
  setMinSelected,
}: {
  options: AvatarSelectorOption[];
  initialSelectedIds: string[];
  initialPreset: Preset;
  setInitialPreset: (value: Preset) => void;
  withSubtitle: boolean;
  setWithSubtitle: (value: boolean) => void;
  count: number;
  setCount: (value: number) => void;
  minSelected: number;
  setMinSelected: (value: number) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  return (
    <PropsPlayground
      caption={`Selecionados: ${selectedIds.join(", ") || "nenhum"}`}
      preview={
        <div className="w-full">
          <UAvatarSelector
            initialSelectedIds={initialSelectedIds}
            minSelected={minSelected > 0 ? minSelected : undefined}
            name="gallery-avatar-selector"
            onChange={setSelectedIds}
            options={options}
          />
        </div>
      }
      previewClassName="items-start"
      title="UAvatarSelector"
    >
      <PlaygroundRadio
        label="Selecionados iniciais"
        onChange={setInitialPreset}
        optionLabels={PRESET_LABELS}
        options={PRESETS}
        prop="initialSelectedIds"
        value={initialPreset}
      />
      <PlaygroundBoolean
        label="Subtítulo"
        onChange={setWithSubtitle}
        prop="subtitle"
        value={withSubtitle}
      />
      <PlaygroundNumber
        label="Quantidade de opções"
        max={8}
        min={2}
        onChange={setCount}
        prop="options"
        value={count}
      />
      <PlaygroundNumber
        label="Mínimo selecionado"
        max={2}
        min={0}
        onChange={setMinSelected}
        prop="minSelected"
        value={minSelected}
      />
    </PropsPlayground>
  );
}

export function UzzinaAvatarSelectorSection() {
  return (
    <div id="uzzina-avatar-selector">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Grade de seleção múltipla por avatar, ligada a formulário por inputs ocultos."
          title="UAvatarSelector"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UAvatarSelector">
            <AvatarSelectorPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
