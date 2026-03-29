import {
  ArrowDownAZIcon,
  ArrowDownIcon,
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
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { COLUMNS, ORDER_BY, VARIANT } from "~/lib/CONSTANTS";

export type ViewOptions = {
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: (typeof COLUMNS)[keyof typeof COLUMNS];
  responsibles?: boolean;
  priority?: boolean;
  category?: boolean;
  late?: boolean;
  partner?: boolean;
  order?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  finishedOnEnd?: boolean;
  sprint?: boolean;
  filter_category?: string[];
  filter_state?: string[];
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
    finishedOnEnd?: boolean;
    sprint?: boolean;
    filter_category?: boolean;
    filter_state?: boolean;
    filter_responsible?: boolean;
  };
};

import { useState } from "react";

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
  finishedOnEnd: false,
} satisfies Omit<
  ViewOptions,
  | "instagram"
  | "showOptions"
  | "filter_category"
  | "filter_state"
  | "filter_responsible"
>;

/**
 * Hook que inicializa ViewOptions com defaults aplicados automaticamente.
 * Passe apenas o que difere do padrão — showOptions é obrigatório.
 */
export function useViewOptions(
  overrides: Partial<ViewOptions> & Pick<ViewOptions, "showOptions">,
) {
  return useState<ViewOptions>({ ...DEFAULT_VIEW_OPTIONS, ...overrides });
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
      {startComponents}
      {(viewOptions.showOptions.variant ||
        viewOptions.showOptions.finishedOnEnd) && (
        <div className="flex gap-1">
          {viewOptions.showOptions.variant && (
            <div className="flex">
              <Button
                variant={
                  viewOptions.variant === VARIANT.line ? "outline" : "ghost"
                }
                title="Ação em formato de linha"
                onClick={() => {
                  setViewOptions({ ...viewOptions, variant: VARIANT.line });
                }}
              >
                <Rows3Icon />
              </Button>
              <Button
                variant={
                  viewOptions.variant === VARIANT.block ? "outline" : "ghost"
                }
                title="Ação em formato de bloco"
                onClick={() => {
                  setViewOptions({ ...viewOptions, variant: VARIANT.block });
                }}
              >
                <Rows2Icon />
              </Button>
              <Button
                variant={
                  viewOptions.variant === VARIANT.content ? "outline" : "ghost"
                }
                title="Ação em formato de conteúdo"
                onClick={() => {
                  setViewOptions({ ...viewOptions, variant: VARIANT.content });
                }}
              >
                <ImageIcon />
              </Button>
              {viewOptions.variant === VARIANT.content &&
                viewOptions.showOptions.columns && (
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      if (viewOptions.columns === 4) {
                        setViewOptions({ ...viewOptions, columns: 6 });
                      } else if (viewOptions.columns === 6) {
                        setViewOptions({ ...viewOptions, columns: 7 });
                      } else {
                        setViewOptions({ ...viewOptions, columns: 4 });
                      }
                    }}
                  >
                    {viewOptions.columns === 4 && <Columns2Icon />}
                    {viewOptions.columns === 6 && <Columns3Icon />}
                    {viewOptions.columns === 7 && <Columns4Icon />}
                  </Button>
                )}
            </div>
          )}
          {/* Colocar ações concluídas no final */}
          {viewOptions.showOptions.finishedOnEnd && (
            <Toggle
              title="Colocar ações concluídas no final"
              pressed={viewOptions.finishedOnEnd}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, finishedOnEnd: value })
              }
              className="grid place-content-center p-0"
            >
              <ArrowDownIcon />
            </Toggle>
          )}
        </div>
      )}

      {(viewOptions.showOptions.order || viewOptions.showOptions.ascending) && (
        <div className="flex gap-1">
          {/* Ordem Crescente ou Descencente */}
          {viewOptions.showOptions.ascending && (
            <Toggle
              title={
                viewOptions.ascending ? "Ordem Crescente" : "Ordem Descencente"
              }
              pressed={viewOptions.ascending}
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  ascending: pressed,
                })
              }
              className="grid place-content-center p-0"
            >
              {viewOptions.ascending ? <ArrowUpAZIcon /> : <ArrowDownAZIcon />}
            </Toggle>
          )}
          {/* Ordem por Data  */}
          {viewOptions.showOptions.order && (
            <Toggle
              title="Ordem por Data"
              pressed={viewOptions.order === ORDER_BY.date}
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  order: pressed ? ORDER_BY.date : ORDER_BY.state,
                })
              }
              className="grid place-content-center p-0"
            >
              <ClockIcon />
            </Toggle>
          )}
          {/* Ordem por Status */}
          {viewOptions.showOptions.order && (
            <Toggle
              title="Ordem por Status"
              pressed={viewOptions.order === ORDER_BY.state}
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  order: pressed ? ORDER_BY.state : ORDER_BY.date,
                })
              }
              className="grid place-content-center p-0"
            >
              <SquareCheckIcon />
            </Toggle>
          )}
        </div>
      )}

      {(viewOptions.showOptions.responsibles ||
        viewOptions.showOptions.priority ||
        viewOptions.showOptions.partner ||
        viewOptions.showOptions.category) && (
        <div className="flex gap-1">
          {viewOptions.showOptions.responsibles && (
            <Toggle
              className="grid place-content-center p-0"
              pressed={viewOptions.responsibles}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, responsibles: value })
              }
            >
              <UsersIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.priority && (
            <Toggle
              pressed={viewOptions.priority}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, priority: value })
              }
              className="grid place-content-center p-0"
            >
              <SignalIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.category && (
            <Toggle
              pressed={viewOptions.category}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, category: value })
              }
              className="grid place-content-center p-0"
            >
              <TagIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.partner && (
            <Toggle
              pressed={viewOptions.partner}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, partner: value })
              }
              className="grid place-content-center p-0"
            >
              <HeartHandshakeIcon />
            </Toggle>
          )}
        </div>
      )}

      {(viewOptions.showOptions.filter_category ||
        viewOptions.showOptions.filter_state ||
        viewOptions.showOptions.filter_responsible) && (
        <div className="flex gap-1">
          {viewOptions.showOptions.filter_category && (
            <CategoriesCombobox
              isMulti
              showInstagramGroup
              selectedCategories={viewOptions.filter_category || ["all"]}
              onSelect={({ categories }) => {
                setViewOptions({
                  ...viewOptions,
                  filter_category:
                    categories[0] === "all" ? undefined : categories,
                });
              }}
            />
          )}
        </div>
      )}
      {endComponents}
    </div>
  );
}
