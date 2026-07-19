import { useState } from "react";
import { PlusIcon, Trash2Icon, TagIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ULoader } from "~/components/uzzina/ULoader";
import { PartnerColorPicker } from "~/components/features/ActionForm/PartnerColorPicker";
import { getGridCols } from "~/lib/uzzina-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <TagIcon className="size-4 opacity-75" />
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
                style={{ backgroundColor: topic.color }}
              />
              <span className="text-foreground">{topic.title}</span>
              <button
                type="button"
                onClick={() => handleRemoveTopic(topic.id)}
                className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                title="Remover Tópico"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="size-9 rounded-xl border flex items-center justify-center shrink-0 hover:bg-secondary transition focus:outline-none"
              title="Escolher cor do tópico"
            >
              <div
                className="size-5 rounded-full border border-black/5"
                style={{ backgroundColor: selectedColor }}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 p-2" align="start">
            <PartnerColorPicker
              colors={brandColors}
              onChange={setSelectedColor}
              value={selectedColor}
              className={getGridCols(brandColors.length)}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="Nome do novo tópico..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTopic();
            }
          }}
          className="flex-1"
          variant="inset"
        />

        <Button
          type="button"
          onClick={handleAddTopic}
          disabled={!newTitle.trim()}
          size="sm"
          className="rounded-xl px-3"
        >
          <PlusIcon className="size-4 mr-1" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
