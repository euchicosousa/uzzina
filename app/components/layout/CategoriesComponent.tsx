import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { useOutletContext, useRouteLoaderData } from "react-router";
import {
  CATEGORIES,
  ORDER_BY,
  VARIANT,
  type CATEGORY_TYPE,
} from "~/lib/CONSTANTS";
import { getCleanAction, Icons } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import type { AppLoaderData } from "~/routes/app";
import { ActionContainer } from "../features/ActionContainer";
import { Button } from "../ui/button";
import { UBadge } from "../uzzina/UBadge";

/**
 * Visualização de ações agrupadas por categoria.
 * Exibe apenas as categorias que possuem pelo menos uma ação no dia.
 */
export function CategoriesComponent({
  actions,
  orderBy,
  ascending,
}: {
  actions: Action[];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
}) {
  // Filtra apenas as categorias que estão presentes nas ações atuais
  const activeCategories = useMemo(() => {
    const slugSet = new Set(actions.map((a) => a.category));
    return Object.values(CATEGORIES).filter((c) => slugSet.has(c.slug));
  }, [actions]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {activeCategories.map((category) => {
          const categoryActions = actions.filter(
            (a) => a.category === category.slug,
          );
          return (
            <CategoryColumn
              key={category.slug}
              category={category}
              actions={categoryActions}
              orderBy={orderBy}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryColumn({
  category,
  actions,
  orderBy,
  ascending,
}: {
  category: CATEGORY_TYPE;
  actions: Action[];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
}) {
  const { person } = useRouteLoaderData("routes/app") as AppLoaderData;
  const { setBaseAction } = useOutletContext<{
    setBaseAction: (action: Action) => void;
  }>();

  return (
    <div className="group/column flex flex-col overflow-hidden">
      {/* Header da categoria */}
      <div className="flex h-10 items-center justify-between gap-4 overflow-hidden p-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color,
            }}
          >
            <Icons slug={category.slug} className="size-4" />
          </div>
          <span className="truncate text-sm font-medium tracking-tight">
            {category.title}
          </span>
          <UBadge value={actions.length} />
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="size-6 opacity-0 group-hover/column:opacity-100"
          onClick={() =>
            setBaseAction({
              ...(getCleanAction({
                user_id: person.user_id,
              }) as unknown as Action),
              category: category.slug,
            })
          }
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      {/* Lista de ações */}
      <ActionContainer
        actions={actions}
        variant={VARIANT.hair}
        showPartner
        showLate
        orderBy={orderBy}
        ascending={ascending}
      />
    </div>
  );
}
