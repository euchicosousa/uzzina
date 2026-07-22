import {
  PrismDialogTrigger,
  PrismDialog,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogClose,
  PrismButton,
  toast,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function DialogSection() {
  return (
    <div id="prism-dialog">
      <GallerySection>
        <GallerySectionHeader
          description="Modais de caixa de diálogo com tratamento nativo de foco, acessibilidade e escurecimento do fundo."
          title="PrismDialog"
        />
        <GallerySectionContent>
          <GalleryItem label="Modal Simples">
            <PrismDialogTrigger>
              <PrismButton variant="default">Abrir Modal</PrismButton>
              <PrismDialog>
                <PrismDialogHeader>
                  <PrismDialogTitle>Título do Modal</PrismDialogTitle>
                  <PrismDialogDescription>
                    Este é um modal simples construído com o design system Prism do Uzzina.
                  </PrismDialogDescription>
                </PrismDialogHeader>
                <div className="flex flex-col gap-2 py-4">
                  <p className="text-sm text-foreground">
                    Conteúdo dinâmico do modal. Suporta inputs, tabelas e botões adicionais de ação.
                  </p>
                </div>
                <PrismDialogFooter>
                  <PrismDialogClose variant="outline">
                    Cancelar
                  </PrismDialogClose>
                  <PrismButton
                    onPress={() => toast.success("Confirmado!")}
                    variant="default"
                  >
                    Confirmar Ação
                  </PrismButton>
                </PrismDialogFooter>
              </PrismDialog>
            </PrismDialogTrigger>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
