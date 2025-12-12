import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
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
  SearchIcon,
  SignalHighIcon,
  SquareCheckIcon,
  SquareIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import {
  useLoaderData,
  useMatches,
  useNavigate,
  useOutletContext,
  useParams,
  useRouteLoaderData,
  useSubmit,
  type LoaderFunctionArgs,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionContainer } from "~/components/features/ActionContainer";
import { ActionItem } from "~/components/features/ActionItem";
import {
  CalendarActions,
  CalendarButtons,
} from "~/components/features/Calendar";
import { CategoriesCombobox } from "~/components/features/CategoriesCombobox";
import { Button } from "~/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Toggle } from "~/components/ui/toggle";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { UToggle } from "~/components/uzzina/UToggle";
import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import {
  DATE_TIME_DISPLAY,
  INTENT,
  ORDER_BY,
  SIZE,
  VARIANT,
} from "~/lib/CONSTANTS";
import {
  getCleanAction,
  getLateActions,
  getNewDateForAction,
  getUserId,
  handleAction,
  isInstagramFeed,
} from "~/lib/helpers";
import type { AppLoaderData } from "./app";

export const runtime = "edge";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const searchParams = new URL(request.url).searchParams;
  let date = searchParams.get("date");

  if (!date) {
    date = format(new Date().setDate(15), "yyyy-MM-dd");
  } else {
    date = isValid(new Date(date))
      ? format(parseISO(date).setDate(15), "yyyy-MM-dd")
      : format(new Date().setDate(15), "yyyy-MM-dd");
  }

  const start = startOfDay(startOfWeek(startOfMonth(subDays(date, 30))));
  const end = endOfDay(endOfWeek(endOfMonth(addDays(date, 30))));

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
      .overlaps("partners", [params.slug])
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("date", { ascending: false }),
  ]);

  invariant(partner);

  return { partner, actions, date };
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
  sprint?: boolean;
  filter_category?: string[];
  filter_state?: string[];
  filter_responsible?: string[];
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
    sprint?: boolean;
    filter_category?: boolean;
    filter_state?: boolean;
    filter_responsible?: boolean;
  };
};

export default function PartnerPage() {
  let { partner, actions, date } = useLoaderData<typeof loader>();
  let currentActions = useOptimisticActions(actions || []);
  const [currentDay, setCurrentDay] = useState(parseISO(date));
  const [query, setQuery] = useState("");

  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    responsibles: true,
    priority: false,
    category: true,
    late: true,
    partner: false,
    instagram: false,
    sprint: true,
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

  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-68px)] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 p-8">
        <div className="flex items-center gap-2">
          <UAvatar
            fallback={partner.short}
            backgroundColor={partner.colors[0]}
            color={partner.colors[1]}
            size={SIZE.lg}
          />
          <UBadge
            value={getLateActions(currentActions).length}
            isDynamic
            className="isolate -mt-8 -ml-4"
          />
          <h2 className="line-clamp-2 p-0">{partner.title}</h2>
        </div>

        <CalendarButtons
          currentDay={currentDay}
          setCurrentDay={(day) => {
            setCurrentDay(day);
            navigate(`?date=${format(day, "yyyy-MM-dd")}`);
          }}
          days={30}
          showDate
          mode="month"
        />
        {/* Organização */}

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

        <ViewOptionsComponent
          viewOptions={viewOptions}
          setViewOptions={setViewOptions}
        />

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

function ActionCalendarPartnerPage({
  currentDay = new Date(),
  actions,
  viewOptions,
}: {
  currentDay?: Date;
  actions: Action[];
  viewOptions: ViewOptions;
}) {
  let calendarDates = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDay)),
    end: endOfWeek(endOfMonth(currentDay)),
  });

  const { person, celebrations } = useMatches()[1].loaderData as AppLoaderData;

  let params = useParams();
  const partnerSlug = params.slug;

  invariant(partnerSlug);

  const { setBaseAction } = useOutletContext<OutletContext>();

  const [activeAction, setActiveAction] = useState<Action>();
  const submit = useSubmit();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveAction(actions.find((action) => action.id === event.active.id)!);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeAction) {
      const key = viewOptions.instagram ? "instagram_date" : "date";
      // event.over.id is ISO string from Droppable id
      const value = format(
        parseISO(event.over.id as string),
        "yyyy-MM-dd",
      ).concat(format(activeAction[key], " HH:mm:ss"));

      // console.log({ value, over: event.over });

      handleAction(
        {
          ...activeAction,
          intent: INTENT.update_action,
          // [key]: value,
          ...getNewDateForAction(
            activeAction,
            parseISO(value),
            viewOptions.instagram && isInstagramFeed(activeAction.category),
          ),
        },
        submit,
      );

      setActiveAction(undefined);
    }
  };

  let calendar = calendarDates.map((date) => ({
    date,
    actions: actions.filter((action) =>
      isSameDay(
        viewOptions.instagram && isInstagramFeed(action.category)
          ? action.instagram_date
          : action.date,
        date,
      ),
    ),
    celebrations: celebrations.filter((celebration) =>
      isSameDay(parseISO(celebration.date), date),
    ),
  }));

  return (
    <DndContext
      id={"calendar"}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CalendarActions
        currentDay={currentDay}
        calendar={calendar}
        viewOptions={viewOptions}
        onCreateAction={(day) => {
          setBaseAction({
            ...(getCleanAction(person.user_id, day) as unknown as Action),
            partners: [partnerSlug],
          });
        }}
      />
      <DragOverlay
        // className="z-100"
        dropAnimation={{ duration: 150, easing: "ease-in-out" }}
        adjustScale={false}
      >
        {activeAction ? (
          <ActionItem
            action={activeAction}
            variant={viewOptions.variant}
            isDragging
            showLate={viewOptions.late}
            showPartner={viewOptions.partner}
            showCategory={viewOptions.category}
            showResponsibles={viewOptions.responsibles}
            showPriority={viewOptions.priority}
            dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
            showSprint={viewOptions.sprint}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
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

      {(viewOptions.showOptions.filter_category ||
        viewOptions.showOptions.filter_state ||
        viewOptions.showOptions.filter_responsible) && (
        <div className="flex gap-1">
          {viewOptions.showOptions.filter_category && (
            <CategoriesCombobox
              isMulti
              showInstagramGroup
              selectedCategories={viewOptions.filter_category || ["all"]}
              onSelect={({ categories }) => {
                setViewOptions({
                  ...viewOptions,
                  filter_category:
                    categories[0] === "all" ? undefined : categories,
                });
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
