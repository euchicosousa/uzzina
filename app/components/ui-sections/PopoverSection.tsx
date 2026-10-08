import {
  PrismPopover,
  PrismPopoverTrigger,
  PrismButton,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function PopoverSection() {
  return (
    <div id="prism-popover">
      <GallerySection>
        <GallerySectionHeader
          description="Popover contextual construído sobre o React Aria Components com posicionamento automático e transições suaves."
          title="PrismPopover"
        />
        <GallerySectionContent>
          <GalleryItem label="Default Popover">
            <PrismPopoverTrigger>
              <PrismButton variant="default">Abrir Popover</PrismButton>
              <PrismPopover>
                <div className="flex w-48 flex-col gap-2">
                  <span className="text-sm font-semibold">Opções Rápidas</span>
                  <p className="text-xs text-muted-foreground">
                    Este é o conteúdo do popover de exemplo.
                  </p>
                </div>
              </PrismPopover>
            </PrismPopoverTrigger>
          </GalleryItem>

          <GalleryItem label="Popover alinhado no Topo">
            <PrismPopoverTrigger>
              <PrismButton variant="ghost">Ver Notificação</PrismButton>
              <PrismPopover placement="top">
                <div className="flex w-64 flex-col gap-1">
                  <span className="text-xs font-semibold text-primary">
                    NOVO AVISO
                  </span>
                  <p className="text-xs">
                    O PrismPopover se alinha perfeitamente com qualquer gatilho.
                  </p>
                </div>
              </PrismPopover>
            </PrismPopoverTrigger>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
