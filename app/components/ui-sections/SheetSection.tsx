import { useState } from "react";
import {
  PrismButton,
  PrismSheet,
  PrismSheetClose,
  PrismSheetDescription,
  PrismSheetFooter,
  PrismSheetHeader,
  PrismSheetTitle,
  PrismSheetTrigger,
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

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const;
type SheetSide = (typeof SHEET_SIDES)[number];

const SIDE_LABELS: Record<SheetSide, string> = {
  top: "Topo",
  right: "Direita",
  bottom: "Base",
  left: "Esquerda",
};

const PARAGRAPH_NUMBERS = Array.from({ length: 15 }, (_, index) => index + 1);

export function SheetPlayground() {
  const [side, setSide] = useState<SheetSide>("right");
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [isDismissable, setIsDismissable] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [isLongContent, setIsLongContent] = useState(false);

  return (
    <PropsPlayground
      caption={`side="${side}"`}
      preview={
        <PrismSheetTrigger>
          <PrismButton variant="outline">Abrir painel</PrismButton>
          <PrismSheet
            isDismissable={isDismissable}
            showCloseButton={showCloseButton}
            side={side}
          >
            {showHeader ? (
              <PrismSheetHeader>
                <PrismSheetTitle>Editar parceiro</PrismSheetTitle>
                <PrismSheetDescription>
                  Altere os dados e salve.
                </PrismSheetDescription>
              </PrismSheetHeader>
            ) : (
              <PrismSheetTitle className="sr-only">
                Painel de exemplo
              </PrismSheetTitle>
            )}
            <div className="flex-1 overflow-y-auto px-6 text-sm">
              {isLongContent ? (
                <div className="flex flex-col gap-3 py-4">
                  {PARAGRAPH_NUMBERS.map((number) => (
                    <p key={number}>
                      Parágrafo {number}: Informações complementares de teste
                      para verificar a rolagem independente dentro do painel
                      modal do Sheet.
                    </p>
                  ))}
                </div>
              ) : (
                <p className="py-4">
                  Conteúdo principal do painel. Todos os elementos respeitam a
                  rolagem e as bordas do painel lateral.
                </p>
              )}
            </div>
            {showFooter && (
              <PrismSheetFooter>
                <div className="flex items-center justify-end gap-2">
                  <PrismSheetClose>Cancelar</PrismSheetClose>
                  <PrismSheetClose variant="default">Salvar</PrismSheetClose>
                </div>
              </PrismSheetFooter>
            )}
          </PrismSheet>
        </PrismSheetTrigger>
      }
      title="Sheet"
    >
      <PlaygroundRadio
        label="Lado"
        onChange={setSide}
        optionLabels={SIDE_LABELS}
        options={SHEET_SIDES}
        prop="side"
        value={side}
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
        label="Cabeçalho"
        onChange={setShowHeader}
        prop="PrismSheetHeader"
        value={showHeader}
      />
      <PlaygroundBoolean
        label="Rodapé"
        onChange={setShowFooter}
        prop="PrismSheetFooter"
        value={showFooter}
      />
      <PlaygroundBoolean
        label="Conteúdo longo"
        onChange={setIsLongContent}
        prop="isLongContent"
        value={isLongContent}
      />
    </PropsPlayground>
  );
}

export function SheetSection() {
  return (
    <div id="prism-sheet">
      <GallerySection>
        <GallerySectionHeader
          description="Painel modal preso a uma borda da janela. Não usado no app hoje."
          title="Sheet"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Sheet">
            <SheetPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
