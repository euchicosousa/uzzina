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
            <div className="grid grid-cols-4 gap-8">
              {[
                {
                  title: "4px (xs)",
                  value: "4px",
                },
                {
                  title: "8px (sm)",
                  value: "8px",
                },
                {
                  title: "16px (md)",
                  value: "16px",
                },
                {
                  title: "32px (lg)",
                  value: "32px",
                },
              ].map((item) => (
                <div className="flex items-center gap-4" key={item.value}>
                  <div className="w-20 font-mono text-xs whitespace-nowrap">
                    {item.title}
                  </div>
                  <div className="w-full bg-secondary">
                    <div
                      className="h-4 bg-primary"
                      style={{
                        width: item.value,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
