import { useState } from "react";
import {
  UViewOptions,
  type UViewOptions as UViewOptionsType,
} from "~/components/uzzina/UViewOptions";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import { PropsPlayground, PlaygroundBoolean } from "./PropsPlayground";

export function UViewOptionsPlayground() {
  const [viewOptions, setViewOptions] = useState<UViewOptionsType>({
    variant: VARIANT.content,
    columns: 4,
    order: ORDER_BY.date,
    ascending: true,
    category: true,
    late: true,
    partner: true,
    responsibles: true,
    priority: true,
    showOptions: {
      variant: true,
      columns: true,
      limitHeight: true,
      responsibles: true,
      priority: true,
      category: true,
      partner: true,
      order: true,
      ascending: true,
      filter_category: true,
      filter_phase: true,
    },
  });

  const updateShowOption = (
    key: keyof NonNullable<UViewOptionsType["showOptions"]>,
    val: boolean,
  ) => {
    setViewOptions((prev) => ({
      ...prev,
      showOptions: {
        ...prev.showOptions,
        [key]: val,
      },
    }));
  };

  const show = viewOptions.showOptions ?? {};

  return (
    <PropsPlayground
      caption={`variant: ${viewOptions.variant} · columns: ${viewOptions.columns} · order: ${viewOptions.order} · ascending: ${viewOptions.ascending}`}
      preview={
        <div className="w-full">
          <UViewOptions
            setViewOptions={setViewOptions}
            viewOptions={viewOptions}
          />
        </div>
      }
      title="UViewOptions"
    >
      <PlaygroundBoolean
        label="Modo de exibição"
        onChange={(v) => updateShowOption("variant", v)}
        prop="showOptions.variant"
        value={show.variant ?? true}
      />
      <PlaygroundBoolean
        label="Colunas"
        onChange={(v) => updateShowOption("columns", v)}
        prop="showOptions.columns"
        value={show.columns ?? true}
      />
      <PlaygroundBoolean
        label="Limitar altura"
        onChange={(v) => updateShowOption("limitHeight", v)}
        prop="showOptions.limitHeight"
        value={show.limitHeight ?? true}
      />
      <PlaygroundBoolean
        label="Critério de ordenação"
        onChange={(v) => updateShowOption("order", v)}
        prop="showOptions.order"
        value={show.order ?? true}
      />
      <PlaygroundBoolean
        label="Direção da ordenação"
        onChange={(v) => updateShowOption("ascending", v)}
        prop="showOptions.ascending"
        value={show.ascending ?? true}
      />
      <PlaygroundBoolean
        label="Responsáveis"
        onChange={(v) => updateShowOption("responsibles", v)}
        prop="showOptions.responsibles"
        value={show.responsibles ?? true}
      />
      <PlaygroundBoolean
        label="Prioridade"
        onChange={(v) => updateShowOption("priority", v)}
        prop="showOptions.priority"
        value={show.priority ?? true}
      />
      <PlaygroundBoolean
        label="Categoria"
        onChange={(v) => updateShowOption("category", v)}
        prop="showOptions.category"
        value={show.category ?? true}
      />
      <PlaygroundBoolean
        label="Parceiro"
        onChange={(v) => updateShowOption("partner", v)}
        prop="showOptions.partner"
        value={show.partner ?? true}
      />
      <PlaygroundBoolean
        label="Filtro de categoria"
        onChange={(v) => updateShowOption("filter_category", v)}
        prop="showOptions.filter_category"
        value={show.filter_category ?? true}
      />
      <PlaygroundBoolean
        label="Filtro de fase"
        onChange={(v) => updateShowOption("filter_phase", v)}
        prop="showOptions.filter_phase"
        value={show.filter_phase ?? true}
      />
    </PropsPlayground>
  );
}

export function UzzinaViewOptionsSection() {
  return (
    <div id="uzzina-view-options">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Barra de opções de visualização em três menus: Visualizar (modo, limite de altura, colunas), Ordenar (critério e direção) e Exibir (metadados de cada ação). Cada grupo e cada menu só aparecem quando a tela permite; um menu sem opções não é exibido."
          title="UViewOptions"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UViewOptions">
            <UViewOptionsPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
