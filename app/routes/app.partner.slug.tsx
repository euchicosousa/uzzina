import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { getUserId } from "~/lib/helpers";
import invariant from "tiny-invariant";
import {
  CalendarIcon,
  HandshakeIcon,
  ListIcon,
  MenuIcon,
  SignalHighIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { UToggle } from "~/components/uzzina/UToggle";
import { ActionContainer } from "~/components/features/ActionContainer";
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
import { DATE_TIME_DISPLAY } from "~/lib/CONSTANTS";
import { Toggle } from "~/components/ui/toggle";
import { useState } from "react";

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
    <div>
      <div className="border_after">
        <div className="border_after flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-4">
            <h2 className="p-0">{partner.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <UToggle checked={true} onClick={() => {}}>
              <ListIcon />
            </UToggle>
            <UToggle checked={false} onClick={() => {}}>
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
      <div className="p-4">
        <ActionContainer
          actions={actions || []}
          dateTimeDisplay={DATE_TIME_DISPLAY.DateTime}
          showCategory={viewOptions.category}
          showPartner={viewOptions.partner}
          showResponsibles={viewOptions.responsibles}
          showLate={viewOptions.late}
          showPriority={viewOptions.priority}
        />
      </div>
    </div>
  );
}
