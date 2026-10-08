import {
  retryPortalQuery,
  usePortalSessionError,
} from "~/hooks/usePortalSessionError";
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { SidebarClose } from "lucide-react";
import { useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { ClientCalendar } from "~/components/client/ClientCalendar";
import { InstagramFeedSection } from "~/components/features/InstagramFeedSection";
import { PrismButton } from "~/components/prism";
import { useQuery } from "@tanstack/react-query";
import { useDashContext } from "~/contexts/DashContext";
import { fetchDashActions, type DashActionDto } from "~/services/dash-client";
import { getInstagramFeedActions } from "~/utils";
import { z } from "zod";
const dashSearchSchema = z.object({
  partner: z.string().optional(),
  sidebar: z.string().optional(),
});
export const Route = createFileRoute("/dash/")({
  validateSearch: dashSearchSchema,
  component: DashHome,
});
function DashHome() {
  const { partners, clientId } = useDashContext();
  const navigate = useNavigate({
    from: "/dash/",
  });
  const searchParams = Route.useSearch();
  const [currentDay, setCurrentDay] = useState(new Date());
  const [mobileTab, setMobileTab] = useState<"calendar" | "feed">("calendar");
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");
  const partnerQuery = searchParams.partner;
  const lastPartner =
    typeof window !== "undefined"
      ? localStorage.getItem("uzzina_dash_last_partner")
      : null;
  const currentPartnerSlug =
    partnerQuery && partners.some((p) => p.slug === partnerQuery)
      ? partnerQuery
      : lastPartner && partners.some((p) => p.slug === lastPartner)
        ? lastPartner
        : partners[0]?.slug || "";
  const currentPartner =
    partners.find((p) => p.slug === currentPartnerSlug) || partners[0];

  // Período visível cobrindo semanas completas (domingo a sábado)
  const visibleStart = startOfWeek(
    calendarView === "month" ? startOfMonth(currentDay) : currentDay,
    { weekStartsOn: 0 },
  );
  const visibleEnd = endOfWeek(
    calendarView === "month" ? endOfMonth(currentDay) : currentDay,
    { weekStartsOn: 0 },
  );

  const start = format(visibleStart, "yyyy-MM-dd 00:00:00");
  const end = format(visibleEnd, "yyyy-MM-dd 23:59:59");
  const periodKey =
    calendarView === "month"
      ? format(currentDay, "yyyy-MM")
      : format(visibleStart, "yyyy-MM-dd");

  const {
    data: actions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<DashActionDto[]>({
    queryKey: [
      "dashActions",
      clientId,
      currentPartnerSlug,
      calendarView,
      periodKey,
    ],
    queryFn: async () => {
      if (!currentPartnerSlug) return [];
      return fetchDashActions({
        partner: currentPartnerSlug,
        from: start,
        to: end,
      });
    },
    enabled: !!currentPartnerSlug,
    retry: retryPortalQuery,
  });
  usePortalSessionError(error);
  const isSidebarVisible = searchParams.sidebar !== "false";
  const toggleSidebar = () => {
    navigate({
      search: (old) => ({
        ...old,
        sidebar: isSidebarVisible ? "false" : "true",
      }),
    });
  };
  if (error) {
    return (
      <div
        role="alert"
        className="flex h-full flex-col items-center justify-center gap-4 p-8"
      >
        <h2>Falha ao carregar calendário</h2>
        <p>Não foi possível consultar as ações. Tente novamente.</p>
        <PrismButton onClick={() => refetch()}>Tentar novamente</PrismButton>
      </div>
    );
  }
  if (!currentPartner) {
    return <p className="p-8">Nenhum parceiro vinculado à sua conta.</p>;
  }
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          Carregando calendário...
        </p>
      </div>
    );
  }
  const handleActionClick = (action: DashActionDto) => {
    navigate({
      to: "/dash/action/$id",
      params: {
        id: action.id,
      },
      search: (old) => ({
        partner: old.partner,
      }),
    });
  };
  const handlePrev = () => {
    if (calendarView === "month") setCurrentDay((d) => addMonths(d, -1));
    else setCurrentDay((d) => addWeeks(d, -1));
  };
  const handleNext = () => {
    if (calendarView === "month") setCurrentDay((d) => addMonths(d, 1));
    else setCurrentDay((d) => addWeeks(d, 1));
  };

  // Ações do calendário (todas as postagens/stories programadas do parceiro no período)
  const calendarActions = getInstagramFeedActions(actions, true, true);
  // Ações da grade do feed (exclusivo para grade de fotos: post, reels, carrossel)
  const feedActions = getInstagramFeedActions(actions);
  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      {/* Mobile: abas */}
      <div className="flex min-h-0 w-full flex-1 flex-col lg:hidden">
        <div className="flex items-center justify-between border-b pr-2">
          <div className="flex flex-1">
            <button
              className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${mobileTab === "calendar" ? "border-foreground" : "border-transparent text-muted-foreground"}`}
              onClick={() => setMobileTab("calendar")}
              type="button"
            >
              Calendário
            </button>
            <button
              className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${mobileTab === "feed" ? "border-foreground" : "border-transparent text-muted-foreground"}`}
              onClick={() => setMobileTab("feed")}
              type="button"
            >
              Feed
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === "calendar" ? (
            <ClientCalendar
              actions={calendarActions}
              calendarView={calendarView}
              currentDay={currentDay}
              onActionClick={handleActionClick}
              onNext={handleNext}
              onPrev={handlePrev}
              setCalendarView={setCalendarView}
              view={calendarView}
            />
          ) : (
            <div className="h-full w-full overflow-y-auto">
              <InstagramFeedSection
                actions={feedActions}
                currentPartner={currentPartner}
                onActionClick={handleActionClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop (lg+): calendário + feed lado a lado */}
      <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
        {/* Calendário — ocupa o resto */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ClientCalendar
            actions={calendarActions}
            calendarView={calendarView}
            currentDay={currentDay}
            onActionClick={handleActionClick}
            onNext={handleNext}
            onPrev={handlePrev}
            setCalendarView={setCalendarView}
            view={calendarView}
          />
        </div>

        {/* Feed — max-width 560px (agora com 3 colunas) */}
        <div
          className={`w-full ${isSidebarVisible ? "max-w-140" : "max-w-0"} shrink-0 overflow-y-auto border-l`}
        >
          <InstagramFeedSection
            actions={feedActions}
            currentPartner={currentPartner}
            onActionClick={handleActionClick}
          />
        </div>
      </div>
      <PrismButton
        className="absolute top-4 left-4 z-50 rounded-full"
        onClick={toggleSidebar}
        size="icon"
        variant="ghost"
      >
        <SidebarClose />
      </PrismButton>
    </div>
  );
}
