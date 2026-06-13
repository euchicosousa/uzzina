import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { SendIcon } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "~/components/ui/popover";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { cn } from "~/lib/utils";

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
  submitLabel?: string;
  onCancel?: () => void;
}

export function CommentInput({
  value,
  onChange,
  onSend,
  isSubmitting,
  mentionablePeople = [],
  submitLabel,
  onCancel,
}: CommentInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  // Filtragem local das pessoas baseada no termo digitado após o @
  const filteredPeople = useMemo(() => {
    return mentionablePeople.filter((person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [mentionablePeople, searchTerm]);

  // Use refs to avoid stale closures in Tiptap's event handlers
  const suggestionsOpenRef = useRef(suggestionsOpen);
  suggestionsOpenRef.current = suggestionsOpen;

  const filteredPeopleRef = useRef(filteredPeople);
  filteredPeopleRef.current = filteredPeople;

  const activeSuggestionIndexRef = useRef(activeSuggestionIndex);
  activeSuggestionIndexRef.current = activeSuggestionIndex;

  const handleSelectPersonRef = useRef<(person: Person) => void>(() => {});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        blockquote: false,
      }),
      Placeholder.configure({
        placeholder: "Escreva uma observação (use @ para mencionar)...",
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] w-full rounded-xl border bg-muted/50 px-4 py-3 text-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:outline-none outline-none max-w-none prose dark:prose-invert",
      },
      handleKeyDown: (_view, event) => {
        const isOpen = suggestionsOpenRef.current;
        const people = filteredPeopleRef.current;
        const activeIndex = activeSuggestionIndexRef.current;

        if (isOpen && people.length > 0) {
          if (event.key === "ArrowDown") {
            setActiveSuggestionIndex((prev) => (prev + 1) % people.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            setActiveSuggestionIndex(
              (prev) => (prev - 1 + people.length) % people.length,
            );
            return true;
          }
          if (event.key === "Enter") {
            const activePerson = people[activeIndex];
            if (activePerson) {
              handleSelectPersonRef.current(activePerson);
            }
            return true;
          }
          if (event.key === "Escape") {
            setSuggestionsOpen(false);
            return true;
          }
        }

        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          handleSend();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Detecta @ para abrir o dropdown de sugestões
      const { selection } = editor.state;
      const { $from } = selection;
      const textBefore = $from.parent.textBetween(
        Math.max(0, $from.parentOffset - 20),
        $from.parentOffset,
        null,
        "\n",
      );
      const lastWord = textBefore.split(/[\s\n]+/).pop() || "";

      if (lastWord.startsWith("@")) {
        const term = lastWord.substring(1);
        setSearchTerm(term);
        setSuggestionsOpen(true);
        setActiveSuggestionIndex(0);
      } else {
        setSuggestionsOpen(false);
      }
    },
  });

  // Limpa o editor se o valor externo for redefinido para vazio
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      if (value === "") {
        editor.commands.setContent("");
      }
    }
  }, [value, editor]);

  const handleSelectPerson = (person: Person) => {
    if (!editor) return;

    const caretPos = editor.state.selection.$from.pos;
    const wordLength = searchTerm.length + 1; // +1 para o '@'
    const fromPos = caretPos - wordLength;

    editor
      .chain()
      .focus()
      .deleteRange({ from: fromPos, to: caretPos })
      .insertContent([
        {
          type: "mention",
          attrs: {
            id: person.user_id,
            label: person.name,
          },
        },
        {
          type: "text",
          text: " ",
        },
      ])
      .run();

    setSuggestionsOpen(false);
    setSearchTerm("");
  };

  handleSelectPersonRef.current = handleSelectPerson;

  const handleSend = () => {
    if (!editor || editor.isEmpty) return;
    const htmlContent = editor.getHTML();

    const mentions: string[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "mention") {
        mentions.push(node.attrs.id);
      }
    });

    onSend(htmlContent, mentions);
  };

  return (
    <div className="relative flex flex-col gap-2">
      <Popover
        open={suggestionsOpen && filteredPeople.length > 0}
        onOpenChange={setSuggestionsOpen}
      >
        <PopoverAnchor asChild>
          <div>
            <EditorContent editor={editor} />
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[200px] p-1"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()} // evita roubar o foco do editor
        >
          <Command>
            <CommandList className="max-h-[200px]">
              <CommandEmpty>Nenhum membro encontrado</CommandEmpty>
              {filteredPeople.map((person: Person, index: number) => (
                <CommandItem
                  key={person.user_id}
                  value={person.name}
                  onSelect={() => handleSelectPerson(person)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-2 py-1",
                    index === activeSuggestionIndex &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  <UAvatar
                    fallback={person.name}
                    image={person.image}
                    size="sm"
                  />
                  <span className="text-xs font-medium text-foreground">
                    {person.name}
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          Cmd + Enter para {submitLabel === "Salvar" ? "salvar" : "enviar"}
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl px-4 text-xs"
              onClick={onCancel}
              type="button"
            >
              Cancelar
            </Button>
          )}
          <Button
            size="sm"
            className="squircle h-9 rounded-xl px-4 text-xs"
            disabled={isSubmitting || !editor || editor.isEmpty}
            onClick={handleSend}
          >
            {submitLabel !== "Salvar" && <SendIcon className="mr-2 size-3.5" />}
            {submitLabel || "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
