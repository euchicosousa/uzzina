import type { TodayViewMode } from "~/lib/preferences";
import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  BlocksIcon,
  Grid3x3Icon,
  HeartHandshakeIcon,
  KanbanIcon,
  PaletteIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ActionContainer } from "~/components/features/ActionContainer";
import { CategoriesBoard } from "~/components/layout/CategoriesBoard";
import KanbanPhasesBoard from "~/components/layout/KanbanPhasesBoard";
import { PartnersBoard } from "~/components/layout/PartnersBoard";
import {
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
  PrismTooltip,
} from "~/components/prism";
import { VARIANT } from "~/lib/CONSTANTS";
import type { Action } from "~/types";
import { isInstagramFeed } from "~/utils";
import { parseU } from "~/utils/date";

// Building blocks shared by the Home "Hoje" block and the dedicated Today page.
export type { TodayViewMode } from "~/lib/preferences";

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

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Dedicated page heading: always names the selected date, adding the year only
// when it differs from the current one. Home keeps using useTodayTitle.
export function getTodayPageHeading(currentDay: Date, now: Date = new Date()) {
  const showYear = currentDay.getFullYear() !== now.getFullYear();
  const locale = { locale: ptBR };
  const wideDate = format(
    currentDay,
    showYear ? "d 'de' MMMM 'de' yyyy" : "d 'de' MMMM",
    locale,
  );
  if (isSameDay(currentDay, now)) {
    return `Hoje, ${format(currentDay, "eeee", locale)}, ${wideDate}`;
  }
  return `${capitalize(format(currentDay, "eeee", locale))}, ${wideDate}`;
}

export function useTodayPageHeading(currentDay: Date) {
  return useMemo(() => getTodayPageHeading(currentDay), [currentDay]);
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
      className="max-w-full flex-wrap"
      selectedKeys={[view]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as TodayViewMode;
        if (selected) onViewChange(selected);
      }}
      size="sm"
    >
      <PrismTooltip label={TODAY_VIEW_LABELS.kanban}>
        <PrismToggleGroupItem aria-label="Visão por Kanban" id="kanban">
          <KanbanIcon />
        </PrismToggleGroupItem>
      </PrismTooltip>
      <PrismTooltip label={TODAY_VIEW_LABELS.categories}>
        <PrismToggleGroupItem aria-label="Visão por Categorias" id="categories">
          <Grid3x3Icon />
        </PrismToggleGroupItem>
      </PrismTooltip>
      <PrismTooltip label={TODAY_VIEW_LABELS.feed}>
        <PrismToggleGroupItem aria-label="Visão por Feed" id="feed">
          <BlocksIcon />
        </PrismToggleGroupItem>
      </PrismTooltip>
      <PrismTooltip label={TODAY_VIEW_LABELS.partners}>
        <PrismToggleGroupItem aria-label="Visão por Parceiros" id="partners">
          <HeartHandshakeIcon />
        </PrismToggleGroupItem>
      </PrismTooltip>
    </PrismToggleGroup>
  );
}

/** Only Partners and Categories offer the phase color; Kanban already groups by phase. */
function viewHasPhaseColor(view: TodayViewMode) {
  return view === "partners" || view === "categories";
}

/** Today block's only display option, so a toggle instead of a menu. */
export function useTodayPhaseColor(view: TodayViewMode) {
  const [isOn, setIsOn] = useState(false);
  const isAvailable = viewHasPhaseColor(view);
  return {
    showPhaseColor: isAvailable && isOn,
    phaseColorToggle: isAvailable ? (
      <PrismTooltip label="Cor da fase">
        <PrismToggle
          aria-label="Cor da fase"
          isSelected={isOn}
          onChange={setIsOn}
          size="sm"
        >
          <PaletteIcon />
        </PrismToggle>
      </PrismTooltip>
    ) : null,
  };
}

export function TodayBoard({
  view,
  actions,
  isLoading,
  currentDay,
  fillHeight = false,
  showFeedTitle = true,
  showPhaseColor = false,
}: {
  view: TodayViewMode;
  actions: Action[];
  isLoading?: boolean;
  currentDay: Date;
  fillHeight?: boolean;
  showFeedTitle?: boolean;
  /** Tints Partners and Categories cards by phase; Kanban and Feed ignore it. */
  showPhaseColor?: boolean;
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
  if (view === "categories")
    return (
      <CategoriesBoard actions={actions} showPhaseColor={showPhaseColor} />
    );
  return (
    <PartnersBoard
      actions={actions}
      isLoading={isLoading}
      currentDay={currentDay}
      showPhaseColor={showPhaseColor}
    />
  );
}
