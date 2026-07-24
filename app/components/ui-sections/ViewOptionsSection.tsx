import { useState } from "react";
import {
  ViewOptionsComponent,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

export function ViewOptionsSection() {
  // 1. Estado Completo com todas as opções ativas (inclusive colunas e filtros)
  const [fullViewOptions, setFullViewOptions] = useState<ViewOptions>({
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
      responsibles: true,
      priority: true,
      category: true,
      partner: true,
      order: true,
      ascending: true,
      filter_category: true,
      filter_phase: true,
      filter_station: true,
    },
  });

  // 2. Estado Simplificado (usado no SprintHomeComponent)
  const [sprintViewOptions, setSprintViewOptions] = useState<ViewOptions>({
    variant: VARIANT.block,
    columns: 4,
    showOptions: {
      variant: true,
      columns: true,
    },
  });

  return (
    <div id="uzzina-view-options">
      <GallerySection>
        <GallerySectionHeader
          description="Barra de ferramentas de opções de visualização do Uzzina para alternar layouts (linha/bloco/conteúdo), colunas, ordenações e visibilidade de metadados."
          title="ViewOptionsComponent"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="1. Modo Completo (Todas as Opções e Filtros Ativos)">
            <div className="flex w-full flex-col gap-4 rounded-2xl border bg-surface/50 p-4 squircle">
              <ViewOptionsComponent
                setViewOptions={setFullViewOptions}
                viewOptions={fullViewOptions}
              />
              <div className="overflow-x-auto rounded-xl bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Estado Atual:
                </span>{" "}
                {JSON.stringify(
                  {
                    variant: fullViewOptions.variant,
                    columns: fullViewOptions.columns,
                    order: fullViewOptions.order,
                    ascending: fullViewOptions.ascending,
                    responsibles: fullViewOptions.responsibles,
                    priority: fullViewOptions.priority,
                    category: fullViewOptions.category,
                    partner: fullViewOptions.partner,
                    filter_category: fullViewOptions.filter_category,
                    filter_phase: fullViewOptions.filter_phase,
                    filter_station: fullViewOptions.filter_station,
                  },
                  null,
                  2,
                )}
              </div>
            </div>
          </GalleryItem>

          <GalleryItem label="2. Modo Simplificado (Estilo SprintHomeComponent)">
            <div className="flex w-full flex-col gap-4 rounded-2xl border bg-surface/50 p-4 squircle">
              <ViewOptionsComponent
                setViewOptions={setSprintViewOptions}
                viewOptions={sprintViewOptions}
              />
              <div className="overflow-x-auto rounded-xl bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Estado Atual:
                </span>{" "}
                {JSON.stringify(
                  {
                    variant: sprintViewOptions.variant,
                    columns: sprintViewOptions.columns,
                  },
                  null,
                  2,
                )}
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
