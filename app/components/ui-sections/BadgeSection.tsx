import { PrismBadge } from "~/components/prism";
import {
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
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
          description="Etiquetas visuais semânticas para contadores, status de processos e marcas de identificação."
          title="PrismBadge"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Variants Básicas (default, secondary, outline, ghost, destructive)">
            <div className="flex flex-wrap gap-3 items-center">
              <PrismBadge variant="default">Default</PrismBadge>
              <PrismBadge variant="secondary">Secondary</PrismBadge>
              <PrismBadge variant="outline">Outline</PrismBadge>
              <PrismBadge variant="ghost">Ghost</PrismBadge>
              <PrismBadge variant="destructive">Destrutivo</PrismBadge>
            </div>
          </GalleryItem>

          <GalleryItem label="Variants Semânticas OKLCH (success, error, warning, info)">
            <div className="flex flex-wrap gap-3 items-center">
              <PrismBadge variant="success">
                <IconCheck />
                Aprovado
              </PrismBadge>
              <PrismBadge variant="error">
                <IconAlertTriangle />
                Erro
              </PrismBadge>
              <PrismBadge variant="warning">
                <IconAlertTriangle />
                Pendente
              </PrismBadge>
              <PrismBadge variant="info">
                <IconInfoCircle />
                Processando
              </PrismBadge>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
