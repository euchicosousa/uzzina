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
  PaletteIcon,
  ListOrderedIcon,
  Rows3Icon,
  SignalIcon,
  SquareCheckIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { UCategoriesCombobox } from "~/components/uzzina/UCategoriesCombobox";
import { UPhaseCombobox } from "~/components/uzzina/UPhaseCombobox";
import {
  PrismButton,
  PrismMenu,
  PrismMenuContent,
  PrismMenuGroup,
  PrismMenuItem,
  PrismMenuLabel,
  PrismMenuSeparator,
  PrismMenuTrigger,
  PrismTooltip,
} from "~/components/prism";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

export type UViewOptions = {
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  limitHeight?: boolean;
  /** Tints each action card by its phase (DS11). */
  phaseColor?: boolean;
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
    limitHeight?: boolean;
    phaseColor?: boolean;
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

/** Defaults internos — não expostos fora deste módulo */
const DEFAULT_VIEW_OPTIONS = {
  variant: VARIANT.line,
  columns: 4,
  limitHeight: false,
  phaseColor: false,
  ascending: true,
  order: ORDER_BY.date,
  category: true,
  late: true,
  partner: false,
  sprint: false,
  responsibles: false,
  priority: false,
} satisfies Omit<
  UViewOptions,
  | "instagram"
  | "showOptions"
  | "filter_category"
  | "filter_phase"
  | "filter_responsible"
>;

/**
 * Hook que inicializa UViewOptions com defaults aplicados automaticamente.
 * Passe apenas o que difere do padrão — showOptions é obrigatório.
 */
export function useUViewOptions(
  overrides: Partial<UViewOptions> & Pick<UViewOptions, "showOptions">,
) {
  return useState<UViewOptions>({
    ...DEFAULT_VIEW_OPTIONS,
    ...overrides,
  });
}

type ViewMenuProps = {
  viewOptions: UViewOptions;
  setViewOptions: (viewOptions: UViewOptions) => void;
  /** Optional context that keeps the accessible names unique on the page. */
  context?: string;
};

function withContext(base: string, context?: string) {
  return context ? `${base} (${context})` : base;
}

function ViewMenuTrigger({
  icon,
  label,
  accessibleName,
}: {
  icon: React.ReactNode;
  label: string;
  /** Stable accessible name; must contain the visible label (WCAG 2.5.3). */
  accessibleName: string;
}) {
  return (
    <PrismTooltip label={label}>
      <PrismButton aria-label={accessibleName} size="sm" variant="ghost">
        {icon}
        <span className="hidden md:block lg:hidden xl:block">{label}</span>
        <ChevronDownIcon className="hidden md:block lg:hidden xl:block" />
      </PrismButton>
    </PrismTooltip>
  );
}

/**
 * Which "Visualizar" groups the screen allows right now. The menu button is
 * rendered only when at least one group is visible, so it never opens empty.
 */
export function getVisualizeGroups(viewOptions: UViewOptions) {
  const { showOptions } = viewOptions;
  const isContent = viewOptions.variant === VARIANT.content;
  return {
    variant: !!showOptions.variant,
    limitHeight: !!showOptions.limitHeight,
    phaseColor: !!showOptions.phaseColor,
    columns: !!showOptions.columns && isContent,
  };
}

/** "Visualizar": layout variant, height limit and number of columns. */
function VisualizeMenu({
  viewOptions,
  setViewOptions,
  context,
}: ViewMenuProps) {
  const groups = getVisualizeGroups(viewOptions);
  return (
    <PrismMenu>
      <PrismMenuTrigger>
        <ViewMenuTrigger
          icon={<LayoutListIcon />}
          label="Visualizar"
          accessibleName={withContext("Visualizar ações", context)}
        />
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
        {groups.limitHeight && (
          <>
            {groups.variant && <PrismMenuSeparator />}
            <PrismMenuGroup
              aria-label="Altura"
              onSelectionChange={(keys) =>
                setViewOptions({
                  ...viewOptions,
                  limitHeight: new Set(keys).has("limitHeight"),
                })
              }
              selectedKeys={
                new Set(viewOptions.limitHeight ? ["limitHeight"] : [])
              }
              selectionMode="multiple"
            >
              <PrismMenuItem
                id="limitHeight"
                textValue="Limitar altura dos dias"
              >
                <ChevronsUpDownIcon /> Limitar altura dos dias
              </PrismMenuItem>
            </PrismMenuGroup>
          </>
        )}
        {groups.phaseColor && (
          <>
            {(groups.variant || groups.limitHeight) && <PrismMenuSeparator />}
            <PrismMenuGroup
              aria-label="Cor"
              onSelectionChange={(keys) =>
                setViewOptions({
                  ...viewOptions,
                  phaseColor: new Set(keys).has("phaseColor"),
                })
              }
              selectedKeys={
                new Set(viewOptions.phaseColor ? ["phaseColor"] : [])
              }
              selectionMode="multiple"
            >
              <PrismMenuItem id="phaseColor" textValue="Cor da fase">
                <PaletteIcon /> Cor da fase
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
function SortMenu({ viewOptions, setViewOptions, context }: ViewMenuProps) {
  const { showOptions } = viewOptions;
  return (
    <PrismMenu>
      <PrismMenuTrigger>
        <ViewMenuTrigger
          icon={<ListOrderedIcon />}
          label="Ordenar"
          accessibleName={withContext("Ordenar ações", context)}
        />
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
function DisplayMenu({ viewOptions, setViewOptions, context }: ViewMenuProps) {
  const { showOptions } = viewOptions;
  return (
    <PrismMenu>
      <PrismMenuTrigger>
        <ViewMenuTrigger
          icon={<EyeIcon />}
          label="Exibir"
          accessibleName={withContext("Exibir campos", context)}
        />
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

export interface UViewOptionsProps {
  viewOptions: UViewOptions;
  setViewOptions: (viewOptions: UViewOptions) => void;
  startComponents?: React.ReactNode;
  endComponents?: React.ReactNode;
  className?: string;
  /** Distinguishes menu names when more than one UViewOptions is on a page. */
  context?: string;
}

export function UViewOptions({
  viewOptions,
  setViewOptions,
  startComponents,
  endComponents,
  className,
  context,
}: UViewOptionsProps) {
  viewOptions.variant ||= VARIANT.line;
  const { showOptions } = viewOptions;
  const menuProps = { viewOptions, setViewOptions, context };
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
    <div
      className={cn(
        "flex w-full shrink flex-wrap items-center justify-between gap-x-2 gap-y-2",
        className,
      )}
    >
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
            <UCategoriesCombobox
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
            <UPhaseCombobox
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
