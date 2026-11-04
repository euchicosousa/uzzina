import { useState } from "react";
import {
  PrismButton,
  PrismSelect,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectGroup,
  PrismSelectLabel,
  PrismSelectSeparator,
} from "~/components/prism";
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

const SELECT_SIZES = ["sm", "default", "lg"] as const;
type SelectSize = (typeof SELECT_SIZES)[number];

const ALL_SELECT_OPTIONS = [
  { id: "design-visual", label: "Design Visual" },
  { id: "redacao-publicitaria", label: "Redação Publicitária" },
  { id: "edicao-de-video", label: "Edição de Vídeo" },
  { id: "motion", label: "Motion" },
  { id: "estrategia", label: "Estratégia" },
  { id: "fotografia", label: "Fotografia" },
  { id: "trafego-pago", label: "Tráfego Pago" },
  { id: "atendimento", label: "Atendimento" },
] as const;

function SelectPlayground() {
  const [size, setSize] = useState<SelectSize>("default");
  const [hasValue, setHasValue] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isGrouped, setIsGrouped] = useState(false);
  const [compareButton, setCompareButton] = useState(false);
  const [count, setCount] = useState(5);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    "design-visual",
  );

  const currentOptions = ALL_SELECT_OPTIONS.slice(0, count);
  const effectiveKey = hasValue ? (selectedKey ?? currentOptions[0]?.id) : null;

  const half = Math.ceil(currentOptions.length / 2);
  const group1 = currentOptions.slice(0, half);
  const group2 = currentOptions.slice(half);

  return (
    <PropsPlayground
      caption={`size="${size}" · selectedKey="${effectiveKey ?? ""}"`}
      preview={
        <div className="flex items-center gap-4">
          <PrismSelect
            aria-label="Área de atuação"
            className="w-56"
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            onSelectionChange={(key) =>
              setSelectedKey(key ? String(key) : null)
            }
            placeholder="Selecione uma área"
            selectedKey={effectiveKey}
          >
            <PrismSelectTrigger size={size}>
              <PrismSelectValue />
            </PrismSelectTrigger>
            <PrismSelectContent>
              {isGrouped ? (
                <>
                  <PrismSelectGroup>
                    <PrismSelectLabel>Criação</PrismSelectLabel>
                    {group1.map((opt) => (
                      <PrismSelectItem id={opt.id} key={opt.id}>
                        {opt.label}
                      </PrismSelectItem>
                    ))}
                  </PrismSelectGroup>
                  <PrismSelectSeparator />
                  <PrismSelectGroup>
                    <PrismSelectLabel>Gestão</PrismSelectLabel>
                    {group2.map((opt) => (
                      <PrismSelectItem id={opt.id} key={opt.id}>
                        {opt.label}
                      </PrismSelectItem>
                    ))}
                  </PrismSelectGroup>
                </>
              ) : (
                currentOptions.map((opt) => (
                  <PrismSelectItem id={opt.id} key={opt.id}>
                    {opt.label}
                  </PrismSelectItem>
                ))
              )}
            </PrismSelectContent>
          </PrismSelect>
          {compareButton && (
            <PrismButton size={size} variant="default">
              Botão
            </PrismButton>
          )}
        </div>
      }
      title="Select"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={SELECT_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Com valor"
        onChange={setHasValue}
        prop="selectedKey"
        value={hasValue}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Inválido"
        onChange={setIsInvalid}
        prop="isInvalid"
        value={isInvalid}
      />
      <PlaygroundBoolean
        label="Agrupado"
        onChange={setIsGrouped}
        prop="PrismSelectGroup"
        value={isGrouped}
      />
      <PlaygroundBoolean
        label="Comparar com botão"
        onChange={setCompareButton}
        prop="compareButton"
        value={compareButton}
      />
      <PlaygroundNumber
        label="Quantidade de opções"
        max={8}
        min={3}
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

export function SelectSection() {
  return (
    <div id="prism-select">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Controle de seleção suspensa acessível baseado em React Aria Components, alinhado à escala e canto do botão."
          title="Select"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Select">
            <SelectPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
