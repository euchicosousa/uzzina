import { endOfMonth, isToday, startOfMonth } from "date-fns";
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
import KanbanComponent from "~/components/layout/KanbanComponent";
import { Button } from "~/components/ui/button";
import { getShortText } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { getLateActions, getUserId } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { AppLoaderData } from "./app";
export type AppHomeLoaderData = {
  actions: Action[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const interval = [startOfMonth(new Date()), endOfMonth(new Date())];

  const { data: actions } = await supabase.rpc("get_user_actions", {
    user_id_param: user_id,
    //@ts-ignore
    start_date: interval[0],
    //@ts-ignore
    end_date: interval[1],
  });

  return {
    actions,
  } as AppHomeLoaderData;
};

export default function AppHome() {
  const { actions } = useLoaderData<typeof loader>();
  const actionsMap = new Map();
  actions.map((action) => actionsMap.set(action.id, action));

  return (
    <div className="w-full">
      <PartnersHomeComponent />
      <TodayHomeComponent />
      <div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem
          praesentium cum sed fuga quae modi, possimus recusandae, ratione
          inventore architecto ab temporibus illo, corrupti deserunt corporis
          voluptates sequi saepe perspiciatis.
        </p>
        <p>
          Ea odio earum iusto illo eligendi est sunt aut quibusdam quasi vel
          voluptatum similique explicabo quia animi vitae fuga totam voluptate
          quam necessitatibus consectetur, voluptatibus reprehenderit quae quo!
          Nulla, inventore!
        </p>
        <p>
          Dignissimos eius itaque veniam aliquam odit eveniet, tempora omnis
          nesciunt repellendus dolores deserunt sint nihil voluptates ipsam
          perferendis, dicta eum, explicabo consequuntur! Pariatur aperiam
          eligendi fugit sunt natus placeat sit.
        </p>
        <p>
          Officia expedita voluptatem ea velit voluptatum quam nobis quos?
          Aspernatur vitae qui non repellendus? Laudantium earum quam quo magni
          saepe animi, quidem dolore similique velit. Dolorum ad perspiciatis
          suscipit porro.
        </p>
        <p>
          Excepturi, voluptatibus molestiae minus corporis obcaecati culpa porro
          non consequatur, velit dolorem ad, doloribus doloremque aut.
          Praesentium laudantium vitae, corporis atque quod voluptate
          dignissimos modi voluptates dolorum in dolores voluptatum.
        </p>
        <p>
          Dolor nostrum eaque animi eveniet ducimus cumque at expedita dolorum
          reprehenderit. Beatae commodi recusandae vero et? Voluptatibus debitis
          aliquam, architecto veniam ut est harum numquam, cupiditate, expedita
          quo atque! Fugit.
        </p>
        <p>
          Est placeat alias nostrum quod necessitatibus sint dicta eius
          doloremque asperiores assumenda iusto hic consequatur mollitia ullam,
          dolorum ad aliquid sed voluptates! Cum in corrupti dicta eaque aliquam
          illum necessitatibus!
        </p>
        <p>
          Eaque saepe facere placeat consequuntur deleniti eligendi sit quae,
          et, tenetur expedita praesentium fuga itaque consequatur minus unde
          ratione nesciunt tempore veniam possimus? Odio magnam repellendus
          omnis veritatis! Nisi, perferendis.
        </p>
        <p>
          Molestiae, amet accusantium? Veniam animi expedita minima harum
          delectus tempore itaque quas nulla repellat? Quisquam assumenda atque
          tempore enim sit quae, magnam ab sapiente, dolores ipsum accusamus
          fuga, accusantium minima.
        </p>
        <p>
          Tenetur, tempore sapiente aut id quam sed numquam maiores,
          perspiciatis suscipit delectus repellendus distinctio, quia hic non
          libero nulla molestias? Cum quisquam amet debitis! Vel, voluptates
          excepturi! Illum, sequi sint?
        </p>
        <p>
          Earum laborum autem, possimus inventore illo, ducimus dolores nisi
          laudantium fugiat numquam perspiciatis. Voluptas minima mollitia in
          tempora quod molestiae beatae, dignissimos quia fugiat! Impedit
          distinctio animi incidunt quo excepturi!
        </p>
        <p>
          Eligendi explicabo vel, nam error placeat minus sunt sed libero sit
          animi, facere fuga aut, voluptatem recusandae alias cum maiores
          quaerat? Laborum architecto doloribus sed amet earum exercitationem
          provident in.
        </p>
      </div>
    </div>
  );
}

const PartnersHomeComponent = () => {
  const { partners, states } = useMatches()[1].loaderData as AppLoaderData;
  const { actions } = useLoaderData<typeof loader>();

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
            to={`/partner/${partner.id}`}
            key={partner.id}
            className="group/partner relative grid place-content-center p-8"
          >
            <div className="group-hover/partner: relative transition-[opacity,scale] duration-500 group-hover/partner:scale-80 group-hover/partner:opacity-0">
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

const TodayHomeComponent = () => {
  let { actions } = useLoaderData<typeof loader>();

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
          <Button variant={"ghost"}>
            <KanbanIcon />
          </Button>
          <Button variant={"ghost"}>
            <ClockIcon />
          </Button>
          <Button variant={"ghost"}>
            <Grid3X3Icon />
          </Button>
          <Button variant={"ghost"}>
            <ComponentIcon />
          </Button>
        </div>
      }
    >
      {/* <ActionContainer actions={actions} /> */}
      <KanbanComponent actions={actions} />
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
