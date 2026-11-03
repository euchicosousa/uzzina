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
  GalleryItem,
} from "./GalleryHelperComponents";

export function TabsSection() {
  return (
    <div id="prism-tabs">
      <GallerySection>
        <GallerySectionHeader
          approved
          title="Tabs"
          description="Abas com suporte a dois estilos de navegação: Linha Inferior (padrão com bordas limpas) e Estilo Gaveta (linha superior e união transparente com o painel). Ambas possuem larguras estáveis e sem bordas superiores arredondadas."
        />
        <GallerySectionContent className="flex flex-col gap-10">
          <GalleryItem label="Linha Inferior (Underline · Padrão)">
            <PrismTabs
              defaultSelectedKey="details"
              className="w-full max-w-xl"
              variant="underline"
            >
              <PrismTabList aria-label="Exemplo de abas underline">
                <PrismTab id="details">Informações</PrismTab>
                <PrismTab id="preview">Prévia</PrismTab>
                <PrismTab id="history">Histórico</PrismTab>
                <PrismTab id="disabled" isDisabled>
                  Indisponível
                </PrismTab>
              </PrismTabList>
              <PrismTabPanel id="details" shouldForceMount className="py-4">
                <PrismInput
                  aria-label="Rascunho do exemplo"
                  placeholder="Painel de Informações — largura das abas permanece constante"
                />
              </PrismTabPanel>
              <PrismTabPanel
                id="preview"
                shouldForceMount
                className="py-4 text-sm text-muted-foreground"
              >
                Painel de Prévia — alterne entre as abas sem qualquer salto de
                layout.
              </PrismTabPanel>
              <PrismTabPanel
                id="history"
                shouldForceMount
                className="py-4 text-sm text-muted-foreground"
              >
                Painel de Histórico de ações e alterações.
              </PrismTabPanel>
            </PrismTabs>
          </GalleryItem>

          <GalleryItem label="Estilo Gaveta (Drawer · Linha superior + Encaixe no painel)">
            <PrismTabs
              defaultSelectedKey="essential"
              className="w-full max-w-xl"
              variant="drawer"
            >
              <PrismTabList aria-label="Exemplo de abas drawer">
                <PrismTab id="essential">ESSENCIAL</PrismTab>
                <PrismTab id="instagram">INSTAGRAM</PrismTab>
                <PrismTab id="observations">OBSERVAÇÕES</PrismTab>
              </PrismTabList>
              <div className="border-x border-b border-border bg-popover">
                <PrismTabPanel id="essential" shouldForceMount className="p-4">
                  <PrismInput
                    aria-label="Campo essencial"
                    placeholder="A aba ativa une com o painel (borda inferior transparente)"
                  />
                </PrismTabPanel>
                <PrismTabPanel
                  id="instagram"
                  shouldForceMount
                  className="p-4 text-sm text-muted-foreground"
                >
                  Configurações de publicação e legenda do Instagram.
                </PrismTabPanel>
                <PrismTabPanel
                  id="observations"
                  shouldForceMount
                  className="p-4 text-sm text-muted-foreground"
                >
                  Histórico de comentários e notas internas da equipe.
                </PrismTabPanel>
              </div>
            </PrismTabs>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
