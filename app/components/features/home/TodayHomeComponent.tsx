import { useState, useMemo } from "react";
import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircleIcon,
  ClockIcon,
  ComponentIcon,
  Grid3X3Icon,
  KanbanIcon,
} from "lucide-react";
import { CalendarButtons } from "~/components/features/Calendar";
import {
  ViewOptionsComponent,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import { UToggle } from "~/components/uzzina/UToggle";
import KanbanComponent from "~/components/layout/KanbanComponent";
import { HoursComponent } from "~/components/layout/HoursComponent";
import FeedComponent from "~/components/layout/FeedComponent";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { isInstagramFeed } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export const TodayHomeComponent = ({ actions }: { actions: Action[] }) => {
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
