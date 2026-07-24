import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  ClockIcon,
  Columns2Icon,
  Columns3Icon,
  Columns4Icon,
  HeartHandshakeIcon,
  ImageIcon,
  Rows2Icon,
  Rows3Icon,
  SignalIcon,
  SquareCheckIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { StationCombobox } from "~/components/features/StationCombobox";
import {
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
export type ViewOptions = {
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  responsibles?: boolean;
  priority?: boolean;
  category?: boolean;
  late?: boolean;
  partner?: boolean;
  order?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  sprint?: boolean;
  filter_category?: string[];
  filter_phase?: string[];
  filter_station?: string[];
  filter_responsible?: string[];
  showOptions: {
    variant?: boolean;
    columns?: boolean;
    responsibles?: boolean;
    priority?: boolean;
    category?: boolean;
    partner?: boolean;
    order?: boolean;
    ascending?: boolean;
    sprint?: boolean;
    filter_category?: boolean;
    filter_phase?: boolean;
    filter_station?: boolean;
    filter_responsible?: boolean;
  };
};
import { useState } from "react";
import { PhaseCombobox } from "./PhaseCombobox";

/** Defaults internos — não expostos fora deste módulo */
const DEFAULT_VIEW_OPTIONS = {
  variant: VARIANT.line,
  columns: 4,
  ascending: true,
  order: ORDER_BY.date,
  category: true,
  late: true,
  partner: false,
  sprint: false,
  responsibles: false,
  priority: false,
} satisfies Omit<
  ViewOptions,
  | "instagram"
  | "showOptions"
  | "filter_category"
  | "filter_phase"
  | "filter_responsible"
>;

/**
 * Hook que inicializa ViewOptions com defaults aplicados automaticamente.
 * Passe apenas o que difere do padrão — showOptions é obrigatório.
 */
export function useViewOptions(
  overrides: Partial<ViewOptions> & Pick<ViewOptions, "showOptions">,
) {
  return useState<ViewOptions>({
    ...DEFAULT_VIEW_OPTIONS,
    ...overrides,
  });
}
export function ViewOptionsComponent({
  viewOptions,
  setViewOptions,
  startComponents,
  endComponents,
}: {
  viewOptions: ViewOptions;
  setViewOptions: (viewOptions: ViewOptions) => void;
  startComponents?: React.ReactNode;
  endComponents?: React.ReactNode;
}) {
  viewOptions.variant ||= VARIANT.line;
  return (
    <div className="flex w-full shrink flex-wrap justify-between gap-x-2 gap-y-2">
      {/* Componentes no começo */}
      {startComponents}

      {/* 1. Seleção de Modo de Exibição (Linha / Bloco / Conteúdo) */}
      {viewOptions.showOptions.variant && (
        <PrismToggleGroup
          aria-label="Modo de Exibição"
          className={"gap-1"}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as
              (typeof VARIANT)[keyof typeof VARIANT] | undefined;
            if (selected) {
              setViewOptions({
                ...viewOptions,
                variant: selected,
              });
            }
          }}
          selectedKeys={
            viewOptions.variant ? new Set([viewOptions.variant]) : new Set()
          }
          selectionMode="single"
          size="sm"
        >
          <PrismToggleGroupItem id={VARIANT.line} title="Exibição em Linha">
            <Rows3Icon />
          </PrismToggleGroupItem>
          <PrismToggleGroupItem id={VARIANT.block} title="Exibição em Bloco">
            <Rows2Icon />
          </PrismToggleGroupItem>
          <PrismToggleGroupItem
            id={VARIANT.content}
            title="Exibição em Conteúdo"
          >
            <ImageIcon />
          </PrismToggleGroupItem>
        </PrismToggleGroup>
      )}

      {/* 2. Seleção de Colunas */}
      {viewOptions.variant === VARIANT.content &&
        viewOptions.showOptions.columns && (
          <PrismToggleGroup
            aria-label="Número de Colunas"
            className={"gap-1"}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string | undefined;
              if (selected) {
                setViewOptions({
                  ...viewOptions,
                  columns: Number(selected) as 4 | 6 | 7,
                });
              }
            }}
            selectedKeys={
              viewOptions.columns
                ? new Set([String(viewOptions.columns)])
                : new Set(["4"])
            }
            selectionMode="single"
            size="sm"
          >
            <PrismToggleGroupItem id="4" title="4 Colunas">
              <Columns2Icon />
            </PrismToggleGroupItem>
            <PrismToggleGroupItem id="6" title="6 Colunas">
              <Columns3Icon />
            </PrismToggleGroupItem>
            <PrismToggleGroupItem id="7" title="7 Colunas">
              <Columns4Icon />
            </PrismToggleGroupItem>
          </PrismToggleGroup>
        )}

      {/* 3 & 4. Ordenação (Direção + Critério) */}
      {(viewOptions.showOptions.order || viewOptions.showOptions.ascending) && (
        <div className="flex gap-1">
          {/* 3. Ordem Crescente ou Descendente */}
          {viewOptions.showOptions.ascending && (
            <PrismToggle
              aria-label={
                viewOptions.ascending ? "Ordem Crescente" : "Ordem Descendente"
              }
              isSelected={!!viewOptions.ascending}
              onChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  ascending: pressed,
                })
              }
              size="sm"
            >
              {viewOptions.ascending ? <ArrowUpAZIcon /> : <ArrowDownAZIcon />}
            </PrismToggle>
          )}

          {/* 4. Critério de Ordenação (Data / Fase) */}
          {viewOptions.showOptions.order && (
            <PrismToggleGroup
              aria-label="Critério de Ordenação"
              className={"gap-1"}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as
                  (typeof ORDER_BY)[keyof typeof ORDER_BY] | undefined;
                if (selected) {
                  setViewOptions({
                    ...viewOptions,
                    order: selected,
                  });
                }
              }}
              selectedKeys={
                viewOptions.order ? new Set([viewOptions.order]) : new Set()
              }
              selectionMode="single"
              size="sm"
            >
              <PrismToggleGroupItem id={ORDER_BY.date} title="Ordem por Data">
                <ClockIcon />
              </PrismToggleGroupItem>
              <PrismToggleGroupItem id={ORDER_BY.phase} title="Ordem por Fase">
                <SquareCheckIcon />
              </PrismToggleGroupItem>
            </PrismToggleGroup>
          )}
        </div>
      )}

      {/* 5. Toggles de Exibição de Campos */}
      {(viewOptions.showOptions.responsibles ||
        viewOptions.showOptions.priority ||
        viewOptions.showOptions.partner ||
        viewOptions.showOptions.category) && (
        <PrismToggleGroup
          aria-label="Exibição de Campos"
          className={"gap-1"}
          onSelectionChange={(keys) => {
            const selectedSet = new Set(Array.from(keys) as string[]);
            setViewOptions({
              ...viewOptions,
              responsibles: selectedSet.has("responsibles"),
              priority: selectedSet.has("priority"),
              category: selectedSet.has("category"),
              partner: selectedSet.has("partner"),
            });
          }}
          selectedKeys={
            new Set(
              [
                viewOptions.responsibles && "responsibles",
                viewOptions.priority && "priority",
                viewOptions.category && "category",
                viewOptions.partner && "partner",
              ].filter(Boolean) as string[],
            )
          }
          selectionMode="multiple"
          size="sm"
        >
          {viewOptions.showOptions.responsibles && (
            <PrismToggleGroupItem id="responsibles" title="Responsáveis">
              <UsersIcon />
            </PrismToggleGroupItem>
          )}
          {viewOptions.showOptions.priority && (
            <PrismToggleGroupItem id="priority" title="Prioridade">
              <SignalIcon />
            </PrismToggleGroupItem>
          )}
          {viewOptions.showOptions.category && (
            <PrismToggleGroupItem id="category" title="Categoria">
              <TagIcon />
            </PrismToggleGroupItem>
          )}
          {viewOptions.showOptions.partner && (
            <PrismToggleGroupItem id="partner" title="Parceiro">
              <HeartHandshakeIcon />
            </PrismToggleGroupItem>
          )}
        </PrismToggleGroup>
      )}

      {(viewOptions.showOptions.filter_category ||
        viewOptions.showOptions.filter_phase ||
        viewOptions.showOptions.filter_station ||
        viewOptions.showOptions.filter_responsible) && (
        <div className="flex gap-1">
          {viewOptions.showOptions.filter_category && (
            <CategoriesCombobox
              isMulti
              onSelect={({ categories }) => {
                setViewOptions({
                  ...viewOptions,
                  filter_category:
                    categories[0] === "all" ? undefined : categories,
                });
              }}
              selectedCategories={viewOptions.filter_category || ["all"]}
              showInstagramGroup
            />
          )}
          {viewOptions.showOptions.filter_phase && (
            <PhaseCombobox
              isMulti={true}
              onSelect={({ phases }) => {
                setViewOptions({
                  ...viewOptions,
                  filter_phase: phases[0] === "all" ? undefined : phases,
                });
              }}
              selectedPhases={viewOptions.filter_phase ?? ["all"]}
            />
          )}
          {viewOptions.showOptions.filter_station && (
            <StationCombobox
              isMulti={true}
              onSelect={({ stations }) => {
                setViewOptions({
                  ...viewOptions,
                  filter_station: stations[0] === "all" ? undefined : stations,
                });
              }}
              selectedStations={viewOptions.filter_station ?? ["all"]}
            />
          )}
        </div>
      )}
      {endComponents}
    </div>
  );
}
