import { useState } from "react";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import {
  PrismButton,
  PrismButtonGroup,
  PrismButtonGroupSeparator,
  type PrismButtonVariantProps,
} from "~/components/prism";
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
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "success",
  "link",
] as const;

const BUTTON_SIZES = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
] as const;

const BUTTON_CONTENTS = ["text", "icon-start", "icon-end"] as const;

type GalleryButtonVariant = (typeof BUTTON_VARIANTS)[number];
type GalleryButtonSize = (typeof BUTTON_SIZES)[number];
type GalleryButtonContent = (typeof BUTTON_CONTENTS)[number];

const SIZE_METRICS: Record<GalleryButtonSize, string> = {
  xs: "altura 24px · ícone 12px",
  sm: "altura 32px · ícone 16px",
  default: "altura 40px · ícone 20px",
  lg: "altura 48px · ícone 20px",
  "icon-xs": "24 × 24px · ícone 16px",
  "icon-sm": "32 × 32px · ícone 16px",
  icon: "40 × 40px · ícone 20px",
  "icon-lg": "48 × 48px · ícone 20px",
};

const BUTTON_CONTENT_LABELS: Record<GalleryButtonContent, string> = {
  text: "Texto",
  "icon-start": "Ícone + texto",
  "icon-end": "Texto + ícone",
};

const BUTTON_GROUP_SIZES = ["xs", "sm", "default", "lg"] as const;
type ButtonGroupSize = (typeof BUTTON_GROUP_SIZES)[number];

const BUTTON_GROUP_ORIENTATIONS = ["horizontal", "vertical"] as const;
type ButtonGroupOrientation = (typeof BUTTON_GROUP_ORIENTATIONS)[number];

const BUTTON_GROUP_CHILD_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
] as const;
type ButtonGroupChildVariant = (typeof BUTTON_GROUP_CHILD_VARIANTS)[number];

const GROUP_ICON_SIZES: Record<
  ButtonGroupSize,
  PrismButtonVariantProps["size"]
> = {
  xs: "icon-xs",
  sm: "icon-sm",
  default: "icon",
  lg: "icon-lg",
};

function ButtonPlayground() {
  const [variant, setVariant] = useState<GalleryButtonVariant>("default");
  const [size, setSize] = useState<GalleryButtonSize>("default");
  const [content, setContent] = useState<GalleryButtonContent>("text");
  const [isDisabled, setIsDisabled] = useState(false);
  const [text, setText] = useState("Botão");

  const isIconOnly = size.startsWith("icon");

  let previewButton: React.ReactNode;
  if (isIconOnly) {
    previewButton = (
      <PrismButton
        aria-label={text}
        isDisabled={isDisabled}
        size={size}
        variant={variant}
      >
        <PlusIcon />
      </PrismButton>
    );
  } else if (content === "icon-start") {
    previewButton = (
      <PrismButton isDisabled={isDisabled} size={size} variant={variant}>
        <PlusIcon data-icon="inline-start" />
        {text}
      </PrismButton>
    );
  } else if (content === "icon-end") {
    previewButton = (
      <PrismButton isDisabled={isDisabled} size={size} variant={variant}>
        {text}
        <ChevronDownIcon data-icon="inline-end" />
      </PrismButton>
    );
  } else {
    previewButton = (
      <PrismButton isDisabled={isDisabled} size={size} variant={variant}>
        {text}
      </PrismButton>
    );
  }

  return (
    <PropsPlayground
      caption={`${variant} / ${size} · ${SIZE_METRICS[size]}`}
      preview={previewButton}
      title="Button"
    >
      <PlaygroundSelect
        label="Variante"
        onChange={setVariant}
        options={BUTTON_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={BUTTON_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        isDisabled={isIconOnly}
        label="Conteúdo"
        onChange={setContent}
        optionLabels={BUTTON_CONTENT_LABELS}
        options={BUTTON_CONTENTS}
        prop="children"
        value={content}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
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

function ButtonGroupPlayground() {
  const [size, setSize] = useState<ButtonGroupSize>("default");
  const [orientation, setOrientation] =
    useState<ButtonGroupOrientation>("horizontal");
  const [variant, setVariant] = useState<ButtonGroupChildVariant>("outline");
  const [showSeparator, setShowSeparator] = useState(true);
  const [hasMenuButton, setHasMenuButton] = useState(false);

  const separatorOrientation =
    orientation === "horizontal" ? "vertical" : "horizontal";
  const iconSize = GROUP_ICON_SIZES[size];

  return (
    <PropsPlayground
      caption={`size="${size}" · orientation="${orientation}" · variant="${variant}"`}
      preview={
        <PrismButtonGroup orientation={orientation} size={size}>
          <PrismButton size={size} variant={variant}>
            Salvar
          </PrismButton>
          {showSeparator && (
            <PrismButtonGroupSeparator orientation={separatorOrientation} />
          )}
          {hasMenuButton ? (
            <PrismButton
              aria-label="Mais opções"
              size={iconSize}
              variant={variant}
            >
              <ChevronDownIcon />
            </PrismButton>
          ) : (
            <PrismButton size={size} variant={variant}>
              Publicar
            </PrismButton>
          )}
        </PrismButtonGroup>
      }
      title="ButtonGroup"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={BUTTON_GROUP_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Orientação"
        onChange={setOrientation}
        options={BUTTON_GROUP_ORIENTATIONS}
        prop="orientation"
        value={orientation}
      />
      <PlaygroundSelect
        label="Variante dos botões"
        onChange={setVariant}
        options={BUTTON_GROUP_CHILD_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundBoolean
        label="Separador"
        onChange={setShowSeparator}
        prop="PrismButtonGroupSeparator"
        value={showSeparator}
      />
      <PlaygroundBoolean
        label="Botão de menu"
        onChange={setHasMenuButton}
        prop="hasMenuButton"
        value={hasMenuButton}
      />
    </PropsPlayground>
  );
}

export function ButtonSection() {
  return (
    <div id="prism-button">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Botão do Prism sobre React Aria. Ajuste as propriedades à direita para ver uma instância real; variantes e tamanhos vêm de buttonVariants."
          title="Button"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Button">
            <ButtonPlayground />
          </GalleryItem>
          <GalleryItem label="ButtonGroup">
            <ButtonGroupPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
