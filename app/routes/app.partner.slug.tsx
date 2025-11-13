import {
  useLoaderData,
  useOutletContext,
  useParams,
  type LoaderFunctionArgs,
} from "react-router";
import { getUserId } from "~/lib/helpers";
import invariant from "tiny-invariant";
import {
  CalendarIcon,
  HandshakeIcon,
  ListIcon,
  MenuIcon,
  PlusIcon,
  SignalHighIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { UToggle } from "~/components/uzzina/UToggle";
import { ActionContainer } from "~/components/features/ActionContainer";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { Toggle } from "~/components/ui/toggle";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { Button } from "~/components/ui/button";

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

export default function PartnerPage() {
  let { partner, actions } = useLoaderData<typeof loader>();

  const actionsMap = new Map();
  actions?.map((action) => actionsMap.set(action.id, action));

  const currentActions: Action[] = [];
  actionsMap.forEach((action) => currentActions.push(action));

  const [viewOptions, setViewOptions] = useState({
    list: true,
    calendar: false,
    responsibles: true,
    priority: false,
    category: true,
    late: true,
    partner: false,
  });

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col overflow-hidden">
      <div className="border_after">
        <div className="border_after flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-4">
            <h2 className="p-0">{partner.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <UToggle
              checked={viewOptions.list}
              onClick={() => {
                setViewOptions({ ...viewOptions, list: true, calendar: false });
              }}
            >
              <ListIcon />
            </UToggle>
            <UToggle
              checked={viewOptions.calendar}
              onClick={() => {
                setViewOptions({ ...viewOptions, list: false, calendar: true });
              }}
            >
              <CalendarIcon />
            </UToggle>
          </div>
        </div>
        <div className="flex justify-end gap-1 px-4 py-1">
          <Toggle
            className="grid place-content-center p-0"
            pressed={viewOptions.responsibles}
            onPressedChange={(value) =>
              setViewOptions({ ...viewOptions, responsibles: value })
            }
          >
            <UsersIcon />
          </Toggle>
          <Toggle
            pressed={viewOptions.priority}
            onPressedChange={(value) =>
              setViewOptions({ ...viewOptions, priority: value })
            }
            className="grid place-content-center p-0"
          >
            <SignalHighIcon />
          </Toggle>
          <Toggle
            pressed={viewOptions.category}
            onPressedChange={(value) =>
              setViewOptions({ ...viewOptions, category: value })
            }
            className="grid place-content-center p-0"
          >
            <TagIcon />
          </Toggle>
          <Toggle
            pressed={viewOptions.partner}
            onPressedChange={(value) =>
              setViewOptions({ ...viewOptions, partner: value })
            }
            className="grid place-content-center p-0"
          >
            <HandshakeIcon />
          </Toggle>
        </div>
      </div>
      <div className="flex overflow-hidden">
        {viewOptions.calendar && (
          <ActionCalendarPartnerPage
            actions={actions || []}
            viewOptions={viewOptions}
          />
        )}
        {viewOptions.list && (
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
    <div className="w-full overflow-y-auto p-4">
      <ActionContainer
        actions={actions || []}
        dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
        showCategory={viewOptions.category}
        showPartner={viewOptions.partner}
        showResponsibles={viewOptions.responsibles}
        showLate={viewOptions.late}
        showPriority={viewOptions.priority}
        showDivider={true}
      />
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
  viewOptions: any;
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
    <div className="flex w-full flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {calendar.slice(0, 7).map((day) => (
          <div key={day.toISOString()} className="p-2 text-center xl:p-3">
            <div className="text-sm leading-none font-medium capitalize xl:text-lg">
              <span className="uppercase sm:hidden">
                {format(day, "eeeeee", { locale: ptBR })}
              </span>
              <span className="hidden sm:block xl:hidden">
                {format(day, "eee", { locale: ptBR })}
              </span>
              <span className="hidden xl:block">
                {format(day, "eeee", { locale: ptBR })}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 overflow-y-auto">
        {calendar.map((day) => (
          <div key={day.toISOString()} className="group/column border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 text-lg">{format(day, "d")}</div>
              <div className="opacity-0 group-hover/column:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() =>
                    setBaseAction({
                      ...(BaseAction as Action),
                      date: format(day, "yyyy-MM-dd HH:mm:ss"),
                      instagram_date: format(day, "yyyy-MM-dd HH:mm:ss"),
                      partners: [partnerSlug],
                    })
                  }
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>
            <ActionContainer
              actions={actions.filter((action) => isSameDay(action.date, day))}
              dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
              showCategory={viewOptions.category}
              showPartner={viewOptions.partner}
              showResponsibles={viewOptions.responsibles}
              showLate={viewOptions.late}
              showPriority={viewOptions.priority}
              showDivider={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
