import { PrismSkeleton, PrismSkeletonGroup } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function SkeletonSection() {
  return (
    <div id="prism-skeleton">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Marcadores de carregamento com animação de pulso e cantos squircle. Exemplos baseados nos usos reais da aplicação."
          title="Skeleton"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Cards de Sprint (HomeSprintView)">
            <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              <PrismSkeleton className="h-28 rounded-2xl" />
              <PrismSkeleton className="h-28 rounded-2xl" delay={100} />
              <PrismSkeleton className="h-28 rounded-2xl" delay={200} />
              <PrismSkeleton className="h-28 rounded-2xl" delay={300} />
            </div>
          </GalleryItem>

          <GalleryItem label="Ações em Célula de Calendário (CalendarDayCell)">
            <div className="w-64 rounded-2xl border bg-card p-3 squircle">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">
                Hoje · 3 ações
              </span>
              <PrismSkeletonGroup
                className="gap-1.5"
                count={3}
                delay={200}
                orientation="vertical"
              />
            </div>
          </GalleryItem>

          <GalleryItem label="Mural de Parceiros / Perfis (PartnersBoard)">
            <div className="w-full max-w-2xl">
              <PrismSkeletonGroup
                count={6}
                isWrapped={false}
                variant="profile"
              />
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
