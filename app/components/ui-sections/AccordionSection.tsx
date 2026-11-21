import { useState } from "react";
import { InfoIcon } from "lucide-react";
import {
  PrismAccordion,
  PrismAccordionItem,
  PrismAccordionTrigger,
  PrismAccordionContent,
  PrismButton,
} from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundBoolean,
  PlaygroundNumber,
} from "./PropsPlayground";

const ALL_ITEMS = [
  {
    id: "item-1",
    shortTitle: "O que é o Uzzina?",
    longTitle:
      "Exemplo de título muito longo demonstrativo para validação do comportamento de truncamento com reticências (truncate) em linhas horizontais quando o item estiver recolhido",
    content:
      "Plataforma de gestão operacional e produção de conteúdo da agência CNVT.",
  },
  {
    id: "item-2",
    shortTitle: "Como funcionam os prazos?",
    longTitle: "Como funcionam os prazos?",
    content:
      "Cada ação possui sprints, data de execução e fases bem definidas.",
  },
  {
    id: "item-3",
    shortTitle: "Quem tem acesso ao portal?",
    longTitle: "Quem tem acesso ao portal?",
    content:
      "Clientes comerciais da agência e membros da equipe com papéis autorizados.",
  },
  {
    id: "item-4",
    shortTitle:
      "Exemplo de título longo de teste para validação de layout no quarto item",
    longTitle:
      "Exemplo de título muito longo demonstrativo para validação do comportamento de truncamento com reticências (truncate) em linhas horizontais quando o item estiver recolhido",
    content:
      "Quando o texto do cabeçalho excede a largura útil do contêiner, o texto trunca suavemente com reticências sem quebrar a altura nem empurrar o ícone chevron.",
  },
  {
    id: "item-5",
    shortTitle:
      "Exemplo de quinto item demonstrativo para validação de truncamento em linhas horizontais",
    longTitle:
      "Exemplo de título muito longo demonstrativo para validação do comportamento de truncamento com reticências (truncate) em linhas horizontais quando o item estiver expandido",
    content:
      "Mesmo quando expandido, o cabeçalho mantém rigorosamente o mesmo truncamento com reticências e largura contida, sem deslocar o ícone chevron ou vazar para fora do contêiner.",
  },
];

function AccordionPlayground() {
  const [allowsMultipleExpanded, setAllowsMultipleExpanded] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [useLongTitle, setUseLongTitle] = useState(false);
  const [count, setCount] = useState(3);
  const [withInfo, setWithInfo] = useState(false);
  const [isCard, setIsCard] = useState(false);

  const visibleItems = ALL_ITEMS.slice(0, count);

  return (
    <PropsPlayground
      caption={`allowsMultipleExpanded={${allowsMultipleExpanded}} · ${count} itens`}
      preview={
        <div className="w-full max-w-2xl min-w-0">
          <PrismAccordion
            allowsMultipleExpanded={allowsMultipleExpanded}
            className="w-full min-w-0"
            defaultExpandedKeys={["item-1"]}
            isDisabled={isDisabled}
            key={`${allowsMultipleExpanded}`}
            variant={isCard ? "card" : "default"}
          >
            {visibleItems.map((item, index) => {
              const title =
                index === 0 && useLongTitle ? item.longTitle : item.shortTitle;
              return (
                <PrismAccordionItem id={item.id} key={item.id}>
                  {withInfo ? (
                    <PrismAccordionTrigger aria-label={title} info>
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{title}</span>
                        <PrismButton
                          aria-label={`Informação sobre ${title}`}
                          className="pointer-events-auto relative z-10 shrink-0"
                          size="icon-xs"
                          variant="ghost"
                        >
                          <InfoIcon />
                        </PrismButton>
                      </span>
                    </PrismAccordionTrigger>
                  ) : (
                    <PrismAccordionTrigger>{title}</PrismAccordionTrigger>
                  )}
                  <PrismAccordionContent>{item.content}</PrismAccordionContent>
                </PrismAccordionItem>
              );
            })}
          </PrismAccordion>
        </div>
      }
      title="Accordion"
    >
      <PlaygroundBoolean
        label="Vários abertos"
        onChange={setAllowsMultipleExpanded}
        prop="allowsMultipleExpanded"
        value={allowsMultipleExpanded}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Título longo (trunca)"
        onChange={setUseLongTitle}
        prop="useLongTitle"
        value={useLongTitle}
      />
      <PlaygroundBoolean
        label="Com botão de info (info)"
        onChange={setWithInfo}
        prop="info"
        value={withInfo}
      />
      <PlaygroundBoolean
        label="Fundo de card (variant=card)"
        onChange={setIsCard}
        prop="variant"
        value={isCard}
      />
      <PlaygroundNumber
        label="Quantidade de itens"
        max={5}
        min={1}
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

export function AccordionSection() {
  return (
    <div className="w-full max-w-full min-w-0" id="prism-accordion">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Variantes: default (sem fundo, hover em bg-secondary) e card (fundo fixo bg-card, hover em bg-secondary-hover). Usado na gaveta de ação (default) e no editor de temas (card)."
          title="Accordion"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Accordion">
            <AccordionPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
