import {
  retryPortalQuery,
  usePortalSessionError,
} from "~/hooks/usePortalSessionError";
import { ULoader } from "~/components/uzzina/ULoader";
import {
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { ClientCalendar } from "~/components/client/ClientCalendar";
import { InstagramFeedSection } from "~/components/features/InstagramFeedSection";
import {
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
  PrismButton,
} from "~/components/prism";
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
        <ULoader size="2xl" className="text-primary" />
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
      <PrismTabs
        selectedKey={mobileTab}
        onSelectionChange={(key) => {
          if (key === "calendar" || key === "feed") setMobileTab(key);
        }}
        className="min-h-0 w-full flex-1 lg:hidden"
      >
        <PrismTabList aria-label="Visualização do portal">
          <PrismTab id="calendar">Calendário</PrismTab>
          <PrismTab id="feed">Feed</PrismTab>
        </PrismTabList>

        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === "calendar" ? (
            <PrismTabPanel id="calendar" className="h-full">
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
            </PrismTabPanel>
          ) : (
            <PrismTabPanel id="feed" className="h-full w-full overflow-y-auto">
              <InstagramFeedSection
                actions={feedActions}
                currentPartner={currentPartner}
                onActionClick={handleActionClick}
              />
            </PrismTabPanel>
          )}
        </div>
      </PrismTabs>

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
            endContent={
              <PrismButton
                aria-label={
                  isSidebarVisible
                    ? "Ocultar feed do Instagram"
                    : "Mostrar feed do Instagram"
                }
                aria-expanded={isSidebarVisible}
                aria-controls="dash-instagram-feed"
                onClick={toggleSidebar}
                size="icon"
                variant="ghost"
              >
                {isSidebarVisible ? (
                  <PanelRightCloseIcon />
                ) : (
                  <PanelRightOpenIcon />
                )}
              </PrismButton>
            }
          />
        </div>

        {/* Feed — max-width 560px (agora com 3 colunas) */}
        <div
          id="dash-instagram-feed"
          hidden={!isSidebarVisible}
          className="w-full max-w-140 shrink-0 overflow-y-auto border-l"
        >
          <InstagramFeedSection
            actions={feedActions}
            currentPartner={currentPartner}
            onActionClick={handleActionClick}
          />
        </div>
      </div>
    </div>
  );
}
