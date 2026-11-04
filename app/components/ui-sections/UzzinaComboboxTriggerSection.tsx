import { useState } from "react";
import { TagIcon } from "lucide-react";
import {
  UComboboxTrigger,
  getTriggerAvatarSize,
  getTriggerContentSizeClass,
  getTriggerAvatarPadding,
} from "~/components/uzzina/UComboboxTrigger";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { cn } from "~/lib/utils";
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
  PlaygroundText,
} from "./PropsPlayground";

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

const CONTENT_TYPES = [
  "avatar-text",
  "avatar",
  "icon-text",
  "icon",
  "text",
  "swatch",
] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

const CONTENT_LABELS: Record<ContentType, string> = {
  "avatar-text": "Avatar + texto",
  avatar: "Avatar",
  "icon-text": "Ícone + texto",
  icon: "Ícone",
  text: "Texto",
  swatch: "Amostra de cor",
};

const AVATAR_PX = { xs: 16, sm: 24, md: 32 } as const;

export function ComboboxTriggerPlayground() {
  const [variant, setVariant] = useState<Variant>("ghost");
  const [size, setSize] = useState<Size>("sm");
  const [contentType, setContentType] = useState<ContentType>("avatar-text");
  const [disabled, setDisabled] = useState(false);
  const [text, setText] = useState("Parceiros");

  const isIconSize =
    size === "icon-xs" ||
    size === "icon-sm" ||
    size === "icon" ||
    size === "icon-lg";

  const avatarSize = getTriggerAvatarSize(size);
  const avatarPx = AVATAR_PX[avatarSize];
  const contentSizeClass = getTriggerContentSizeClass(size);
  const contentPx =
    contentSizeClass === "size-3"
      ? 12
      : contentSizeClass === "size-4"
        ? 16
        : 20;
  const paddingClass =
    contentType === "avatar-text" && !isIconSize
      ? getTriggerAvatarPadding(size)
      : undefined;

  let contentNode: React.ReactNode;
  if (isIconSize) {
    if (contentType === "avatar" || contentType === "avatar-text") {
      contentNode = (
        <UAvatar
          backgroundColor="#2563eb"
          color="#ffffff"
          fallback="AO"
          size={avatarSize}
        />
      );
    } else if (contentType === "swatch") {
      contentNode = (
        <span
          className={cn("rounded-full", contentSizeClass)}
          style={{ backgroundColor: "#7c3aed" }}
        />
      );
    } else {
      contentNode = <TagIcon className={contentSizeClass} />;
    }
  } else {
    switch (contentType) {
      case "text":
        contentNode = <span>{text}</span>;
        break;
      case "icon":
        contentNode = <TagIcon className={contentSizeClass} />;
        break;
      case "icon-text":
        contentNode = (
          <>
            <TagIcon className={contentSizeClass} />
            <span>{text}</span>
          </>
        );
        break;
      case "avatar":
        contentNode = (
          <UAvatar
            backgroundColor="#2563eb"
            color="#ffffff"
            fallback="AO"
            size={avatarSize}
          />
        );
        break;
      case "avatar-text":
        contentNode = (
          <>
            <UAvatar
              backgroundColor="#2563eb"
              color="#ffffff"
              fallback="AO"
              size={avatarSize}
            />
            <span>{text}</span>
          </>
        );
        break;
      case "swatch":
        contentNode = (
          <span
            className={cn("rounded-full", contentSizeClass)}
            style={{ backgroundColor: "#7c3aed" }}
          />
        );
        break;
    }
  }

  const paddingDesc = paddingClass ?? "sem padding extra";

  return (
    <PropsPlayground
      caption={`${variant} / ${size} · avatar ${avatarPx}px · conteúdo ${contentPx}px · ${paddingDesc}`}
      preview={
        <UComboboxTrigger
          aria-label={text}
          className={paddingClass}
          disabled={disabled}
          onPress={() => {}}
          size={size}
          variant={variant}
        >
          {contentNode}
        </UComboboxTrigger>
      }
      title="UComboboxTrigger"
    >
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
      <PlaygroundSelect
        label="Conteúdo"
        onChange={setContentType}
        optionLabels={CONTENT_LABELS}
        options={CONTENT_TYPES}
        prop="children"
        value={contentType}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setDisabled}
        prop="disabled"
        value={disabled}
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

export function UzzinaComboboxTriggerSection() {
  return (
    <div id="uzzina-combobox-trigger">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Gatilho comum dos comboboxes: usa variante e tamanho do botão Prism; avatares, ícones e amostras seguem os helpers de tamanho."
          title="UComboboxTrigger"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UComboboxTrigger">
            <ComboboxTriggerPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
