import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import {
  CalendarIcon,
  Grid3X3Icon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  data,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionCalendarPartnerPage } from "~/components/features/ActionCalendarPartnerPage";
import { ActionContainer } from "~/components/features/ActionContainer";
import { CalendarButtons } from "~/components/features/Calendar";
import { Content } from "~/components/features/Content";
import {
  ViewOptionsComponent,
  useViewOptions,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import { Button } from "~/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { useAccentColor } from "~/hooks/useAccentColor";
import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import { DATE_TIME_DISPLAY, SIZE } from "~/lib/CONSTANTS";
import { getLateActions } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { getActionsByPartner } from "~/models/actions.server";
import { getPartnerBySlug } from "~/models/partners.server";
import { getPersonByUserId } from "~/models/people.server";
import { getUserId } from "~/services/auth.server";

export const runtime = "edge";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

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

  const start = startOfDay(
    startOfWeek(startOfMonth(subDays(parseISO(date), 30))),
  );
  const end = endOfDay(endOfWeek(endOfMonth(addDays(parseISO(date), 30))));

  const person = await getPersonByUserId(supabase, user_id);

  invariant(person);

  const [partner, actions] = await Promise.all([
    getPartnerBySlug(supabase, params.slug!),
    skipActions
      ? Promise.resolve([])
      : getActionsByPartner(
          supabase,
          params.slug!,
          user_id,
          person.admin,
          format(start, "yyyy-MM-dd HH:mm:ss"),
          format(end, "yyyy-MM-dd HH:mm:ss"),
        ),
  ]);

  invariant(partner);

  return data(
    { partner, actions, date, person },
    { headers: { "Cache-Control": "no-store" } },
  );
};

export default function PartnerPage() {
  let { partner, actions, date, person } = useLoaderData<typeof loader>();
  let currentActions = useOptimisticActions(actions || []);
  const [currentDay, setCurrentDay] = useState(parseISO(date));
  const [query, setQuery] = useState("");

  const { followPartnerColor, applyPartnerColors, restoreAccentColors } =
    useAccentColor();

  // Aplica as cores do parceiro quando a flag está ativa
  useEffect(() => {
    if (followPartnerColor && partner.colors.length >= 2) {
      applyPartnerColors(partner.colors[0], partner.colors[1]);
    } else {
      restoreAccentColors();
    }
    return () => {
      // Restaura ao desmontar a página
      restoreAccentColors();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followPartnerColor, partner.colors]);

  const [viewOptions, setViewOptions] = useViewOptions({
    sprint: true,
    finishedOnEnd: true,
    showOptions: {
      variant: true,
      responsibles: true,
      priority: true,
      category: true,
      partner: true,
      order: true,
      ascending: true,
      finishedOnEnd: true,
      filter_category: true,
      filter_state: true,
      filter_responsible: true,
    },
  });

  const filteredActions = currentActions
    .filter((action) =>
      viewOptions.filter_category
        ? viewOptions.filter_category.includes(action.category)
        : action,
    )
    .filter((action) => {
      if (!query) return true;
      return action.title?.toLowerCase().includes(query.toLowerCase());
    });

  const lateCount = getLateActions(currentActions).length;

  const navigate = useNavigate();

  const [view, setView] = useState<"calendar" | "feed">("calendar");

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
              size={SIZE.lg}
              isSquircle
            />
            {lateCount > 0 && (
              <Link
                className="isolate -mt-8 -ml-4"
                to={`/app/late/${partner.slug}`}
              >
                <UBadge value={lateCount} isDynamic />
              </Link>
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

          <InputGroup className="w-auto">
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
              <div className="flex items-center gap-2">
                <Button
                  variant={view === "calendar" ? "secondary" : "ghost"}
                  onClick={() => {
                    setView("calendar");
                  }}
                >
                  <CalendarIcon />
                </Button>
                <Button
                  variant={view === "feed" ? "secondary" : "ghost"}
                  onClick={() => {
                    setView("feed");
                  }}
                >
                  <Grid3X3Icon />
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <div className="flex overflow-hidden">
        <div
          className={cn(
            "flex shrink overflow-hidden",
            view === "calendar" ? "w-full" : "hidden w-auto md:flex",
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
          <div className="flex items-center gap-2 p-4">
            <UAvatar
              fallback={partner.short}
              backgroundColor={partner.colors[0]}
              color={partner.colors[1]}
              size={SIZE.lg}
              isSquircle
            />

            <div className="font-medium">@{partner.slug}</div>
          </div>
          <div className="grid grid-cols-3">
            {filteredActions.map((action) => (
              <Content key={action.id} action={action} isSquared />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionListPartnerPage({
  actions,
  viewOptions,
}: {
  actions: Action[];
  viewOptions: ViewOptions;
}) {
  return (
    <div className="w-full overflow-y-auto">
      {viewOptions.finishedOnEnd ? (
        <div className="flex flex-col">
          <h4 className="border-b p-4">Ações em andamento</h4>
          <ActionContainer
            actions={
              actions.filter((action) => action.state !== "finished") || []
            }
            dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
            showCategory={viewOptions.category}
            showPartner={viewOptions.partner}
            showResponsibles={viewOptions.responsibles}
            showLate={viewOptions.late}
            showPriority={viewOptions.priority}
            orderBy={viewOptions.order}
            ascending={viewOptions.ascending}
          />
          <h4 className="border-y p-4">Ações concluídas</h4>
          <ActionContainer
            actions={
              actions.filter((action) => action.state === "finished") || []
            }
            dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
            showCategory={viewOptions.category}
            showPartner={viewOptions.partner}
            showResponsibles={viewOptions.responsibles}
            showLate={viewOptions.late}
            showPriority={viewOptions.priority}
            orderBy={viewOptions.order}
            ascending={viewOptions.ascending}
          />
        </div>
      ) : (
        <ActionContainer
          actions={actions || []}
          dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
          showCategory={viewOptions.category}
          showPartner={viewOptions.partner}
          showResponsibles={viewOptions.responsibles}
          showLate={viewOptions.late}
          showPriority={viewOptions.priority}
          orderBy={viewOptions.order}
          ascending={viewOptions.ascending}
        />
      )}
    </div>
  );
}
