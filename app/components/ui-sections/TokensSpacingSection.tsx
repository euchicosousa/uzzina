import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function TokensSpacingSection() {
  return (
    <div id="spacing">
      <GallerySection>
        <GallerySectionHeader
          description="Garante que os layouts dobrem as margens a cada nível da escala para manter a fluidez visual."
          title="Espaçamento Exponencial"
        />
        <GallerySectionContent>
          <GalleryItem
            className="w-full max-w-md space-y-4"
            label="Escala Modular"
          >
            <div className="flex items-center gap-4">
              <span className="w-12 text-xs font-mono">4px (xs)</span>
              <div
                className="h-4 bg-primary rounded"
                style={{
                  width: "4px",
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-12 text-xs font-mono">8px (sm)</span>
              <div
                className="h-4 bg-primary rounded"
                style={{
                  width: "8px",
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-12 text-xs font-mono">16px (md)</span>
              <div
                className="h-4 bg-primary rounded"
                style={{
                  width: "16px",
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="w-12 text-xs font-mono">32px (lg)</span>
              <div
                className="h-4 bg-primary rounded"
                style={{
                  width: "32px",
                }}
              />
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
