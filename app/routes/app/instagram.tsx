import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { PrismBadge, PrismButton, PrismButtonGroup } from "~/components/prism";
import { UPartnersCombobox } from "~/components/uzzina/UPartnersCombobox";
import { useAppContext } from "~/contexts/AppContext";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { instagramPublishCalendarRequest } from "~/models/instagram-publish";
import { getActionById } from "~/models/actions";
import type { InstagramCalendarEvent } from "~/models/instagram-publish";

export const Route = createFileRoute("/app/instagram")({
  component: InstagramCalendarPage,
});

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function eventStatus(status: string) {
  switch (status) {
    case "published":
      return { label: "Publicado", variant: "success" as const };
    case "scheduled":
      return { label: "Programado", variant: "info" as const };
    case "processing":
      return { label: "Publicando", variant: "warning" as const };
    case "partial":
      return { label: "Parcial", variant: "warning" as const };
    case "uncertain":
      return { label: "Conferir", variant: "warning" as const };
    case "failed":
      return { label: "Falhou", variant: "error" as const };
    default:
      return { label: status, variant: "secondary" as const };
  }
}

function formatLabel(formatValue: string) {
  switch (formatValue) {
    case "stories":
      return "Stories";
    case "reel":
      return "Reel";
    case "video":
      return "Vídeo no feed";
    case "feed":
      return "Feed";
    default:
      return formatValue;
  }
}

function eventsOnDay(events: InstagramCalendarEvent[], day: Date) {
  return events.filter((event) => isSameDay(new Date(event.occurredAt), day));
}

