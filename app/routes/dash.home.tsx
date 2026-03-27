import { addDays, format } from "date-fns";
import { useState } from "react";
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import { ClientCalendar } from "~/components/client/ClientCalendar";
import { Content } from "~/components/features/Content";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { CATEGORIES, type CATEGORY } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { getClientSession, dashSessionStorage } from "~/services/client-auth.server";
import { sortActions } from "~/utils/sort";
import { getInstagramFeedActions } from "~/utils/validation";
import type { Partner } from "~/models/partners.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, partners } = await getClientSession(request);

  if (partners.length === 0) {
    return { actions: [] as Action[], currentPartner: null };
  }

  const session = await dashSessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  const lastPartner = session.get("lastPartner");

  const url = new URL(request.url);
  const partnerQuery = url.searchParams.get("partner");

  const currentPartnerSlug =
    partnerQuery && partners.some((p: any) => p.slug === partnerQuery)
      ? partnerQuery
      : lastPartner && partners.some((p: any) => p.slug === lastPartner)
        ? lastPartner
        : partners[0].slug;

  const currentPartner = partners.find((p: any) => p.slug === currentPartnerSlug)!;

  // Janela de 3 meses centrada no hoje
  const today = new Date();
  const start = format(addDays(today, -30), "yyyy-MM-dd HH:mm:ss");
  const end = format(addDays(today, 90), "yyyy-MM-dd HH:mm:ss");

  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .is("archived", false)
    .contains("partners", [currentPartnerSlug])
    .neq("state", "idea")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true })
    .limit(2000);

  return { actions: (actions ?? []) as Action[], currentPartner };
};

export default function DashHome() {
  const { actions, currentPartner } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(new Date());
  const [mobileTab, setMobileTab] = useState<"calendar" | "feed">("calendar");
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");

  if (!currentPartner) return null;

  const handleActionClick = (action: Action) => {
    const searchParams = new URLSearchParams(window.location.search);
    const partner = searchParams.get("partner");
    navigate(`/dash/action/${action.id}${partner ? `?partner=${partner}` : ""}`);
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
  const feedActions = getInstagramFeedActions(actions, true, true);

  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      {/* Mobile: abas */}
      <div className="flex min-h-0 w-full flex-1 flex-col lg:hidden">
        <div className="flex items-center justify-between border-b pr-2">
          <div className="flex flex-1">
            <button
              className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${mobileTab === "calendar" ? "border-foreground" : "text-muted-foreground border-transparent"}`}
              onClick={() => setMobileTab("calendar")}
            >
              Calendário
            </button>
            <button
              className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${mobileTab === "feed" ? "border-foreground" : "text-muted-foreground border-transparent"}`}
              onClick={() => setMobileTab("feed")}
            >
              Feed
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === "calendar" ? (
            <ClientCalendar
              actions={feedActions}
              currentDay={currentDay}
              onPrev={handlePrev}
              onNext={handleNext}
              onActionClick={handleActionClick}
              view={calendarView}
              calendarView={calendarView}
              setCalendarView={setCalendarView}
            />
          ) : (
            <div className="h-full w-full overflow-y-auto">
              <FeedSection
                actions={feedActions}
                onActionClick={handleActionClick}
                currentPartner={currentPartner as Partner}
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
            currentDay={currentDay}
            onPrev={handlePrev}
            onNext={handleNext}
            onActionClick={handleActionClick}
            view={calendarView}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
          />
        </div>

        {/* Feed — max-width 560px (agora com 3 colunas) */}
        <div className="w-full max-w-[560px] shrink-0 overflow-y-auto border-l">
          <FeedSection
            actions={feedActions}
            onActionClick={handleActionClick}
            currentPartner={currentPartner as Partner}
          />
        </div>
      </div>
    </div>
  );
}

function FeedSection({
  actions,
  onActionClick,
  currentPartner,
}: {
  actions: Action[];
  onActionClick: (action: Action) => void;
  currentPartner: Partner;
}) {
  actions = sortActions(actions, "date", false);
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <UAvatar fallback={currentPartner.short} image={currentPartner.image} />
        <div className="font-medium">{currentPartner.title}</div>
      </div>
      {actions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma publicação programada.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-px">
          {actions.map((action) => (
            <div
              key={action.id}
              onClick={() => onActionClick(action)}
              className="relative transition-opacity hover:opacity-60"
            >
              <Content
                action={action}
                isSquared
                category={CATEGORIES[action.category as CATEGORY]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
