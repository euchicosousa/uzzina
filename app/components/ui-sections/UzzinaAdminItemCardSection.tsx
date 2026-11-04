import { useState } from "react";
import { UAdminItemCard } from "~/components/uzzina/UAdminItemCard";
import { PrismBadge } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

export function AdminItemCardPlayground() {
  const [useCustomColors, setUseCustomColors] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  const [title, setTitle] = useState("Alfa Odontologia");
  const [fallback, setFallback] = useState("AO");

  return (
    <PropsPlayground
      caption={`${title} · ${fallback}${showBadge ? " · com selo" : ""}`}
      preview={
        <div className="w-full max-w-md">
          <UAdminItemCard
            avatarBgColor={useCustomColors ? "#2563eb" : undefined}
            avatarColor={useCustomColors ? "#ffffff" : undefined}
            badge={
              showBadge ? (
                <PrismBadge variant="secondary">Arquivado</PrismBadge>
              ) : undefined
            }
            fallback={fallback}
            subtitle={showSubtitle ? "marketing · 3 pessoas" : undefined}
            title={title}
            to="/ui"
          />
        </div>
      }
      title="UAdminItemCard"
    >
      <PlaygroundBoolean
        label="Cores próprias"
        onChange={setUseCustomColors}
        prop="avatarBgColor"
        value={useCustomColors}
      />
      <PlaygroundBoolean
        label="Subtítulo"
        onChange={setShowSubtitle}
        prop="subtitle"
        value={showSubtitle}
      />
      <PlaygroundBoolean
        label="Selo"
        onChange={setShowBadge}
        prop="badge"
        value={showBadge}
      />
      <PlaygroundText
        label="Título"
        onChange={setTitle}
        prop="title"
        value={title}
      />
      <PlaygroundText
        label="Texto do avatar"
        onChange={setFallback}
        prop="fallback"
        value={fallback}
      />
    </PropsPlayground>
  );
}

export function UzzinaAdminItemCardSection() {
  return (
    <div id="uzzina-admin-item-card">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Item de lista da administração (parceiros, pessoas), com avatar, título, selo e subtítulo."
          title="UAdminItemCard"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UAdminItemCard">
            <AdminItemCardPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
