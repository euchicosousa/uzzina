import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Grid3X3Icon, SearchIcon, SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  data,
  useLoaderData,
  useNavigate,
  useOutletContext,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionCalendarPartnerPage } from "~/components/features/ActionCalendarPartnerPage";
import { CalendarButtons } from "~/components/features/Calendar";
import { FeedSection } from "~/components/features/FeedSection";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { Button } from "~/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ActionContainer } from "~/components/features/ActionContainer";
import { useAppTheme } from "~/hooks/useAppTheme";
import { PHASES, SIZE } from "~/lib/CONSTANTS";
import { filterActions, getInstagramFeedActions } from "~/lib/helpers";
import { getUserPreferences } from "~/lib/preferences";
import { cn } from "~/lib/utils";
import { getPartnerBySlug } from "~/models/partners.server";
import { getUserId } from "~/services/auth.server";
import type { Action } from "~/models/actions.server";

import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useMatches } from "react-router";
import { QUERY_KEYS } from "~/lib/query-keys";
import {
  fetchAllLateActions,
  fetchPartnerActions,
} from "~/lib/supabase.queries";
import type { AppLoaderData } from "./app";

export const runtime = "edge";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);

  const searchParams = new URL(request.url).searchParams;
  let date = searchParams.get("date");
  const skipActions = searchParams.get("skip_actions") === "true";

  if (!date) {
    date = format(new Date().setDate(15), "yyyy-MM-dd");
  } else {
    date = isValid(new Date(date))
      ? format(parseISO(date).setDate(15), "yyyy-MM-dd")
      : format(new Date().setDate(15), "yyyy-MM-dd");
  }

  const start = startOfDay(startOfWeek(startOfMonth(parseISO(date))));
  const end = endOfDay(endOfWeek(endOfMonth(parseISO(date))));

  // Loader simplificado: apenas partner e datas (sem queries de actions)
  invariant(params.slug, "Slug do parceiro não fornecido");
  const partner = await getPartnerBySlug(supabase, params.slug);
  invariant(partner);

  return data(
    {
      partner,
      date,
      startDateFormatted: format(start, "yyyy-MM-dd HH:mm:ss"),
      endDateFormatted: format(end, "yyyy-MM-dd HH:mm:ss"),
      skipActions,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
};

export default function PartnerPage() {
  const { partner, date, startDateFormatted, endDateFormatted, skipActions } =
    useLoaderData<typeof loader>();

  const queryClient = useQueryClient();
  const { person, partners } = useMatches()[1].loaderData as AppLoaderData;

  // Actions do parceiro — client-side via React Query
  const dateRange = `${startDateFormatted}_${endDateFormatted}`;
  const { data: currentActions = [] } = useQuery({
    queryKey: QUERY_KEYS.actions.partner(partner.slug, dateRange),
    queryFn: () =>
      fetchPartnerActions(
        partner.slug,
        person.user_id,
        person.admin,
        startDateFormatted,
        endDateFormatted,
      ),
    enabled: !skipActions,
    initialData: () => {
      // Tenta recuperar do cache da Home e filtrar pelo parceiro
      const cachedHomeActions = queryClient.getQueryData<Action[]>(
        QUERY_KEYS.actions.home(person.user_id),
      );
      if (cachedHomeActions) {
        return cachedHomeActions.filter((action) =>
          action.partners?.includes(partner.slug),
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
        partners.map((p) => p.slug),
      ),
    select: (allLateActions) =>
      allLateActions.filter((action) =>
        action.partners?.includes(partner.slug),
      ),
    enabled: !skipActions,
  });
  const context = useOutletContext<OutletContext | undefined>();
  const setBaseAction = context?.setBaseAction;
  const [currentDay, setCurrentDay] = useState(parseISO(date));
  const [query, setQuery] = useState("");

  const { followPartnerColor, applyPartnerColors, restoreThemeColors } =
    useAppTheme();

  // Aplica as cores do parceiro quando a flag está ativa
  useEffect(() => {
    if (followPartnerColor && partner.colors.length >= 2) {
      applyPartnerColors(partner.colors[0], partner.colors[1]);
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
    partner.colors,
    restoreThemeColors,
    applyPartnerColors,
  ]);

  const preferences = getUserPreferences(person);

  const [viewOptions, setViewOptions] = useViewOptions({
    sprint: true,
    variant: preferences.defaultViewVariant,
    showOptions: {
      variant: true,
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

  const navigate = useNavigate();

  const [view, setView] = useState<"calendar" | "feed">(
    preferences.showInstagramSidebar ? "feed" : "calendar",
  );

  return (
    <div className="page-height flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b 2xl:flex-nowrap 2xl:gap-4">
        {/* Mobile Top */}
        <div className="order-1 flex w-full shrink-0 items-center justify-between gap-4 overflow-hidden border-b p-2 2xl:w-auto 2xl:border-b-0">
          <div className="flex shrink-0 items-center justify-between gap-2 overflow-hidden">
            <UAvatar
              fallback={partner.short}
              backgroundColor={partner.colors[0]}
              color={partner.colors[1]}
              size={SIZE.md}
              image={partner.image}
            />
            {lateCount > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="isolate -mt-4 -ml-4 cursor-pointer outline-none select-none">
                    <UBadge value={lateCount} isDynamic />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="max-h-[400px] w-[380px] overflow-y-auto bg-popover/50 p-4 backdrop-blur-lg"
                  align="start"
                >
                  <h3 className="text-lg tracking-normal">
                    Ações Atrasadas ({lateCount})
                  </h3>
                  <ActionContainer
                    actions={currentLateActions}
                    variant="line"
                    onClick={(action) => setBaseAction?.(action)}
                  />
                </PopoverContent>
              </Popover>
            )}
            <div className="hidden truncate p-0 py-2 text-lg font-medium sm:block">
              {partner.title}
            </div>
            <Link to={`/app/admin/partner/${partner.slug}/`}>
              {person.admin && <SettingsIcon className="size-5" />}
            </Link>
          </div>

          <CalendarButtons
            currentDay={currentDay}
            setCurrentDay={(day: Date) => {
              setCurrentDay(day);
              navigate(`?date=${format(day, "yyyy-MM-dd")}`);
            }}
            days={30}
            showDate
            mode="month"
          />

          <InputGroup className="w-auto bg-input">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar ação..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
        </div>
        {/* Mobile Bottom */}
        <div className="order-3 w-full overflow-hidden p-2 2xl:order-2">
          {/* Organização */}
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
            endComponents={
              <Button
                variant={view === "feed" ? "secondary" : "ghost"}
                onClick={() => {
                  const v = view === "calendar" ? "feed" : "calendar";
                  setView(v);
                }}
              >
                <Grid3X3Icon />
              </Button>
            }
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
          <ActionCalendarPartnerPage
            actions={filteredActions}
            viewOptions={viewOptions}
            currentDay={currentDay}
          />
        </div>
        <div
          className={cn(
            "overflow-hidden overflow-y-auto border-l",
            view === "feed"
              ? "min-w-full md:w-[540px] md:min-w-auto md:shrink-0"
              : "w-0",
          )}
        >
          <FeedSection
            actions={feedActions}
            onActionClick={(action) => {
              setBaseAction?.(action);
            }}
            currentPartner={partner}
          />
        </div>
      </div>
    </div>
  );
}
