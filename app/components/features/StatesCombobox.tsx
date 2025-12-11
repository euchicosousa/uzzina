import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { useMatches } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { UBadge } from "../uzzina/UBadge";
import { STATES, type STATE } from "~/lib/CONSTANTS";

export const StatesCombobox = ({
  selectedState,
  onSelect,
}: {
  selectedState: string;
  onSelect?: (state: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  let currentState = STATES[selectedState as STATE];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="hover:bg-secondary flex items-center gap-2 p-6 text-sm outline-none">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: currentState.color }}
          ></div>
          {currentState.title}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Procurar estado..." />
          <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
          <CommandList className="p-2 outline-none">
            {Object.values(STATES).map((state) => (
              <CommandItem
                key={state.slug}
                className={cn("flex items-center gap-2")}
                onSelect={() => {
                  onSelect?.(state.slug);
                  setOpen(false);
                }}
              >
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: state.color }}
                ></div>
                {state.title}
                <CheckIcon
                  className={cn(
                    "ml-auto size-4",
                    selectedState === state.slug ? "visible" : "invisible",
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
