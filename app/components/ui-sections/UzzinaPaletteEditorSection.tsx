import { useState } from "react";
import { UPaletteEditor } from "~/components/uzzina/UPaletteEditor";
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
} from "./PropsPlayground";

const PALETTE = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#EA580C",
  "#DB2777",
  "#0F172A",
] as const;

const SCENARIOS = ["3-cores", "6-cores", "vazio"] as const;
type Scenario = (typeof SCENARIOS)[number];

export function PaletteEditorPlayground() {
  const [scenario, setScenario] = useState<Scenario>("3-cores");
  const [disabled, setDisabled] = useState(false);

  const initialColors =
    scenario === "3-cores"
      ? PALETTE.slice(0, 3)
      : scenario === "6-cores"
        ? PALETTE.slice(0, 6)
        : [];

  return (
    <PaletteEditorInner
      disabled={disabled}
      initialColors={[...initialColors]}
      key={`${scenario}-${disabled}`}
      scenario={scenario}
      setDisabled={setDisabled}
      setScenario={setScenario}
    />
  );
}

function PaletteEditorInner({
  scenario,
  setScenario,
  disabled,
  setDisabled,
  initialColors,
}: {
  scenario: Scenario;
  setScenario: (val: Scenario) => void;
  disabled: boolean;
  setDisabled: (val: boolean) => void;
  initialColors: string[];
}) {
  const [colors, setColors] = useState<string[]>(() => [...initialColors]);

  return (
    <PropsPlayground
      caption={
        colors.length > 0 ? colors.join(", ") : "Nenhuma cor (estado vazio)"
      }
      preview={
        <div className="w-full max-w-xl">
          <UPaletteEditor
            disabled={disabled}
            initialColors={initialColors}
            onChange={setColors}
          />
        </div>
      }
      previewClassName="items-start"
      title="UPaletteEditor"
    >
      <PlaygroundRadio
        label="Cenário de Cores"
        onChange={setScenario}
        options={SCENARIOS}
        prop="scenario"
        value={scenario}
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

export function UzzinaPaletteEditorSection() {
  return (
    <div id="uzzina-palette-editor">
      <GallerySection>
        <GallerySectionHeader
          description="Editor de paleta de cores: seletor de cor compartilhado, validação com preservação de texto, reordenação por arraste e exclusão discreta ghost-error."
          title="UPaletteEditor"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UPaletteEditor">
            <PaletteEditorPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
