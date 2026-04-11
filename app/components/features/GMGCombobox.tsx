import { useState } from "react";
import { GENESIS, GOALS, MISSIONS } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { CheckIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function GMGCombobox({
  className,
  selected,
  gmg,
  onSelect,
}: {
  className?: string;
  selected?: string;
  gmg: "origem" | "funil" | "objetivo";
  onSelect?: (value: string | undefined) => void;
}) {
  const items = {
    origem: Object.values(GENESIS),
    funil: Object.values(MISSIONS),
    objetivo: Object.values(GOALS),
  }[gmg];

  const [selectedItem, setSelectedItem] = useState(selected);

  const [isOpen, setIsOpen] = useState(false);

  const currentItem = items.find((item) => item.slug === selectedItem);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 underline-offset-2 hover:underline",
            className,
          )}
        >
          {selectedItem ? (
            <span className="bg-secondary squircle rounded-xl px-3 py-2">
              {currentItem?.title}
            </span>
          ) : (
            <span className="opacity-50"> Selecione {gmg} </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Digite para pesquisar..." />
          <CommandList className="p-2">
            <CommandEmpty> Nenhum resultado encontrado. </CommandEmpty>
            {items.map((item, index) => (
              <CommandItem
                key={index}
                onSelect={() => {
                  setSelectedItem(item.slug);
                  onSelect?.(item.slug);
                  setIsOpen(false);
                }}
                className="flex justify-between"
              >
                {item.title}
                {selected === item.slug && <CheckIcon />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
