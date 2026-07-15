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
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
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
      {/* Mostrar botões de variantes */}
      {viewOptions.showOptions.variant && (
        <Button
          onClick={() => {
            const variant =
              viewOptions.variant === VARIANT.line
                ? VARIANT.block
                : viewOptions.variant === VARIANT.block
                  ? VARIANT.content
                  : VARIANT.line;
            setViewOptions({
              ...viewOptions,
              variant,
            });
          }}
          size="icon"
          title="Ação em formato de linha"
          variant="raised"
        >
          {viewOptions.variant === VARIANT.line ? (
            <Rows3Icon />
          ) : viewOptions.variant === VARIANT.block ? (
            <Rows2Icon />
          ) : (
            <ImageIcon />
          )}
        </Button>
      )}

      {viewOptions.variant === VARIANT.content &&
        viewOptions.showOptions.columns && (
          <Button
            onClick={() => {
              if (viewOptions.columns === 4) {
                setViewOptions({
                  ...viewOptions,
                  columns: 6,
                });
              } else if (viewOptions.columns === 6) {
                setViewOptions({
                  ...viewOptions,
                  columns: 7,
                });
              } else {
                setViewOptions({
                  ...viewOptions,
                  columns: 4,
                });
              }
            }}
            size="icon"
            variant="raised"
          >
            {viewOptions.columns === 4 && <Columns2Icon />}
            {viewOptions.columns === 6 && <Columns3Icon />}
            {viewOptions.columns === 7 && <Columns4Icon />}
          </Button>
        )}

      {(viewOptions.showOptions.order || viewOptions.showOptions.ascending) && (
        <div className="flex gap-1">
          {/* Ordem Crescente ou Descencente */}
          {viewOptions.showOptions.ascending && (
            <Toggle
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  ascending: pressed,
                })
              }
              pressed={viewOptions.ascending}
              title={
                viewOptions.ascending ? "Ordem Crescente" : "Ordem Descencente"
              }
              variant="pressed"
            >
              {viewOptions.ascending ? <ArrowUpAZIcon /> : <ArrowDownAZIcon />}
            </Toggle>
          )}
          {/* Ordem por Data  */}
          {viewOptions.showOptions.order && (
            <Toggle
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  order: pressed ? ORDER_BY.date : ORDER_BY.phase,
                })
              }
              pressed={viewOptions.order === ORDER_BY.date}
              title="Ordem por Data"
              variant="pressed"
            >
              <ClockIcon />
            </Toggle>
          )}
          <Toggle
            onPressedChange={(pressed) =>
              setViewOptions({
                ...viewOptions,
                order: pressed ? ORDER_BY.phase : ORDER_BY.date,
              })
            }
            pressed={viewOptions.order === ORDER_BY.phase}
            title="Ordem por Fase"
            variant="pressed"
          >
            <SquareCheckIcon />
          </Toggle>
        </div>
      )}

      {(viewOptions.showOptions.responsibles ||
        viewOptions.showOptions.priority ||
        viewOptions.showOptions.partner ||
        viewOptions.showOptions.category) && (
        <div className="flex gap-1">
          {viewOptions.showOptions.responsibles && (
            <Toggle
              onPressedChange={(value) =>
                setViewOptions({
                  ...viewOptions,
                  responsibles: value,
                })
              }
              pressed={viewOptions.responsibles}
              variant="pressed"
            >
              <UsersIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.priority && (
            <Toggle
              onPressedChange={(value) =>
                setViewOptions({
                  ...viewOptions,
                  priority: value,
                })
              }
              pressed={viewOptions.priority}
              variant="pressed"
            >
              <SignalIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.category && (
            <Toggle
              onPressedChange={(value) =>
                setViewOptions({
                  ...viewOptions,
                  category: value,
                })
              }
              pressed={viewOptions.category}
              variant="pressed"
            >
              <TagIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.partner && (
            <Toggle
              onPressedChange={(value) =>
                setViewOptions({
                  ...viewOptions,
                  partner: value,
                })
              }
              pressed={viewOptions.partner}
              variant="pressed"
            >
              <HeartHandshakeIcon />
            </Toggle>
          )}
        </div>
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
