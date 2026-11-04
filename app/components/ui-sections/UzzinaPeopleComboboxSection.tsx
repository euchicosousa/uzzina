import { useState } from "react";
import { UPeopleCombobox } from "~/components/uzzina/UPeopleCombobox";
import { getTriggerAvatarSize } from "~/components/uzzina/UComboboxTrigger";
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
import { GalleryAppProviders, MOCK_PARTNERS } from "./gallery-mocks";

const VARIANTS = ["ghost", "outline", "secondary", "link", "default"] as const;
type Variant = (typeof VARIANTS)[number];

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
type Size = (typeof SIZES)[number];

const SELECTION_PRESETS = ["0", "1", "3"] as const;
type SelectionPreset = (typeof SELECTION_PRESETS)[number];

const PRESET_VALUES: Record<SelectionPreset, string[]> = {
  "0": [],
  "1": ["user-mock-001"],
  "3": ["user-mock-001", "user-mock-002", "user-mock-003"],
};

const SPRINT_PRESETS = ["0", "1", "2"] as const;
type SprintPreset = (typeof SPRINT_PRESETS)[number];
const SPRINT_VALUES: Record<SprintPreset, string[]> = {
  "0": [],
  "1": ["user-mock-001"],
  "2": ["user-mock-001", "user-mock-002"],
};

const RESPONSIBLES_PRESETS = ["none", "one", "all"] as const;
type ResponsiblesPreset = (typeof RESPONSIBLES_PRESETS)[number];
const RESPONSIBLES_LABELS: Record<ResponsiblesPreset, string> = {
  none: "Nenhum",
  one: "Um",
  all: "Todos",
};
const RESPONSIBLES_VALUES: Record<ResponsiblesPreset, string[]> = {
  none: [],
  one: ["user-mock-001"],
  all: ["user-mock-001", "user-mock-002", "user-mock-003"],
};

const AVATAR_PX = { xs: 16, sm: 24, md: 32 } as const;

export function PeopleResponsiblesPlayground() {
  const [variant, setVariant] = useState<Variant>("ghost");
  const [size, setSize] = useState<Size>("sm");
  const [preset, setPreset] = useState<SelectionPreset>("1");
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>(
    PRESET_VALUES["1"],
  );
  const [disabled, setDisabled] = useState(false);

  const handlePresetChange = (nextPreset: SelectionPreset) => {
    setPreset(nextPreset);
    setSelectedResponsibles(PRESET_VALUES[nextPreset] ?? []);
  };

  const handleSelect = (responsibles: string[]) => {
    setSelectedResponsibles(responsibles);
  };

  const avatarSize = getTriggerAvatarSize(size);
  const avatarPx = AVATAR_PX[avatarSize];

  return (
    <GalleryAppProviders>
      <PropsPlayground
        caption={`variant="${variant}" • size="${size}" • avatar=${avatarSize} (${avatarPx}px) • selecionados: ${selectedResponsibles.length}`}
        preview={
          <div className="flex w-full items-center justify-center p-6">
            <UPeopleCombobox
              currentPartners={MOCK_PARTNERS}
              disabled={disabled}
              mode="responsibles"
              onSelect={handleSelect}
              selectedResponsibles={selectedResponsibles}
              size={size}
              variant={variant}
            />
          </div>
        }
        title="UPeopleCombobox (modo Responsáveis)"
      >
        <PlaygroundRadio
          label="Preset de seleção"
          onChange={handlePresetChange}
          options={SELECTION_PRESETS}
          prop="preset"
          value={preset}
        />
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
        <PlaygroundBoolean
          label="Desativado"
          onChange={setDisabled}
          prop="disabled"
          value={disabled}
        />
      </PropsPlayground>
    </GalleryAppProviders>
  );
}

export function PeopleSprintPlayground() {
  const [variant, setVariant] = useState<Variant>("ghost");
  const [size, setSize] = useState<Size>("sm");
  const [sprintPreset, setSprintPreset] = useState<SprintPreset>("1");
  const [responsiblesPreset, setResponsiblesPreset] =
    useState<ResponsiblesPreset>("one");
  const [sprints, setSprints] = useState<string[]>(SPRINT_VALUES["1"]);
  const [responsibles, setResponsibles] = useState<string[]>(
    RESPONSIBLES_VALUES.one,
  );
  const [disabled, setDisabled] = useState(false);

  const handleSprintPresetChange = (nextPreset: SprintPreset) => {
    setSprintPreset(nextPreset);
    setSprints(SPRINT_VALUES[nextPreset] ?? []);
  };

  const handleResponsiblesPresetChange = (nextPreset: ResponsiblesPreset) => {
    setResponsiblesPreset(nextPreset);
    setResponsibles(RESPONSIBLES_VALUES[nextPreset] ?? []);
  };

  const handleSelect = (nextSprints: string[], nextResponsibles?: string[]) => {
    setSprints(nextSprints);
    if (nextResponsibles) {
      setResponsibles(nextResponsibles);
    }
  };

  const avatarSize = getTriggerAvatarSize(size);
  const avatarPx = AVATAR_PX[avatarSize];

  return (
    <GalleryAppProviders>
      <PropsPlayground
        caption={`variant="${variant}" • size="${size}" • avatar=${avatarSize} (${avatarPx}px) • sprint: ${sprints.length} • responsáveis: ${responsibles.length}`}
        preview={
          <div className="flex w-full items-center justify-center p-6">
            <UPeopleCombobox
              currentPartners={MOCK_PARTNERS}
              disabled={disabled}
              mode="sprint"
              onSelect={handleSelect}
              responsibles={responsibles}
              selectedSprints={sprints}
              size={size}
              variant={variant}
            />
          </div>
        }
        title="UPeopleCombobox (modo Sprint)"
      >
        <PlaygroundRadio
          label="Preset de sprint"
          onChange={handleSprintPresetChange}
          options={SPRINT_PRESETS}
          prop="sprintPreset"
          value={sprintPreset}
        />
        <PlaygroundRadio
          label="Responsáveis da ação"
          onChange={handleResponsiblesPresetChange}
          options={RESPONSIBLES_PRESETS}
          optionLabels={RESPONSIBLES_LABELS}
          prop="responsibles"
          value={responsiblesPreset}
        />
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
        <PlaygroundBoolean
          label="Desativado"
          onChange={setDisabled}
          prop="disabled"
          value={disabled}
        />
      </PropsPlayground>
    </GalleryAppProviders>
  );
}

export function UzzinaPeopleComboboxSection() {
  return (
    <div id="uzzina-people-combobox">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Seletor unificado de pessoas com suporte a modo 'responsibles' e modo 'sprint'. Gerencia avatares, regras de atribuição de sprint e sincronização com responsáveis da ação."
          title="UPeopleCombobox"
        />
        <GallerySectionContent className="flex flex-col gap-8">
          <GalleryItem
            id="uzzina-people-responsibles"
            label="Modo Responsáveis"
          >
            <PeopleResponsiblesPlayground />
          </GalleryItem>
          <GalleryItem id="uzzina-people-sprint" label="Modo Sprint">
            <PeopleSprintPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
