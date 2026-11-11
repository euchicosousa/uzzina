import { useState } from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { PrismBadge, PrismKbd } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundRadio,
  PlaygroundText,
} from "./PropsPlayground";

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "success",
  "warning",
  "error",
  "info",
  "link",
] as const;

type BadgeVariant = (typeof BADGE_VARIANTS)[number];

const BADGE_ICONS = ["none", "inline-start", "inline-end"] as const;
type BadgeIconOption = (typeof BADGE_ICONS)[number];

const BADGE_ICON_LABELS: Record<BadgeIconOption, string> = {
  none: "Sem ícone",
  "inline-start": "Início",
  "inline-end": "Fim",
};

function BadgePlayground() {
  const [variant, setVariant] = useState<BadgeVariant>("default");
  const [icon, setIcon] = useState<BadgeIconOption>("none");
  const [text, setText] = useState("Badge");

  let content: React.ReactNode;
  if (icon === "inline-start") {
    content = (
      <>
        <CheckIcon data-icon="inline-start" />
        {text}
      </>
    );
  } else if (icon === "inline-end") {
    content = (
      <>
        {text}
        <ChevronRightIcon data-icon="inline-end" />
      </>
    );
  } else {
    content = text;
  }

  return (
    <PropsPlayground
      caption={`variant="${variant}"`}
      preview={<PrismBadge variant={variant}>{content}</PrismBadge>}
      title="Badge"
    >
      <PlaygroundSelect
        label="Variante"
        onChange={setVariant}
        options={BADGE_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundRadio
        label="Ícone"
        onChange={setIcon}
        optionLabels={BADGE_ICON_LABELS}
        options={BADGE_ICONS}
        prop="data-icon"
        value={icon}
      />
      <PlaygroundText
        label="Texto"
        onChange={setText}
        prop="children"
        value={text}
      />
    </PropsPlayground>
  );
}

function KbdPlayground() {
  const [text, setText] = useState("⌘K");

  return (
    <PropsPlayground
      caption="PrismKbd"
      preview={<PrismKbd>{text}</PrismKbd>}
      title="Kbd"
    >
      <PlaygroundText
        label="Texto"
        onChange={setText}
        prop="children"
        value={text}
      />
    </PropsPlayground>
  );
}

export function BadgeSection() {
  return (
    <div id="prism-badge">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Etiquetas visuais semânticas para contadores, status de processos e marcas de identificação."
          title="Badge"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem id="prism-badge-badge" label="Badge">
            <BadgePlayground />
          </GalleryItem>
          <GalleryItem id="prism-badge-kbd" label="Kbd">
            <KbdPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
