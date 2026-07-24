import { useState } from "react";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
import { StationCombobox } from "~/components/features/StationCombobox";
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

      <div className="mt-8" id="uzzina-categories-combobox">
        <GallerySection>
          <GallerySectionHeader
            description="Seletor de Categoria refatorado para o Prism exibindo todas as variantes de gatilhos (filter, form-inline lg/sm, icon-only, form-link e form-footer)."
            title="CategoriesCombobox (Todas as Variantes)"
          />
          <GallerySectionContent className="grid gap-6">
            <GalleryItem label="1. Modo Filtro Múltiplo (variant='filter' + isMulti)">
              <CategoriesDemoMulti />
            </GalleryItem>
            <GalleryItem label="2. Modo Form-Inline Grande (variant='form-inline', size='lg')">
              <CategoriesDemoSingle size="lg" triggerVariant="form-inline" />
            </GalleryItem>
            <GalleryItem label="3. Modo Form-Inline Pequeno (variant='form-inline', size='sm')">
              <CategoriesDemoSingle size="sm" triggerVariant="form-inline" />
            </GalleryItem>
            <GalleryItem label="4. Modo Apenas Ícone (variant='form-inline', showText=false)">
              <CategoriesDemoSingle
                showText={false}
                size="sm"
                triggerVariant="form-inline"
              />
            </GalleryItem>
            <GalleryItem label="5. Modo Form-Link (variant='form-link')">
              <CategoriesDemoSingle triggerVariant="form-link" />
            </GalleryItem>
            <GalleryItem label="6. Modo Form-Footer (variant='form-footer')">
              <div className="max-w-md rounded-2xl border bg-surface/80 p-2 squircle">
                <CategoriesDemoSingle triggerVariant="form-footer" />
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

      <div className="mt-8" id="uzzina-station-combobox">
        <GallerySection>
          <GallerySectionHeader
            description="Seletor de Estação refatorado para o Prism com suporte a pontos coloridos de estações e filtro por categoria."
            title="StationCombobox"
          />
          <GallerySectionContent className="grid gap-6">
            <GalleryItem label="Modo Filtro Múltiplo (isMulti)">
              <StationDemoMulti />
            </GalleryItem>
            <GalleryItem label="Modo Formulário Único (Form-Inline)">
              <StationDemoSingle />
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
        triggerVariant="filter"
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionados: {selected.join(", ")}
      </span>
    </div>
  );
}

function CategoriesDemoSingle({
  triggerVariant,
  size = "lg",
  showText = true,
}: {
  triggerVariant: "form-inline" | "form-link" | "form-footer";
  size?: "sm" | "lg";
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
        triggerVariant={triggerVariant}
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
        onSelect={(phase) => setSelected(phase)}
        selectedPhase={selected}
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionado: {selected}
      </span>
    </div>
  );
}

function StationDemoMulti() {
  const [selected, setSelected] = useState<string[]>(["all"]);
  return (
    <div className="flex flex-col gap-2">
      <StationCombobox
        isMulti
        onSelect={({ stations }) => setSelected(stations)}
        selectedStations={selected}
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionados: {selected.join(", ")}
      </span>
    </div>
  );
}

function StationDemoSingle() {
  const [selected, setSelected] = useState<string>("flow");
  return (
    <div className="flex flex-col gap-2">
      <StationCombobox
        onSelect={({ station }) => setSelected(station || "flow")}
        selectedStation={selected}
      />
      <span className="font-mono text-xs text-muted-foreground">
        Selecionado: {selected}
      </span>
    </div>
  );
}
