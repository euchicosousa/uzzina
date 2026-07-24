import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ULoader } from "~/components/uzzina/ULoader";
import { normalizeHexColor } from "~/lib/uzzina-utils";
import type { PartnerTopic } from "~/types";
interface PartnerTopicsEditorProps {
  topics: PartnerTopic[];
  brandColors: string[];
  isSaving?: boolean;
  onChange: (topics: PartnerTopic[]) => void;
}
export function PartnerTopicsEditor({
  topics,
  brandColors,
  isSaving = false,
  onChange,
}: PartnerTopicsEditorProps) {
  const [newTitle, setNewTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    brandColors[0] || "#3b82f6",
  );
  const handleColorChange = (raw: string) => {
    let formatted = raw.trim().replace(/^#+/, "");
    if (formatted) formatted = `#${formatted}`;
    setSelectedColor(formatted);
  };
  const handleColorBlur = () => {
    let val = selectedColor.trim();
    if (!val || val === "#") val = "#000000";
    if (!val.startsWith("#")) val = `#${val}`;
    const hexRegex = /^#[0-9A-Fa-f]{3,6}$/;
    if (!hexRegex.test(val)) {
      val = "#000000";
    } else if (val.length !== 4 && val.length !== 7) {
      val = val.length < 7 ? val.padEnd(7, "0") : val.slice(0, 7);
    }
    setSelectedColor(val);
  };
  const handleAddTopic = () => {
    if (!newTitle.trim()) return;
    const newTopic: PartnerTopic = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      color: selectedColor,
    };
    const updated = [...topics, newTopic];
    onChange(updated);
    setNewTitle("");
  };
  const handleRemoveTopic = (id: string) => {
    const updated = topics.filter((t) => t.id !== id);
    onChange(updated);
  };
  return (
    <div className="grid gap-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          Tópicos de Assunto
        </h3>
        {isSaving && <ULoader />}
      </div>

      {topics.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center gap-1.5 rounded-full pl-3 pr-1 py-1 border text-sm font-medium transition hover:border-foreground/30"
              style={{
                borderColor: `${topic.color}40`,
                backgroundColor: `${topic.color}10`,
              }}
            >
              <div
                className="size-2 rounded-full shrink-0"
                style={{
                  backgroundColor: topic.color,
                }}
              />
              <span className="text-foreground">{topic.title}</span>
              <button
                className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                onClick={() => handleRemoveTopic(topic.id)}
                title="Remover Tópico"
                type="button"
              >
                <Trash2Icon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum tópico criado para este parceiro.
        </p>
      )}

      {/* Formulário Inline para Adicionar */}
      <div className="flex items-center gap-2 max-w-md pt-2">
        {/* Seletor de cor: igual ao ColorListEditor — círculo clicável + input hex */}
        <div className="flex items-center gap-2">
          <label
            className="relative cursor-pointer"
            title="Escolher cor do tópico"
          >
            <div
              className="size-6 rounded-full border"
              style={{
                backgroundColor: normalizeHexColor(selectedColor),
              }}
            />
            <input
              aria-label="Escolher cor visualmente"
              className="absolute inset-0 size-0 cursor-pointer p-0.5"
              onBlur={handleColorBlur}
              onChange={(e) => setSelectedColor(e.target.value)}
              type="color"
              value={normalizeHexColor(selectedColor)}
            />
          </label>
          <Input
            aria-label="Código Hexadecimal da Cor do Tópico"
            className="w-24 font-mono uppercase"
            maxLength={9}
            onBlur={handleColorBlur}
            onChange={(e) => handleColorChange(e.target.value)}
            type="text"
            value={selectedColor}
            variant="inset"
          />
        </div>

        <Input
          className="flex-1"
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTopic();
            }
          }}
          placeholder="Nome do novo tópico..."
          value={newTitle}
          variant="inset"
        />

        <Button
          className="rounded-xl px-3"
          disabled={!newTitle.trim()}
          onClick={handleAddTopic}
          size="sm"
          type="button"
        >
          <PlusIcon className="size-4 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
