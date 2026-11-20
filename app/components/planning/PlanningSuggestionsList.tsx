import {
  CalendarIcon,
  CheckCircle2Icon,
  CheckIcon,
  PencilIcon,
  Undo2Icon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import {
  PrismBadge,
  PrismButton,
  PrismDialog,
  PrismDialogBody,
  PrismDialogClose,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismDialogTrigger,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import type {
  PlanSuggestion,
  PlanSuggestionStatus,
} from "~/lib/social-planning/types";
import { cn } from "~/lib/utils";
import { PLANNING_FORMAT_LABELS } from "./PlanningPreview";

const FILTER_LABELS = {
  all: "Todas",
  pending: "Pendentes",
  approved: "Aprovadas",
  rejected: "Descartadas",
  finalized: "Finalizadas",
};
const FILTERS = [
  "all",
  "pending",
  "approved",
  "rejected",
  "finalized",
] as const;
type SuggestionFilter = keyof typeof FILTER_LABELS;

const STATUS_LABELS = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Descartada",
} satisfies Record<PlanSuggestionStatus, string>;

interface PlanningSuggestionsListProps {
  suggestions: PlanSuggestion[];
  onEditSuggestion: (suggestion: PlanSuggestion) => void;
  onChangeStatus: (id: string, status: PlanSuggestionStatus) => void;
  onApproveAllPending: () => void;
  onFinalize: () => void;
  onRelease: (suggestionId: string) => void;
  isSaving: boolean;
  isFinalizing: boolean;
}

export function PlanningSuggestionsList({
  suggestions,
  onEditSuggestion,
  onChangeStatus,
  onApproveAllPending,
  onFinalize,
  onRelease,
  isSaving,
  isFinalizing,
}: PlanningSuggestionsListProps) {
  const [filter, setFilter] = useState<SuggestionFilter>("all");
  // A suggestion that already became an action is "finalized": it leaves the
  // pending/approved counts and the Finalizar button until it is released.
  const isFinalized = (suggestion: PlanSuggestion) =>
    Boolean(suggestion.created_action_id);
  const counts = {
    all: suggestions.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    finalized: 0,
  };
  for (const suggestion of suggestions) {
    if (isFinalized(suggestion)) counts.finalized++;
    else counts[suggestion.status]++;
  }
  const visibleSuggestions = suggestions.filter((suggestion) => {
    if (filter === "all") return true;
    if (filter === "finalized") return isFinalized(suggestion);
    return !isFinalized(suggestion) && suggestion.status === filter;
  });
  const isBusy = isSaving || isFinalizing;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-6 py-3">
        <PrismToggleGroup
          aria-label="Filtrar sugestões"
          className="flex-wrap"
          disallowEmptySelection
          onSelectionChange={(keys) =>
            setFilter(FILTERS.find((key) => keys.has(key)) ?? "all")
          }
          selectedKeys={[filter]}
          selectionMode="single"
          size="sm"
          variant="ghost"
        >
          {FILTERS.map((key) => (
            <PrismToggleGroupItem id={key} key={key}>
              {FILTER_LABELS[key]} ({counts[key]})
            </PrismToggleGroupItem>
          ))}
        </PrismToggleGroup>

        <div className="flex flex-wrap items-center gap-2">
          {counts.pending > 0 && (
            <PrismButton
              isDisabled={isBusy}
              onPress={onApproveAllPending}
              size="sm"
              variant="outline"
            >
              Aprovar todas as pendentes
              <CheckIcon data-icon="inline-end" />
            </PrismButton>
          )}
          {counts.approved > 0 && (
            <PrismButton
              isDisabled={isBusy}
              onPress={onFinalize}
              size="sm"
              variant="success"
            >
              {isFinalizing
                ? "Criando ações…"
                : `Finalizar ${counts.approved} ${counts.approved === 1 ? "ação" : "ações"}`}
              <CheckCircle2Icon data-icon="inline-end" />
            </PrismButton>
          )}
        </div>
      </div>

      {visibleSuggestions.length === 0 ? (
        <p className="px-6 py-4 text-sm text-secondary-foreground">
          Nenhuma sugestão para este filtro.
        </p>
      ) : (
        <ul className="divide-y divide-border px-6">
          {visibleSuggestions.map((suggestion) => {
            const finalized = isFinalized(suggestion);
            const isApproved = suggestion.status === "approved";
            const isRejected = suggestion.status === "rejected";

            return (
              <li
                className={cn("grid gap-2 py-4", finalized && "opacity-70")}
                key={suggestion.id}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-foreground">
                  <span>{PLANNING_FORMAT_LABELS[suggestion.format]}</span>
                  {suggestion.scheduled_date && (
                    <time
                      className="inline-flex items-center gap-1"
                      dateTime={suggestion.scheduled_date}
                    >
                      <CalendarIcon className="size-3" />
                      {suggestion.scheduled_date.split("-").reverse().join("/")}
                    </time>
                  )}
                  {suggestion.is_commemorative && (
                    <span className="inline-flex items-center gap-1">
                      <SparklesIcon className="size-3" />
                      {suggestion.celebration_title || "Data comemorativa"}
                    </span>
                  )}
                  <PrismBadge
                    variant={
                      finalized
                        ? "info"
                        : isApproved
                          ? "success"
                          : isRejected
                            ? "error"
                            : "outline"
                    }
                  >
                    {finalized
                      ? "Virou ação"
                      : STATUS_LABELS[suggestion.status]}
                  </PrismBadge>
                </div>
                <h3 className="text-base font-semibold">{suggestion.title}</h3>
                {suggestion.objective && (
                  <p className="text-sm text-secondary-foreground">
                    {suggestion.objective}
                  </p>
                )}
                {suggestion.briefing && (
                  <p className="text-sm whitespace-pre-line">
                    {suggestion.briefing}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1">
                  <PrismButton
                    isDisabled={isBusy || finalized}
                    onPress={() => onEditSuggestion(suggestion)}
                    size="sm"
                    variant="ghost"
                  >
                    Editar
                    <PencilIcon data-icon="inline-end" />
                  </PrismButton>
                  {finalized ? (
                    <PrismDialogTrigger>
                      <PrismButton
                        isDisabled={isBusy}
                        size="sm"
                        variant="ghost"
                      >
                        Liberar para aprovar de novo
                        <Undo2Icon data-icon="inline-end" />
                      </PrismButton>
                      <PrismDialog>
                        <PrismDialogHeader>
                          <PrismDialogTitle>
                            Liberar esta sugestão?
                          </PrismDialogTitle>
                          <PrismDialogDescription>
                            {suggestion.title}
                          </PrismDialogDescription>
                        </PrismDialogHeader>
                        <PrismDialogBody>
                          <p>
                            A sugestão volta a Aprovada e pode ser finalizada de
                            novo, criando uma nova ação. A ação que já existe
                            não é alterada nem apagada.
                          </p>
                        </PrismDialogBody>
                        <PrismDialogFooter>
                          <PrismDialogClose>Cancelar</PrismDialogClose>
                          <PrismDialogClose
                            onPress={() => onRelease(suggestion.id)}
                            variant="default"
                          >
                            Liberar
                          </PrismDialogClose>
                        </PrismDialogFooter>
                      </PrismDialog>
                    </PrismDialogTrigger>
                  ) : (
                    <>
                      <PrismButton
                        aria-pressed={isApproved}
                        isDisabled={isBusy}
                        onPress={() =>
                          onChangeStatus(
                            suggestion.id,
                            isApproved ? "pending" : "approved",
                          )
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {isApproved ? "Desfazer aprovação" : "Aprovar"}
                        <CheckIcon data-icon="inline-end" />
                      </PrismButton>
                      <PrismButton
                        aria-pressed={isRejected}
                        isDisabled={isBusy}
                        onPress={() =>
                          onChangeStatus(
                            suggestion.id,
                            isRejected ? "pending" : "rejected",
                          )
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {isRejected ? "Desfazer descarte" : "Descartar"}
                        <XIcon data-icon="inline-end" />
                      </PrismButton>
                    </>
                  )}
                </div>
                {finalized && (
                  <p className="text-xs text-secondary-foreground">
                    A ação já foi criada. Para mudar o conteúdo, edite a ação.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
