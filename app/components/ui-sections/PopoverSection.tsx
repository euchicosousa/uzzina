import { useState } from "react";
import type { Placement } from "react-aria-components";
import {
  PrismPopover,
  PrismPopoverTrigger,
  PrismPopoverHeader,
  PrismPopoverTitle,
  PrismPopoverDescription,
  PrismButton,
} from "~/components/prism";
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
  PlaygroundNumber,
} from "./PropsPlayground";

const POPOVER_SIZES = ["sm", "default", "lg"] as const;
type PopoverSize = (typeof POPOVER_SIZES)[number];

const POPOVER_SIZE_LABELS: Record<PopoverSize, string> = {
  sm: "sm (w-56)",
  default: "default (w-72)",
  lg: "lg (w-80)",
};

const POPOVER_PLACEMENTS = [
  "bottom",
  "bottom start",
  "bottom end",
  "top",
  "left",
  "right",
] as const;
type PopoverPlacement = (typeof POPOVER_PLACEMENTS)[number];

function PopoverPlayground() {
  const [size, setSize] = useState<PopoverSize>("default");
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const [hasHeader, setHasHeader] = useState(true);
  const [offset, setOffset] = useState(4);

  return (
    <PropsPlayground
      caption={`size="${size}" · placement="${placement}" · offset={${offset}}`}
      preview={
        <PrismPopoverTrigger>
          <PrismButton variant="outline">Abrir popover</PrismButton>
          <PrismPopover
            offset={offset}
            placement={placement as Placement}
            size={size}
          >
            {hasHeader && (
              <PrismPopoverHeader>
                <PrismPopoverTitle>Opções rápidas</PrismPopoverTitle>
                <PrismPopoverDescription>
                  Configure os parâmetros do painel.
                </PrismPopoverDescription>
              </PrismPopoverHeader>
            )}
            <p className="text-sm text-secondary-foreground">
              Este é o conteúdo demonstrativo do popover contextual.
            </p>
          </PrismPopover>
        </PrismPopoverTrigger>
      }
      title="Popover"
    >
      <PlaygroundRadio
        label="Largura"
        onChange={setSize}
        optionLabels={POPOVER_SIZE_LABELS}
        options={POPOVER_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundSelect
        label="Posição"
        onChange={setPlacement}
        options={POPOVER_PLACEMENTS}
        prop="placement"
        value={placement}
      />
      <PlaygroundBoolean
        label="Com cabeçalho"
        onChange={setHasHeader}
        prop="PrismPopoverHeader"
        value={hasHeader}
      />
      <PlaygroundNumber
        label="Deslocamento"
        max={16}
        min={0}
        onChange={setOffset}
        prop="offset"
        step={4}
        value={offset}
      />
    </PropsPlayground>
  );
}

export function PopoverSection() {
  return (
    <div id="prism-popover">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Popover contextual construído sobre o React Aria Components com posicionamento automático e transições suaves."
          title="Popover"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Popover">
            <PopoverPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
