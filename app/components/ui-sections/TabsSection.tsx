import { useState } from "react";
import {
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
  type TabsVariant,
} from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundBoolean,
  PlaygroundNumber,
} from "./PropsPlayground";

const TABS_VARIANTS = ["underline", "drawer"] as const;
const TABS_VARIANT_LABELS: Record<TabsVariant, string> = {
  underline: "Linha inferior",
  drawer: "Gaveta",
};

const ALL_TABS = [
  {
    id: "essential",
    label: "Essencial",
    content:
      "Configurações essenciais da ação: título, datas, responsáveis e fase.",
  },
  {
    id: "instagram",
    label: "Instagram",
    content: "Configurações de publicação, legenda e mídias para o Instagram.",
  },
  {
    id: "observations",
    label: "Observações",
    content: "Histórico de notas internas, comentários da equipe e diretrizes.",
  },
  {
    id: "history",
    label: "Histórico",
    content: "Linha do tempo de alterações e revisões desta ação.",
  },
];

function TabsPlayground() {
  const [variant, setVariant] = useState<TabsVariant>("underline");
  const [disableLast, setDisableLast] = useState(false);
  const [count, setCount] = useState(3);

  const currentTabs = ALL_TABS.slice(0, count);
  const lastTabId = currentTabs[currentTabs.length - 1]?.id;
  const disabledKeys = disableLast && lastTabId ? [lastTabId] : [];

  return (
    <PropsPlayground
      caption={`variant="${variant}" · ${count} abas${disableLast ? " · última desabilitada" : ""}`}
      preview={
        <div className="w-full max-w-xl">
          <PrismTabs
            defaultSelectedKey="essential"
            disabledKeys={disabledKeys}
            variant={variant}
          >
            <PrismTabList aria-label="Navegação por abas">
              {currentTabs.map((tab) => (
                <PrismTab id={tab.id} key={tab.id}>
                  {tab.label}
                </PrismTab>
              ))}
            </PrismTabList>
            {variant === "drawer" ? (
              <div className="border-x border-b border-border bg-popover p-4">
                {currentTabs.map((tab) => (
                  <PrismTabPanel id={tab.id} key={tab.id} shouldForceMount>
                    <p className="text-sm text-secondary-foreground">
                      {tab.content}
                    </p>
                  </PrismTabPanel>
                ))}
              </div>
            ) : (
              currentTabs.map((tab) => (
                <PrismTabPanel
                  className="py-4"
                  id={tab.id}
                  key={tab.id}
                  shouldForceMount
                >
                  <p className="text-sm text-secondary-foreground">{tab.content}</p>
                </PrismTabPanel>
              ))
            )}
          </PrismTabs>
        </div>
      }
      title="Tabs"
    >
      <PlaygroundRadio
        label="Variante"
        onChange={setVariant}
        optionLabels={TABS_VARIANT_LABELS}
        options={TABS_VARIANTS}
        prop="variant"
        value={variant}
      />
      <PlaygroundBoolean
        label="Última aba desabilitada"
        onChange={setDisableLast}
        prop="disabledKeys"
        value={disableLast}
      />
      <PlaygroundNumber
        label="Quantidade de abas"
        max={4}
        min={2}
        onChange={setCount}
        prop="count"
        step={1}
        value={count}
      />
    </PropsPlayground>
  );
}

export function TabsSection() {
  return (
    <div id="prism-tabs">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Abas com suporte a dois estilos de navegação: Linha Inferior (padrão com bordas limpas) e Estilo Gaveta (linha superior e união transparente com o painel). Ambas possuem larguras estáveis e sem bordas superiores arredondadas."
          title="Tabs"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Tabs">
            <TabsPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
