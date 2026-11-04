import {
  CalendarIcon,
  CheckCircle2Icon,
  CheckIcon,
  PencilIcon,
  SparklesIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PrismBadge, PrismButton } from "~/components/prism";
import type { PlanSuggestion } from "~/lib/social-planning/types";
import { PlanningSuggestionEditor } from "./PlanningSuggestionEditor";

interface PlanningSuggestionsListProps {
  suggestions: PlanSuggestion[];
  onUpdateSuggestion: (id: string, patch: Partial<PlanSuggestion>) => void;
  onApproveAllPending?: () => void;
  onFinalize?: () => void;
  isFinalizing?: boolean;
}

export function PlanningSuggestionsList({
  suggestions,
  onUpdateSuggestion,
  onApproveAllPending,
  onFinalize,
  isFinalizing = false,
}: PlanningSuggestionsListProps) {
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [editingSuggestion, setEditingSuggestion] =
    useState<PlanSuggestion | null>(null);

  const stats = useMemo(() => {
    const total = suggestions.length;
    const approved = suggestions.filter((s) => s.status === "approved").length;
    const rejected = suggestions.filter((s) => s.status === "rejected").length;
    const pending = suggestions.filter((s) => s.status === "pending").length;
    return { total, approved, rejected, pending };
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    if (filter === "all") return suggestions;
    return suggestions.filter((s) => s.status === filter);
  }, [suggestions, filter]);

  const formatLabels: Record<string, string> = {
    reels: "Reels",
    carousel: "Carrossel",
    static: "Estático",
  };

  return (
    <div className="flex flex-col gap-6 p-6 xl:p-8">
      {/* Header com contadores e ações globais */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Sugestões geradas ({stats.total})
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {stats.approved} aprovadas
            </span>
            <span>•</span>
            <span className="font-medium text-destructive">
              {stats.rejected} descartadas
            </span>
            <span>•</span>
            <span>{stats.pending} pendentes</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {stats.pending > 0 && onApproveAllPending && (
            <PrismButton
              onClick={onApproveAllPending}
              size="sm"
              variant="outline"
            >
              <CheckIcon className="size-4" />
              Aprovar todas as pendentes
            </PrismButton>
          )}

          {stats.approved > 0 && onFinalize && (
            <PrismButton
              isDisabled={isFinalizing}
              onClick={onFinalize}
              size="sm"
              variant="default"
            >
              <CheckCircle2Icon className="size-4" />
              {isFinalizing
                ? "Criando ações..."
                : `Finalizar ${stats.approved} ${stats.approved === 1 ? "ação" : "ações"}`}
            </PrismButton>
          )}
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors squircle ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          Todas ({stats.total})
        </button>
        <button
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors squircle ${
            filter === "pending"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("pending")}
          type="button"
        >
          Pendentes ({stats.pending})
        </button>
        <button
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors squircle ${
            filter === "approved"
              ? "bg-emerald-600 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("approved")}
          type="button"
        >
          Aprovadas ({stats.approved})
        </button>
        <button
          className={`rounded-lg px-3 py-1.5 font-medium transition-colors squircle ${
            filter === "rejected"
              ? "text-destructive-foreground bg-destructive"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("rejected")}
          type="button"
        >
          Descartadas ({stats.rejected})
        </button>
      </div>

      {/* Lista de cards */}
      <div className="grid gap-4">
        {filteredSuggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground squircle">
            Nenhuma sugestão encontrada para o filtro selecionado.
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => {
            const isApproved = suggestion.status === "approved";
            const isRejected = suggestion.status === "rejected";

            return (
              <div
                className={`relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs transition-all squircle hover:border-border/80 ${
                  isRejected ? "opacity-60" : ""
                }`}
                key={suggestion.id}
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <PrismBadge variant="secondary">
                      {formatLabels[suggestion.format] || suggestion.format}
                    </PrismBadge>

                    {suggestion.scheduled_date && (
                      <PrismBadge variant="outline">
                        <CalendarIcon className="mr-1 size-3" />
                        {suggestion.scheduled_date}
                      </PrismBadge>
                    )}

                    {suggestion.is_commemorative && (
                      <PrismBadge variant="warning">
                        <SparklesIcon className="mr-1 size-3" />
                        {suggestion.celebration_title || "Data comemorativa"}
                      </PrismBadge>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isRejected && (
                      <PrismBadge variant="destructive">
                        <XCircleIcon className="mr-1 size-3" />
                        Descartada
                      </PrismBadge>
                    )}
                    {!isApproved && !isRejected && (
                      <PrismBadge variant="outline">Pendente</PrismBadge>
                    )}
                  </div>
                </div>

                {/* Título */}
                <h3
                  className={`text-base font-semibold ${
                    isRejected
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {suggestion.title}
                </h3>

                {/* Racional / Objetivo */}
                {suggestion.objective && (
                  <p className="text-sm text-muted-foreground italic">
                    Objetivo: {suggestion.objective}
                  </p>
                )}

                {/* Briefing / Direcionamento */}
                {suggestion.briefing && (
                  <p className="text-sm text-foreground/90">
                    {suggestion.briefing}
                  </p>
                )}

                {/* Ações individuais */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <PrismButton
                    onClick={() => setEditingSuggestion(suggestion)}
                    size="sm"
                    variant="ghost"
                  >
                    <PencilIcon className="mr-1 size-3.5" />
                    Editar
                  </PrismButton>

                  <div className="flex items-center gap-2">
                    <PrismButton
                      aria-label="Descartar sugestão"
                      className={
                        isRejected ? "bg-destructive/20 text-destructive" : ""
                      }
                      onClick={() =>
                        onUpdateSuggestion(suggestion.id, {
                          status: isRejected ? "pending" : "rejected",
                        })
                      }
                      size="sm"
                      variant="ghost"
                    >
                      <XIcon className="mr-1 size-4" />
                      {isRejected ? "Desfazer descarte" : "Descartar"}
                    </PrismButton>

                    <PrismButton
                      aria-label="Aprovar sugestão"
                      onClick={() =>
                        onUpdateSuggestion(suggestion.id, {
                          status: isApproved ? "pending" : "approved",
                        })
                      }
                      size="sm"
                      variant={isApproved ? "success" : "secondary"}
                    >
                      <CheckIcon className="mr-1 size-4" />
                      {isApproved ? "Aprovada" : "Aprovar"}
                    </PrismButton>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
