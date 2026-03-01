import { useState } from "react";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { STATES, type STATE } from "~/lib/CONSTANTS";
import { StateIcon } from "./StateIcon";

export function StatesCombobox({
  selectedState,
  onSelect,
  tabIndex,
  showText = true,
}: {
  selectedState: string;
  onSelect?: (state: string) => void;
  tabIndex?: number;
  showText?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  let currentState = STATES[selectedState as STATE];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          tabIndex={tabIndex}
          className="hover:bg-secondary focus:bg-secondary/50 flex items-center gap-2 p-6 text-sm outline-none"
        >
          {!showText ? (
            <StateIcon state={currentState} />
          ) : (
            <>
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: currentState.color }}
              ></div>
              {currentState.title}
            </>
          )}
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
                  setIsOpen(false);
                }}
              >
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: state.color }}
                ></div>
                {state.title}
                <Check
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
}
