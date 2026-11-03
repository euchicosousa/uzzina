import type { ComboboxTriggerProps } from "~/components/features/ComboboxTrigger";
import { useState } from "react";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
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
          description="Barra de opções de visualização em três menus: Visualizar (modo, limite de altura, colunas), Ordenar (critério e direção) e Exibir (metadados de cada ação). Cada grupo e cada menu só aparecem quando a tela permite; um menu sem opções não é exibido."
          title="ViewOptionsComponent"
        />
        <GallerySectionContent className="grid gap-6">
          <GalleryItem label="1. Modo Completo (Todas as Opções e Filtros Ativos)">
            <div className="flex w-full flex-col gap-4">
              <ViewOptionsComponent
                setViewOptions={setFullViewOptions}
                viewOptions={fullViewOptions}
              />
              <div className="overflow-x-auto rounded-xl bg-muted/40 p-3 font-mono text-xs text-muted-foreground squircle">
                <span className="font-semibold text-foreground">
                  Estado Atual:
                </span>{" "}
                {JSON.stringify(
                  {
                    variant: fullViewOptions.variant,
                    columns: fullViewOptions.columns,
                    limitHeight: fullViewOptions.limitHeight ?? false,
                    order: fullViewOptions.order,
                    ascending: fullViewOptions.ascending,
                    responsibles: fullViewOptions.responsibles,
                    priority: fullViewOptions.priority,
                    category: fullViewOptions.category,
                    partner: fullViewOptions.partner,
                    filter_category: fullViewOptions.filter_category,
                    filter_phase: fullViewOptions.filter_phase,
                  },
                  null,
                  2,
                )}
              </div>
            </div>
          </GalleryItem>

          <GalleryItem label="2. Modo Simplificado (Estilo SprintHomeComponent)">
            <div className="flex w-full flex-col gap-4">
              <ViewOptionsComponent
                setViewOptions={setSprintViewOptions}
                viewOptions={sprintViewOptions}
              />
              <div className="overflow-x-auto rounded-xl bg-muted/40 p-3 font-mono text-xs text-muted-foreground squircle">
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

      <div className="mt-8" id="uzzina-categories-combobox">
        <GallerySection>
          <GallerySectionHeader
            description="Seletor de Categoria refatorado para o Prism exibindo as combinações de variant/size do gatilho (ghost sm, apenas ícone, link sm e ghost icon-lg)."
            title="CategoriesCombobox (Todas as Variantes)"
          />
          <GallerySectionContent className="grid gap-6">
            <GalleryItem label="1. Filtro Múltiplo (isMulti, padrão ghost sm)">
              <CategoriesDemoMulti />
            </GalleryItem>
            <GalleryItem label="2. Texto (variant='ghost' size='sm', seleção única)">
              <CategoriesDemoSingle size="sm" variant="ghost" />
            </GalleryItem>
            <GalleryItem label="3. Modo Apenas Ícone (showText=false)">
              <CategoriesDemoSingle
                showText={false}
                size="sm"
                variant="ghost"
              />
            </GalleryItem>
            <GalleryItem label="4. Link (variant='link' size='sm')">
              <CategoriesDemoSingle size="sm" variant="link" />
            </GalleryItem>
            <GalleryItem label="5. Rodapé (variant='ghost' size='icon-lg', 48px, anel padrão)">
              <div className="max-w-md rounded-2xl border bg-card/80 p-2 squircle">
                <CategoriesDemoSingle
                  showText={false}
                  size="icon-lg"
                  variant="ghost"
                />
              </div>
            </GalleryItem>
          </GallerySectionContent>
        </GallerySection>
      </div>

      <div className="mt-8" id="uzzina-phase-combobox">
        <GallerySection>
          <GallerySectionHeader
            description="Seletor de Fase refatorado para o Prism com suporte a estados de progresso, ícones coloridos e seleção única/múltipla."
            title="PhaseCombobox"
          />
          <GallerySectionContent className="grid gap-6">
            <GalleryItem label="Modo Filtro Múltiplo (isMulti)">
              <PhaseDemoMulti />
            </GalleryItem>
            <GalleryItem label="Modo Formulário Único (Form-Inline)">
              <PhaseDemoSingle />
            </GalleryItem>
          </GallerySectionContent>
        </GallerySection>
      </div>
    </div>
  );
}

function CategoriesDemoMulti() {
  const [selected, setSelected] = useState<string[]>(["all"]);
  return (
    <div className="flex flex-col gap-2">
      <CategoriesCombobox
        isMulti
        onSelect={({ categories }) => setSelected(categories)}
        selectedCategories={selected}
        showInstagramGroup
        size="sm"
        variant="ghost"
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionados: {selected.join(", ")}
      </span>
    </div>
  );
}

function CategoriesDemoSingle({
  variant,
  size,
  showText = true,
}: {
  variant: ComboboxTriggerProps["variant"];
  size: ComboboxTriggerProps["size"];
  showText?: boolean;
}) {
  const [selected, setSelected] = useState<string>("post");
  return (
    <div className="flex flex-col gap-2">
      <CategoriesCombobox
        onSelect={({ category }) => setSelected(category)}
        selectedCategories={[selected]}
        showInstagramGroup
        showText={showText}
        size={size}
        variant={variant}
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionado: {selected}
      </span>
    </div>
  );
}

function PhaseDemoMulti() {
  const [selected, setSelected] = useState<string[]>(["all"]);
  return (
    <div className="flex flex-col gap-2">
      <PhaseCombobox
        isMulti
        onSelect={({ phases }) => setSelected(phases)}
        selectedPhases={selected}
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionados: {selected.join(", ")}
      </span>
    </div>
  );
}

function PhaseDemoSingle() {
  const [selected, setSelected] = useState<string>("to_do");
  return (
    <div className="flex flex-col gap-2">
      <PhaseCombobox
        onSelect={({ phase }) => setSelected(phase || "to_do")}
        selectedPhase={selected}
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionado: {selected}
      </span>
    </div>
  );
}
