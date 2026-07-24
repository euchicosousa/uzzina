import { useState } from "react";
import { PrismCheckbox, PrismCheckboxGroup } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

export function CheckboxSection() {
  const [checked, setChecked] = useState(true);
  const [groupValues, setGroupValues] = useState<string[]>(["option1"]);

  return (
    <div id="prism-checkbox">
      <GallerySection>
        <GallerySectionHeader
          description="Caixas de seleção acessíveis nativas do React Aria com suporte a tamanhos, estados selecionado, indeterminado e desativado."
          title="PrismCheckbox"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="Variantes de Tamanho">
            <div className="flex items-center gap-6">
              <PrismCheckbox defaultSelected size="sm">
                Pequeno (sm)
              </PrismCheckbox>
              <PrismCheckbox defaultSelected size="default">
                Padrão (default)
              </PrismCheckbox>
              <PrismCheckbox defaultSelected size="lg">
                Grande (lg)
              </PrismCheckbox>
            </div>
          </GalleryItem>

          <GalleryItem label="Estados (Controlado, Indeterminado & Desativado)">
            <div className="flex items-center gap-6">
              <PrismCheckbox
                isSelected={checked}
                onChange={setChecked}
              >
                {checked ? "Selecionado" : "Desmarcado"}
              </PrismCheckbox>
              <PrismCheckbox isIndeterminate>
                Indeterminado
              </PrismCheckbox>
              <PrismCheckbox isDisabled>
                Desativado
              </PrismCheckbox>
              <PrismCheckbox defaultSelected isDisabled>
                Marcado & Desativado
              </PrismCheckbox>
            </div>
          </GalleryItem>

          <GalleryItem label="PrismCheckboxGroup">
            <div className="flex flex-col gap-2">
              <PrismCheckboxGroup
                value={groupValues}
                onChange={setGroupValues}
              >
                <PrismCheckbox value="option1">Opção 1 (Sprints)</PrismCheckbox>
                <PrismCheckbox value="option2">Opção 2 (Ações)</PrismCheckbox>
                <PrismCheckbox value="option3">Opção 3 (Parceiros)</PrismCheckbox>
              </PrismCheckboxGroup>
              <span className="font-mono text-xs text-muted-foreground">
                Selecionados no Grupo: {groupValues.join(", ")}
              </span>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
