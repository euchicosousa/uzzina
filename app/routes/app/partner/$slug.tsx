import type { Action } from "~/types";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { parseU } from "~/utils/date";
import { Grid3X3Icon, SearchIcon, SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { PartnerCalendarBoard } from "~/components/features/PartnerCalendarBoard";
import { ActionContainer } from "~/components/features/ActionContainer";
import { CalendarButtons } from "~/components/features/Calendar";
import { InstagramFeedSection } from "~/components/features/InstagramFeedSection";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import {
  PrismBadge,
  PrismButton,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
  PrismPopover,
  PrismPopoverTrigger,
  PrismToggle,
} from "~/components/prism";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { useAppTheme } from "~/hooks/useAppTheme";
import { PHASES, SIZE } from "~/lib/CONSTANTS";
import { filterActions, getInstagramFeedActions } from "~/lib/helpers";
import { getUserPreferences } from "~/lib/preferences";
import { cn } from "cnfast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import {
  fetchAllLateActions,
  fetchPartnerActions,
} from "~/lib/supabase.queries";
import { z } from "zod";
const partnerSearchSchema = z.object({
  date: z.string().optional(),
  skip_actions: z.string().optional(),
});
export const Route = createFileRoute("/app/partner/$slug")({
  validateSearch: partnerSearchSchema,
  component: PartnerPage,
});
import { useAppContext } from "~/contexts/AppContext";
import type { Partner } from "~/types";
function PartnerPage() {
  const { slug } = Route.useParams();
  const { person, partners } = useAppContext();
  const partner = partners.find((p: Partner) => p.slug === slug);
  const partnerSlug = partner?.slug || "";
  const partnerColors = partner?.colors || [];
  const searchParams = Route.useSearch();
  let dateParam = searchParams.date;
  const skipActions = searchParams.skip_actions === "true";
  if (!dateParam) {
    dateParam = format(new Date().setDate(15), "yyyy-MM-dd");
  } else {
    dateParam = isValid(new Date(dateParam))
      ? format(parseU(dateParam).setDate(15), "yyyy-MM-dd")
      : format(new Date().setDate(15), "yyyy-MM-dd");
  }
  const start = startOfDay(startOfWeek(startOfMonth(parseU(dateParam))));
  const end = endOfDay(endOfWeek(endOfMonth(parseU(dateParam))));
  const startDateFormatted = format(start, "yyyy-MM-dd HH:mm:ss");
  const endDateFormatted = format(end, "yyyy-MM-dd HH:mm:ss");
  const queryClient = useQueryClient();
  const dateRange = `${startDateFormatted}_${endDateFormatted}`;
  const { data: currentActions = [] } = useQuery({
    queryKey: QUERY_KEYS.actions.partner(partnerSlug, dateRange),
    queryFn: () =>
      fetchPartnerActions(
        partnerSlug,
        person.user_id,
        person.admin,
        startDateFormatted,
        endDateFormatted,
      ),
    enabled: !skipActions && !!partnerSlug,
    initialData: () => {
      // Tenta recuperar do cache da Home e filtrar pelo parceiro
      const cachedHomeActions = queryClient.getQueryData<Action[]>(
        QUERY_KEYS.actions.home(person.user_id),
      );
      if (cachedHomeActions && partnerSlug) {
        return cachedHomeActions.filter((action) =>
          action.partners?.includes(partnerSlug),
        );
      }
      return undefined;
    },
  });

  // LateActions do parceiro — client-side via React Query (reutilizando cache global do Header)
  const { data: currentLateActions = [] } = useQuery({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p: Partner) => p.slug),
      ),
    select: (allLateActions) =>
      allLateActions.filter((action) => action.partners?.includes(partnerSlug)),
    enabled: !skipActions && !!partnerSlug,
  });
  const { setBaseAction } = useAppContext();
  const currentDay = parseU(dateParam);
  const [query, setQuery] = useState("");
  const { followPartnerColor, applyPartnerColors, restoreThemeColors } =
    useAppTheme();

  // Aplica as cores do parceiro quando a flag está ativa
  useEffect(() => {
    if (followPartnerColor && partnerColors.length >= 2) {
      applyPartnerColors(partnerColors[0], partnerColors[1]);
    } else {
      restoreThemeColors();
    }
    return () => {
      // Restaura ao desmontar a página
      restoreThemeColors();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    followPartnerColor,
    partnerColors,
    restoreThemeColors,
    applyPartnerColors,
  ]);
  const preferences = getUserPreferences(person);
  const [viewOptions, setViewOptions] = useViewOptions({
    sprint: true,
    variant: preferences.defaultViewVariant,
    showOptions: {
      variant: true,
      autoHeight: true,
      responsibles: true,
      priority: true,
      category: true,
      partner: true,
      order: true,
      ascending: true,
      filter_category: true,
      filter_phase: true,
      filter_responsible: true,
    },
  });
  const filteredActions = filterActions(currentActions, viewOptions, query);
  const feedActions = getInstagramFeedActions(filteredActions).filter(
    (action) => action.phase !== PHASES.idea.slug,
  );
  const lateCount = currentLateActions.length;
  const navigate = useNavigate({
    from: "/app/partner/$slug",
  });
  const [view, setView] = useState<"calendar" | "feed">(
    preferences.showInstagramSidebar ? "feed" : "calendar",
  );
  if (!partner) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Parceiro não encontrado ou acesso não autorizado.
      </div>
    );
  }
  return (
    <div className="page-height flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b 2xl:flex-nowrap 2xl:gap-4">
        {/* Mobile Top */}
        <div className="order-1 flex w-full shrink-0 items-center justify-between gap-4 overflow-hidden border-b p-2 2xl:w-auto 2xl:border-b-0">
          <div className="flex shrink-0 items-center justify-between gap-2 overflow-hidden">
            <UAvatar
              backgroundColor={partner.colors[0]}
              color={partner.colors[1]}
              fallback={partner.short}
              image={partner.image}
              size={SIZE.md}
            />
            {lateCount > 0 && (
              <PrismPopoverTrigger>
                <PrismButton
                  className="isolate -mt-4 -ml-4 cursor-pointer outline-none select-none"
                  size="unstyled"
                  variant="unstyled"
                >
                  <PrismBadge>{lateCount}</PrismBadge>
                </PrismButton>
                <PrismPopover
                  className="max-h-100 w-95 overflow-y-auto space-y-4"
                  placement="bottom start"
                >
                  <h5>Ações Atrasadas ({lateCount})</h5>
                  <ActionContainer
                    actions={currentLateActions}
                    onClick={(action) => setBaseAction?.(action)}
                    variant="line"
                  />
                </PrismPopover>
              </PrismPopoverTrigger>
            )}
            <div className="hidden truncate p-0 py-2 text-lg font-medium sm:block">
              {partner.title}
            </div>
            <Link
              params={{
                slug: partner.slug,
              }}
              to="/app/admin/partner/$slug"
            >
              {person.admin && <SettingsIcon className="size-5" />}
            </Link>
          </div>

          <CalendarButtons
            currentDay={currentDay}
            days={30}
            setCurrentDay={(day: Date) => {
              navigate({
                search: (old) => ({
                  ...old,
                  date: format(day, "yyyy-MM-dd"),
                }),
              });
            }}
            showDate
          />

          <PrismInputGroup className="w-auto bg-input" size="sm">
            <PrismInputGroupAddon>
              <SearchIcon />
            </PrismInputGroupAddon>
            <PrismInputGroupInput
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ação..."
              value={query}
            />
          </PrismInputGroup>
        </div>
        {/* Mobile Bottom */}
        <div className="order-3 w-full overflow-hidden p-2 2xl:order-2">
          {/* Organização */}
          <ViewOptionsComponent
            endComponents={
              <PrismToggle
                aria-label="Alternar Visão Feed"
                isSelected={view === "feed"}
                onChange={() => {
                  const v = view === "calendar" ? "feed" : "calendar";
                  setView(v);
                }}
                size="sm"
              >
                <Grid3X3Icon />
              </PrismToggle>
            }
            setViewOptions={setViewOptions}
            viewOptions={viewOptions}
          />
        </div>
      </div>

      <div className="flex overflow-hidden">
        <div
          className={cn(
            "flex w-full shrink overflow-hidden",
            view === "calendar" ? "" : "hidden md:flex",
          )}
        >
          <PartnerCalendarBoard
            actions={filteredActions}
            currentDay={currentDay}
            viewOptions={viewOptions}
          />
        </div>
        <div
          className={cn(
            "overflow-hidden overflow-y-auto border-l",
            view === "feed"
              ? "flex min-w-full md:w-135 md:min-w-auto md:shrink-0"
              : "hidden",
          )}
        >
          <InstagramFeedSection
            actions={feedActions}
            currentPartner={partner}
            onActionClick={(action) => {
              setBaseAction?.(action);
            }}
          />
        </div>
      </div>
    </div>
  );
}
