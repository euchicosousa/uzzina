import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ClockIcon,
  Columns2Icon,
  Columns3Icon,
  Columns4Icon,
  HeartHandshakeIcon,
  ImageIcon,
  Rows2Icon,
  EyeIcon,
  LayoutListIcon,
  ListOrderedIcon,
  Rows3Icon,
  SignalIcon,
  SquareCheckIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import {
  PrismButton,
  PrismMenu,
  PrismMenuContent,
  PrismMenuGroup,
  PrismMenuItem,
  PrismMenuLabel,
  PrismMenuSeparator,
  PrismMenuTrigger,
} from "~/components/prism";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";

export type ViewOptions = {
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  autoHeight?: boolean;
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
  filter_responsible?: string[];
  showOptions: {
    variant?: boolean;
    columns?: boolean;
    autoHeight?: boolean;
    responsibles?: boolean;
    priority?: boolean;
    category?: boolean;
    partner?: boolean;
    order?: boolean;
    ascending?: boolean;
    sprint?: boolean;
    filter_category?: boolean;
    filter_phase?: boolean;
    filter_responsible?: boolean;
  };
};
import { useState } from "react";
import { PhaseCombobox } from "./PhaseCombobox";

/** Defaults internos — não expostos fora deste módulo */
const DEFAULT_VIEW_OPTIONS = {
  variant: VARIANT.line,
  columns: 4,
  autoHeight: false,
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
type ViewMenuProps = {
  viewOptions: ViewOptions;
  setViewOptions: (viewOptions: ViewOptions) => void;
};

function ViewMenuTrigger({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <PrismButton className="max-sm:px-2" size="xs" variant="secondary">
      {icon}
      {label}
      <ChevronDownIcon className="max-sm:hidden" />
    </PrismButton>
  );
}

/**
 * Which "Visualizar" groups the screen allows right now. The menu button is
 * rendered only when at least one group is visible, so it never opens empty.
 */
export function getVisualizeGroups(viewOptions: ViewOptions) {
  const { showOptions } = viewOptions;
  const isContent = viewOptions.variant === VARIANT.content;
  return {
    variant: !!showOptions.variant,
    autoHeight: !!showOptions.autoHeight && !isContent,
    columns: !!showOptions.columns && isContent,
  };
}

/** "Visualizar": layout variant, auto height and number of columns. */
function VisualizeMenu({ viewOptions, setViewOptions }: ViewMenuProps) {
  const groups = getVisualizeGroups(viewOptions);
  return (
    <PrismMenu>
      <PrismMenuTrigger>
        <ViewMenuTrigger icon={<LayoutListIcon />} label="Visualizar" />
      </PrismMenuTrigger>
      <PrismMenuContent className="w-56">
        {groups.variant && (
          <PrismMenuGroup
            aria-label="Modo de Exibição"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as
                (typeof VARIANT)[keyof typeof VARIANT] | undefined;
              if (selected)
                setViewOptions({ ...viewOptions, variant: selected });
            }}
            selectedKeys={new Set([viewOptions.variant ?? VARIANT.line])}
            selectionMode="single"
          >
            <PrismMenuLabel>Modo de exibição</PrismMenuLabel>
            <PrismMenuItem id={VARIANT.line} textValue="Linha">
              <Rows3Icon /> Linha
            </PrismMenuItem>
            <PrismMenuItem id={VARIANT.block} textValue="Bloco">
              <Rows2Icon /> Bloco
            </PrismMenuItem>
            <PrismMenuItem id={VARIANT.content} textValue="Conteúdo">
              <ImageIcon /> Conteúdo
            </PrismMenuItem>
          </PrismMenuGroup>
        )}
        {groups.autoHeight && (
          <>
            {groups.variant && <PrismMenuSeparator />}
            <PrismMenuGroup
              aria-label="Altura"
              onSelectionChange={(keys) =>
                setViewOptions({
                  ...viewOptions,
                  autoHeight: new Set(keys).has("autoHeight"),
                })
              }
              selectedKeys={
                new Set(viewOptions.autoHeight ? ["autoHeight"] : [])
              }
              selectionMode="multiple"
            >
              <PrismMenuItem id="autoHeight" textValue="Altura automática">
                <ChevronsUpDownIcon /> Altura automática
              </PrismMenuItem>
            </PrismMenuGroup>
          </>
        )}
        {groups.columns && (
          <>
            {groups.variant && <PrismMenuSeparator />}
            <PrismMenuGroup
              aria-label="Número de Colunas"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                if (selected) {
                  setViewOptions({
                    ...viewOptions,
                    columns: Number(selected) as 4 | 6 | 7,
                  });
                }
              }}
              selectedKeys={new Set([String(viewOptions.columns ?? 4)])}
              selectionMode="single"
            >
              <PrismMenuLabel>Colunas</PrismMenuLabel>
              <PrismMenuItem id="4" textValue="4 colunas">
                <Columns2Icon /> 4 colunas
              </PrismMenuItem>
              <PrismMenuItem id="6" textValue="6 colunas">
                <Columns3Icon /> 6 colunas
              </PrismMenuItem>
              <PrismMenuItem id="7" textValue="7 colunas">
                <Columns4Icon /> 7 colunas
              </PrismMenuItem>
            </PrismMenuGroup>
          </>
        )}
      </PrismMenuContent>
    </PrismMenu>
  );
}

