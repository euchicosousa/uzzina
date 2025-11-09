import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  ClockIcon,
  ComponentIcon,
  Grid3X3Icon,
  KanbanIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useLoaderData,
  useMatches,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionContainer } from "~/components/features/ActionContainer";
import KanbanComponent from "~/components/layout/KanbanComponent";
import { getShortText } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { UToggle } from "~/components/uzzina/UToggle";
import { STATE } from "~/lib/CONSTANTS";
import { getLateActions, getUserId } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "./app";
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

  // const interval = [startOfMonth(new Date()), endOfMonth(new Date())];

  let start = startOfWeek(startOfMonth(new Date()));
  let end = endOfDay(endOfWeek(endOfMonth(addMonths(new Date(), 1))));

  const [{ data: actions }, { data: actionsChart }] = await Promise.all([
    // supabase.rpc("get_user_actions", {
    //   user_id_param: user_id,
    //   //@ts-ignore
    //   start_date: interval[0],
    //   //@ts-ignore
    //   end_date: interval[1],
    // }),
    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .contains("responsibles", person.admin ? [] : [user_id])
      .containedBy("partners", partners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("title", { ascending: true }),

    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .not("state", "eq", STATE.finished)
      .contains("responsibles", person.admin ? [] : [user_id])
      .containedBy("partners", partners.map((p) => p.slug)!)
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

export default function AppHome() {
  let { actions } = useLoaderData<typeof loader>();
  const actionsMap = new Map();
  actions.map((action) => actionsMap.set(action.id, action));

  const currentActions: Action[] = [];
  actionsMap.forEach((action) => currentActions.push(action));

  return (
    <>
      {/* <pre>{JSON.stringify(actionsChart[0], null, 2)}</pre>
      <pre>
        {JSON.stringify(actionsChart[actionsChart.length - 1], null, 2)}
      </pre> */}
      {/* {
        <table>
          <thead>
            <tr className="[&>th]:p-4">
              <th>ID</th>
              <th>Title</th>
              <th>Partners</th>
              <th>Date</th>
              <th>Instagram Date</th>
            </tr>
          </thead>
          <tbody>
            {getLateActions(actionsChart).map((action, i) => (
              <tr key={action.id} className="border-t [&>td]:p-4">
                <td>{i + 1}</td>
                <td>{action.title}</td>
                <td>{action.partners.join(", ")}</td>
                <td className="w-48">
                  {format(action.date, "dd/MM/yyyy HH:mm")}
                </td>
                <td className="w-48">
                  {format(action.instagram_date, "dd/MM/yyyy HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      } */}
      <TodayHomeComponent actions={currentActions} />
      <PartnersHomeComponent actions={currentActions} />
      <LateHomeComponent actions={currentActions} />
    </>
  );
}

const PartnersHomeComponent = ({ actions }: { actions: Action[] }) => {
  const { partners, states } = useMatches()[1].loaderData as AppLoaderData;

  const partnersWithActionsLength = partners.map((partner) => {
    return {
      ...partner,
      actions: actions.filter((action) =>
        action.partners.find((p) => p === partner.slug),
      ),
    };
  });

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
  actions = actions.filter((action) => {
    return isToday(action.date);
  });

  const [view, setView] = useState<"kanban" | "hours" | "feed" | "categories">(
    "kanban",
  );

  return (
    <HomeComponentWrapper
      title="Hoje"
      OptionsComponent={
        <div className="flex items-center gap-2">
          <UToggle
            checked={view === "kanban"}
            onClick={() => setView("kanban")}
          >
            <KanbanIcon />
          </UToggle>
          <UToggle checked={view === "hours"} onClick={() => setView("hours")}>
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
      }
    >
      <KanbanComponent actions={actions} />
    </HomeComponentWrapper>
  );
};

const LateHomeComponent = ({ actions }: { actions: Action[] }) => {
  actions = getLateActions(actions);
  return (
    <HomeComponentWrapper title="Atrasados">
      <div className="p-8">
        <ActionContainer actions={actions} columns={6} />
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
  title: string;
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
