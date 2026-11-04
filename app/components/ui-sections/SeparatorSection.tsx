import { useState } from "react";
import { PrismSeparator } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import { PropsPlayground, PlaygroundRadio } from "./PropsPlayground";

const SEPARATOR_ORIENTATIONS = ["horizontal", "vertical"] as const;
type SeparatorOrientation = (typeof SEPARATOR_ORIENTATIONS)[number];

const SEPARATOR_ORIENTATION_LABELS: Record<SeparatorOrientation, string> = {
  horizontal: "Horizontal",
  vertical: "Vertical",
};

function SeparatorPlayground() {
  const [orientation, setOrientation] =
    useState<SeparatorOrientation>("horizontal");

  return (
    <PropsPlayground
      caption={`orientation="${orientation}"`}
      preview={
        orientation === "horizontal" ? (
          <div className="flex w-64 flex-col gap-3">
            <span className="text-sm text-foreground">Acima</span>
            <PrismSeparator orientation="horizontal" />
            <span className="text-sm text-foreground">Abaixo</span>
          </div>
        ) : (
          <div className="flex h-10 items-center gap-3">
            <span className="text-sm text-foreground">Esquerda</span>
            <PrismSeparator orientation="vertical" />
            <span className="text-sm text-foreground">Direita</span>
          </div>
        )
      }
      title="Separator"
    >
      <PlaygroundRadio
        label="Orientação"
        onChange={setOrientation}
        optionLabels={SEPARATOR_ORIENTATION_LABELS}
        options={SEPARATOR_ORIENTATIONS}
        prop="orientation"
        value={orientation}
      />
    </PropsPlayground>
  );
}

export function SeparatorSection() {
  return (
    <div id="prism-separator">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Linhas divisórias horizontais e verticais para agrupamento e separação semântica de conteúdo."
          title="Separator"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Separator">
            <SeparatorPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
