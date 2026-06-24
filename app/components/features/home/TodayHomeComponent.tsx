import type { Action } from "~/types";
import { format, isSameDay, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  BlocksIcon,
  Grid3x3Icon,
  HeartHandshakeIcon,
  KanbanIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CalendarButtons } from "~/components/features/Calendar";
import { CategoriesComponent } from "~/components/layout/CategoriesComponent";
import FeedComponent from "~/components/layout/FeedComponent";
import KanbanComponent from "~/components/layout/KanbanComponent";
import { PartnersComponent } from "~/components/layout/PartnersComponent";
import { UToggle } from "~/components/uzzina/UToggle";
import { isInstagramFeed } from "~/lib/helpers";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export function TodayHomeComponent({
  actions,
  isLoading,
}: {
  actions: Action[];
  isLoading?: boolean;
}) {
  const [view, setView] = useState<
    "kanban" | "feed" | "categories" | "partners"
  >("partners");

  const [currentDay, setCurrentDay] = useState(new Date());

  const filteredActions = useMemo(() => {
    return view === "feed"
      ? actions.filter((action) => {
          return (
            isSameDay(parseISO(action.date), currentDay) &&
            isInstagramFeed(action.category)
          );
        })
      : actions.filter((action) => {
          return isSameDay(parseISO(action.date), currentDay);
        });
  }, [actions, view, currentDay]);

  const title = useMemo(() => {
    if (isToday(currentDay)) return "Hoje";
    const formatted = format(currentDay, "eeee, dd 'de' MMMM", {
      locale: ptBR,
    });
    return formatted[0].toUpperCase() + formatted.slice(1);
  }, [currentDay]);

  return (
    <HomeComponentWrapper
      title={title}
      OptionsComponent={
        <div className="flex flex-wrap items-center gap-2 xl:gap-6">
          <div className="flex items-center gap-8">
            {/* Opções de calendario  */}
            <CalendarButtons
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              showDate
            />
            {/* Opções de visualização  */}
            {/* <ViewOptionsComponent
              viewOptions={viewOptions}
              setViewOptions={setViewOptions}
            /> */}
          </div>
          {/* Opções de Views  */}
          <div className="flex gap-1">
            <UToggle
              pressed={view === "kanban"}
              onClick={() => setView("kanban")}
              className="raised"
            >
              <KanbanIcon />
            </UToggle>

            <UToggle
              pressed={view === "feed"}
              onClick={() => setView("feed")}
              className="raised"
            >
              <Grid3x3Icon />
            </UToggle>
            <UToggle
              pressed={view === "categories"}
              onClick={() => setView("categories")}
              className="raised"
            >
              <BlocksIcon />
            </UToggle>
            <UToggle
              pressed={view === "partners"}
              onClick={() => setView("partners")}
              className="raised"
            >
              <HeartHandshakeIcon />
            </UToggle>
          </div>
        </div>
      }
    >
      <div className="px-8 xl:px-16">
        {view === "kanban" && <KanbanComponent actions={filteredActions} />}
        {view === "feed" && <FeedComponent actions={filteredActions} />}
        {view === "categories" && (
          <CategoriesComponent actions={filteredActions} />
        )}
        {view === "partners" && (
          <PartnersComponent actions={filteredActions} isLoading={isLoading} />
        )}
      </div>
    </HomeComponentWrapper>
  );
}