/** "Ordenar": criterion (date or phase) and direction. */
function SortMenu({ viewOptions, setViewOptions }: ViewMenuProps) {
  const { showOptions } = viewOptions;
  return (
    <PrismMenu>
      <PrismMenuTrigger>
        <ViewMenuTrigger icon={<ListOrderedIcon />} label="Ordenar" />
      </PrismMenuTrigger>
      <PrismMenuContent className="w-56">
        {showOptions.order && (
          <PrismMenuGroup
            aria-label="Critério de Ordenação"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as
                (typeof ORDER_BY)[keyof typeof ORDER_BY] | undefined;
              if (selected) setViewOptions({ ...viewOptions, order: selected });
            }}
            selectedKeys={
              viewOptions.order ? new Set([viewOptions.order]) : new Set()
            }
            selectionMode="single"
          >
            <PrismMenuLabel>Ordenar por</PrismMenuLabel>
            <PrismMenuItem id={ORDER_BY.date} textValue="Data">
              <ClockIcon /> Data
            </PrismMenuItem>
            <PrismMenuItem id={ORDER_BY.phase} textValue="Fase">
              <SquareCheckIcon /> Fase
            </PrismMenuItem>
          </PrismMenuGroup>
        )}
        {showOptions.order && showOptions.ascending && <PrismMenuSeparator />}
        {showOptions.ascending && (
          <PrismMenuGroup
            aria-label="Direção"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string | undefined;
              if (selected) {
                setViewOptions({
                  ...viewOptions,
                  ascending: selected === "ascending",
                });
              }
            }}
            selectedKeys={
              new Set([viewOptions.ascending ? "ascending" : "descending"])
            }
            selectionMode="single"
          >
            <PrismMenuLabel>Direção</PrismMenuLabel>
            <PrismMenuItem id="ascending" textValue="Crescente">
              <ArrowUpAZIcon /> Crescente
            </PrismMenuItem>
            <PrismMenuItem id="descending" textValue="Decrescente">
              <ArrowDownAZIcon /> Decrescente
            </PrismMenuItem>
          </PrismMenuGroup>
        )}
      </PrismMenuContent>
    </PrismMenu>
  );
}

/** "Exibir": which metadata fields each action shows. */
function DisplayMenu({ viewOptions, setViewOptions }: ViewMenuProps) {
  const { showOptions } = viewOptions;
  return (
    <PrismMenu>
      <PrismMenuTrigger>
        <ViewMenuTrigger icon={<EyeIcon />} label="Exibir" />
      </PrismMenuTrigger>
      <PrismMenuContent className="w-56">
        <PrismMenuGroup
          aria-label="Exibição de Campos"
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
        >
          <PrismMenuLabel>Mostrar em cada ação</PrismMenuLabel>
          {showOptions.responsibles && (
            <PrismMenuItem id="responsibles" textValue="Responsáveis">
              <UsersIcon /> Responsáveis
            </PrismMenuItem>
          )}
          {showOptions.priority && (
            <PrismMenuItem id="priority" textValue="Prioridade">
              <SignalIcon /> Prioridade
            </PrismMenuItem>
          )}
          {showOptions.category && (
            <PrismMenuItem id="category" textValue="Categoria">
              <TagIcon /> Categoria
            </PrismMenuItem>
          )}
          {showOptions.partner && (
            <PrismMenuItem id="partner" textValue="Parceiro">
              <HeartHandshakeIcon /> Parceiro
            </PrismMenuItem>
          )}
        </PrismMenuGroup>
      </PrismMenuContent>
    </PrismMenu>
  );
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
  const { showOptions } = viewOptions;
  const menuProps = { viewOptions, setViewOptions };
  const showVisualize = Object.values(getVisualizeGroups(viewOptions)).some(
    Boolean,
  );
  const showSort = showOptions.order || showOptions.ascending;
  const showDisplay =
    showOptions.responsibles ||
    showOptions.priority ||
    showOptions.partner ||
    showOptions.category;
  return (
    <div className="flex w-full shrink flex-wrap items-center justify-between gap-x-2 gap-y-2">
      {/* Componentes no começo */}
      {startComponents}

      {(showVisualize || showSort || showDisplay) && (
        <div className="flex flex-wrap gap-1">
          {showVisualize && <VisualizeMenu {...menuProps} />}
          {showSort && <SortMenu {...menuProps} />}
          {showDisplay && <DisplayMenu {...menuProps} />}
        </div>
      )}

      {(showOptions.filter_category ||
        showOptions.filter_phase ||
        showOptions.filter_responsible) && (
        <div className="flex gap-1">
          {showOptions.filter_category && (
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
          {showOptions.filter_phase && (
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
        </div>
      )}
      {endComponents}
    </div>
  );
}
