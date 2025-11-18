import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  ArrowDownAZIcon,
  ArrowDownIcon,
  ArrowUpAZIcon,
  CalendarIcon,
  ClockIcon,
  HandshakeIcon,
  InstagramIcon,
  ListIcon,
  Rows2Icon,
  Rows3Icon,
  SignalHighIcon,
  SquareCheckIcon,
  SquareIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import {
  useLoaderData,
  useOutletContext,
  useParams,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionContainer } from "~/components/features/ActionContainer";
import { CalendarActions } from "~/components/features/Calendar";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { UToggle } from "~/components/uzzina/UToggle";
import { DATE_TIME_DISPLAY, ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
import { getUserId } from "~/lib/helpers";

export const runtime = "edge";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const searchParams = new URL(request.url).searchParams;
  let date = searchParams.get("date");

  if (!date) {
    date = format(new Date(), "yyyy-MM-dd");
  } else {
    date = isValid(new Date(date))
      ? format(new Date(date), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");
  }

  const start = startOfDay(startOfWeek(startOfMonth(date)));
  const end = endOfDay(endOfWeek(endOfMonth(date)));

  const { data: person } = await supabase
    .from("people")
    .select("*")
    .match({ user_id: user_id })
    .single();

  invariant(person);

  const [{ data: partner }, { data: actions }] = await Promise.all([
    supabase.from("partners").select("*").match({ slug: params.slug }).single(),
    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .contains("responsibles", person.admin ? [] : [user_id])
      .containedBy("partners", [params.slug])
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("date", { ascending: false }),
  ]);

  invariant(partner);

  return { partner, actions };
};

export type ViewOptions = {
  instagram?: boolean;
  variant?: (typeof VARIANT)[keyof typeof VARIANT];
  responsibles?: boolean;
  priority?: boolean;
  category?: boolean;
  late?: boolean;
  partner?: boolean;
  order?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
  finishedOnEnd?: boolean;
  showOptions: {
    instagram?: boolean;
    variant?: boolean;
    responsibles?: boolean;
    priority?: boolean;
    category?: boolean;
    partner?: boolean;
    order?: boolean;
    ascending?: boolean;
    finishedOnEnd?: boolean;
  };
};

export default function PartnerPage() {
  let { partner, actions } = useLoaderData<typeof loader>();

  const actionsMap = new Map();
  actions?.map((action) => actionsMap.set(action.id, action));

  const currentActions: Action[] = [];
  actionsMap.forEach((action) => currentActions.push(action));

  const [view, setView] = useState<"list" | "calendar">("list");

  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    responsibles: true,
    priority: false,
    category: true,
    late: true,
    partner: false,
    instagram: false,
    variant: VARIANT.line,
    order: ORDER_BY.date,
    ascending: true,
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
    },
  });

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col overflow-hidden">
      <div className="border_after">
        <div className="border_after flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-4">
            <h2 className="p-0">{partner.title}</h2>
          </div>
          {/* Tab de páginas */}
          <div className="flex items-center gap-2">
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
              <CalendarIcon />
            </UToggle>
          </div>
        </div>
        {/* Organização */}
        <div className="flex justify-end px-4 py-1">
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
          />
        </div>
      </div>
      <div className="flex overflow-hidden">
        {view === "calendar" && (
          <ActionCalendarPartnerPage
            actions={actions || []}
            viewOptions={viewOptions}
          />
        )}
        {view === "list" && (
          <ActionListPartnerPage
            actions={actions || []}
            viewOptions={viewOptions}
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
  viewOptions: any;
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
          orderBy={viewOptions.order}
          ascending={viewOptions.ascending}
        />
      )}
    </div>
  );
}

function ActionCalendarPartnerPage({
  date = new Date(),
  actions,
  viewOptions,
}: {
  date?: Date;
  actions: Action[];
  viewOptions: ViewOptions;
}) {
  let calendar = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date)),
    end: endOfWeek(endOfMonth(date)),
  });

  let params = useParams();
  const partnerSlug = params.slug;

  invariant(partnerSlug);

  const { BaseAction, setBaseAction } = useOutletContext<OutletContext>();

  return (
    <CalendarActions
      calendar={calendar}
      actions={actions}
      viewOptions={viewOptions}
      onCreateAction={(day) => {
        setBaseAction({
          ...(BaseAction as Action),
          date: format(day, "yyyy-MM-dd HH:mm:ss"),
          instagram_date: format(day, "yyyy-MM-dd HH:mm:ss"),
          partners: [partnerSlug],
        });
      }}
    />
  );
}

