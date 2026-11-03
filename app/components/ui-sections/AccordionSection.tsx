import {
  PrismAccordion,
  PrismAccordionItem,
  PrismAccordionTrigger,
  PrismAccordionContent,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function AccordionSection() {
  return (
    <div id="prism-accordion" className="w-full max-w-full min-w-0">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Não usado no app hoje."
          title="Accordion"
        />
        <GallerySectionContent className="grid w-full max-w-2xl min-w-0 gap-6">
          <GalleryItem
            className="w-full min-w-0"
            label="Demonstração com truncamento e estados recolhido/expandido"
          >
            <PrismAccordion
              allowsMultipleExpanded
              className="w-full min-w-0"
              defaultExpandedKeys={["item-1", "item-5"]}
            >
              <PrismAccordionItem id="item-1">
                <PrismAccordionTrigger>O que é o Uzzina?</PrismAccordionTrigger>
                <PrismAccordionContent>
                  Plataforma de gestão operacional e produção de conteúdo da
                  agência CNVT.
                </PrismAccordionContent>
              </PrismAccordionItem>
              <PrismAccordionItem id="item-2">
                <PrismAccordionTrigger>
                  Como funcionam os prazos?
                </PrismAccordionTrigger>
                <PrismAccordionContent>
                  Cada ação possui sprints, data de execução e fases bem
                  definidas.
                </PrismAccordionContent>
              </PrismAccordionItem>
              <PrismAccordionItem id="item-3">
                <PrismAccordionTrigger>
                  Quem tem acesso ao portal?
                </PrismAccordionTrigger>
                <PrismAccordionContent>
                  Clientes comerciais da agência e membros da equipe com papéis
                  autorizados.
                </PrismAccordionContent>
              </PrismAccordionItem>
              <PrismAccordionItem id="item-4">
                <PrismAccordionTrigger>
                  Exemplo de título muito longo demonstrativo para validação do
                  comportamento de truncamento com reticências (truncate) em
                  linhas horizontais quando o item estiver recolhido
                </PrismAccordionTrigger>
                <PrismAccordionContent>
                  Quando o texto do cabeçalho excede a largura útil do
                  contêiner, o texto trunca suavemente com reticências sem
                  quebrar a altura nem empurrar o ícone chevron.
                </PrismAccordionContent>
              </PrismAccordionItem>
              <PrismAccordionItem id="item-5">
                <PrismAccordionTrigger>
                  Exemplo de título muito longo demonstrativo para validação do
                  comportamento de truncamento com reticências (truncate) em
                  linhas horizontais quando o item estiver expandido
                </PrismAccordionTrigger>
                <PrismAccordionContent>
                  Mesmo quando expandido, o cabeçalho mantém rigorosamente o
                  mesmo truncamento com reticências e largura contida, sem
                  deslocar o ícone chevron ou vazar para fora do contêiner.
                </PrismAccordionContent>
              </PrismAccordionItem>
            </PrismAccordion>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
