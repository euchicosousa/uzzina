import { useState } from "react";
import { UPartnerCelebrationsSelector } from "~/components/uzzina/UPartnerCelebrationsSelector";
import type { Celebration } from "~/types";
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

const MOCK_CELEBRATIONS: Celebration[] = [
  {
    id: "celebration-mock-01",
    date: "2026-01-01",
    title: "Confraternização Universal",
    is_holiday: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "celebration-mock-02",
    date: "2026-03-08",
    title: "Dia Internacional da Mulher",
    is_holiday: false,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "celebration-mock-03",
    date: "2026-04-21",
    title: "Tiradentes",
    is_holiday: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "celebration-mock-04",
    date: "2026-05-10",
    title: "Dia das Mães",
    is_holiday: false,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "celebration-mock-05",
    date: "2026-06-12",
    title: "Dia dos Namorados",
    is_holiday: false,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "celebration-mock-06",
    date: "2026-08-09",
    title: "Dia dos Pais",
    is_holiday: false,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "celebration-mock-07",
    date: "2026-10-12",
    title: "Dia das Crianças",
    is_holiday: false,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "celebration-mock-08",
    date: "2026-12-25",
    title: "Natal",
    is_holiday: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

const PRESETS = ["none", "some", "all"] as const;
type Preset = (typeof PRESETS)[number];

const PRESET_LABELS: Record<Preset, string> = {
  none: "Nenhuma",
  some: "Duas",
  all: "Todas",
};

export function UPartnerCelebrationsSelectorPlayground() {
  const [preset, setPreset] = useState<Preset>("some");
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "celebration-mock-02",
    "celebration-mock-04",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState(8);

  const celebrations = MOCK_CELEBRATIONS.slice(0, count);

  const handlePresetChange = (newPreset: Preset) => {
    setPreset(newPreset);
    if (newPreset === "none") {
      setSelectedIds([]);
    } else if (newPreset === "some") {
      setSelectedIds(["celebration-mock-02", "celebration-mock-04"]);
    } else {
      setSelectedIds(celebrations.map((c) => c.id));
    }
  };

  const handleToggle = (id: string, isChecked: boolean) => {
    setSelectedIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleClear = () => {
    setSelectedIds([]);
  };

  return (
    <PropsPlayground
      caption={`${selectedIds.length} selecionada(s)`}
      preview={
        <div className="w-full max-w-2xl">
          <UPartnerCelebrationsSelector
            celebrations={celebrations}
            isLoading={isLoading}
            onClear={handleClear}
            onToggle={handleToggle}
            saving={saving}
            selectedIds={selectedIds}
          />
        </div>
      }
      previewClassName="items-start"
      title="UPartnerCelebrationsSelector"
    >
      <PlaygroundRadio
        label="Selecionadas"
        onChange={handlePresetChange}
        optionLabels={PRESET_LABELS}
        options={PRESETS}
        prop="selectedIds"
        value={preset}
      />
      <PlaygroundBoolean
        label="Carregando"
        onChange={setIsLoading}
        prop="isLoading"
        value={isLoading}
      />
      <PlaygroundBoolean
        label="Salvando"
        onChange={setSaving}
        prop="saving"
        value={saving}
      />
      <PlaygroundNumber
        label="Quantidade de datas"
        max={8}
        min={0}
        onChange={setCount}
        prop="celebrations"
        value={count}
      />
    </PropsPlayground>
  );
}

export function UzzinaPartnerCelebrationsSelectorSection() {
  return (
    <div id="uzzina-partner-celebrations-selector">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Seleção das datas comemorativas da marca, com filtro por mês e busca."
          title="UPartnerCelebrationsSelector"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UPartnerCelebrationsSelector">
            <UPartnerCelebrationsSelectorPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
