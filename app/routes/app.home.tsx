import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircleIcon,
  ClockIcon,
  ComponentIcon,
  Grid3X3Icon,
  KanbanIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Link,
  useInRouterContext,
  useLoaderData,
  useMatches,
  useOutletContext,
  useRouteLoaderData,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionContainer } from "~/components/features/ActionContainer";
import {
  CalendarActions,
  CalendarButtons,
} from "~/components/features/Calendar";
import FeedComponent from "~/components/layout/FeedComponent";
import KanbanComponent from "~/components/layout/KanbanComponent";
import { Toggle } from "~/components/ui/toggle";
import { getShortText } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { UToggle } from "~/components/uzzina/UToggle";
import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import { ORDER_BY, PRIORITIES, STATES, VARIANT } from "~/lib/CONSTANTS";
import {
  getCleanAction,
  getLateActions,
  getUserId,
  isInstagramFeed,
} from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "./app";
import { ViewOptionsComponent, type ViewOptions } from "./app.partner.slug";
export type AppHomeLoaderData = {
  actions: Action[];
  actionsChart: Action[];
};

export const runtime = "edge";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const [{ data: people }, { data: partners }, { data: archivedPartners }] =
    await Promise.all([
      supabase.from("people").select("*").match({ user_id: user_id }),
      supabase
        .from("partners")
        .select("slug")
        .eq("archived", false)
        .contains("users_ids", [user_id]),
      supabase.from("partners").select("slug").match({ archived: true }),
    ]);

  invariant(people);
  invariant(partners);
  invariant(archivedPartners);

  const person = people[0];

  let start = startOfWeek(startOfMonth(new Date()));
  let end = endOfDay(endOfWeek(endOfMonth(addMonths(new Date(), 1))));

  const [{ data: actions }, { data: actionsChart }] = await Promise.all([
    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .contains("responsibles", person.admin ? [] : [user_id])
      .overlaps("partners", partners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("title", { ascending: true }),

    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .not("state", "eq", STATES.finished.slug)
      .contains("responsibles", person.admin ? [] : [user_id])
      .overlaps("partners", partners.map((p) => p.slug)!)
      .lte("date", format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss"))
      .order("date", { ascending: true }),
  ]);

  return {
    actions,
    actionsChart,
  } as AppHomeLoaderData;
};

import { useMemo } from "react";
import { HoursComponent } from "~/components/features/HoursComponent";

export default function AppHome() {
  let { actions, actionsChart } = useLoaderData<typeof loader>();
  let { person } = useMatches()[1].loaderData as AppLoaderData;
  const currentActions = useOptimisticActions(actions);

  const currentLateActions = useOptimisticActions(actionsChart);

  const sprintActions = useMemo(() => {
    return currentActions.filter(
      (action) =>
        action.sprints?.length &&
        action.sprints.filter((sprint) => sprint === person.user_id),
    );
  }, [currentActions]);

  const { setBaseAction } = useOutletContext<OutletContext>();

  return (
    <>
      {sprintActions.length > 0 && (
        <SprintHomeComponent actions={sprintActions} />
      )}
      <TodayHomeComponent actions={currentActions} />
      <CalendarHomeComponent
        actions={currentActions}
        setBaseAction={setBaseAction}
      />
      <PartnersHomeComponent actions={currentLateActions} />
      <LateHomeComponent actions={currentLateActions} />
    </>
  );
}

const SprintHomeComponent = ({ actions }: { actions: Action[] }) => {
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showOptions: {
      priority: true,
      category: true,
    },
  });

  return (
    <HomeComponentWrapper
      title="Sprints"
      OptionsComponent={
        <div className="flex items-center gap-4">
          <div></div>
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
          />
        </div>
      }
    >
      <div className="px-8 pb-8 xl:px-16">
        {viewOptions.priority ? (
          <div className="grid grid-cols-3">
            <div className="flex flex-col">
              <div className="mb-4 flex items-center gap-1">
                <div className="relative">
                  <SignalHighIcon className="absolute top-0 left-0 size-6 opacity-20" />
                  <SignalLowIcon className="size-6 text-green-500" />
                </div>
                <h5 className="p-0"> LOW</h5>
              </div>

              <ActionContainer
                showCategory={viewOptions.category}
                showPriority={viewOptions.priority}
                actions={actions.filter(
                  (action) => action.priority === PRIORITIES.low.slug,
                )}
                variant={VARIANT.block}
                showLate
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-4 flex items-center gap-1">
                <div className="relative">
                  <SignalHighIcon className="absolute top-0 left-0 size-6 opacity-20" />
                  <SignalMediumIcon className="size-6 text-yellow-500" />
                </div>
                <h5 className="p-0"> MEDIUM</h5>
              </div>

              <ActionContainer
                showCategory={viewOptions.category}
                showPriority={viewOptions.priority}
                actions={actions.filter(
                  (action) => action.priority === PRIORITIES.medium.slug,
                )}
                variant={VARIANT.block}
                showLate
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-4 flex items-center gap-1">
                <div className="relative">
                  <SignalHighIcon className="size-6 text-red-500" />
                </div>
                <h5 className="p-0"> HIGH</h5>
              </div>

              <ActionContainer
                showCategory={viewOptions.category}
                showPriority={viewOptions.priority}
                actions={actions.filter(
                  (action) => action.priority === PRIORITIES.high.slug,
                )}
                variant={VARIANT.block}
                showLate
              />
            </div>
          </div>
        ) : (
          <ActionContainer
            showCategory={viewOptions.category}
            showPriority={viewOptions.priority}
            actions={actions}
            columns={7}
            variant={VARIANT.block}
            showLate
          />
        )}
      </div>
    </HomeComponentWrapper>
  );
};

