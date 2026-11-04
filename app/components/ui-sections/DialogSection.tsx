import { useState } from "react";
import {
  PrismDialogTrigger,
  PrismDialog,
  PrismDialogBody,
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
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundBoolean,
} from "./PropsPlayground";

const DIALOG_SIZES = ["sm", "default", "lg", "xl"] as const;
type DialogSize = (typeof DIALOG_SIZES)[number];

const DIALOG_PLACEMENTS = ["center", "top"] as const;
type DialogPlacement = (typeof DIALOG_PLACEMENTS)[number];
const DIALOG_PLACEMENT_LABELS: Record<DialogPlacement, string> = {
  center: "Centro",
  top: "Topo",
};

function DialogPlayground() {
  const [size, setSize] = useState<DialogSize>("default");
  const [placement, setPlacement] = useState<DialogPlacement>("center");
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [isDismissable, setIsDismissable] = useState(true);
  const [hasFooter, setHasFooter] = useState(true);
  const [longContent, setLongContent] = useState(false);

  return (
    <PropsPlayground
      caption={`size="${size}" · placement="${placement}"`}
      preview={
        <PrismDialogTrigger>
          <PrismButton variant="outline">Abrir diálogo</PrismButton>
          <PrismDialog
            isDismissable={isDismissable}
            placement={placement}
            showCloseButton={showCloseButton}
            size={size}
          >
            <PrismDialogHeader>
              <PrismDialogTitle>Confirmar Alteração</PrismDialogTitle>
              <PrismDialogDescription>
                Esta ação atualizará as configurações operacionais do parceiro.
              </PrismDialogDescription>
            </PrismDialogHeader>
            <PrismDialogBody>
              {longContent ? (
                Array.from({ length: 12 }, (_, i) => (
                  <p
                    className="mb-3 text-sm text-foreground"
                    key={`p-${i + 1}`}
                  >
                    Parágrafo {i + 1}: Demonstração de conteúdo extenso dentro
                    do corpo do diálogo para testar a contenção de altura e
                    rolagem vertical suave sem quebrar a área de cabeçalho ou
                    rodapé.
                  </p>
                ))
              ) : (
                <p className="text-sm text-foreground">
                  Deseja prosseguir com a atualização? As modificações serão
                  sincronizadas imediatamente.
                </p>
              )}
            </PrismDialogBody>
            {hasFooter && (
              <PrismDialogFooter>
                <PrismDialogClose variant="outline">Cancelar</PrismDialogClose>
                <PrismButton
                  onPress={() => toast.success("Ação confirmada!")}
                  variant="default"
                >
                  Confirmar
                </PrismButton>
              </PrismDialogFooter>
            )}
          </PrismDialog>
        </PrismDialogTrigger>
      }
      title="Dialog"
    >
      <PlaygroundRadio
        label="Largura"
        onChange={setSize}
        options={DIALOG_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Posição"
        onChange={setPlacement}
        optionLabels={DIALOG_PLACEMENT_LABELS}
        options={DIALOG_PLACEMENTS}
        prop="placement"
        value={placement}
      />
      <PlaygroundBoolean
        label="Botão fechar (X)"
        onChange={setShowCloseButton}
        prop="showCloseButton"
        value={showCloseButton}
      />
      <PlaygroundBoolean
        label="Fecha ao clicar fora"
        onChange={setIsDismissable}
        prop="isDismissable"
        value={isDismissable}
      />
      <PlaygroundBoolean
        label="Com rodapé"
        onChange={setHasFooter}
        prop="PrismDialogFooter"
        value={hasFooter}
      />
      <PlaygroundBoolean
        label="Conteúdo longo"
        onChange={setLongContent}
        prop="longContent"
        value={longContent}
      />
    </PropsPlayground>
  );
}

export function DialogSection() {
  return (
    <div id="prism-dialog">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Modais de caixa de diálogo com tratamento nativo de foco, acessibilidade e escurecimento do fundo."
          title="Dialog"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Dialog">
            <DialogPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