function InstagramCalendarPage() {
  const { person, partners, setPrimaryAction } = useAppContext();
  const queryClient = useQueryClient();
  const pageRef = useRef<HTMLDivElement>(null);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [openingAction, setOpeningAction] = useState(false);
  useFillScrollViewport(pageRef);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);
  const from = startOfDay(days[0] ?? month).toISOString();
  const to = startOfDay(addDays(days.at(-1) ?? month, 1)).toISOString();
  const calendarQuery = useQuery({
    queryKey: ["instagram-publish-calendar", person.user_id, from, to],
    queryFn: () => instagramPublishCalendarRequest(from, to),
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
  const connectedPartners = useMemo(() => {
    const ids = new Set(calendarQuery.data?.connectedPartnerIds ?? []);
    return partners.filter((partner) => ids.has(partner.id));
  }, [calendarQuery.data?.connectedPartnerIds, partners]);
  const events = useMemo(() => {
    const allEvents = calendarQuery.data?.events ?? [];
    if (selectedPartners.length === 0) return allEvents;
    const selectedPartnerIds = new Set(
      partners
        .filter((partner) => selectedPartners.includes(partner.slug))
        .map((partner) => partner.id),
    );
    return allEvents.filter((event) => selectedPartnerIds.has(event.partnerId));
  }, [calendarQuery.data?.events, partners, selectedPartners]);
  const selectedEvents = useMemo(
    () => eventsOnDay(events, selectedDay),
    [events, selectedDay],
  );

  const changeMonth = (nextMonth: Date) => {
    setMonth(startOfMonth(nextMonth));
    setSelectedDay(startOfMonth(nextMonth));
  };
  const selectToday = () => {
    const today = startOfDay(new Date());
    setMonth(startOfMonth(today));
    setSelectedDay(today);
  };

  const openAction = async (actionId: string) => {
    if (openingAction) return;
    setOpeningAction(true);
    const generation = getQuerySessionGeneration(queryClient);
    try {
      const action = await getActionById(
        createSupabaseBrowserClient(),
        actionId,
      );
      if (generation !== getQuerySessionGeneration(queryClient)) return;
      await setPrimaryAction(action);
    } catch {
      toast.error("Não foi possível abrir a ação.");
    } finally {
      setOpeningAction(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className="mx-auto flex w-full max-w-7xl shrink-0 flex-col md:h-[calc(100vh-68px)] md:flex-row md:overflow-hidden"
    >
      <aside className="flex w-full shrink-0 flex-col gap-5 p-4 md:h-full md:w-80 md:overflow-y-auto md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Publicações</h2>
          </div>
          <PrismButton
            aria-label="Atualizar calendário"
            isDisabled={calendarQuery.isFetching}
            onPress={() => void calendarQuery.refetch()}
            size="icon-sm"
            variant="ghost"
          >
            <RefreshCwIcon />
          </PrismButton>
        </div>

        {connectedPartners.length > 0 && (
          <UPartnersCombobox
            allowAll
            availablePartners={connectedPartners}
            disabled={calendarQuery.isLoading || calendarQuery.isError}
            onSelect={setSelectedPartners}
            selectedPartners={selectedPartners}
            showText
            size={"default"}
            variant="outline"
          />
        )}

        <section aria-label="Selecionar dia" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl capitalize">
              {format(month, "MMM\/yyyy", { locale: ptBR })}
            </h3>
            <PrismButtonGroup>
              <PrismButton
                aria-label="Mês anterior"
                onPress={() => changeMonth(subMonths(month, 1))}
                size="icon-sm"
                variant="secondary"
              >
                <ArrowLeftIcon />
              </PrismButton>
              <PrismButton onPress={selectToday} size="sm" variant="secondary">
                Hoje
              </PrismButton>
              <PrismButton
                aria-label="Próximo mês"
                onPress={() => changeMonth(addMonths(month, 1))}
                size="icon-sm"
                variant="secondary"
              >
                <ArrowRightIcon />
              </PrismButton>
            </PrismButtonGroup>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-secondary-foreground">
            {WEEKDAYS.map((weekday) => (
              <span className="py-1" key={weekday}>
                {weekday}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = eventsOnDay(events, day);
              const selected = isSameDay(day, selectedDay);
              return (
                <PrismButton
                  aria-label={
                    format(day, "dd 'de' MMMM", { locale: ptBR }) +
                    ", " +
                    dayEvents.length +
                    " publicações"
                  }
                  aria-pressed={selected}
                  className="relative min-h-9 rounded-xl px-0 text-sm squircle"
                  key={format(day, "yyyy-MM-dd")}
                  onPress={() => setSelectedDay(day)}
                  variant={selected ? "secondary" : "ghost"}
                >
                  <span
                    className={
                      isSameMonth(day, month)
                        ? undefined
                        : "text-secondary-foreground"
                    }
                  >
                    {format(day, "d")}
                  </span>
                  {dayEvents.length > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute right-1 bottom-1 size-1 rounded-full bg-primary"
                    />
                  )}
                </PrismButton>
              );
            })}
          </div>
        </section>
        <p className="text-base text-secondary-foreground">
          Selecione um dia para ver os envios registrados.
        </p>
        <AppBarSpacer className="hidden md:block" />
      </aside>

      <main className="min-h-0 flex-1 border-t border-border px-4 py-5 md:overflow-y-auto md:border-t-0 md:border-l md:px-8 md:py-6">
        <section className="flex flex-col gap-3" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <h3 className="capitalize">
              {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>
            <span className="text-sm text-secondary-foreground">
              {selectedEvents.length}{" "}
              {selectedEvents.length === 1 ? "item" : "itens"}
            </span>
          </div>
          {calendarQuery.isLoading ? (
            <p className="text-base text-secondary-foreground">
              Carregando publicações…
            </p>
          ) : calendarQuery.isError ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <p className="text-base text-error">
                Não foi possível carregar as publicações deste período.
              </p>
              <PrismButton
                onPress={() => void calendarQuery.refetch()}
                size="sm"
              >
                Tentar novamente
              </PrismButton>
            </div>
          ) : selectedEvents.length === 0 ? (
            <p className="py-8 text-base text-secondary-foreground">
              Nenhuma publicação ou programação neste dia.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {selectedEvents.map((event) => {
                const status = eventStatus(event.status);
                return (
                  <li
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                    key={event.id}
                  >
                    <PrismButton
                      className="min-w-0 flex-1 justify-start gap-3 px-2 text-left font-normal"
                      isDisabled={openingAction}
                      onPress={() => void openAction(event.actionId)}
                      variant="ghost"
                    >
                      <time className="shrink-0 text-sm whitespace-nowrap text-secondary-foreground">
                        {format(new Date(event.occurredAt), "HH:mm")}
                      </time>
                      <span className="min-w-0 truncate text-base">
                        {event.actionTitle}
                      </span>
                      <span className="hidden shrink-0 text-sm text-secondary-foreground md:inline">
                        {event.partnerName} · {formatLabel(event.format)}
                      </span>
                    </PrismButton>
                    <div className="flex items-center gap-2 pl-2 sm:pl-0">
                      <span className="text-sm text-secondary-foreground md:hidden">
                        {event.partnerName} · {formatLabel(event.format)}
                      </span>
                      <PrismBadge variant={status.variant}>
                        {status.label}
                      </PrismBadge>
                      {event.permalinks.map((permalink, index) => (
                        <a
                          className="inline-flex items-center gap-1 text-sm underline underline-offset-4"
                          href={permalink}
                          key={permalink}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {event.format === "stories" &&
                          event.permalinks.length > 1
                            ? "Story " + (index + 1)
                            : "Ver post"}
                          <ExternalLinkIcon className="size-4" />
                        </a>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <AppBarSpacer />
      </main>
    </div>
  );
}
