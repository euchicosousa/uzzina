import { parseISO } from "date-fns";
import type { Action } from "~/models/actions.server";
import {
  ORDER_BY,
  PRIORITIES,
  STATES,
  type PRIORITY,
  type STATE,
} from "~/lib/CONSTANTS";

export function sortActions(
  actions: Action[],
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY],
  ascending = true,
) {
  const sorted = [...actions];

  const priorities_order = Object.values(PRIORITIES).map(
    (priority) => priority.slug,
  );
  const states_order = Object.values(STATES).map((state) => state.slug);

  /** Tiebreaker fixo: ordem alfabética por título quando o critério primário empata */
  const byTitle = (a: Action, b: Action) =>
    (a.title ?? "").localeCompare(b.title ?? "", "pt-BR", {
      sensitivity: "base",
    });

  switch (orderBy) {
    case ORDER_BY.priority:
      sorted.sort((a, b) => {
        const primary =
          (priorities_order.indexOf(a.priority as PRIORITY) -
            priorities_order.indexOf(b.priority as PRIORITY)) *
          (ascending ? 1 : -1);
        return primary !== 0 ? primary : byTitle(a, b);
      });
      break;
    case ORDER_BY.state:
      sorted.sort((a, b) => {
        const primary =
          (states_order.indexOf(a.state as STATE) -
            states_order.indexOf(b.state as STATE)) *
          (ascending ? 1 : -1);
        return primary !== 0 ? primary : byTitle(a, b);
      });
      break;
    case ORDER_BY.date:
      sorted.sort((a, b) => {
        const primary =
          (parseISO(a.date).getTime() - parseISO(b.date).getTime()) *
          (ascending ? 1 : -1);
        return primary !== 0 ? primary : byTitle(a, b);
      });
      break;
    default:
      // Sem critério primário: ordem estável por título
      sorted.sort(byTitle);
      break;
  }

  return sorted;
}
