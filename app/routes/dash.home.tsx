import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { useState } from "react";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { ClientCalendar } from "~/components/client/ClientCalendar";
import { VARIANT, ORDER_BY } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { getClientSession } from "~/services/client-auth.server";
import { ActionContainer } from "~/components/features/ActionContainer";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, partnerSlugs } = await getClientSession(request);

  if (partnerSlugs.length === 0) {
    return { actions: [] as Action[] };
  }

  // Janela de 3 meses centrada no hoje
  const today = new Date();
  const start = format(addDays(today, -30), "yyyy-MM-dd HH:mm:ss");
  const end = format(addDays(today, 90), "yyyy-MM-dd HH:mm:ss");

  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .is("archived", false)
    .overlaps("partners", partnerSlugs)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true })
    .limit(2000);

  return { actions: (actions ?? []) as Action[] };
};

export default function DashHome() {
  const { actions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(new Date());
  const [mobileTab, setMobileTab] = useState<"calendar" | "feed">("calendar");

  const handleActionClick = (action: Action) => {
    navigate(`/dash/action/${action.id}`);
  };

  const handlePrev = () => setCurrentDay((d) => addDays(d, -7));
  const handleNext = () => setCurrentDay((d) => addDays(d, 7));

  // Ações de feed (Instagram) ordenadas por instagram_date
  const feedActions = actions.filter(
    (a) => a.category === "post" || a.category === "reels" || a.category === "stories",
  );

  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden">
      {/* Mobile: abas */}
      <div className="flex w-full flex-col md:hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileTab === "calendar" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            onClick={() => setMobileTab("calendar")}
          >
            Calendário
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${mobileTab === "feed" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            onClick={() => setMobileTab("feed")}
          >
            Feed
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === "calendar" ? (
            <ClientCalendar
              actions={actions}
              currentDay={currentDay}
              onPrev={handlePrev}
              onNext={handleNext}
              onActionClick={handleActionClick}
            />
          ) : (
            <FeedSection actions={feedActions} onActionClick={handleActionClick} />
          )}
        </div>
      </div>

      {/* Desktop: calendário + feed lado a lado */}
      <div className="hidden min-h-0 flex-1 md:flex overflow-hidden">
        {/* Calendário — ocupa o resto */}
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <ClientCalendar
            actions={actions}
            currentDay={currentDay}
            onPrev={handlePrev}
            onNext={handleNext}
            onActionClick={handleActionClick}
          />
        </div>

        {/* Feed — max-width 480px */}
        <div className="w-full max-w-[480px] shrink-0 border-l overflow-y-auto">
          <FeedSection actions={feedActions} onActionClick={handleActionClick} />
        </div>
      </div>
    </div>
  );
}

function FeedSection({
  actions,
  onActionClick,
}: {
  actions: Action[];
  onActionClick: (action: Action) => void;
}) {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Feed do Instagram
      </h2>
      {actions.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma publicação programada.</p>
      ) : (
        <ActionContainer
          actions={actions}
          variant={VARIANT.content}
          columns={2}
          orderBy={ORDER_BY.instagram_date}
          ascending
          isInstagramDate
          showCategory
          onClick={onActionClick}
        />
      )}
    </div>
  );
}
