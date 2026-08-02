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
import { CalendarToolbar } from "~/components/features/CalendarToolbar";
import { CategoriesBoard } from "~/components/layout/CategoriesBoard";
import KanbanPhasesBoard from "~/components/layout/KanbanPhasesBoard";
import { PartnersBoard } from "~/components/layout/PartnersBoard";
import { ActionContainer } from "~/components/features/ActionContainer";
import { VARIANT } from "~/lib/CONSTANTS";
import { PrismToggleGroup, PrismToggleGroupItem } from "~/components/prism";
import { isInstagramFeed } from "~/lib/helpers";
import type { Action } from "~/types";
import { HomeViewWrapper } from "./HomeViewWrapper";

export function HomeTodayView({
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
    <HomeViewWrapper
      title={title}
      OptionsComponent={
        <div className="flex items-center gap-2">
          <CalendarToolbar currentDay={currentDay} setCurrentDay={setCurrentDay} />
          <PrismToggleGroup
            aria-label="Opções de Visualização da Home"
            selectedKeys={[view]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as typeof view;
              if (selected) setView(selected);
            }}
            size="sm"
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
        {view === "kanban" && <KanbanPhasesBoard actions={filteredActions} />}
        {view === "feed" && (
          <div className="w-full max-w-full overflow-hidden">
            <h5 className="pb-8">Feed do Instagram</h5>
            <div className="pb-8">
              <ActionContainer
                columns={6}
                actions={filteredActions}
                variant={VARIANT.content}
                displayFlags={{ showCategory: true }}
              />
            </div>
          </div>
        )}
        {view === "categories" && (
          <CategoriesBoard actions={filteredActions} />
        )}
        {view === "partners" && (
          <PartnersBoard actions={filteredActions} isLoading={isLoading} currentDay={currentDay} />
        )}
      </div>
    </HomeViewWrapper>
  );
}
