import type { Action } from "~/models/actions.server";
import type { ViewOptions } from "~/components/features/ViewOptions";

/**
 * Retorna as pessoas (people) que correspondem aos IDs fornecidos.
 */
export function getPeople(
  ids: string[] | null | undefined,
  people: Person[],
): Person[] {
  if (!ids || ids.length === 0) return [];
  return people.filter((p) => ids.includes(p.user_id));
}

/**
 * Filtra uma lista de ações com base nas ViewOptions e em uma query de busca.
 */
export function filterActions(
  actions: Action[],
  options: ViewOptions,
  query?: string,
) {
  return actions.filter((action) => {
    // 1. Filtro por busca textual (Título)
    if (query) {
      const title = action.title?.toLowerCase() || "";
      if (!title.includes(query.toLowerCase())) return false;
    }

    // 2. Filtro por Categoria
    if (options.filter_category && options.filter_category.length > 0) {
      if (!options.filter_category.includes(action.category)) return false;
    }

    // 3. Filtro por Estado (Status)
    if (options.filter_state && options.filter_state.length > 0) {
      if (!options.filter_state.includes(action.state)) return false;
    }

    // 4. Filtro por Responsável
    if (options.filter_responsible && options.filter_responsible.length > 0) {
      // Verifica se a ação tem algum dos responsáveis selecionados no filtro
      const responsibles = (action.responsibles as string[]) || [];
      const hasOverlap = responsibles.some((r) =>
        options.filter_responsible?.includes(r),
      );
      if (!hasOverlap) return false;
    }

    return true;
  });
}
