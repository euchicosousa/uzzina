import { useRef, useState } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { UAvatar } from "~/components/uzzina/UAvatar";

interface Person {
  user_id: string;
  name: string;
  image: string | null;
}

interface CommentInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (content: string, mentions: string[]) => void;
  isSubmitting?: boolean;
  mentionablePeople?: Person[];
}

export function CommentInput({
  value,
  onChange,
  onSend,
  isSubmitting,
  mentionablePeople = [],
}: CommentInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const caretPos = e.target.selectionStart;
    const textBeforeCaret = val.substring(0, caretPos);
    const lastWord = textBeforeCaret.split(/[\s\n]+/).pop() || "";

    if (lastWord.startsWith("@")) {
      const term = lastWord.substring(1);
      setSearchTerm(term);
      setSuggestionsOpen(true);
      setMentionStartIndex(caretPos - lastWord.length);
    } else {
      setSuggestionsOpen(false);
    }
  };

  const handleSelectPerson = (person: Person) => {
    if (!textareaRef.current) return;

    const caretPos = textareaRef.current.selectionStart;
    const textBeforeMention = value.substring(0, mentionStartIndex);
    const textAfterMention = value.substring(caretPos);

    // Insere o @Nome e um espaço
    const mentionText = `@${person.name} `;
    const newValue = textBeforeMention + mentionText + textAfterMention;

    onChange(newValue);

    // Adiciona o ID às menções se já não estiver
    if (!selectedMentions.includes(person.user_id)) {
      setSelectedMentions([...selectedMentions, person.user_id]);
    }

    setSuggestionsOpen(false);
    setSearchTerm("");

    // Foca o textarea de volta e posiciona o cursor após a menção
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCaretPos = mentionStartIndex + mentionText.length;
        textareaRef.current.setSelectionRange(newCaretPos, newCaretPos);
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;

    // Filtra as menções para enviar apenas as pessoas que realmente continuam com o nome citado no texto
    const finalMentions = selectedMentions.filter((userId) => {
      const person = mentionablePeople.find((p) => p.user_id === userId);
      return person ? value.includes(`@${person.name}`) : false;
    });

    onSend(value, finalMentions);
    setSelectedMentions([]);
  };

  // Filtragem local das pessoas baseada no termo digitado após o @
  const filteredPeople = mentionablePeople.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2 relative">
      <Popover open={suggestionsOpen && filteredPeople.length > 0} onOpenChange={setSuggestionsOpen}>
        <PopoverAnchor asChild>
          <textarea
            ref={textareaRef}
            placeholder="Escreva uma observação (use @ para mencionar)..."
            className="min-h-[80px] w-full resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-[240px] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()} // evita roubar o foco do textarea
        >
          <Command>
            <CommandList className="max-h-[200px]">
              <CommandEmpty>Nenhum membro encontrado</CommandEmpty>
              {filteredPeople.map((person) => (
                <CommandItem
                  key={person.user_id}
                  value={person.name}
                  onSelect={() => handleSelectPerson(person)}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                >
                  <UAvatar
                    fallback={person.name}
                    image={person.image}
                    size="sm"
                  />
                  <span className="text-xs font-medium text-foreground">{person.name}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex items-center justify-between px-1">
        <span className="text-muted-foreground uppercase text-[10px] font-medium tracking-wider">
          Cmd + Enter para enviar
        </span>
        <Button
          size="sm"
          className="squircle h-9 rounded-xl px-4"
          disabled={!value.trim() || isSubmitting}
          onClick={handleSend}
        >
          <SendIcon className="mr-2 size-3.5" />
          Enviar
        </Button>
      </div>
    </div>
  );
}