const PartnersHomeComponent = ({ actions }: { actions: Action[] }) => {
  const { partners } = useRouteLoaderData("routes/app") as {
    partners: Partner[];
  };

  const partnersWithActionsLength = useMemo(() => {
    // Create a map of partner slug to actions for O(1) lookup or O(N) build
    const actionsByPartner = new Map<string, Action[]>();

    // Initialize map
    partners.forEach((p) => actionsByPartner.set(p.slug, []));

    // Single pass through actions
    actions.forEach((action) => {
      action.partners.forEach((partnerSlug) => {
        if (actionsByPartner.has(partnerSlug)) {
          actionsByPartner.get(partnerSlug)?.push(action);
        }
      });
    });

    return partners.map((partner) => {
      return {
        ...partner,
        lateActionsLength: getLateActions(
          actionsByPartner.get(partner.slug) || [],
        ).length,
      };
    });
  }, [partners, actions]);

  return (
    <HomeComponentWrapper title="Parceiros">
      <div
        className={cn(
          "grid grid-cols-2 px-8 text-center text-3xl leading-none font-bold uppercase sm:grid-cols-3 md:grid-cols-4 xl:px-16",
          Math.ceil(partnersWithActionsLength.length / 2) === 7
            ? "xl:grid-cols-7"
            : Math.ceil(partnersWithActionsLength.length / 2) === 8
              ? "xl:grid-cols-8"
              : "",
        )}
      >
        {partnersWithActionsLength.map((partner) => (
          <Link
            to={`/app/partner/${partner.slug}`}
            key={partner.id}
            className="group/partner hover:bg-foreground hover:text-background relative grid place-content-center p-8"
          >
            <div className="relative">
              {getShortText(partner.short)}

              <div className="absolute -top-2 -right-6 flex">
                <UBadge isDynamic value={partner.lateActionsLength} size="sm" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </HomeComponentWrapper>
  );
};

const TodayHomeComponent = ({ actions }: { actions: Action[] }) => {
  const [view, setView] = useState<"kanban" | "hours" | "feed" | "categories">(
    "hours",
  );

  const [currentDay, setCurrentDay] = useState(new Date());
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    ascending: true,
    category: true,
    late: true,
    partner: true,
    order: ORDER_BY.date,
    showOptions: {
      ascending: true,
      order: true,
    },
  });

  const filteredActions = useMemo(() => {
    return view === "feed"
      ? actions.filter((action) => {
          return (
            isSameDay(action.instagram_date, currentDay) &&
            isInstagramFeed(action.category)
          );
        })
      : actions.filter((action) => {
          return isSameDay(action.date, currentDay);
        });
  }, [actions, view, currentDay]);

  return (
    <HomeComponentWrapper
      title={
        isToday(currentDay)
          ? "Hoje"
          : format(currentDay, "eeee, dd 'de' MMMM", {
              locale: ptBR,
            })[0].toUpperCase() +
            format(currentDay, "eeee, dd 'de' MMMM", {
              locale: ptBR,
            }).slice(1)
      }
      OptionsComponent={
        <div className="flex items-center gap-8">
          <CalendarButtons
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
          />
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
          />
          <div className="flex gap-2">
            <UToggle
              checked={view === "kanban"}
              onClick={() => setView("kanban")}
            >
              <KanbanIcon />
            </UToggle>
            <UToggle
              checked={view === "hours"}
              onClick={() => setView("hours")}
            >
              <ClockIcon />
            </UToggle>
            <UToggle checked={view === "feed"} onClick={() => setView("feed")}>
              <Grid3X3Icon />
            </UToggle>
            <UToggle
              checked={view === "categories"}
              onClick={() => setView("categories")}
            >
              <ComponentIcon />
            </UToggle>
          </div>
        </div>
      }
    >
      <div className="px-8 xl:px-16">
        {view === "kanban" && <KanbanComponent actions={filteredActions} />}
        {view === "hours" && (
          <HoursComponent
            actions={filteredActions}
            date={currentDay}
            viewOptions={viewOptions}
          />
        )}
        {view === "feed" && (
          <FeedComponent
            actions={filteredActions}
            orderBy={viewOptions.order}
            ascending={viewOptions.ascending}
          />
        )}
        {view === "categories" && (
          <div className="bg-muted text-muted-foreground flex items-center rounded-xl p-8">
            <AlertCircleIcon className="mr-4 size-8 opacity-50" />
            <div>
              Visualização por <strong className="underline">CATEGORIAS</strong>{" "}
              ainda não está disponível
            </div>
          </div>
        )}
      </div>
    </HomeComponentWrapper>
  );
};

const LateHomeComponent = ({ actions }: { actions: Action[] }) => {
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    ascending: true,
    partner: true,
    category: true,
    order: ORDER_BY.date,
    showOptions: {
      ascending: true,
      order: true,
      category: true,
      partner: true,
      responsibles: true,
      variant: true,
    },
  });
  actions = getLateActions(actions);
  return (
    <HomeComponentWrapper
      title="Atrasados"
      OptionsComponent={
        <ViewOptionsComponent
          viewOptions={viewOptions}
          setViewOptions={setViewOptions}
        />
      }
    >
      <div className="p-8 xl:px-16">
        <ActionContainer
          orderBy={viewOptions.order}
          ascending={viewOptions.ascending}
          variant={viewOptions.variant}
          showDivider={true}
          actions={actions}
          columns={viewOptions.variant != "content" ? 3 : 6}
          showResponsibles={viewOptions.responsibles}
          showPartner={viewOptions.partner}
          showCategory={viewOptions.category}
        />
      </div>
    </HomeComponentWrapper>
  );
};

