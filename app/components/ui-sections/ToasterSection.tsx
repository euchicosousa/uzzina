import { PrismButton, toast } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

function ToasterDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <PrismButton
        variant="ghost"
        onClick={() => toast.success("Operação realizada com sucesso!")}
      >
        Success Toast
      </PrismButton>
      <PrismButton
        variant="ghost"
        onClick={() => toast.error("Ocorreu um erro ao salvar.")}
      >
        Error Toast
      </PrismButton>
      <PrismButton
        variant="ghost"
        onClick={() => toast.info("Nova atualização disponível.")}
      >
        Info Toast
      </PrismButton>
      <PrismButton
        variant="ghost"
        onClick={() => toast.warning("Atenção aos campos obrigatórios.")}
      >
        Warning Toast
      </PrismButton>
    </div>
  );
}

export function ToasterSection() {
  return (
    <div id="prism-toaster">
      <GallerySection>
        <GallerySectionHeader
          description="Notificações flutuantes (Toasts) acionadas por eventos ou ações da aplicação."
          title="PrismToaster"
        />
        <GallerySectionContent>
          <GalleryItem label="Disparar Toasts">
            <ToasterDemo />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
