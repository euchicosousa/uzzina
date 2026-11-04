import { useState } from "react";
import { PrismSkeletonGroup } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundBoolean,
  PlaygroundNumber,
} from "./PropsPlayground";

const SKELETON_VARIANTS = ["line", "block", "profile"] as const;
type SkeletonVariant = (typeof SKELETON_VARIANTS)[number];

const SKELETON_VARIANT_LABELS: Record<SkeletonVariant, string> = {
  line: "Linha",
  block: "Bloco",
  profile: "Perfil",
};

const SKELETON_ORIENTATIONS = ["vertical", "horizontal"] as const;
type SkeletonOrientation = (typeof SKELETON_ORIENTATIONS)[number];

function SkeletonPlayground() {
  const [variant, setVariant] = useState<SkeletonVariant>("line");
  const [orientation, setOrientation] =
    useState<SkeletonOrientation>("vertical");
  const [isWrapped, setIsWrapped] = useState(true);
  const [count, setCount] = useState(4);
  const [delay, setDelay] = useState(0);

  let itemClassName = "";
  if (variant === "line") {
    itemClassName = "h-4 w-full";
  } else if (variant === "block") {
    itemClassName = "h-24 w-full";
  }

  return (
    <PropsPlayground
      caption={`variant="${variant}" · orientation="${orientation}" · count={${count}}`}
      preview={
        <div className="w-full max-w-2xl">
          <PrismSkeletonGroup
            className={itemClassName}
            count={count}
            delay={delay}
            isWrapped={isWrapped}
            orientation={orientation}
            variant={variant}
          />
        </div>
      }
      title="Skeleton"
    >
      <PlaygroundRadio
        label="Variante"
        onChange={setVariant}
        optionLabels={SKELETON_VARIANT_LABELS}
        options={SKELETON_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundRadio
        label="Orientação"
        onChange={setOrientation}
        options={SKELETON_ORIENTATIONS}
        prop="orientation"
        value={orientation}
      />
      <PlaygroundBoolean
        label="Envolver em grade"
        onChange={setIsWrapped}
        prop="isWrapped"
        value={isWrapped}
      />
      <PlaygroundNumber
        label="Quantidade de itens"
        max={8}
        min={1}
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
      <PlaygroundNumber
        label="Atraso (ms)"
        max={300}
        min={0}
        onChange={setDelay}
        prop="delay"
        step={50}
        value={delay}
      />
    </PropsPlayground>
  );
}

export function SkeletonSection() {
  return (
    <div id="prism-skeleton">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Marcadores de carregamento com animação de pulso e cantos squircle. Exemplos baseados nos usos reais da aplicação."
          title="Skeleton"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Skeleton">
            <SkeletonPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
