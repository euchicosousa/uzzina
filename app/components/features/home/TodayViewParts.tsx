import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  BlocksIcon,
  Grid3x3Icon,
  HeartHandshakeIcon,
  KanbanIcon,
} from "lucide-react";
import { useMemo } from "react";
import { ActionContainer } from "~/components/features/ActionContainer";
import { CategoriesBoard } from "~/components/layout/CategoriesBoard";
import KanbanPhasesBoard from "~/components/layout/KanbanPhasesBoard";
import { PartnersBoard } from "~/components/layout/PartnersBoard";
import { PrismToggleGroup, PrismToggleGroupItem } from "~/components/prism";
import { VARIANT } from "~/lib/CONSTANTS";
import type { Action } from "~/types";
import { isInstagramFeed } from "~/utils";
import { parseU } from "~/utils/date";

// Building blocks shared by the Home "Hoje" block and the dedicated Today page.
export type TodayViewMode = "kanban" | "feed" | "categories" | "partners";

export const TODAY_VIEW_LABELS: Record<TodayViewMode, string> = {
  kanban: "Status das ações",
  categories: "Categorias",
  feed: "Feed do Instagram",
  partners: "Parceiros",
};

export function useTodayActions(
  actions: Action[],
  view: TodayViewMode,
  currentDay: Date,
) {
  return useMemo(
    () =>
      actions.filter(
        (action) =>
          isSameDay(parseU(action.date), currentDay) &&
          (view !== "feed" || isInstagramFeed(action.category)),
      ),
    [actions, view, currentDay],
  );
}

export function useTodayTitle(currentDay: Date) {
  return useMemo(() => {
    if (isToday(currentDay)) return "Hoje";
    const formatted = format(currentDay, "eeee, dd 'de' MMMM", {
      locale: ptBR,
    });
    return formatted[0].toUpperCase() + formatted.slice(1);
  }, [currentDay]);
}

export function TodayViewToggle({
  view,
  onViewChange,
}: {
  view: TodayViewMode;
  onViewChange: (view: TodayViewMode) => void;
}) {
  return (
    <PrismToggleGroup
      aria-label="Opções de Visualização da Home"
      selectedKeys={[view]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as TodayViewMode;
        if (selected) onViewChange(selected);
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
  );
}

export function TodayBoard({
  view,
  actions,
  isLoading,
  currentDay,
  fillHeight = false,
  showFeedTitle = true,
}: {
  view: TodayViewMode;
  actions: Action[];
  isLoading?: boolean;
  currentDay: Date;
  fillHeight?: boolean;
  showFeedTitle?: boolean;
}) {
  if (view === "kanban")
    return <KanbanPhasesBoard actions={actions} fillHeight={fillHeight} />;
  if (view === "feed")
    return (
      <div className="w-full max-w-full overflow-hidden">
        {showFeedTitle && <h5 className="pb-8">{TODAY_VIEW_LABELS.feed}</h5>}
        <div className="pb-8">
          <ActionContainer
            columns={6}
            actions={actions}
            variant={VARIANT.content}
            displayFlags={{ showCategory: true }}
          />
        </div>
      </div>
    );
  if (view === "categories") return <CategoriesBoard actions={actions} />;
  return (
    <PartnersBoard
      actions={actions}
      isLoading={isLoading}
      currentDay={currentDay}
    />
  );
}
