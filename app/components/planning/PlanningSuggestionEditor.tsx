import { useEffect, useState } from "react";
import {
  PrismButton,
  PrismDialog,
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

interface PlanningSuggestionEditorProps {
  suggestion: PlanSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, patch: Partial<PlanSuggestion>) => void;
}

export function PlanningSuggestionEditor({
  suggestion,
  isOpen,
  onClose,
  onSave,
}: PlanningSuggestionEditorProps) {
  if (!isOpen || !suggestion) return null;

  return (
    <EditorDialogContent
      key={suggestion.id}
      onClose={onClose}
      onSave={onSave}
      suggestion={suggestion}
    />
  );
}

function EditorDialogContent({
  suggestion,
  onClose,
  onSave,
}: {
  suggestion: PlanSuggestion;
  onClose: () => void;
  onSave: (id: string, patch: Partial<PlanSuggestion>) => void;
}) {
  const [title, setTitle] = useState(suggestion.title);
  const [format, setFormat] = useState<PlanFormat>(suggestion.format);
  const [date, setDate] = useState(suggestion.scheduled_date || "");
  const [objective, setObjective] = useState(suggestion.objective || "");
  const [briefing, setBriefing] = useState(suggestion.briefing || "");
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever suggestion changes
  useEffect(() => {
    setTitle(suggestion.title);
    setFormat(suggestion.format);
    setDate(suggestion.scheduled_date || "");
    setObjective(suggestion.objective || "");
    setBriefing(suggestion.briefing || "");
    setError(null);
  }, [suggestion]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("O título do conteúdo é obrigatório.");
      return;
    }

    onSave(suggestion.id, {
      title: trimmedTitle,
      format,
      scheduled_date: date.trim() || undefined,
      objective: objective.trim(),
      briefing: briefing.trim(),
    });
    onClose();
  };

  return (
    <PrismDialog
      className="flex flex-col overflow-hidden"
      size="lg"
      isDismissable
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      showCloseButton={false}
    >
      <div className="flex min-h-0 flex-col">
        <PrismDialogHeader className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <PrismDialogTitle>Editar sugestão de conteúdo</PrismDialogTitle>
          <PrismButton
            aria-label="Fechar edição de sugestão"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            ✕
          </PrismButton>
        </PrismDialogHeader>

        <div className="grid gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-md bg-error-background p-2.5 text-xs font-medium text-error squircle">
              {error}
            </p>
          )}

          <div className="grid gap-1.5">
            <PrismLabel htmlFor="edit-title">Título</PrismLabel>
            <PrismInput
              autoFocus
              id="edit-title"
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              value={title}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <PrismLabel htmlFor="edit-format">Formato</PrismLabel>
              <PrismSelect
                aria-label="Formato do conteúdo"
                onSelectionChange={(key) => setFormat(key as PlanFormat)}
                selectedKey={format}
              >
                <PrismSelectTrigger id="edit-format">
                  <PrismSelectValue />
                </PrismSelectTrigger>
                <PrismSelectContent>
                  <PrismSelectItem id="reels">Reels</PrismSelectItem>
                  <PrismSelectItem id="carousel">Carrossel</PrismSelectItem>
                  <PrismSelectItem id="static">Estático</PrismSelectItem>
                </PrismSelectContent>
              </PrismSelect>
            </div>

            <div className="grid gap-1.5">
              <PrismLabel htmlFor="edit-date">Data prevista</PrismLabel>
              <PrismInput
                id="edit-date"
                onChange={(e) => setDate(e.target.value)}
                type="date"
                value={date}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <PrismLabel htmlFor="edit-objective">
              Objetivo / Racional
            </PrismLabel>
            <PrismInput
              id="edit-objective"
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ex: Topo de funil, autoridade, conversão..."
              value={objective}
            />
          </div>

          <div className="grid gap-1.5">
            <PrismLabel htmlFor="edit-briefing">
              Direcionamento / Briefing
            </PrismLabel>
            <PrismTextarea
              className="min-h-24"
              id="edit-briefing"
              onChange={(e) => setBriefing(e.target.value)}
              placeholder="Orientações de roteiro, mensagem principal ou gancho"
              value={briefing}
            />
          </div>
        </div>

        <PrismDialogFooter className="border-t px-6 py-4">
          <PrismButton onClick={onClose} variant="outline">
            Cancelar
          </PrismButton>
          <PrismButton onClick={handleSave} variant="default">
            Salvar alterações
          </PrismButton>
        </PrismDialogFooter>
      </div>
    </PrismDialog>
  );
}
