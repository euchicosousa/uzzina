import { CheckCircle2Icon } from "lucide-react";
import {
  PrismButton,
  PrismDialog,
  PrismDialogBody,
  PrismDialogClose,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismDialogTrigger,
} from "~/components/prism";
import { plannedActionTimeLabel } from "~/lib/social-planning/dates";
import type { PlanSuggestion } from "~/lib/social-planning/types";
import { PLANNING_FORMAT_LABELS } from "./PlanningPreview";

interface PlanningFinalizeDialogProps {
  suggestions: PlanSuggestion[];
  partnerTitle?: string;
  isDisabled: boolean;
  isFinalizing: boolean;
  onConfirm: () => void;
}

/**
 * Confirmation step before Finalizar: shows what will be created and when, and
 * sends nothing until the person confirms. Suggestions that already became an
 * action are not part of it.
 */
export function PlanningFinalizeDialog({
  suggestions,
  partnerTitle,
  isDisabled,
  isFinalizing,
  onConfirm,
}: PlanningFinalizeDialogProps) {
  const toCreate = suggestions.filter(
    (suggestion) =>
      suggestion.status === "approved" && !suggestion.created_action_id,
  );
  const pending = suggestions.filter(
    (suggestion) =>
      suggestion.status === "pending" && !suggestion.created_action_id,
  ).length;
  const rejected = suggestions.filter(
    (suggestion) => suggestion.status === "rejected",
  ).length;
  const undated = toCreate.filter((suggestion) => !suggestion.scheduled_date);
  const count = toCreate.length;

  return (
    <PrismDialogTrigger>
      <PrismButton
        className="min-w-0 shrink"
        isDisabled={isDisabled}
        size="sm"
        variant="success"
      >
        <span className="truncate">
          {isFinalizing
            ? "Criando ações…"
            : `Finalizar ${count} ${count === 1 ? "ação" : "ações"}`}
        </span>
        <CheckCircle2Icon data-icon="inline-end" />
      </PrismButton>
      <PrismDialog className="flex flex-col overflow-hidden">
        <PrismDialogHeader className="shrink-0">
          <PrismDialogTitle>
            Criar {count} {count === 1 ? "ação" : "ações"}?
          </PrismDialogTitle>
          <PrismDialogDescription className="text-base">
            {partnerTitle ? `${partnerTitle} · ` : ""}
            na fase Fazer, com você como responsável.
          </PrismDialogDescription>
        </PrismDialogHeader>
        <PrismDialogBody className="min-h-0 gap-3 overflow-auto text-base [&>*]:shrink-0">
          <ul className="grid gap-2">
            {toCreate.map((suggestion) => (
              <li className="grid" key={suggestion.id}>
                <span className="font-medium">{suggestion.title}</span>
                <span className="text-sm text-secondary-foreground">
                  {PLANNING_FORMAT_LABELS[suggestion.format]} ·{" "}
                  {suggestion.scheduled_date
                    ? plannedActionTimeLabel(suggestion.scheduled_date)
                    : "sem data"}
                </span>
              </li>
            ))}
          </ul>
          {undated.length > 0 && (
            <p className="text-error" role="alert">
              {undated.length === 1
                ? "Uma sugestão aprovada está sem data."
                : `${undated.length} sugestões aprovadas estão sem data.`}{" "}
              Defina a data na edição antes de finalizar.
            </p>
          )}
          <p className="text-sm text-secondary-foreground">
            {pending > 0
              ? `${pending} ${pending === 1 ? "pendente continua" : "pendentes continuam"} na proposta. `
              : ""}
            {rejected > 0
              ? `${rejected} ${rejected === 1 ? "descartada não vira" : "descartadas não viram"} ação.`
              : ""}
          </p>
        </PrismDialogBody>
        <PrismDialogFooter className="shrink-0">
          <PrismDialogClose>Cancelar</PrismDialogClose>
          <PrismDialogClose
            isDisabled={undated.length > 0 || count === 0}
            onPress={onConfirm}
            variant="success"
          >
            Criar {count} {count === 1 ? "ação" : "ações"}
          </PrismDialogClose>
        </PrismDialogFooter>
      </PrismDialog>
    </PrismDialogTrigger>
  );
}
