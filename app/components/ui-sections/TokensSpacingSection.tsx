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
          <GalleryItem className="w-full space-y-4" label="Escala Modular">
            <div className="flex items-center gap-4">
              <span className="w-12 font-mono text-xs">4px (xs)</span>
              <div className="w-full rounded bg-secondary">
                <div
                  className="h-4 rounded bg-primary"
                  style={{
                    width: "4px",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-12 font-mono text-xs">8px (sm)</span>
              <div className="w-full rounded bg-secondary">
                <div
                  className="h-4 rounded bg-primary"
                  style={{
                    width: "8px",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-12 font-mono text-xs">16px (md)</span>
              <div className="w-full rounded bg-secondary">
                <div
                  className="h-4 rounded bg-primary"
                  style={{
                    width: "16px",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-12 font-mono text-xs">32px (lg)</span>
              <div className="w-full rounded bg-secondary">
                <div
                  className="h-4 rounded bg-primary"
                  style={{
                    width: "32px",
                  }}
                />
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
