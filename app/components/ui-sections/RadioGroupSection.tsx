import { useState } from "react";
import { PrismRadio, PrismRadioGroup } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

export function RadioGroupSection() {
  const [selectedVal, setSelectedVal] = useState("sprint");

  return (
    <div id="prism-radio-group">
      <GallerySection>
        <GallerySectionHeader
          description="Botões de rádio acessíveis baseados no React Aria Components com suporte a tamanhos, foco com anel OKLCH e estados ativados/desativados."
          title="PrismRadioGroup"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Variantes de Tamanho">
            <div className="flex items-center gap-8">
              <PrismRadioGroup defaultValue="sm" orientation="horizontal">
                <PrismRadio size="sm" value="sm">
                  Pequeno (sm)
                </PrismRadio>
              </PrismRadioGroup>
              <PrismRadioGroup defaultValue="default" orientation="horizontal">
                <PrismRadio size="default" value="default">
                  Padrão (default)
                </PrismRadio>
              </PrismRadioGroup>
              <PrismRadioGroup defaultValue="lg" orientation="horizontal">
                <PrismRadio size="lg" value="lg">
                  Grande (lg)
                </PrismRadio>
              </PrismRadioGroup>
            </div>
          </GalleryItem>

          <GalleryItem label="PrismRadioGroup Controlado">
            <div className="flex flex-col gap-3">
              <PrismRadioGroup
                value={selectedVal}
                onChange={setSelectedVal}
              >
                <PrismRadio value="sprint">Visão por Sprint</PrismRadio>
                <PrismRadio value="categories">Visão por Categorias</PrismRadio>
                <PrismRadio value="feed">Visão por Feed</PrismRadio>
                <PrismRadio isDisabled value="disabled">
                  Opção Desativada
                </PrismRadio>
              </PrismRadioGroup>
              <span className="font-mono text-xs text-muted-foreground">
                Selecionado: {selectedVal}
              </span>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
