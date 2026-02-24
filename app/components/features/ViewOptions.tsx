import { IconBrandInstagram } from "@tabler/icons-react";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
import {
  AlignJustify,
  ArrowDown,
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  HeartHandshake,
  Rows2,
  Rows3,
  Signal,
  Square,
  SquareCheck,
  Tag,
  Users,
} from "lucide-react";

export type ViewOptions = {
  instagram?: boolean;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
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
    instagram?: boolean;
    variant?: boolean;
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

export function ViewOptionsComponent({
  viewOptions,
  setViewOptions,
}: {
  viewOptions: ViewOptions;
  setViewOptions: (viewOptions: ViewOptions) => void;
}) {
  viewOptions.variant ||= VARIANT.line;

  return (
    <div className="flex gap-8">
      {(viewOptions.showOptions.instagram ||
        viewOptions.showOptions.variant ||
        viewOptions.showOptions.finishedOnEnd) && (
        <div className="flex gap-1">
          {/* Organizar pela Data do Instagram */}
          {viewOptions.showOptions.instagram && (
            <Toggle
              title="Organizar pela Data do Instagram"
              pressed={viewOptions.instagram}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, instagram: value })
              }
              className="grid place-content-center p-0"
            >
              <IconBrandInstagram />
            </Toggle>
          )}

          {viewOptions.showOptions.variant && (
            <Button
              variant={"ghost"}
              title={
                viewOptions.variant === VARIANT.line
                  ? "Ação em formato de linha"
                  : viewOptions.variant === VARIANT.block
                    ? "Ação em formato de bloco"
                    : "Ação em formato de conteúdo"
              }
              onClick={() => {
                if (viewOptions.variant === VARIANT.line) {
                  setViewOptions({ ...viewOptions, variant: VARIANT.block });
                } else if (viewOptions.variant === VARIANT.block) {
                  setViewOptions({ ...viewOptions, variant: VARIANT.content });
                } else if (viewOptions.variant === VARIANT.content) {
                  setViewOptions({ ...viewOptions, variant: VARIANT.line });
                }
              }}
              className="grid place-content-center p-0"
            >
              {viewOptions.variant === VARIANT.line && <Rows3 />}
              {viewOptions.variant === VARIANT.block && <Rows2 />}
              {viewOptions.variant === VARIANT.content && <Square />}
            </Button>
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
              <ArrowDown />
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
              {viewOptions.ascending ? <ArrowUpAZ /> : <ArrowDownAZ />}
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
                  order: pressed ? ORDER_BY.date : ORDER_BY.instagram_date,
                })
              }
              className="grid place-content-center p-0"
            >
              <Clock />
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
              <SquareCheck />
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
              <Users />
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
              <Signal />
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
              <Tag />
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
              <HeartHandshake />
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
    </div>
  );
}
