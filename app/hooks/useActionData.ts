import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "~/contexts/AppContext";
import type { Action, Partner, Person } from "~/types";
import { CATEGORIES, PHASES, type CATEGORY, type PHASE } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";

const DEFAULT_PEOPLE: Person[] = [];

/**
 * Hook para extrair, resolver e memoizar os relacionamentos da ação
 * (parceiros completos, responsáveis completos, fase atual e categoria).
 */
export function useActionData(action: Action) {
  const { partners } = useAppContext();
  const { data: people = DEFAULT_PEOPLE } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });

  const currentPhase = useMemo(
    () => PHASES[(action.phase as PHASE) || "idea"],
    [action.phase],
  );

  const currentPartners = useMemo(
    () =>
      action.partners
        .map((partner) => partners.find((p: Partner) => p.slug === partner))
        .filter((p): p is Partner => p !== undefined),
    [action.partners, partners],
  );

  const currentResponsibles = useMemo(
    () =>
      action.responsibles
        .map((person) => people.find((p: Person) => p.user_id === person))
        .filter((r) => r !== undefined) as Person[],
    [action.responsibles, people],
  );

  const currentCategory = useMemo(
    () => CATEGORIES[action.category as CATEGORY],
    [action.category],
  );

  return {
    people,
    partners,
    currentPhase,
    currentPartners,
    currentResponsibles,
    currentCategory,
  };
}
