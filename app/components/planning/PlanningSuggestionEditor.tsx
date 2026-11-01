import { useState } from "react";
import {
  PrismButton,
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
    <EditorModalContent
      onClose={onClose}
      onSave={onSave}
      suggestion={suggestion}
    />
  );
}

function EditorModalContent({
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

  const handleSave = () => {
    onSave(suggestion.id, {
      title: title.trim() || suggestion.title,
      format,
      scheduled_date: date || undefined,
      objective: objective.trim(),
      briefing: briefing.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        aria-modal="true"
        className="w-full max-w-xl rounded-xl border border-border bg-background p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Editar sugestão de conteúdo
          </h2>
          <PrismButton onClick={onClose} size="sm" variant="ghost">
            ✕
          </PrismButton>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1.5">
            <PrismLabel htmlFor="edit-title">Título</PrismLabel>
            <PrismInput
              id="edit-title"
              onChange={(e) => setTitle(e.target.value)}
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

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <PrismButton onClick={onClose} variant="outline">
            Cancelar
          </PrismButton>
          <PrismButton onClick={handleSave} variant="default">
            Salvar alterações
          </PrismButton>
        </div>
      </div>
    </div>
  );
}
