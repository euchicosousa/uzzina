import {
  PrismButton,
  PrismSelect,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismSelectContent,
  PrismSelectItem,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

const SELECT_SIZES: { size: "sm" | "default" | "lg"; label: string }[] = [
  { size: "sm", label: "sm · h-8 / 32px" },
  { size: "default", label: "default · h-10 / 40px" },
  { size: "lg", label: "lg · h-12 / 48px" },
];

export function SelectSection() {
  return (
    <div id="prism-select">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Controle de seleção suspensa acessível baseado em React Aria Components, alinhado à escala e canto do botão."
          title="Select"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Tamanhos · campo ao lado de PrismButton do mesmo tamanho">
            <div className="grid gap-3">
              {SELECT_SIZES.map(({ size, label }) => (
                <div className="flex flex-wrap items-center gap-4" key={size}>
                  <span className="w-44 text-xs text-muted-foreground">
                    {label}
                  </span>
                  <PrismButton size={size} variant="default">
                    Botão
                  </PrismButton>
                  <PrismSelect
                    aria-label={`Select ${size}`}
                    className="w-56"
                    defaultSelectedKey="design"
                  >
                    <PrismSelectTrigger size={size}>
                      <PrismSelectValue />
                    </PrismSelectTrigger>
                    <PrismSelectContent>
                      <PrismSelectItem id="design">
                        Design Visual
                      </PrismSelectItem>
                      <PrismSelectItem id="copy">
                        Redação Publicitária
                      </PrismSelectItem>
                      <PrismSelectItem id="video">
                        Edição de Vídeo
                      </PrismSelectItem>
                    </PrismSelectContent>
                  </PrismSelect>
                </div>
              ))}
            </div>
          </GalleryItem>

          <GalleryItem label="Estados: Com valor selecionado e Desativado">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Com valor selecionado
                </span>
                <PrismSelect
                  aria-label="Opção selecionada"
                  className="w-56"
                  defaultSelectedKey="planejamento"
                >
                  <PrismSelectTrigger>
                    <PrismSelectValue />
                  </PrismSelectTrigger>
                  <PrismSelectContent>
                    <PrismSelectItem id="planejamento">
                      Planejamento
                    </PrismSelectItem>
                    <PrismSelectItem id="execucao">Execução</PrismSelectItem>
                    <PrismSelectItem id="revisao">Revisão</PrismSelectItem>
                  </PrismSelectContent>
                </PrismSelect>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Desativado
                </span>
                <PrismSelect
                  aria-label="Select desativado"
                  className="w-56"
                  defaultSelectedKey="bloqueado"
                  isDisabled
                >
                  <PrismSelectTrigger>
                    <PrismSelectValue />
                  </PrismSelectTrigger>
                  <PrismSelectContent>
                    <PrismSelectItem id="bloqueado">
                      Opção Bloqueada
                    </PrismSelectItem>
                  </PrismSelectContent>
                </PrismSelect>
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
