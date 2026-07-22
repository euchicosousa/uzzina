import { IconSend, IconTrash, IconCheckFilled } from "@tabler/icons-react";
import { PrismButton } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function ButtonSection() {
  return (
    <div id="prism-button">
      <GallerySection>
        <GallerySectionHeader
          description="Componente de botão baseado no React Aria Components com suporte a estados nativos e ícones do Tabler."
          title="PrismButton"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Variants (default, secondary, outline, ghost, destructive, link)">
            <div className="flex flex-wrap gap-3">
              <PrismButton variant="default">Default</PrismButton>
              <PrismButton variant="secondary">Secondary</PrismButton>
              <PrismButton variant="outline">Outline</PrismButton>
              <PrismButton variant="ghost">Ghost</PrismButton>
              <PrismButton variant="destructive">Destructive</PrismButton>
              <PrismButton variant="link">Link</PrismButton>
            </div>
          </GalleryItem>

          <GalleryItem label="Sizes (xs, sm, default, lg)">
            <div className="flex items-center flex-wrap gap-3">
              <PrismButton size="xs">Extra Small (xs)</PrismButton>
              <PrismButton size="sm">Small (sm)</PrismButton>
              <PrismButton size="default">Default</PrismButton>
              <PrismButton size="lg">Large (lg)</PrismButton>
            </div>
          </GalleryItem>

          <GalleryItem label="Icon Buttons & Disabled States">
            <div className="flex flex-wrap items-center gap-3">
              <PrismButton variant="default">
                <IconSend className="size-5" />
                Enviar
              </PrismButton>
              <PrismButton
                aria-label="Excluir item"
                size="icon"
                variant="ghost"
              >
                <IconTrash className="size-5 text-destructive" />
              </PrismButton>
              <PrismButton
                aria-label="Confirmar"
                size="icon-sm"
                variant="secondary"
              >
                <IconCheckFilled className="size-5" />
              </PrismButton>
              <PrismButton isDisabled variant="default">
                Disabled
              </PrismButton>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
