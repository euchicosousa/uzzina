import { addMinutes, format, isToday } from "date-fns";
import { CATEGORY_ATTRIBUTES, PRIORITIES, STATES } from "~/lib/CONSTANTS";
import type { CATEGORY } from "~/lib/CONSTANTS";

export const getCleanAction = ({
  user_id,
  date,
  partners,
}: {
  user_id: string;
  date?: Date;
  partners?: string[];
}) => {
  date = date || new Date();
  let _date = format(
    isToday(date)
      ? date.getHours() < 11
        ? date.setHours(11, 0, 0)
        : addMinutes(date, 10)
      : date.setHours(11, 0, 0),
    "yyyy-MM-dd HH:mm:ss",
  );

  return {
    title: "",
    description: "",
    state: STATES.idea.slug,
    priority: PRIORITIES.medium.slug,
    category: "post",
    responsibles: [user_id],
    color: "#999",
    date: _date,
    partners: partners || [],
    time: 10,
    archived: false,
    attributes: buildAttributes("post"),
  };
};

/**
 * Cria o objeto de attributes inicial para uma categoria.
 * Todos os slugs da categoria começam com state "idea".
 */
export function buildAttributes(category: string): Record<string, string> {
  const slugs = CATEGORY_ATTRIBUTES[category as CATEGORY] ?? [];
  return Object.fromEntries(slugs.map((slug) => [slug, STATES.idea.slug]));
}

/**
 * Ao trocar de categoria, preserva o estado dos slugs que existem
 * em ambas as categorias. Slugs novos começam como "idea".
 */
export function mergeAttributes(
  oldAttrs: Record<string, string>,
  newCategory: string,
): Record<string, string> {
  const newSlugs = CATEGORY_ATTRIBUTES[newCategory as CATEGORY] ?? [];
  return Object.fromEntries(
    newSlugs.map((slug) => [slug, oldAttrs[slug] ?? STATES.idea.slug]),
  );
}