export const ViewOptionsComponent = ({
  viewOptions,
  setViewOptions,
}: {
  viewOptions: ViewOptions;
  setViewOptions: (viewOptions: ViewOptions) => void;
}) => {
  viewOptions.variant ||= VARIANT.line;
  return (
    <div className="flex gap-8">
      {(viewOptions.showOptions.instagram ||
        viewOptions.showOptions.variant ||
        viewOptions.showOptions.finishedOnEnd) && (
        <div className="flex gap-1">
          {/* Organizar pela Data do Instagram */}
          {viewOptions.showOptions.instagram && (
            <Toggle
              title="Organizar pela Data do Instagram"
              pressed={viewOptions.instagram}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, instagram: value })
              }
              className="grid place-content-center p-0"
            >
              <InstagramIcon />
            </Toggle>
          )}

          {viewOptions.showOptions.variant && (
            <Button
              variant={"ghost"}
              title={
                viewOptions.variant === VARIANT.line
                  ? "Ação em formato de linha"
                  : viewOptions.variant === VARIANT.block
                    ? "Ação em formato de bloco"
                    : "Ação em formato de conteúdo"
              }
              onClick={() => {
                if (viewOptions.variant === VARIANT.line) {
                  setViewOptions({ ...viewOptions, variant: VARIANT.block });
                } else if (viewOptions.variant === VARIANT.block) {
                  setViewOptions({ ...viewOptions, variant: VARIANT.content });
                } else if (viewOptions.variant === VARIANT.content) {
                  setViewOptions({ ...viewOptions, variant: VARIANT.line });
                }
              }}
              className="grid place-content-center p-0"
            >
              {viewOptions.variant === VARIANT.line && <Rows3Icon />}
              {viewOptions.variant === VARIANT.block && <Rows2Icon />}
              {viewOptions.variant === VARIANT.content && <SquareIcon />}
            </Button>
          )}
          {/* Colocar ações concluídas no final */}
          {viewOptions.showOptions.finishedOnEnd && (
            <Toggle
              title="Colocar ações concluídas no final"
              pressed={viewOptions.finishedOnEnd}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, finishedOnEnd: value })
              }
              className="grid place-content-center p-0"
            >
              <ArrowDownIcon />
            </Toggle>
          )}
        </div>
      )}

      {(viewOptions.showOptions.order || viewOptions.showOptions.ascending) && (
        <div className="flex gap-1">
          {/* Ordem Crescente ou Descencente */}
          {viewOptions.showOptions.ascending && (
            <Toggle
              title={
                viewOptions.ascending ? "Ordem Crescente" : "Ordem Descencente"
              }
              pressed={viewOptions.ascending}
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  ascending: pressed,
                })
              }
              className="grid place-content-center p-0"
            >
              {viewOptions.ascending ? <ArrowDownAZIcon /> : <ArrowUpAZIcon />}
            </Toggle>
          )}
          {/* Ordem por Data  */}
          {viewOptions.showOptions.order && (
            <Toggle
              title="Ordem por Data"
              pressed={viewOptions.order === ORDER_BY.date}
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  order: pressed ? ORDER_BY.date : ORDER_BY.instagram_date,
                })
              }
              className="grid place-content-center p-0"
            >
              <ClockIcon />
            </Toggle>
          )}
          {/* Ordem por Status */}
          {viewOptions.showOptions.order && (
            <Toggle
              title="Ordem por Status"
              pressed={viewOptions.order === ORDER_BY.state}
              onPressedChange={(pressed) =>
                setViewOptions({
                  ...viewOptions,
                  order: pressed ? ORDER_BY.state : ORDER_BY.date,
                })
              }
              className="grid place-content-center p-0"
            >
              <SquareCheckIcon />
            </Toggle>
          )}
        </div>
      )}

      {(viewOptions.showOptions.responsibles ||
        viewOptions.showOptions.priority ||
        viewOptions.showOptions.partner ||
        viewOptions.showOptions.category) && (
        <div className="flex gap-1">
          {viewOptions.showOptions.responsibles && (
            <Toggle
              className="grid place-content-center p-0"
              pressed={viewOptions.responsibles}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, responsibles: value })
              }
            >
              <UsersIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.priority && (
            <Toggle
              pressed={viewOptions.priority}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, priority: value })
              }
              className="grid place-content-center p-0"
            >
              <SignalHighIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.category && (
            <Toggle
              pressed={viewOptions.category}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, category: value })
              }
              className="grid place-content-center p-0"
            >
              <TagIcon />
            </Toggle>
          )}
          {viewOptions.showOptions.partner && (
            <Toggle
              pressed={viewOptions.partner}
              onPressedChange={(value) =>
                setViewOptions({ ...viewOptions, partner: value })
              }
              className="grid place-content-center p-0"
            >
              <HandshakeIcon />
            </Toggle>
          )}
        </div>
      )}
    </div>
  );
};
