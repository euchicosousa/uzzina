import { CheckIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import {
  PrismButton,
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismPopover,
  PrismPopoverTrigger,
  PrismTextarea,
} from "~/components/prism";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
interface Person {
  user_id: string;
  name: string;
  image: string | null;
}
interface CommentInputProps {
  value: string;
  onCancel?: () => void;
  onChange: (val: string) => void;
  onSend: (content: string, mentions: string[]) => void;
  isSubmitting?: boolean;
  mentionablePeople?: Person[];
  submitLabel?: string;
}
const DEFAULT_MENTIONABLE_PEOPLE: Person[] = [];
export function CommentInput({
  value,
  onChange,
  onSend,
  isSubmitting,
  mentionablePeople = DEFAULT_MENTIONABLE_PEOPLE,
  submitLabel,
  onCancel,
}: CommentInputProps) {
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value, selectedMentions);
    setSelectedMentions([]);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };
  const toggleMention = (userId: string) => {
    setSelectedMentions((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };
  const selectedPeople = mentionablePeople.filter((p) =>
    selectedMentions.includes(p.user_id),
  );
  return (
    <div className="relative flex flex-col gap-2 bg-input dark:bg-input/30 p-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
      <PrismTextarea
        className="min-h-20 w-full p-4 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escreva uma observação..."
        value={value}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 p-2">
        {/* Seletor de Notificação */}
        <div className="flex items-center gap-2">
          <PrismPopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <PrismButton size="sm" variant="ghost">
              {/* Avatares das pessoas selecionadas */}
              {selectedPeople.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <UAvatarGroup
                    avatars={selectedPeople.map((p) => ({
                      image: p.image,
                      id: p.user_id,
                      fallback: p.name.substring(0, 2).toUpperCase(),
                    }))}
                    size={SIZE.sm}
                  />
                </div>
              ) : (
                <span>Responsáveis</span>
              )}
            </PrismButton>
            <PrismPopover className="w-60 p-0" placement="bottom start">
              <PrismCommand>
                <PrismCommandInput placeholder="Procurar membro..." />
                <PrismCommandList
                  className="max-h-50"
                  renderEmptyState={() => (
                    <PrismCommandEmpty className="py-3 text-center text-xs">
                      Nenhum membro encontrado.
                    </PrismCommandEmpty>
                  )}
                >
                  {mentionablePeople.map((person) => {
                    const isSelected = selectedMentions.includes(
                      person.user_id,
                    );
                    return (
                      <PrismCommandItem
                        key={person.user_id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted"
                        isSelected={isSelected}
                        onAction={() => toggleMention(person.user_id)}
                      >
                        <UAvatar
                          fallback={person.name}
                          image={person.image}
                          size="sm"
                        />
                        <span className="flex-1 truncate font-medium text-foreground">
                          {person.name}
                        </span>
                        <CheckIcon
                          className={cn(
                            "ml-auto size-3.5 text-primary",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </PrismCommandItem>
                    );
                  })}
                </PrismCommandList>
              </PrismCommand>
            </PrismPopover>
          </PrismPopoverTrigger>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden text-[10px] font-medium tracking-wider text-muted-foreground uppercase sm:inline">
            Cmd + Enter para {submitLabel === "Salvar" ? "salvar" : "enviar"}
          </span>
          {onCancel && (
            <PrismButton
              className="h-8 rounded-lg px-3 text-xs"
              onClick={onCancel}
              variant="ghost"
            >
              Cancelar
            </PrismButton>
          )}
          <PrismButton
            className="h-8 rounded-lg px-3 text-xs"
            isDisabled={isSubmitting || !value.trim()}
            onClick={handleSend}
          >
            <SendIcon className="mr-1.5 size-3.5" />
            {submitLabel || "Enviar"}
          </PrismButton>
        </div>
      </div>
    </div>
  );
}
