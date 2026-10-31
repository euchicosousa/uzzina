import {
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
  PrismInput,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

export function TabsSection() {
  return (
    <div id="prism-tabs">
      <GallerySection>
        <GallerySectionHeader
          title="PrismTabs"
          description="Abas alternam painéis. A linha inferior indica seleção; a superior indica foco pelo teclado. Escolhas de valores continuam usando os seletores existentes."
        />
        <GallerySectionContent>
          <PrismTabs defaultSelectedKey="details" className="max-w-xl">
            <PrismTabList aria-label="Exemplo de abas">
              <PrismTab id="details">Informações</PrismTab>
              <PrismTab id="preview">Prévia</PrismTab>
              <PrismTab id="disabled" isDisabled>
                Indisponível
              </PrismTab>
            </PrismTabList>
            <PrismTabPanel id="details" shouldForceMount className="py-4">
              <PrismInput
                aria-label="Rascunho do exemplo"
                placeholder="O texto permanece ao trocar de aba"
              />
            </PrismTabPanel>
            <PrismTabPanel id="preview" shouldForceMount className="py-4">
              Use as setas para alternar abas e Tab para entrar no painel.
            </PrismTabPanel>
          </PrismTabs>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
