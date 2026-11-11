import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  CalendarDaysIcon,
  CheckIcon,
  GripVerticalIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { PrismBadge } from "~/components/prism";
import type { PlanSuggestion } from "~/lib/social-planning/types";
import { parseU } from "~/utils";
import { PlanningSuggestionEditor } from "./PlanningSuggestionEditor";

interface PlanningCalendarViewProps {
  suggestions: PlanSuggestion[];
  onUpdateSuggestion: (id: string, patch: Partial<PlanSuggestion>) => void;
  startDate?: string;
  endDate?: string;
}

export function PlanningCalendarView({
  suggestions,
  onUpdateSuggestion,
  startDate,
  endDate,
}: PlanningCalendarViewProps) {
  const [editingSuggestion, setEditingSuggestion] =
    useState<PlanSuggestion | null>(null);
  const [draggedSuggestionId, setDraggedSuggestionId] = useState<string | null>(
    null,
  );
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Intervalo de dias do calendário
  const calendarDays = useMemo(() => {
    const start = startDate ? parseU(startDate) : new Date();
    const end = endDate ? parseU(endDate) : new Date();

    const gridStart = startOfWeek(start, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(end, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [startDate, endDate]);

  const referenceDate = useMemo(() => {
    return startDate ? parseU(startDate) : new Date();
  }, [startDate]);

  const unscheduledSuggestions = useMemo(() => {
    return suggestions.filter((s) => !s.scheduled_date);
  }, [suggestions]);

  return (
    <div className="flex flex-col gap-6 p-6 xl:p-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Calendário do Planejamento
          </h2>
          <p className="text-sm text-secondary-foreground">
            Visualize e ajuste a distribuição no tempo. Arraste sugestões entre
            os dias ou clique para editar.
          </p>
        </div>
      </div>

      {/* Contêiner com rolagem horizontal nos dois eixos (C07) */}
      <div className="w-full shrink-0 overflow-x-auto">
        <div className="flex min-w-[700px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs squircle">
          {/* Cabeçalho dos dias da semana no padrão do app */}
          <div className="grid grid-cols-7 border-b border-border bg-secondary text-center text-xs font-semibold tracking-wider text-secondary-foreground uppercase">
            <div className="py-2.5">Dom</div>
            <div className="py-2.5">Seg</div>
            <div className="py-2.5">Ter</div>
            <div className="py-2.5">Qua</div>
            <div className="py-2.5">Qui</div>
            <div className="py-2.5">Sex</div>
            <div className="py-2.5">Sáb</div>
          </div>

          {/* Grade de células de dias */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {calendarDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const daySuggestions = suggestions.filter((s) => {
                if (!s.scheduled_date) return false;
                return isSameDay(parseU(s.scheduled_date), day);
              });
              const isCurrentMonth = isSameMonth(day, referenceDate);
              const isOver = dragOverDate === dateStr;

              return (
                <div
                  className={`flex min-h-[8.5rem] flex-col p-2 transition-colors ${
                    isOver
                      ? "rounded-2xl bg-primary text-primary-foreground squircle"
                      : isCurrentMonth
                        ? "bg-background"
                        : "bg-secondary opacity-60"
                  }`}
                  key={dateStr}
                  onDragLeave={() => {
                    if (dragOverDate === dateStr) setDragOverDate(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverDate !== dateStr) setDragOverDate(dateStr);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverDate(null);
                    const suggestionId =
                      e.dataTransfer.getData("text/plain") ||
                      draggedSuggestionId;
                    if (suggestionId) {
                      onUpdateSuggestion(suggestionId, {
                        scheduled_date: dateStr,
                      });
                      setDraggedSuggestionId(null);
                    }
                  }}
                >
                  {/* Cabeçalho do dia */}
                  <div className="flex items-center justify-between pb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrentMonth
                          ? "text-foreground"
                          : "text-secondary-foreground"
                      }`}
                    >
                      {format(day, "d", { locale: ptBR })}
                    </span>
                    {daySuggestions.length > 0 && (
                      <span className="text-[10px] font-medium text-secondary-foreground">
                        {daySuggestions.length}{" "}
                        {daySuggestions.length === 1 ? "item" : "itens"}
                      </span>
                    )}
                  </div>

                  {/* Lista de sugestões no dia */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    {daySuggestions.map((suggestion) => {
                      const isApproved = suggestion.status === "approved";
                      const isRejected = suggestion.status === "rejected";

                      return (
                        <div
                          className={`group relative flex cursor-grab flex-col gap-1 rounded-md border border-border bg-card p-1.5 text-xs text-foreground shadow-2xs transition-all squircle hover:border-primary/50 active:cursor-grabbing ${
                            isRejected
                              ? "line-through opacity-50"
                              : isApproved
                                ? "border-success bg-success-background"
                                : ""
                          }`}
                          draggable={true}
                          key={suggestion.id}
                          onDragEnd={() => setDraggedSuggestionId(null)}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", suggestion.id);
                            setDraggedSuggestionId(suggestion.id);
                          }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <GripVerticalIcon className="size-3 text-secondary-foreground/60 opacity-0 group-hover:opacity-100" />
                              <span className="text-[10px] font-semibold tracking-wide text-secondary-foreground uppercase">
                                {suggestion.format}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <button
                                aria-label="Aprovar sugestão"
                                className={`rounded p-0.5 transition-colors squircle ${
                                  isApproved
                                    ? "bg-success-strong text-success-strong-foreground"
                                    : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateSuggestion(suggestion.id, {
                                    status: isApproved ? "pending" : "approved",
                                  });
                                }}
                                title="Aprovar sugestão"
                                type="button"
                              >
                                <CheckIcon className="size-3" />
                              </button>
                              <button
                                aria-label="Descartar sugestão"
                                className={`rounded p-0.5 transition-colors squircle ${
                                  isRejected
                                    ? "bg-error text-white"
                                    : "text-secondary-foreground hover:bg-secondary hover:text-error"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateSuggestion(suggestion.id, {
                                    status: isRejected ? "pending" : "rejected",
                                  });
                                }}
                                title="Descartar sugestão"
                                type="button"
                              >
                                <XIcon className="size-3" />
                              </button>
                            </div>
                          </div>

                          <span
                            className="line-clamp-2 cursor-pointer font-medium hover:underline"
                            onClick={() => setEditingSuggestion(suggestion)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setEditingSuggestion(suggestion);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            {suggestion.title}
                          </span>

                          {suggestion.is_commemorative && (
                            <div className="flex items-center gap-1 text-[10px] text-warning-foreground">
                              <SparklesIcon className="size-2.5 shrink-0" />
                              <span className="truncate">
                                {suggestion.celebration_title ||
                                  "Data especial"}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sugestões sem data prevista */}
      {unscheduledSuggestions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 squircle">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="size-4 opacity-60" />
            <h3 className="text-sm font-semibold text-foreground">
              Sugestões sem data prevista ({unscheduledSuggestions.length})
            </h3>
          </div>
          <p className="mt-1 text-xs text-secondary-foreground">
            Clique em uma sugestão para definir sua data ou arraste-a para um
            dia do calendário.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {unscheduledSuggestions.map((s) => (
              <button
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors squircle hover:border-primary"
                draggable={true}
                key={s.id}
                onClick={() => setEditingSuggestion(s)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", s.id);
                  setDraggedSuggestionId(s.id);
                }}
                type="button"
              >
                <span>{s.title}</span>
                <PrismBadge variant="outline">{s.format}</PrismBadge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Modal Acessível (C08) */}
      <PlanningSuggestionEditor
        isOpen={Boolean(editingSuggestion)}
        onClose={() => setEditingSuggestion(null)}
        onSave={onUpdateSuggestion}
        suggestion={editingSuggestion}
      />

      {/* Espaçador da AppBar no fim da coluna rolável */}
      <AppBarSpacer />
    </div>
  );
}
