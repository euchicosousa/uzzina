import { useState } from "react";
import { UTopicCombobox } from "~/components/uzzina/UTopicCombobox";
import type { UComboboxTriggerProps } from "~/components/uzzina/UComboboxTrigger";
import type { PartnerTopicGroup } from "~/utils/topics";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundBoolean,
} from "./PropsPlayground";

type TriggerVariant = NonNullable<UComboboxTriggerProps["variant"]>;
type TriggerSize = NonNullable<UComboboxTriggerProps["size"]>;

const TOPIC_VARIANTS = ["ghost", "outline", "secondary", "default"] as const;
const TOPIC_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;

const STAMP = "2026-11-16T12:00:00Z";
const sampleTopic = (
  id: string,
  partner_id: string,
  position: number,
  title: string,
  color: string,
) => ({
  id,
  partner_id,
  position,
  title,
  color,
  created_at: STAMP,
  updated_at: STAMP,
});

const ONE_PARTNER: PartnerTopicGroup[] = [
  {
    partner: { id: "p1", slug: "marca-a", title: "Marca A" },
    topics: [
      sampleTopic("t1", "p1", 0, "Lançamentos", "#e5484d"),
      sampleTopic("t2", "p1", 1, "Bastidores", "#3e63dd"),
      sampleTopic("t3", "p1", 2, "Dicas", "#30a46c"),
    ],
  },
];

const TWO_PARTNERS: PartnerTopicGroup[] = [
  ...ONE_PARTNER,
  {
    partner: { id: "p2", slug: "marca-b", title: "Marca B" },
    topics: [
      sampleTopic("t4", "p2", 0, "Promoções", "#f76b15"),
      sampleTopic("t5", "p2", 1, "Depoimentos", "#8e4ec6"),
    ],
  },
];

const EMPTY: PartnerTopicGroup[] = [
  { partner: { id: "p3", slug: "marca-c", title: "Marca C" }, topics: [] },
];

const SCENARIOS = {
  "Um parceiro": ONE_PARTNER,
  "Dois parceiros": TWO_PARTNERS,
  "Sem tópicos": EMPTY,
} as const;
type Scenario = keyof typeof SCENARIOS;
const SCENARIO_OPTIONS = Object.keys(SCENARIOS) as Scenario[];

function TopicComboboxPlayground() {
  const [variant, setVariant] = useState<TriggerVariant>("ghost");
  const [size, setSize] = useState<TriggerSize>("icon-lg");
  const [scenario, setScenario] = useState<Scenario>("Dois parceiros");
  const [showText, setShowText] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>("t1");

  return (
    <PropsPlayground
      caption={`selectedTopicId: ${selectedTopicId ? `"${selectedTopicId}"` : "null"}`}
      preview={
        <div className="flex w-fit items-center justify-center p-4">
          <UTopicCombobox
            disabled={disabled}
            fallbackColor="#788c96"
            groups={SCENARIOS[scenario]}
            onSelect={setSelectedTopicId}
            selectedTopicId={selectedTopicId}
            showText={showText}
            size={size}
            variant={variant}
          />
        </div>
      }
      title="UTopicCombobox"
    >
      <PlaygroundSelect
        label="Cenário"
        onChange={setScenario}
        options={SCENARIO_OPTIONS}
        prop="groups"
        value={scenario}
      />
      <PlaygroundSelect
        label="Variante"
        onChange={setVariant}
        options={TOPIC_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={TOPIC_SIZES}
        prop="size"
        value={size}
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
  );
}

export function UzzinaTopicComboboxSection() {
  return (
    <div id="uzzina-topic-combobox">
      <GallerySection>
        <GallerySectionHeader
          description="Seletor de tópico da ação (rodapé da gaveta). Lista os tópicos de todos os parceiros da ação, agrupados por parceiro, e a opção Sem tópico. A bolinha mostra a cor do tópico ou, sem tópico, a cor da própria ação."
          title="UTopicCombobox"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UTopicCombobox">
            <TopicComboboxPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
