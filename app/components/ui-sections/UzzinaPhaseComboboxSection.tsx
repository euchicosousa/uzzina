import { useState } from "react";
import { UPhaseCombobox } from "~/components/uzzina/UPhaseCombobox";
import type { UComboboxTriggerProps } from "~/components/uzzina/UComboboxTrigger";
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

type TriggerVariant = NonNullable<UComboboxTriggerProps["variant"]>;
type TriggerSize = NonNullable<UComboboxTriggerProps["size"]>;

const PHASE_VARIANTS = [
  "ghost",
  "outline",
  "secondary",
  "link",
  "default",
] as const;

const PHASE_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;

const ICON_VARIANTS = ["progress", "icon"] as const;
type PhaseIconVariant = (typeof ICON_VARIANTS)[number];
const ICON_VARIANT_LABELS: Record<PhaseIconVariant, string> = {
  progress: "Progresso",
  icon: "Temático",
};

function PhaseComboboxPlayground() {
  const [variant, setVariant] = useState<TriggerVariant>("ghost");
  const [size, setSize] = useState<TriggerSize>("sm");
  const [iconVariant, setIconVariant] = useState<PhaseIconVariant>("progress");
  const [isMulti, setIsMulti] = useState(false);
  const [showText, setShowText] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const [selectedPhase, setSelectedPhase] = useState<string>("doing");
  const [selectedPhases, setSelectedPhases] = useState<string[]>(["all"]);

  const handleIsMultiChange = (multi: boolean) => {
    setIsMulti(multi);
  };

  return (
    <GalleryAppProviders>
      <PropsPlayground
        caption={
          isMulti
            ? `selectedPhases: [${selectedPhases.join(", ")}]`
            : `selectedPhase: "${selectedPhase}"`
        }
        key={String(isMulti)}
        preview={
          <div className="flex w-fit items-center justify-center p-4">
            <UPhaseCombobox
              disabled={disabled}
              isMulti={isMulti}
              onSelect={({ phase, phases }) => {
                if (phase !== undefined) setSelectedPhase(phase);
                setSelectedPhases(phases);
              }}
              selectedPhases={selectedPhases}
              showText={showText}
              size={size}
              variant={variant}
            />
          </div>
        }
        title="UPhaseCombobox"
      >
        <PlaygroundSelect
          label="Variante"
          onChange={setVariant}
          options={PHASE_VARIANTS}
          prop="variant"
          value={variant}
        />
        <PlaygroundSelect
          label="Tamanho"
          onChange={setSize}
          options={PHASE_SIZES}
          prop="size"
          value={size}
        />
        <PlaygroundRadio
          label="Ícone"
          onChange={setIconVariant}
          optionLabels={ICON_VARIANT_LABELS}
          options={ICON_VARIANTS}
          prop="iconVariant"
          value={iconVariant}
        />
        <PlaygroundBoolean
          label="Seleção múltipla"
          onChange={handleIsMultiChange}
          prop="isMulti"
          value={isMulti}
        />
        <PlaygroundBoolean
          label="Mostrar nome"
          onChange={setShowText}
          prop="showText"
          value={showText}
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

export function UzzinaPhaseComboboxSection() {
  return (
    <div id="uzzina-phase-combobox">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Seletor de Fase refatorado para o Prism com suporte a estados de progresso, ícones coloridos e seleção única/múltipla."
          title="UPhaseCombobox"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UPhaseCombobox">
            <PhaseComboboxPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
