import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  BlocksIcon,
  CircleAlertIcon,
  ClockIcon,
  Grid3x3Icon,
  HandshakeIcon,
  HeartHandshakeIcon,
  KanbanIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CalendarButtons } from "~/components/features/Calendar";
import {
  ViewOptionsComponent,
  useViewOptions,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import FeedComponent from "~/components/layout/FeedComponent";
import { HoursComponent } from "~/components/layout/HoursComponent";
import KanbanComponent from "~/components/layout/KanbanComponent";
import { PartnersComponent } from "~/components/layout/PartnersComponent";
import { UToggle } from "~/components/uzzina/UToggle";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { isInstagramFeed } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export function TodayHomeComponent({ actions }: { actions: Action[] }) {
  const [view, setView] = useState<
    "kanban" | "hours" | "feed" | "categories" | "partners"
  >("partners");

  const [currentDay, setCurrentDay] = useState(new Date());
  const [viewOptions, setViewOptions] = useViewOptions({
    partner: true,
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
        <div className="flex flex-wrap items-center gap-2 xl:gap-6">
          <div className="flex items-center gap-8">
            {/* Opções de calendario  */}
            <CalendarButtons
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
            />
            {/* Opções de visualização  */}
            <ViewOptionsComponent
              viewOptions={viewOptions}
              setViewOptions={setViewOptions}
            />
          </div>
          {/* Opções de Views  */}
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
              <Grid3x3Icon />
            </UToggle>
            <UToggle
              checked={view === "categories"}
              onClick={() => setView("categories")}
            >
              <BlocksIcon />
            </UToggle>
            <UToggle
              checked={view === "partners"}
              onClick={() => setView("partners")}
            >
              <HeartHandshakeIcon />
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
          <NotAvailableViewComponent view="CATEGORIAS" />
        )}
        {view === "partners" && <PartnersComponent actions={filteredActions} />}
      </div>
    </HomeComponentWrapper>
  );
}

function NotAvailableViewComponent({ view }: { view: string }) {
  return (
    <div className="bg-muted text-muted-foreground flex items-center rounded-xl p-8">
      <CircleAlertIcon className="mr-4 size-8 opacity-50" />
      <div>
        Visualização por <strong className="underline">{view}</strong> ainda não
        está disponível
      </div>
    </div>
  );
}
