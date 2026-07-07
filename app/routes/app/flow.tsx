import { endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import KanbanStationsFlow from "~/components/layout/KanbanStationsFlow";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchFlowActions } from "~/lib/supabase.queries";
import { PhaseCombobox } from "~/components/features/PhaseCombobox";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { FlowDateFilter } from "~/components/features/FlowDateFilter";
import { PartnersCombobox } from "~/components/features/PartnersCombobox";
import { ResponsiblesCombobox } from "~/components/features/ResponsiblesCombobox";
import { z } from "zod";

const flowSearchSchema = z.object({
  partner: z.string().optional(),
});

export const Route = createFileRoute("/app/flow")({
  validateSearch: flowSearchSchema,
  component: AppFlow,
});

import { useAppContext } from "~/contexts/AppContext";
import type { Partner } from "~/types";

function AppFlow() {
  const { person, partners } = useAppContext();
  const navigate = useNavigate({ from: "/app/flow" });
  const searchParams = Route.useSearch();
  const urlPartner = searchParams.partner;

  // Local filters
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>(
    [],
  );
  const [localPartnerFilters, setLocalPartnerFilters] = useState<string[]>(
    urlPartner ? [urlPartner] : [],
  );
  const now = new Date();
  const defaultFrom = startOfWeek(now, {
    weekStartsOn: 0,
  }); // Domingo
  const defaultTo = endOfWeek(now, {
    weekStartsOn: 0,
  }); // Sábado

  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to: Date;
  }>({
    from: defaultFrom,
    to: defaultTo,
  });

  // If local partner filters exist, use them, otherwise use all accessible partners
  const queryPartners =
    localPartnerFilters.length > 0
      ? localPartnerFilters
      : partners.map((p: Partner) => p.slug);

  // Check if today is inside the selected date range
  const isCurrentPeriod = useMemo(() => {
    if (!dateRange.from) return true; // Se não tem início definido, assume período atual
    const today = startOfDay(now);
    const fromDate = startOfDay(dateRange.from);
    const toDate = startOfDay(dateRange.to);
    return today >= fromDate && today <= toDate;
  }, [dateRange, now]);
  const startDateISO = isCurrentPeriod
    ? undefined // Se englobar hoje, traz todas as atrasadas (startDate = undefined na query)
    : dateRange.from
      ? startOfDay(dateRange.from).toISOString()
      : undefined;
  const endDateISO = endOfWeek(dateRange.to, {
    weekStartsOn: 0,
  }).toISOString();
  const { data: actions = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.actions.flow(person.user_id, {
      from: startDateISO,
      to: endDateISO,
      partners: queryPartners,
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
    if (selectedResponsibles.length > 0) {
      result = result.filter((a) =>
        a.responsibles?.some((r) => selectedResponsibles.includes(r)),
      );
    }
    return result;
  }, [actions, selectedPhases, selectedCategories, selectedResponsibles]);
  const handlePartnerSelect = (slugs: string[]) => {
    setLocalPartnerFilters(slugs);
    if (slugs.length === 1) {
      navigate({
        search: (old) => ({ ...old, partner: slugs[0] }),
      });
    } else {
      navigate({
        search: (old) => ({ ...old, partner: undefined }),
      });
    }
  };
  const selectedPartnersObjects = partners.filter((p: Partner) =>
    localPartnerFilters.includes(p.slug),
  );
  return (
    <div className="page-height flex flex-col overflow-hidden">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 items-center p-4 xl:px-8 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground p-0">
          Flow
        </h1>
        <div className="flex items-center gap-4">
          {/* Partner Filter */}
          <PartnersCombobox
            onSelect={handlePartnerSelect}
            selectedPartners={localPartnerFilters}
            variant="filter"
          />
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
          {/* Responsibles Filter */}
          <ResponsiblesCombobox
            currentPartners={
              selectedPartnersObjects.length > 0
                ? selectedPartnersObjects
                : partners
            }
            onSelect={setSelectedResponsibles}
            selectedResponsibles={selectedResponsibles}
            variant="filter"
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
