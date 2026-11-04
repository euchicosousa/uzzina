import { useState } from "react";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import { MOCK_PARTNERS, MOCK_PEOPLE } from "./gallery-mocks";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundBoolean,
  PlaygroundNumber,
  PlaygroundText,
} from "./PropsPlayground";

const AVATAR_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
type AvatarSize = (typeof AVATAR_SIZES)[number];

const ALL_MOCK_AVATARS = [
  ...MOCK_PARTNERS.map((p) => ({
    fallback: p.short,
    backgroundColor: p.colors[0],
    color: p.colors[1] ?? "#ffffff",
  })),
  ...MOCK_PEOPLE.map((p) => ({
    fallback: p.short,
    backgroundColor: "#6366f1",
    color: "#ffffff",
  })),
];

function UAvatarPlayground() {
  const [size, setSize] = useState<AvatarSize>("md");
  const [customColors, setCustomColors] = useState(false);
  const [fallback, setFallback] = useState("UZ");

  const bgColor = customColors ? "#2563eb" : undefined;
  const textColor = customColors ? "#ffffff" : undefined;

  return (
    <PropsPlayground
      caption={`size="${size}" · fallback="${fallback}"`}
      preview={
        <div className="flex items-center justify-center p-4">
          <UAvatar
            backgroundColor={bgColor}
            color={textColor}
            fallback={fallback}
            size={size}
          />
        </div>
      }
      title="UAvatar"
    >
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={AVATAR_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Cores próprias"
        onChange={setCustomColors}
        prop="backgroundColor / color"
        value={customColors}
      />
      <PlaygroundText
        label="Texto"
        onChange={setFallback}
        prop="fallback"
        value={fallback}
      />
    </PropsPlayground>
  );
}

function UAvatarGroupPlayground() {
  const [size, setSize] = useState<AvatarSize>("md");
  const [count, setCount] = useState(5);
  const [clampAt, setClampAt] = useState(3);

  const avatars = ALL_MOCK_AVATARS.slice(0, count);
  const effectiveClamp = clampAt > 0 ? clampAt : undefined;

  return (
    <PropsPlayground
      caption={`size="${size}" · ${count} avatares · clampAt={${clampAt === 0 ? "undefined" : clampAt}}`}
      preview={
        <div className="flex items-center justify-center p-4">
          <UAvatarGroup
            avatars={avatars}
            clampAt={effectiveClamp}
            size={size}
          />
        </div>
      }
      title="UAvatarGroup"
    >
      <PlaygroundSelect
        label="Tamanho"
        onChange={setSize}
        options={AVATAR_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundNumber
        label="Quantidade de avatares"
        max={8}
        min={1}
        onChange={setCount}
        prop="avatars"
        step={1}
        value={count}
      />
      <PlaygroundNumber
        label="Limite"
        max={8}
        min={0}
        onChange={setClampAt}
        prop="clampAt"
        step={1}
        value={clampAt}
      />
    </PropsPlayground>
  );
}

export function UzzinaAvatarSection() {
  return (
    <div id="uzzina-avatar">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Sistema de avatares individuais e agrupados em todos os tamanhos suportados."
          title="UAvatar e UAvatarGroup"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem id="uzzina-avatar-uavatar" label="UAvatar">
            <UAvatarPlayground />
          </GalleryItem>
          <GalleryItem id="uzzina-avatar-uavatargroup" label="UAvatarGroup">
            <UAvatarGroupPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
