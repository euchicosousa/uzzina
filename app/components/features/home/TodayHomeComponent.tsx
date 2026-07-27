import { format, isSameDay, isToday } from "date-fns";
import { parseU } from "~/utils/date";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  BlocksIcon,
  Grid3x3Icon,
  HeartHandshakeIcon,
  KanbanIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CalendarButtons } from "~/components/features/Calendar";
import { CategoriesBoardComponent } from "~/components/layout/CategoriesBoardComponent";
import FeedComponent from "~/components/layout/FeedComponent";
import KanbanHomeActions from "~/components/layout/KanbanHomeActions";
import { PartnersComponent } from "~/components/layout/PartnersComponent";
import { PrismToggleGroup, PrismToggleGroupItem } from "~/components/prism";
import { isInstagramFeed } from "~/lib/helpers";
import type { Action } from "~/types";
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
            isSameDay(parseU(action.date), currentDay) &&
            isInstagramFeed(action.category)
          );
        })
      : actions.filter((action) => {
          return isSameDay(parseU(action.date), currentDay);
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
            <CalendarButtons
              currentDay={currentDay}
              setCurrentDay={setCurrentDay}
              showDate
            />
          </div>
          <PrismToggleGroup
            aria-label="Alternar Visão"
            size="sm"
            selectionMode="single"
            selectedKeys={new Set([view])}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as typeof view;
              if (selected) setView(selected);
            }}
          >
            <PrismToggleGroupItem aria-label="Visão por Kanban" id="kanban">
              <KanbanIcon />
            </PrismToggleGroupItem>
            <PrismToggleGroupItem aria-label="Visão por Categorias" id="categories">
              <Grid3x3Icon />
            </PrismToggleGroupItem>
            <PrismToggleGroupItem aria-label="Visão por Feed" id="feed">
              <BlocksIcon />
            </PrismToggleGroupItem>
            <PrismToggleGroupItem aria-label="Visão por Parceiros" id="partners">
              <HeartHandshakeIcon />
            </PrismToggleGroupItem>
          </PrismToggleGroup>
        </div>
      }
    >
      <div className="px-8 xl:px-16">
        {view === "kanban" && <KanbanHomeActions actions={filteredActions} />}
        {view === "feed" && <FeedComponent actions={filteredActions} />}
        {view === "categories" && (
          <CategoriesBoardComponent actions={filteredActions} />
        )}
        {view === "partners" && (
          <PartnersComponent actions={filteredActions} isLoading={isLoading} currentDay={currentDay} />
        )}
      </div>
    </HomeComponentWrapper>
  );
}
