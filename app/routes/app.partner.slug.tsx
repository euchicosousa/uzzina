import { CalendarDaysIcon, ListIcon, SearchIcon } from "lucide-react";
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
import { useState } from "react";
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
import {
  ViewOptionsComponent,
  useViewOptions,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { UToggle } from "~/components/uzzina/UToggle";
import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import { DATE_TIME_DISPLAY, ORDER_BY, SIZE, VARIANT } from "~/lib/CONSTANTS";
import { getLateActions } from "~/lib/helpers";
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
    { partner, actions, date },
    { headers: { "Cache-Control": "no-store" } },
  );
};

export default function PartnerPage() {
  let { partner, actions, date } = useLoaderData<typeof loader>();
  let currentActions = useOptimisticActions(actions || []);
  const [currentDay, setCurrentDay] = useState(parseISO(date));
  const [query, setQuery] = useState("");

  const [viewOptions, setViewOptions] = useViewOptions({
    sprint: true,
    finishedOnEnd: true,
    showOptions: {
      instagram: true,
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

  const [view, setView] = useState<"list" | "calendar">("calendar");
  const lateCount = getLateActions(currentActions).length;

  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-2 2xl:flex-nowrap">
        <div className="order-1 flex items-center gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
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
            <h2 className="overflow-hidden p-0 py-2 text-ellipsis whitespace-nowrap">
              {partner.title}
            </h2>
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

          <InputGroup className="w-auto min-w-[300px]">
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
        <div className="order-3 flex items-center 2xl:order-2">
          {/* Organização */}
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
          />
        </div>

        {/* Tab de páginas */}
        <div className="order-2 flex items-center gap-2 2xl:order-3">
          <UToggle
            checked={view === "list"}
            onClick={() => {
              setView("list");
            }}
          >
            <ListIcon />
          </UToggle>
          <UToggle
            checked={view === "calendar"}
            onClick={() => {
              setView("calendar");
            }}
          >
            <CalendarDaysIcon />
          </UToggle>
        </div>
      </div>

      <div className="flex overflow-hidden">
        {view === "list" && (
          <ActionListPartnerPage
            actions={filteredActions}
            viewOptions={viewOptions}
          />
        )}
        {view === "calendar" && (
          <ActionCalendarPartnerPage
            actions={filteredActions}
            viewOptions={viewOptions}
            currentDay={currentDay}
          />
        )}
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
            showDivider={true}
            showSprint={true}
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
            showDivider={true}
            showSprint={true}
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
          showDivider={true}
          showSprint={true}
          orderBy={viewOptions.order}
          ascending={viewOptions.ascending}
        />
      )}
    </div>
  );
}
