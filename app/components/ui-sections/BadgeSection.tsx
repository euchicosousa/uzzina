import { PrismBadge, PrismKbd } from "~/components/prism";
import { CheckIcon, XIcon, StarIcon } from "lucide-react";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
export function BadgeSection() {
  return (
    <div id="prism-badge">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Etiquetas visuais semânticas para contadores, status de processos e marcas de identificação."
          title="Badge"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Variants Básicas (default, secondary, outline, ghost, destructive)">
            <div className="flex flex-wrap items-center gap-3">
              <PrismBadge variant="default">Default</PrismBadge>
              <PrismBadge variant="secondary">Secondary</PrismBadge>
              <PrismBadge variant="outline">Outline</PrismBadge>
              <PrismBadge variant="ghost">Ghost</PrismBadge>
              <PrismBadge variant="destructive">Destrutivo</PrismBadge>
            </div>
          </GalleryItem>

          <GalleryItem label="Variants Semânticas OKLCH (success, error, warning, info)">
            <div className="flex flex-wrap items-center gap-3">
              <PrismBadge variant="success">
                <CheckIcon />
                Aprovado
              </PrismBadge>
              <PrismBadge variant="error">
                <XIcon />
                Erro
              </PrismBadge>
              <PrismBadge variant="warning">
                <StarIcon />
                Pendente
              </PrismBadge>
              <PrismBadge variant="info">
                <CheckIcon />
                Processando
              </PrismBadge>
            </div>
          </GalleryItem>

          <GalleryItem label="PrismKbd ao lado de PrismBadge">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <PrismBadge variant="default">Busca</PrismBadge>
                <PrismKbd>⌘K</PrismKbd>
              </div>
              <div className="flex items-center gap-2">
                <PrismBadge variant="secondary">Salvar</PrismBadge>
                <PrismKbd>⌘S</PrismKbd>
              </div>
              <div className="flex items-center gap-2">
                <PrismBadge variant="outline">Ação Secundária</PrismBadge>
                <PrismKbd>Shift + Enter</PrismKbd>
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
