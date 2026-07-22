import { PrismSeparator } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
export function SeparatorSection() {
  return (
    <div id="prism-separator">
      <GallerySection>
        <GallerySectionHeader
          description="Linhas divisórias horizontais e verticais para agrupamento e separação semântica de conteúdo."
          title="PrismSeparator"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem className="w-full max-w-md" label="Horizontal Separator">
            <div className="space-y-3">
              <div className="mb-2">
                <h5 className="mb-2">Uzzina Design System</h5>
                <p>Componentes de interface proprietários para o painel.</p>
              </div>
              <PrismSeparator />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Documentação</span>
                <span>Componentes</span>
                <span>Tokens</span>
              </div>
            </div>
          </GalleryItem>

          <GalleryItem label="Vertical Separator">
            <div className="flex items-center gap-4 h-6 text-sm">
              <span className="font-medium">Sprints</span>
              <PrismSeparator orientation="vertical" />
              <span className="font-medium">Ações</span>
              <PrismSeparator orientation="vertical" />
              <span className="font-medium">Calendário</span>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
