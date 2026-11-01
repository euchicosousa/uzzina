import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckIcon, SparklesIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
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

  return (
    <div className="flex flex-col gap-6 p-6 xl:p-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Visualização em Calendário
          </h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe a distribuição temporal das sugestões ao longo do período.
          </p>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <div className="py-2.5">Dom</div>
          <div className="py-2.5">Seg</div>
          <div className="py-2.5">Ter</div>
          <div className="py-2.5">Qua</div>
          <div className="py-2.5">Qui</div>
          <div className="py-2.5">Sex</div>
          <div className="py-2.5">Sáb</div>
        </div>

        {/* Células de dias */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {calendarDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySuggestions = suggestions.filter((s) => {
              if (!s.scheduled_date) return false;
              return isSameDay(parseU(s.scheduled_date), day);
            });
            const isCurrentMonth = isSameMonth(day, referenceDate);

            return (
              <div
                className={`flex min-h-[7.5rem] flex-col p-2 transition-colors ${
                  isCurrentMonth ? "bg-background" : "bg-muted/15 opacity-60"
                }`}
                key={dateStr}
              >
                {/* Cabeçalho do dia */}
                <div className="flex items-center justify-between pb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(day, "d", { locale: ptBR })}
                  </span>
                  {daySuggestions.length > 0 && (
                    <span className="text-[10px] font-medium text-muted-foreground">
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
                        className={`group relative flex flex-col gap-1 rounded-md border p-1.5 text-xs transition-all ${
                          isApproved
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                            : isRejected
                              ? "border-destructive/30 bg-muted/40 line-through opacity-50"
                              : "border-border bg-card text-foreground hover:border-primary/40"
                        }`}
                        key={suggestion.id}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                            {suggestion.format}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              aria-label="Aprovar"
                              className={`rounded p-0.5 transition-colors ${
                                isApproved
                                  ? "bg-emerald-600 text-white"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                              onClick={() =>
                                onUpdateSuggestion(suggestion.id, {
                                  status: isApproved ? "pending" : "approved",
                                })
                              }
                              title="Aprovar sugestão"
                              type="button"
                            >
                              <CheckIcon className="size-3" />
                            </button>
                            <button
                              aria-label="Descartar"
                              className={`rounded p-0.5 transition-colors ${
                                isRejected
                                  ? "bg-destructive text-white"
                                  : "text-muted-foreground hover:bg-muted hover:text-destructive"
                              }`}
                              onClick={() =>
                                onUpdateSuggestion(suggestion.id, {
                                  status: isRejected ? "pending" : "rejected",
                                })
                              }
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
                        >
                          {suggestion.title}
                        </span>

                        {suggestion.is_commemorative && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                            <SparklesIcon className="size-2.5 shrink-0" />
                            <span className="truncate">
                              {suggestion.celebration_title || "Data especial"}
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

      {/* Sugestões sem data definida */}
      {suggestions.some((s) => !s.scheduled_date) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Sugestões sem data prevista
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !s.scheduled_date)
              .map((s) => (
                <button
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary"
                  key={s.id}
                  onClick={() => setEditingSuggestion(s)}
                  type="button"
                >
                  {s.title} ({s.format})
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <PlanningSuggestionEditor
        isOpen={Boolean(editingSuggestion)}
        onClose={() => setEditingSuggestion(null)}
        onSave={onUpdateSuggestion}
        suggestion={editingSuggestion}
      />
    </div>
  );
}
