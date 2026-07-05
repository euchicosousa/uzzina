import { endOfWeek, startOfDay } from "date-fns";
import { useMatches, useOutletContext } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import KanbanStationsFlow from "~/components/layout/KanbanStationsFlow";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchFlowActions } from "~/lib/supabase.queries";
import type { AppLoaderData } from "./app";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { FlowDateFilter } from "~/components/features/FlowDateFilter";
export function meta() {
  return [
    {
      title: "Flow | Uzzina",
    },
    {
      name: "description",
      content: "Gerenciamento de Fluxo da Agência",
    },
  ];
}
export default function AppFlow() {
  const { person, partners } = useMatches()[1].loaderData as AppLoaderData;
  useOutletContext();

  // Local filters
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [localPartnerFilters] = useState<string[]>([]);

  // Default date filter: from = undefined (get all late), to = Saturday of this week
  const now = new Date();
  const defaultTo = endOfWeek(now, {
    weekStartsOn: 0,
  }); // Sábado
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to: Date;
  }>({
    from: undefined,
    to: defaultTo,
  });

  // If local partner filters exist, use them, otherwise use the ones the user has access to
  const queryPartners =
    localPartnerFilters.length > 0
      ? localPartnerFilters
      : partners.map((p) => p.slug);
  const startDateISO = dateRange.from
    ? startOfDay(dateRange.from).toISOString()
    : undefined;
  const endDateISO = endOfWeek(dateRange.to, {
    weekStartsOn: 0,
  }).toISOString();
  const { data: actions = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.actions.flow(person.user_id, {
      from: startDateISO,
      to: endDateISO,
    }),
    queryFn: () => fetchFlowActions(queryPartners, endDateISO, startDateISO),
  });
  const filteredActions = useMemo(() => {
    let result = actions;
    if (selectedPhases.length > 0) {
      result = result.filter((a) => selectedPhases.includes(a.phase || "idea"));
    }
    if (selectedCategories.length > 0) {
      result = result.filter((a) =>
        selectedCategories.includes(a.category || ""),
      );
    }
    return result;
  }, [actions, selectedPhases, selectedCategories]);
  return (
    <div className="page-height flex flex-col overflow-hidden">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 items-center p-4 xl:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground p-0">
          Flow
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <FlowDateFilter
            dateRange={dateRange}
            onChange={(range) => setDateRange(range)}
          />
          {/* Phase Filter */}
          <PhaseCombobox
            isMulti
            onSelect={({ phases }) => setSelectedPhases(phases)}
            selectedPhases={selectedPhases}
          />
          {/* Categories Filter */}
          <CategoriesCombobox
            isMulti
            onSelect={({ categories }) => setSelectedCategories(categories)}
            selectedCategories={selectedCategories}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Carregando ações...
          </div>
        ) : (
          <KanbanStationsFlow actions={filteredActions} />
        )}
      </div>
    </div>
  );
}
