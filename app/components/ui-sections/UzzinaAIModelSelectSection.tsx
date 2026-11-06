import { useState } from "react";
import { PrismButton, PrismButtonGroup } from "~/components/prism";
import {
  UAIModelSelect,
  type AIModelOption,
} from "~/components/uzzina/UAIModelSelect";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PlaygroundBoolean,
  PlaygroundSelect,
  PlaygroundText,
  PropsPlayground,
} from "./PropsPlayground";

const models = [
  { id: "luna", name: "GPT-6 Luna", provider: "openai", level: 1 },
  { id: "terra", name: "GPT-6.1 Terra", provider: "openai", level: 2 },
  { id: "sol", name: "GPT-6.1 Sol", provider: "openai", level: 3 },
  { id: "astra", name: "GPT-6 Astra", provider: "openai", level: 5 },
  { id: "haiku", name: "Claude Haiku 5.5", provider: "anthropic", level: 1 },
  { id: "sonnet", name: "Claude Sonnet 5.5", provider: "anthropic", level: 3 },
  { id: "opus", name: "Claude Opus 5.5", provider: "anthropic", level: 4 },
] as const satisfies readonly AIModelOption[];

const triggerSizes = {
  xs: "xs",
  sm: "sm",
  default: "default",
  lg: "lg",
  icon: "default",
  "icon-xs": "xs",
  "icon-sm": "sm",
  "icon-lg": "lg",
} as const;

export function UzzinaAIModelSelectSection() {
  const [value, setValue] = useState<string>("luna");
  const [variant, setVariant] = useState<"default" | "outline" | "secondary">(
    "default",
  );
  const [size, setSize] = useState<keyof typeof triggerSizes>("icon");
  const [showText, setShowText] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [label, setLabel] = useState("Gerar legenda");
  const [simulation, setSimulation] = useState("");
  const selected = models.find((model) => model.id === value);

  return (
    <div id="uzzina-ai-model-select">
      <GallerySection>
        <GallerySectionHeader
          title="UAIModelSelect"
          description="Seletor pesquisável de modelo, ao lado do comando de geração."
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Playground">
            <PropsPlayground
              title="UAIModelSelect"
              caption={`value="${value}" · variant="${variant}" · size="${size}" · showText={${showText}} · isDisabled={${isDisabled}}`}
              preview={
                <div className="flex flex-col items-center gap-3">
                  <PrismButtonGroup
                    aria-label="Geração com IA"
                    className="max-w-full"
                    size={triggerSizes[size]}
                  >
                    <PrismButton
                      variant="default"
                      size={triggerSizes[size]}
                      onPress={() =>
                        setSimulation(`Geração simulada com ${selected?.name}.`)
                      }
                    >
                      {label || "Gerar legenda"}
                    </PrismButton>
                    <UAIModelSelect
                      models={models}
                      value={value}
                      onChange={(id) => {
                        setValue(id);
                        setSimulation("");
                      }}
                      variant={variant}
                      size={size}
                      showText={showText}
                      isDisabled={isDisabled}
                    />
                  </PrismButtonGroup>
                  <p className="text-sm text-muted-foreground" role="status">
                    {simulation || selected?.name}
                  </p>
                </div>
              }
            >
              <PlaygroundSelect
                label="Modelo selecionado"
                prop="value"
                value={value}
                options={models.map((model) => model.id)}
                optionLabels={Object.fromEntries(
                  models.map((model) => [model.id, model.name]),
                )}
                onChange={(id) => {
                  setValue(id);
                  setSimulation("");
                }}
              />
              <PlaygroundSelect
                label="Variante do seletor"
                prop="variant"
                value={variant}
                options={["default", "outline", "secondary"] as const}
                onChange={setVariant}
              />
              <PlaygroundSelect
                label="Tamanho do seletor"
                prop="size"
                value={size}
                options={[
                  "xs",
                  "sm",
                  "default",
                  "lg",
                  "icon",
                  "icon-xs",
                  "icon-sm",
                  "icon-lg",
                ]}
                onChange={setSize}
              />
              <PlaygroundBoolean
                label="Mostrar nome do modelo"
                prop="showText"
                value={showText}
                onChange={setShowText}
              />
              <PlaygroundBoolean
                label="Seletor desativado"
                prop="isDisabled"
                value={isDisabled}
                onChange={setIsDisabled}
              />
              <PlaygroundText
                label="Texto da ação"
                prop="children"
                value={label}
                onChange={setLabel}
              />
            </PropsPlayground>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
