import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ComponentIcon,
  Grid3X3Icon,
  KanbanIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Link,
  useLoaderData,
  useMatches,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionContainer } from "~/components/features/ActionContainer";
import { CalendarActions } from "~/components/features/Calendar";
import FeedComponent from "~/components/layout/FeedComponent";
import KanbanComponent from "~/components/layout/KanbanComponent";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { getShortText } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { UToggle } from "~/components/uzzina/UToggle";
import { DATE_TIME_DISPLAY, ORDER_BY, STATE } from "~/lib/CONSTANTS";
import { getLateActions, getUserId, isInstagramFeed } from "~/lib/helpers";
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
      supabase.from("partners").select("slug").match({ archived: false }),
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
      .select(
        "id, title, date, state, partners, responsibles, category, instagram_date, archived, created_at, updated_at, description, instagram_caption, priority, color, content_files, instagram_content, sprints, work_files, time, topics, user_id",
      )
      .is("archived", false)
      .contains("responsibles", person.admin ? [] : [user_id])
      .overlaps("partners", partners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("title", { ascending: true }),

    supabase
      .from("actions")
      .select(
        "id, title, date, state, partners, responsibles, category, instagram_date, archived, created_at, updated_at, description, instagram_caption, priority, color, content_files, instagram_content, sprints, work_files, time, topics, user_id",
      )
      .is("archived", false)
      .not("state", "eq", STATE.finished)
      .contains("responsibles", person.admin ? [] : [user_id])
      .overlaps("partners", partners.map((p) => p.slug)!)
      .lte("date", format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss"))
      .order("date", { ascending: true }),

    // .gte("date", interval[0])
    // .lte("date", interval[1]),
    // supabase
    //   .rpc("get_user_actions_chart", {
    //     user_id_param: user_id,
    //   })
    //   .select("id, date, instagram_date, state, partners, category"),
  ]);

  return {
    actions,
    actionsChart,
  } as AppHomeLoaderData;
};

import { useMemo } from "react";

export default function AppHome() {
  let { actions } = useLoaderData<typeof loader>();

  const currentActions = useMemo(() => {
    const actionsMap = new Map();
    actions.map((action) => actionsMap.set(action.id, action));
    const result: Action[] = [];
    actionsMap.forEach((action) => result.push(action));
    return result;
  }, [actions]);

  return (
    <>
      <TodayHomeComponent actions={currentActions} />
      <CalendarHomeComponent actions={currentActions} />
      <PartnersHomeComponent actions={currentActions} />
      <LateHomeComponent actions={currentActions} />
    </>
  );
}

const PartnersHomeComponent = ({ actions }: { actions: Action[] }) => {
  const { partners, states } = useMatches()[1].loaderData as AppLoaderData;

  const partnersWithActionsLength = useMemo(() => {
    // Create a map of partner slug to actions for O(1) lookup or O(N) build
    const actionsByPartner = new Map<string, Action[]>();

    // Initialize map
    partners.forEach(p => actionsByPartner.set(p.slug, []));

    // Single pass through actions
    actions.forEach(action => {
      action.partners.forEach(partnerSlug => {
        if (actionsByPartner.has(partnerSlug)) {
          actionsByPartner.get(partnerSlug)?.push(action);
        }
      });
    });

    return partners.map((partner) => {
      return {
        ...partner,
        actions: actionsByPartner.get(partner.slug) || [],
      };
    });
  }, [partners, actions]);

  return (
    <HomeComponentWrapper title="Parceiros">
      <div
        className={cn(
          "grid grid-cols-3 text-center text-xl leading-none font-bold uppercase sm:grid-cols-4 md:grid-cols-6 lg:text-3xl",
          Math.ceil(partnersWithActionsLength.length / 2) === 7
            ? "md:grid-cols-7"
            : Math.ceil(partnersWithActionsLength.length / 2) === 8
              ? "md:grid-cols-8"
              : "",
        )}
      >
        {partnersWithActionsLength.map((partner) => (
          <Link
            to={`/app/partner/${partner.slug}`}
            key={partner.id}
            className="group/partner relative grid place-content-center p-8"
          >
            <div className="relative transition-[opacity] duration-500 group-hover/partner:opacity-10">
              {getShortText(partner.short)}

              <div className="absolute -top-2 -right-6 flex">
                <UBadge
                  isDynamic
                  value={getLateActions(partner.actions).length}
                  size="sm"
                />
              </div>
            </div>
            <div className="absolute top-1/2 left-0 flex h-1 w-full origin-left -translate-y-1/2 scale-x-0 p-2 transition-[scale] duration-500 group-hover/partner:scale-x-100">
              {states.map((state) => (
                <div
                  key={state.id}
                  className="h-1 w-full"
                  style={{
                    backgroundColor: state.color,
                    width: `${(partner.actions.filter((action) => action.state === state.slug).length / partner.actions.length) * 100}%`,
                  }}
                ></div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </HomeComponentWrapper>
  );
};

const TodayHomeComponent = ({ actions }: { actions: Action[] }) => {
  const [view, setView] = useState<"kanban" | "hours" | "feed" | "categories">(
    "kanban",
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
          <div className="flex">
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentDay(addDays(currentDay, -1));
              }}
            >
              <ChevronLeftIcon />
            </Button>
            <Button variant="ghost" onClick={() => { }}>
              <CalendarIcon />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentDay(addDays(currentDay, 1));
              }}
            >
              <ChevronRightIcon />
            </Button>
          </div>
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
      {view === "kanban" && <KanbanComponent actions={filteredActions} />}
      {/* {view === "hours" && <HoursComponent actions={filteredActions} />} */}
      {view === "feed" && (
        <FeedComponent
          actions={filteredActions}
          orderBy={viewOptions.order}
          ascending={viewOptions.ascending}
        />
      )}
      {/* {view === "categories" && <CategoriesComponent actions={filteredActions} />} */}
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
      <div className="p-8">
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
    <div className="border_after">
      <div className="border_after flex items-center justify-between gap-4">
        <h3 className="p-8">{title}</h3>
        <div className="px-8">{OptionsComponent}</div>
      </div>
      {children}
    </div>
  );
};

const CalendarHomeComponent = ({ actions }: { actions: Action[] }) => {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const calendar = eachDayOfInterval({
    start:
      period === "week"
        ? startOfWeek(new Date())
        : startOfWeek(startOfMonth(new Date())),
    end:
      period === "week"
        ? endOfWeek(new Date())
        : endOfWeek(endOfMonth(new Date())),
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
    },
  });
  return (
    <HomeComponentWrapper
      title="Calendário"
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
      {/* <div>
        <pre>{JSON.stringify(period, null, 2)}</pre>
      </div> */}
      <div
        className={cn(
          "flex flex-col overflow-hidden",
          period === "week" ? "h-[50vh]" : "",
        )}
      >
        <CalendarActions
          calendar={calendar}
          actions={actions}
          viewOptions={viewOptions}
          isCompact={period === "month"}
          isScroll={period === "week"}
        />
      </div>
    </HomeComponentWrapper>
  );
};
