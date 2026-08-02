import type { Action, Partner } from "~/types";
import { addDays, format } from "date-fns";
import { SidebarClose } from "lucide-react";
import { useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { ClientCalendar } from "~/components/client/ClientCalendar";
import { InstagramFeedSection } from "~/components/features/InstagramFeedSection";
import { PrismButton } from "~/components/prism";
import { useQuery } from "@tanstack/react-query";
import { useDashContext } from "~/contexts/DashContext";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { getInstagramFeedActions } from "~/lib/helpers";
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
  const { partners } = useDashContext();
  const supabase = createSupabaseBrowserClient();
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
  const today = new Date();
  const start = format(addDays(today, -30), "yyyy-MM-dd HH:mm:ss");
  const end = format(addDays(today, 90), "yyyy-MM-dd HH:mm:ss");
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["dashActions", currentPartnerSlug],
    queryFn: async () => {
      if (!currentPartnerSlug) return [];
      const { data, error } = await supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        .contains("partners", [currentPartnerSlug])
        .neq("phase", "idea")
        .gte("date", start)
        .lte("date", end)
        .order("date", {
          ascending: true,
        })
        .limit(2000);
      if (error) throw error;
      return data as Action[];
    },
    enabled: !!currentPartnerSlug,
  });
  const isSidebarVisible = searchParams.sidebar !== "false";
  const toggleSidebar = () => {
    navigate({
      search: (old) => ({
        ...old,
        sidebar: isSidebarVisible ? "false" : "true",
      }),
    });
  };
  if (isLoading || !currentPartner) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Carregando calendário...
        </p>
      </div>
    );
  }
  const handleActionClick = (action: Action) => {
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
    if (calendarView === "month") setCurrentDay((d) => addDays(d, -30));
    else setCurrentDay((d) => addDays(d, -7));
  };
  const handleNext = () => {
    if (calendarView === "month") setCurrentDay((d) => addDays(d, 30));
    else setCurrentDay((d) => addDays(d, 7));
  };

  // Ações de feed (Instagram) ordenadas por date
  const instaActions = getInstagramFeedActions(actions, true, true);
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
              actions={instaActions}
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
                currentPartner={currentPartner as Partner}
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
            actions={feedActions}
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
            currentPartner={currentPartner as Partner}
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
