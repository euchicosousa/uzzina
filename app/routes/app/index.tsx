import { filterOperationalActions } from "~/utils/partner-visibility";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { sortActions } from "~/utils";

import { HomeCalendarView } from "~/components/features/home/HomeCalendarView";
import { HomeLateView } from "~/components/features/home/HomeLateView";
import { HomePartnersView } from "~/components/features/home/HomePartnersView";
import { HomeSprintView } from "~/components/features/home/HomeSprintView";
import { HomeTodayView } from "~/components/features/home/HomeTodayView";

import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchAllLateActions, fetchHomeActions } from "~/lib/supabase.queries";
import { Footer } from "~/components/layout/Footer";

import { AlertTriangleIcon } from "lucide-react";
import { PrismAlert, PrismAlertDescription, PrismAlertTitle, PrismButton } from "~/components/prism";

export const Route = createFileRoute("/app/")({
  component: AppHome,
});

import { useAppContext } from "~/contexts/AppContext";
import type { Partner } from "~/types";

function AppHome() {
  const { person, partners } = useAppContext();

  const partnerSlugs = partners.map(p => p.slug).sort();
  const now = new Date();

  const startDateISO = startOfWeek(startOfMonth(now)).toISOString();
  const endDateISO = endOfDay(endOfWeek(endOfMonth(now))).toISOString();
  const todayEndISO = endOfDay(now).toISOString();

  // Busca as ações no client usando TanStack Query
  const {
    data: currentActions = [],
    isLoading: isLoadingHomeActions,
    isError: isHomeActionsError,
    refetch: refetchHomeActions,
  } = useQuery({
    queryKey: QUERY_KEYS.actions.list("home",person.user_id,person.admin,partnerSlugs,startDateISO,endDateISO),
    queryFn: () =>
      fetchHomeActions(
        person.user_id,
        startDateISO,
        endDateISO,
        todayEndISO,
        partners.map((p: Partner) => p.slug),
      ),
  });

  // Busca as lateActions no client usando TanStack Query
  const {
    data: currentLateActions = [],
    isError: isLateActionsError,
    refetch: refetchLateActions,
  } = useQuery({
    queryKey: QUERY_KEYS.actions.list("late",person.user_id,person.admin,partnerSlugs),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p: Partner) => p.slug),
      ),
  });

  const { setBaseAction, partnerFilters } = useAppContext();

  const filteredActions = useMemo(() => {
    const operational = filterOperationalActions(currentActions,partners);
    if (partnerFilters.length === 0) return operational;
    return operational.filter((action) =>
      action.partners?.some((p) => partnerFilters.includes(p)),
    );
  }, [currentActions, partnerFilters, partners]);

  const filteredLateActions = useMemo(() => {
    const operational = filterOperationalActions(currentLateActions,partners);
    if (partnerFilters.length === 0) return operational;
    return operational.filter((action) =>
      action.partners?.some((p) => partnerFilters.includes(p)),
    );
  }, [currentLateActions, partnerFilters, partners]);

  const sprintActions = useMemo(
    () =>
      sortActions(
        filteredActions.filter((action) =>
          action.sprints?.includes(person.user_id),
        ),
        ORDER_BY.phase,
      ),
    [filteredActions, person.user_id],
  );

  return (
    <>
      {(isHomeActionsError || isLateActionsError) && (
        <div className="px-6 pt-4 pb-2">
          <PrismAlert variant="error">
            <AlertTriangleIcon />
            <PrismAlertTitle>Erro ao carregar dados do painel</PrismAlertTitle>
            <PrismAlertDescription className="flex items-center justify-between gap-4 mt-1">
              <span>
                Não foi possível carregar algumas ações da sua conta. Verifique sua conexão com a internet.
              </span>
              <PrismButton
                size="default"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  if (isHomeActionsError) refetchHomeActions();
                  if (isLateActionsError) refetchLateActions();
                }}
              >
                Tentar novamente
              </PrismButton>
            </PrismAlertDescription>
          </PrismAlert>
        </div>
      )}

      {sprintActions.length > 0 && (
        <>
          <HomeSprintView actions={sprintActions} />
          {/* <div className="-mx-8 h-2 border-b"></div> */}
        </>
      )}

      <HomeTodayView
        actions={filteredActions}
        isLoading={isLoadingHomeActions}
      />
      {/* <div className="-mx-8 h-2 border-b"></div> */}
      <HomeCalendarView
        actions={filteredActions}
        setBaseAction={setBaseAction}
      />
      <HomePartnersView actions={filteredLateActions} />
      <HomeLateView actions={filteredLateActions} />
      <Footer />
    </>
  );
}
