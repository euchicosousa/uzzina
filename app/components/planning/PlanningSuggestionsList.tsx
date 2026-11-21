import {
  CalendarIcon,
  CheckIcon,
  PencilIcon,
  Undo2Icon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
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

export const FILTER_LABELS = {
  all: "Todas",
  pending: "Pendentes",
  approved: "Aprovadas",
  rejected: "Descartadas",
  finalized: "Finalizadas",
};
export const FILTERS = [
  "all",
  "pending",
  "approved",
  "rejected",
  "finalized",
] as const;
export type SuggestionFilter = (typeof FILTERS)[number];

/** A suggestion that already became an action is "finalized". */
export const isSuggestionFinalized = (suggestion: PlanSuggestion) =>
  Boolean(suggestion.created_action_id);

export function countSuggestions(suggestions: PlanSuggestion[]) {
  const counts: Record<SuggestionFilter, number> = {
    all: suggestions.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    finalized: 0,
  };
  for (const suggestion of suggestions) {
    if (isSuggestionFinalized(suggestion)) counts.finalized++;
    else counts[suggestion.status]++;
  }
  return counts;
}

/** Falls back to "all" when the chosen filter has nothing left to show. */
export function resolveSuggestionFilter(
  filter: SuggestionFilter,
  counts: Record<SuggestionFilter, number>,
): SuggestionFilter {
  return filter !== "all" && counts[filter] === 0 ? "all" : filter;
}

/** Filter tabs: filters with nothing in them are hidden, "Todas" always shows. */
export function PlanningFilterTabs({
  counts,
  filter,
  onChange,
}: {
  counts: Record<SuggestionFilter, number>;
  filter: SuggestionFilter;
  onChange: (filter: SuggestionFilter) => void;
}) {
  return (
    <PrismToggleGroup
      aria-label="Filtrar sugestões"
      className="min-w-0 flex-1"
      disallowEmptySelection
      onSelectionChange={(keys) =>
        onChange(FILTERS.find((key) => keys.has(key)) ?? "all")
      }
      selectedKeys={[filter]}
      selectionMode="single"
      size="sm"
      variant="ghost"
    >
      {FILTERS.filter((key) => key === "all" || counts[key] > 0).map((key) => (
        <PrismToggleGroupItem className="shrink" id={key} key={key}>
          <span className="truncate">
            {FILTER_LABELS[key]} {counts[key]}
          </span>
        </PrismToggleGroupItem>
      ))}
    </PrismToggleGroup>
  );
}

const STATUS_LABELS = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Descartada",
} satisfies Record<PlanSuggestionStatus, string>;

interface PlanningSuggestionsListProps {
  filter: SuggestionFilter;
  suggestions: PlanSuggestion[];
  onEditSuggestion: (suggestion: PlanSuggestion) => void;
  onChangeStatus: (id: string, status: PlanSuggestionStatus) => void;
  onApproveAllPending: () => void;
  onRelease: (suggestionId: string) => void;
  isSaving: boolean;
  isFinalizing: boolean;
}

export function PlanningSuggestionsList({
  filter,
  suggestions,
  onEditSuggestion,
  onChangeStatus,
  onApproveAllPending,
  onRelease,
  isSaving,
  isFinalizing,
}: PlanningSuggestionsListProps) {
  const isFinalized = isSuggestionFinalized;
  const pendingCount = countSuggestions(suggestions).pending;
  const visibleSuggestions = suggestions.filter((suggestion) => {
    if (filter === "all") return true;
    if (filter === "finalized") return isFinalized(suggestion);
    return !isFinalized(suggestion) && suggestion.status === filter;
  });
  const isBusy = isSaving || isFinalizing;

  return (
    <div className="flex flex-col">
      {filter === "pending" && pendingCount > 0 && (
        <div className="flex px-6 pt-3">
          <PrismButton
            className="min-w-0 shrink"
            isDisabled={isBusy}
            onPress={onApproveAllPending}
            size="sm"
            variant="outline"
          >
            <span className="truncate">Aprovar todas as pendentes</span>
            <CheckIcon data-icon="inline-end" />
          </PrismButton>
        </div>
      )}

      {visibleSuggestions.length === 0 ? (
        <p className="px-6 py-4 text-base text-secondary-foreground">
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
                <div className="flex flex-wrap items-center gap-2 text-sm text-secondary-foreground">
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
                <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                {suggestion.objective && (
                  <p className="text-base text-secondary-foreground">
                    {suggestion.objective}
                  </p>
                )}
                {suggestion.briefing && (
                  <p className="text-base whitespace-pre-line">
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
                          <PrismDialogDescription className="text-base">
                            {suggestion.title}
                          </PrismDialogDescription>
                        </PrismDialogHeader>
                        <PrismDialogBody className="text-base">
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
                  <p className="text-sm text-secondary-foreground">
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