const CalendarHomeComponent = ({
  actions,
  setBaseAction,
}: {
  actions: Action[];
  setBaseAction: (action: Action | null) => void;
}) => {
  const { celebrations } = useMatches()[1].loaderData as AppLoaderData;

  const [period, setPeriod] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDays = eachDayOfInterval({
    start:
      period === "week"
        ? startOfWeek(currentDate)
        : startOfWeek(startOfMonth(currentDate)),
    end:
      period === "week"
        ? endOfWeek(currentDate)
        : endOfWeek(endOfMonth(currentDate)),
  });
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    ascending: true,
    category: true,
    late: true,
    partner: true,
    order: ORDER_BY.date,
    showOptions: {
      ascending: true,
      order: true,
      finishedOnEnd: true,
    },
  });

  const { person } = useMatches()[1].loaderData as { person: Person };

  let calendar = calendarDays.map((day) => {
    return {
      date: day,
      actions: actions.filter((action) => isSameDay(action.date, day)),
      celebrations: celebrations.filter((celebration) =>
        isSameDay(parseISO(celebration.date), day),
      ),
    };
  });

  return (
    <HomeComponentWrapper
      title={
        period === "week" ? (
          "Essa Semana"
        ) : (
          <span className="capitalize">
            {format(currentDate, "MMMM", { locale: ptBR })}
          </span>
        )
      }
      OptionsComponent={
        <div className="flex items-center gap-8">
          <div className="flex gap-1">
            <Toggle
              pressed={period === "week"}
              onClick={() => setPeriod("week")}
            >
              Semana
            </Toggle>
            <Toggle
              pressed={period === "month"}
              onClick={() => setPeriod("month")}
            >
              Mês
            </Toggle>
          </div>
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
          />
        </div>
      }
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden px-8 xl:px-16",
          period === "week" ? "h-[50vh]" : "",
        )}
      >
        <CalendarActions
          calendar={calendar}
          viewOptions={viewOptions}
          isCompact={period === "month"}
          isScroll={period === "week"}
          onCreateAction={(day) => {
            setBaseAction({
              ...(getCleanAction(person.user_id, day) as unknown as Action),
            });
          }}
        />
      </div>
    </HomeComponentWrapper>
  );
};

const HomeComponentWrapper = ({
  children,
  title,
  OptionsComponent,
}: {
  children: React.ReactNode;
  OptionsComponent?: React.ReactNode;
  title: string | ReactNode;
}) => {
  return (
    <div>
      <div className="flex flex-col justify-between gap-8 p-8 lg:flex-row lg:items-center xl:px-16">
        <h1 className="py-12 text-5xl font-semibold">{title}</h1>
        <div className="bg-foreground hidden h-0.5 w-full lg:block"></div>
        {OptionsComponent && (
          <div className="self-end lg:self-auto">{OptionsComponent}</div>
        )}
      </div>
      {children}
    </div>
  );
};
