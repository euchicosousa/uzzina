import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { GENESIS, GOALS, MISSIONS } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
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
}: {
  className?: string;
  selected?: string;
  gmg: "origem" | "funil" | "objetivo";
}) {
  const items = {
    origem: Object.values(GENESIS),
    funil: Object.values(MISSIONS),
    objetivo: Object.values(GOALS),
  }[gmg];

  const [selectedItem, setSelectedItem] = useState(selected);
  const [open, setOpen] = useState(false);

  const currentItem = items.find((item) => item.slug === selectedItem);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn("flex items-center gap-2", className)}>
          {selectedItem ? currentItem?.title : `Selecione ${gmg}`}
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
                  setOpen(false);
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
