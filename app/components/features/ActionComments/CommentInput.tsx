import { CheckIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
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
    <div className="relative flex flex-col gap-2 rounded-xl border bg-input p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
      <Textarea
        className="min-h-[80px] w-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escreva uma observação..."
        value={value}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-2">
        {/* Seletor de Notificação */}
        <div className="flex items-center gap-2">
          <Popover onOpenChange={setIsOpen} open={isOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost">
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
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[240px] p-0">
              <Command>
                <CommandInput
                  className="h-9 text-xs"
                  placeholder="Procurar membro..."
                />
                <CommandEmpty className="py-3 text-center text-xs">
                  Nenhum membro encontrado.
                </CommandEmpty>
                <CommandList className="max-h-[200px] p-1">
                  {mentionablePeople.map((person) => {
                    const isSelected = selectedMentions.includes(
                      person.user_id,
                    );
                    return (
                      <CommandItem
                        key={person.user_id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted"
                        onSelect={() => toggleMention(person.user_id)}
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
                      </CommandItem>
                    );
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden text-[10px] font-medium tracking-wider text-muted-foreground uppercase sm:inline">
            Cmd + Enter para {submitLabel === "Salvar" ? "salvar" : "enviar"}
          </span>
          {onCancel && (
            <Button
              className="h-8 rounded-lg px-3 text-xs"
              onClick={onCancel}
              size="sm"
              type="button"
              variant="ghost"
            >
              Cancelar
            </Button>
          )}
          <Button
            className="squircle h-8 rounded-lg px-3.5 text-xs font-semibold"
            disabled={isSubmitting || !value.trim()}
            onClick={handleSend}
            size="sm"
          >
            {submitLabel !== "Salvar" && (
              <SendIcon className="mr-1.5 size-3.5" />
            )}
            {submitLabel || "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
