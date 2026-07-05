import type { Action } from "~/types";
import { useMemo } from "react";
import { DATE_TIME_DISPLAY, STATIONS } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { ActionItem } from "../features/ActionItem";
import { UBadge } from "../uzzina/UBadge";
import { useIsDesktop } from "~/hooks/useIsDesktop";
export default function KanbanStationsFlow({ actions }: { actions: Action[] }) {
  const isDesktop = useIsDesktop();

  // Pre-group by station
  const actionsByStation = useMemo(() => {
    const map: Record<string, Action[]> = {
      flow: [],
      planning: [],
      creation: [],
      client: [],
      none: [],
    };
    for (const action of actions) {
      const key = action.station ?? "none";
      if (!map[key]) map[key] = [];
      map[key].push(action);
    }
    return map;
  }, [actions]);
  if (isDesktop) {
    return (
      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* Top 4 columns */}
        <div className="grid grid-cols-4 flex-1 min-h-0 overflow-hidden">
          {Object.values(STATIONS).map((station) => (
            <KanbanColumn
              key={station.slug}
              actions={actionsByStation[station.slug] ?? []}
              station={station}
            />
          ))}
        </div>
        {/* Bottom row: Sem estação */}
        <div className="h-[260px] shrink-0 border-t mt-8">
          <KanbanRow actions={actionsByStation.none ?? []} />
        </div>
      </div>
    );
  }

  // Mobile: 5 columns horizontal
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto pb-8 h-[calc(100vh-200px)]">
        <div className="flex gap-4 min-w-max h-full overflow-hidden">
          {Object.values(STATIONS).map((station) => (
            <KanbanColumn
              key={station.slug}
              actions={actionsByStation[station.slug] ?? []}
              className="w-[300px]"
              station={station}
            />
          ))}
          <KanbanColumn
            actions={actionsByStation.none ?? []}
            className="w-[300px]"
            station={{
              slug: "none",
              title: "Sem estação",
              color: "#888",
            }}
          />
        </div>
      </div>
    </div>
  );
}
const KanbanColumn = ({
  actions,
  station,
  className,
}: {
  actions: Action[];
  station: {
    slug: string;
    title: string;
    color: string;
  };
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex h-full px-4 flex-col overflow-hidden border-t-4 transition-colors",
        className,
      )}
      style={{
        borderTopColor: station.color,
      }}
    >
      <div className="flex items-center gap-2 px-1 py-2 text-lg font-medium tracking-tight">
        <div>{station.title}</div>
        <UBadge value={actions.length} />
      </div>

      <div className="flex h-full flex-col overflow-y-auto p-1">
        <div className="flex flex-col gap-1">
          {actions.map((action) => (
            <ActionItem
              key={action.id}
              action={action}
              dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
              displayFlags={{
                showLate: true,
                showPartner: true,
                showCategory: true,
              }}
            />
          ))}
          {/* Vamos colocar aqui aquele elemento que tem no actioncontainer que simula um fade, mas é só um div com bg linear. transforma em componente e coloca aqui ou então, seria possível a gente usar ActionContainer aqui e manter o DnD? - quero resposta */}
        </div>
      </div>
    </div>
  );
};
const KanbanRow = ({ actions }: { actions: Action[] }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden border-t-4 border-gray-400 pt-2">
      <div className="flex items-center gap-2 px-1 pb-2 text-lg font-medium tracking-tight">
        <div>Sem estação</div>
        <UBadge value={actions.length} />
      </div>
      <div className="flex overflow-x-auto gap-2 p-1 h-full">
        {actions.map((action) => (
          <div key={action.id} className="w-[300px] shrink-0">
            <ActionItem
              action={action}
              dateTimeDisplay={DATE_TIME_DISPLAY.TimeOnly}
              displayFlags={{
                showLate: true,
                showPartner: true,
                showCategory: true,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
