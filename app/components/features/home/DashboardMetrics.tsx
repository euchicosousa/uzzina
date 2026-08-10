import type { Action } from "~/types";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { parseU } from "~/utils/date";
import { ptBR } from "date-fns/locale";
import { BarChart3Icon } from "lucide-react";
import { useMemo } from "react";
import {
  PrismButton,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { PHASES } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
interface DashboardMetricsProps {
  actions: Action[];
  lateActions: Action[];
  showToday?: boolean;
  referenceDate?: Date;
}
export function DashboardMetrics({
  actions,
  lateActions,
  showToday = true,
  referenceDate,
}: DashboardMetricsProps) {
  const refDate = useMemo(() => referenceDate || new Date(), [referenceDate]);
  const isCurrentMonth = useMemo(
    () => isSameMonth(refDate, new Date()),
    [refDate],
  );

  // Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const periodStart = startOfWeek(startOfMonth(refDate));
    const periodEnd = endOfDay(endOfWeek(endOfMonth(refDate)));
    const todayActions: Action[] = [];
    const weekActions: Action[] = [];
    const periodActions: Action[] = [];
    let todayCompleted = 0;
    let weekCompleted = 0;
    let periodCompleted = 0;
    for (const action of actions) {
      const isCompleted = action.phase === PHASES.finished.slug;
      const actionDate = parseU(action.date);

      // 1. Hoje
      if (isSameDay(actionDate, now)) {
        todayActions.push(action);
        if (isCompleted) todayCompleted++;
      }

      // 2. Semana
      if (
        isWithinInterval(actionDate, {
          start: weekStart,
          end: weekEnd,
        })
      ) {
        weekActions.push(action);
        if (isCompleted) weekCompleted++;
      }

      // 3. Período (Mês Comercial)
      if (
        isWithinInterval(actionDate, {
          start: periodStart,
          end: periodEnd,
        })
      ) {
        periodActions.push(action);
        if (isCompleted) periodCompleted++;
      }
    }
    return {
      today: {
        actions: todayActions,
        total: todayActions.length,
        completed: todayCompleted,
      },
      week: {
        actions: weekActions,
        total: weekActions.length,
        completed: weekCompleted,
      },
      period: {
        actions: periodActions,
        total: periodActions.length,
        completed: periodCompleted,
      },
    };
  }, [actions, refDate]);
  if (!actions) {
    return <div>Carregando métricas</div>;
  }
  return (
    <div className="flex items-center justify-center">
      {/* Desktop Layout - Side-by-side pills */}
      <div className="hidden w-full items-center justify-center gap-2 lg:flex">
        {showToday && (
          <MetricPill
            actions={stats.today.actions}
            completed={stats.today.completed}
            title={"hoje"}
            total={stats.today.total}
          />
        )}
        {isCurrentMonth && (
          <MetricPill
            actions={stats.week.actions}
            completed={stats.week.completed}
            title={"Semana"}
            total={stats.week.total}
          />
        )}
        <MetricPill
          actions={stats.period.actions}
          completed={stats.period.completed}
          title={format(refDate, "MMMM", {
            locale: ptBR,
          })}
          total={stats.period.total}
        />
        {lateActions.length > 0 && (
          <MetricPill
            actions={lateActions}
            title={"Atrasadas"}
            total={lateActions.length}
          />
        )}
      </div>

      {/* Mobile Layout - Single chart button with Popover */}
      <div className="flex justify-center lg:hidden">
        <PrismPopoverTrigger>
          <PrismButton aria-label="Ver métricas" size="icon-sm" variant="ghost">
            <BarChart3Icon className="size-4" />
          </PrismButton>
          <PrismPopover className="flex max-w-60 flex-col gap-2 rounded-2xl border-border bg-popover/80 p-2.5 backdrop-blur-2xl">
            {showToday && (
              <MetricPill
                actions={stats.today.actions}
                completed={stats.today.completed}
                isMobile={true}
                title={"hoje"}
                total={stats.today.total}
              />
            )}
            {isCurrentMonth && (
              <MetricPill
                actions={stats.week.actions}
                completed={stats.week.completed}
                isMobile={true}
                title={"Semana"}
                total={stats.week.total}
              />
            )}
            <MetricPill
              actions={stats.period.actions}
              completed={stats.period.completed}
              isMobile={true}
              title={format(refDate, "MMMM", {
                locale: ptBR,
              })}
              total={stats.period.total}
            />
            {lateActions.length > 0 && (
              <MetricPill
                actions={lateActions}
                isMobile={true}
                title={"Atrasadas"}
                total={lateActions.length}
              />
            )}
          </PrismPopover>
        </PrismPopoverTrigger>
      </div>
    </div>
  );
}
const ProgressBar = ({
  actions,
  total,
}: {
  actions: Action[];
  total: number;
}) => {
  if (total === 0) {
    return <div className="h-1.5 w-14 shrink-0 rounded-full bg-secondary" />;
  }
  const counts: Record<string, number> = {
    idea: 0,
    do: 0,
    doing: 0,
    review: 0,
    done: 0,
    finished: 0,
  };
  for (const action of actions) {
    const phase = action.phase as keyof typeof counts;
    if (phase in counts) {
      counts[phase]++;
    }
  }
  return (
    <div className="flex h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-muted/20">
      {Object.entries(PHASES).map(([key, phaseInfo]) => {
        const count = counts[key as keyof typeof counts] || 0;
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={key}
            className="h-full transition-all duration-300 ease-in-out first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${pct}%`,
              backgroundColor: phaseInfo.color,
            }}
          />
        );
      })}
    </div>
  );
};
const MetricPill = ({
  title,
  actions,
  total,
  completed,
  isMobile = false,
}: {
  title: string;
  actions: Action[];
  total: number;
  completed?: number;
  isMobile?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between gap-2 overflow-hidden px-4 py-1">
      <div
        className={cn(
          "truncate text-xs font-medium capitalize",
          isMobile && "w-12",
        )}
      >
        {title}
      </div>
      <ProgressBar actions={actions} total={total} />

      <span
        className={cn(
          "text-right text-xs font-medium text-foreground/80",
          isMobile && "w-14",
        )}
      >
        {completed ? `${completed}/${total}` : total}
      </span>
    </div>
  );
};
