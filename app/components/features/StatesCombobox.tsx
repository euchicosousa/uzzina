import { Fragment, useEffect, useRef, useState } from "react";
import { CheckIcon, FilterIcon } from "lucide-react";
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
  CommandSeparator,
} from "../ui/command";
import { STATES, type STATE } from "~/lib/CONSTANTS";
import { StateIcon } from "./StateIcon";

const ALL_STATE = {
  slug: "all",
  title: "Todos os estados",
  color: "#888",
  foreground: "#fff",
};

export function StatesCombobox({
  selectedState,
  selectedStates = [],
  onSelect,
  isMulti = false,
  tabIndex,
  showText = true,
  className,
}: {
  selectedState?: string;
  selectedStates?: string[];
  onSelect?: (args: any) => void;
  isMulti?: boolean;
  tabIndex?: number;
  showText?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isShiftPressedRef = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const STATES_LIST = Object.values(STATES);
  const statesList = isMulti ? [ALL_STATE, ...STATES_LIST] : STATES_LIST;

  // Determinar o(s) estado(s) atual(is) para o trigger
  let currentStates = statesList.filter((state) =>
    isMulti
      ? selectedStates.includes(state.slug)
      : selectedState === state.slug,
  );

  // Fallback se não encontrar nada (ex: estado inicial)
  if (currentStates.length === 0 && !isMulti) {
    currentStates = [STATES_LIST[0]];
  }

  const hasRealSelection =
    isMulti && currentStates.filter((s) => s.slug !== "all").length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {isMulti ? (
          <Button
            tabIndex={tabIndex}
            variant={hasRealSelection ? "secondary" : "ghost"}
            className={cn("flex gap-px", className)}
            title={
              !hasRealSelection
                ? "Filtrar por estado"
                : currentStates.map((s) => s.title).join(" • ")
            }
          >
            {!hasRealSelection ? (
              <FilterIcon />
            ) : (
              <div className="flex -space-x-2">
                {currentStates.map((s) => (
                  <div
                    key={s.slug}
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: s.color }}
                  />
                ))}
              </div>
            )}
          </Button>
        ) : (
          <button
            tabIndex={tabIndex}
            className={cn(
              "hover:bg-secondary focus:bg-secondary/50 flex items-center gap-2 p-6 text-sm outline-none",
              className,
            )}
          >
            {!showText ? (
              <StateIcon state={currentStates[0] as any} size="md" />
            ) : (
              <>
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: currentStates[0]?.color }}
                />
                {currentStates[0]?.title}
              </>
            )}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Procurar estado..." />
          <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
          <CommandList className="p-1 outline-none">
            {statesList.map((state) => (
              <Fragment key={state.slug}>
                <CommandItem
                  className={cn("flex items-center gap-2")}
                  onSelect={() => {
                    if (isMulti) {
                      let newStates: string[];

                      if (state.slug === "all") {
                        newStates = ["all"];
                      } else if (isShiftPressedRef.current) {
                        newStates = [state.slug];
                      } else {
                        newStates = selectedStates.filter(
                          (slug) => slug !== "all",
                        );
                        if (newStates.includes(state.slug)) {
                          newStates = newStates.filter(
                            (slug) => slug !== state.slug,
                          );
                        } else {
                          newStates = [...newStates, state.slug];
                        }
                        newStates =
                          newStates.length === 0 ? ["all"] : newStates;
                      }

                      onSelect?.({
                        states: newStates,
                        state: state.slug,
                      });
                    } else {
                      onSelect?.(state.slug);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: state.color }}
                  />
                  {state.title}
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      isMulti
                        ? selectedStates.includes(state.slug)
                          ? "visible"
                          : "invisible"
                        : selectedState === state.slug
                          ? "visible"
                          : "invisible",
                    )}
                  />
                </CommandItem>
                {state.slug === "all" && <CommandSeparator className="my-1" />}
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
