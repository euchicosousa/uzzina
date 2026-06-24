import type { Action } from "~/types";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3Icon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { PHASES } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

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

  // Calculations
  const stats = useMemo(() => {
    const weekStart = startOfWeek(refDate);
    const weekEnd = endOfWeek(refDate);
    const periodStart = startOfWeek(startOfMonth(refDate));
    const periodEnd = endOfDay(endOfWeek(endOfMonth(refDate)));

    const todayActions: Action[] = [];
    const weekActions: Action[] = [];
    const periodActions: Action[] = [];

    let todayCompleted = 0;
    let weekCompleted = 0;
    let periodCompleted = 0;

    for (const action of actions) {
      const isCompleted = action.phase === "concluido";
      const actionDate = parseISO(action.date);

      // 1. Hoje
      if (isSameDay(actionDate, refDate)) {
        todayActions.push(action);
        if (isCompleted) todayCompleted++;
      }

      // 2. Semana
      if (isWithinInterval(actionDate, { start: weekStart, end: weekEnd })) {
        weekActions.push(action);
        if (isCompleted) weekCompleted++;
      }

      // 3. Período (Mês Comercial)
      if (
        isWithinInterval(actionDate, { start: periodStart, end: periodEnd })
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
            title={"hoje"}
            actions={stats.today.actions}
            total={stats.today.total}
            completed={stats.today.completed}
          />
        )}
        <MetricPill
          title={"Semana"}
          actions={stats.week.actions}
          total={stats.week.total}
          completed={stats.week.completed}
        />
        <MetricPill
          title={format(refDate, "MMMM", { locale: ptBR })}
          actions={stats.period.actions}
          total={stats.period.total}
          completed={stats.period.completed}
        />
        {lateActions.length > 0 && (
          <MetricPill
            title={"Atrasadas"}
            actions={lateActions}
            total={lateActions.length}
          />
        )}
      </div>

      {/* Mobile Layout - Single chart button with Popover */}
      <div className="flex justify-center lg:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <BarChart3Icon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex w-52 flex-col gap-2 rounded-xl border-border bg-popover/40 p-2.5 backdrop-blur-2xl">
            {showToday && (
              <MetricPill
                title={"hoje"}
                actions={stats.today.actions}
                total={stats.today.total}
                completed={stats.today.completed}
                isMobile={true}
              />
            )}
            <MetricPill
              title={"Semana"}
              actions={stats.week.actions}
              total={stats.week.total}
              completed={stats.week.completed}
              isMobile={true}
            />
            <MetricPill
              title={format(refDate, "MMMM", { locale: ptBR })}
              actions={stats.period.actions}
              total={stats.period.total}
              completed={stats.period.completed}
              isMobile={true}
            />
            {lateActions.length > 0 && (
              <MetricPill
                title={"Atrasadas"}
                actions={lateActions}
                total={lateActions.length}
                isMobile={true}
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

const ProgressBar = ({ actions, total }: { actions: Action[]; total: number }) => {
  if (total === 0) {
    return <div className="h-1.5 w-14 shrink-0 rounded-full bg-muted/20" />;
  }

  const counts = {
    idea: 0,
    fazer: 0,
    produzindo: 0,
    alinhamento: 0,
    revisao: 0,
    concluido: 0,
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
            style={{
              width: `${pct}%`,
              backgroundColor: phaseInfo.color,
            }}
            className="h-full transition-all duration-300 ease-in-out first:rounded-l-full last:rounded-r-full"
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
