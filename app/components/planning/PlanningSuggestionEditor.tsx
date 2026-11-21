import { SaveIcon } from "lucide-react";
import { useState } from "react";
import {
  PrismButton,
  PrismDialog,
  PrismDialogBody,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismInput,
  PrismLabel,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismTextarea,
} from "~/components/prism";
import type { PlanFormat, PlanSuggestion } from "~/lib/social-planning/types";
import { PLANNING_FORMAT_LABELS } from "./PlanningPreview";

export type SavePlanningSuggestion = (
  id: string,
  patch: Partial<PlanSuggestion>,
) => Promise<string | null>;

interface PlanningSuggestionEditorProps {
  suggestion: PlanSuggestion;
  onClose: () => void;
  onSave: SavePlanningSuggestion;
}

export function PlanningSuggestionEditor({
  suggestion,
  onClose,
  onSave,
}: PlanningSuggestionEditorProps) {
  const [title, setTitle] = useState(suggestion.title);
  const [format, setFormat] = useState<PlanFormat>(suggestion.format);
  const [date, setDate] = useState(suggestion.scheduled_date ?? "");
  const [objective, setObjective] = useState(suggestion.objective ?? "");
  const [briefing, setBriefing] = useState(suggestion.briefing ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("O título do conteúdo é obrigatório.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("A data prevista é obrigatória.");
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const saveError = await onSave(suggestion.id, {
        title: trimmedTitle,
        format,
        scheduled_date: date,
        objective: objective.trim(),
        briefing: briefing.trim(),
      });
      if (saveError) {
        setError(saveError);
      } else {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PrismDialog
      isDismissable={!isSaving}
      isKeyboardDismissDisabled={isSaving}
      isOpen
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
      size="lg"
    >
      <PrismDialogHeader>
        <PrismDialogTitle>Editar sugestão</PrismDialogTitle>
      </PrismDialogHeader>
      <form onSubmit={handleSave}>
        <PrismDialogBody>
          {error && (
            <p className="text-base text-error" role="alert">
              {error}
            </p>
          )}
          <fieldset className="grid gap-4" disabled={isSaving}>
            <div className="grid gap-1.5">
              <PrismLabel htmlFor="edit-title">Título</PrismLabel>
              <PrismInput
                autoFocus
                id="edit-title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <PrismLabel>Formato</PrismLabel>
                <PrismSelect
                  aria-label="Formato do conteúdo"
                  isDisabled={isSaving}
                  onSelectionChange={(key) => {
                    if (
                      key === "static" ||
                      key === "carousel" ||
                      key === "reels"
                    ) {
                      setFormat(key);
                    }
                  }}
                  selectedKey={format}
                >
                  <PrismSelectTrigger>
                    <PrismSelectValue />
                  </PrismSelectTrigger>
                  <PrismSelectContent>
                    <PrismSelectItem id="static">
                      {PLANNING_FORMAT_LABELS.static}
                    </PrismSelectItem>
                    <PrismSelectItem id="carousel">
                      {PLANNING_FORMAT_LABELS.carousel}
                    </PrismSelectItem>
                    <PrismSelectItem id="reels">
                      {PLANNING_FORMAT_LABELS.reels}
                    </PrismSelectItem>
                  </PrismSelectContent>
                </PrismSelect>
              </div>

              <div className="grid gap-1.5">
                <PrismLabel htmlFor="edit-date">Data prevista</PrismLabel>
                <PrismInput
                  id="edit-date"
                  required
                  onChange={(event) => setDate(event.target.value)}
                  type="date"
                  value={date}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <PrismLabel htmlFor="edit-objective">Objetivo</PrismLabel>
              <PrismInput
                id="edit-objective"
                onChange={(event) => setObjective(event.target.value)}
                value={objective}
              />
            </div>

            <div className="grid gap-1.5">
              <PrismLabel htmlFor="edit-briefing">Briefing</PrismLabel>
              <PrismTextarea
                className="min-h-24"
                id="edit-briefing"
                onChange={(event) => setBriefing(event.target.value)}
                value={briefing}
              />
            </div>
          </fieldset>
        </PrismDialogBody>
        <PrismDialogFooter>
          <PrismButton isDisabled={isSaving} onPress={onClose} variant="ghost">
            Cancelar
          </PrismButton>
          <PrismButton isDisabled={isSaving} type="submit">
            {isSaving ? "Salvando…" : "Salvar alterações"}
            <SaveIcon data-icon="inline-end" />
          </PrismButton>
        </PrismDialogFooter>
      </form>
    </PrismDialog>
  );
}
