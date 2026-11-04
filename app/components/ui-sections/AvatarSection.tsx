import { useState } from "react";
import { CheckIcon } from "lucide-react";
import {
  PrismAvatar,
  PrismAvatarImage,
  PrismAvatarFallback,
  PrismAvatarBadge,
  PrismAvatarGroup,
  PrismAvatarGroupCount,
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
  PlaygroundText,
} from "./PropsPlayground";

const AVATAR_SIZES = ["sm", "default", "lg"] as const;
type AvatarSize = (typeof AVATAR_SIZES)[number];

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 24,
  default: 32,
  lg: 40,
};

const IMAGE_OPTIONS = ["none", "valid", "broken"] as const;
type ImageOption = (typeof IMAGE_OPTIONS)[number];

const IMAGE_LABELS: Record<ImageOption, string> = {
  none: "Sem imagem",
  valid: "Válida",
  broken: "Quebrada",
};

const AVATAR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#7c3aed'/><circle cx='32' cy='26' r='12' fill='#ffffff'/><rect x='14' y='42' width='36' height='22' rx='11' fill='#ffffff'/></svg>";
const AVATAR_IMAGE = `data:image/svg+xml,${encodeURIComponent(AVATAR_SVG)}`;
const BROKEN_IMAGE = "data:image/png;base64,invalid";

const FALLBACKS = ["AO", "BS", "GC", "DF", "EL", "FM"] as const;

export function AvatarPlayground() {
  const [size, setSize] = useState<AvatarSize>("default");
  const [image, setImage] = useState<ImageOption>("none");
  const [badge, setBadge] = useState(false);
  const [text, setText] = useState("UZ");

  return (
    <PropsPlayground
      caption={`${size} · ${SIZE_PX[size]}px`}
      preview={
        <PrismAvatar size={size}>
          {image !== "none" && (
            <PrismAvatarImage
              alt="Avatar de exemplo"
              key={image}
              src={image === "valid" ? AVATAR_IMAGE : BROKEN_IMAGE}
            />
          )}
          <PrismAvatarFallback>{text}</PrismAvatarFallback>
          {badge && (
            <PrismAvatarBadge>
              <CheckIcon />
            </PrismAvatarBadge>
          )}
        </PrismAvatar>
      }
      title="Avatar"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={AVATAR_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Imagem"
        onChange={setImage}
        optionLabels={IMAGE_LABELS}
        options={IMAGE_OPTIONS}
        prop="PrismAvatarImage"
        value={image}
      />
      <PlaygroundBoolean
        label="Selo"
        onChange={setBadge}
        prop="PrismAvatarBadge"
        value={badge}
      />
      <PlaygroundText
        label="Texto"
        onChange={setText}
        prop="PrismAvatarFallback"
        value={text}
      />
    </PropsPlayground>
  );
}

export function AvatarGroupPlayground() {
  const [size, setSize] = useState<AvatarSize>("default");
  const [showCount, setShowCount] = useState(true);
  const [count, setCount] = useState(4);

  return (
    <PropsPlayground
      caption={`${count} avatares${showCount ? " · com contador (+3)" : ""}`}
      preview={
        <PrismAvatarGroup>
          {FALLBACKS.slice(0, count).map((fb) => (
            <PrismAvatar key={fb} size={size}>
              <PrismAvatarFallback>{fb}</PrismAvatarFallback>
            </PrismAvatar>
          ))}
          {showCount && <PrismAvatarGroupCount>+3</PrismAvatarGroupCount>}
        </PrismAvatarGroup>
      }
      title="AvatarGroup"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={AVATAR_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Contador extra"
        onChange={setShowCount}
        prop="PrismAvatarGroupCount"
        value={showCount}
      />
      <PlaygroundNumber
        label="Quantidade de avatares"
        max={6}
        min={2}
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

export function AvatarSection() {
  return (
    <div id="prism-avatar">
      <GallerySection>
        <GallerySectionHeader
          description="Avatar circular do Prism com imagem, fallback, selo e grupo. No app aparece por meio de UAvatar."
          title="Avatar"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Avatar">
            <AvatarPlayground />
          </GalleryItem>
          <GalleryItem label="AvatarGroup">
            <AvatarGroupPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}

