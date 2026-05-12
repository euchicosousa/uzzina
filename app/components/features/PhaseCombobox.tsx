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
import { PHASES, CATEGORY_PHASES, type CATEGORY } from "~/lib/CONSTANTS";
import { PhaseIcon } from "./PhaseIcon";

const ALL_PHASE = {
  slug: "all",
  title: "Todas as fases",
  color: "#888",
  foreground: "#fff",
};

export function PhaseCombobox({
  selectedPhase,
  selectedPhases = [],
  category,
  onSelect,
  isMulti = false,
  tabIndex,
  showText = true,
  className,
  iconVariant = "progress",
}: {
  selectedPhase?: string;
  selectedPhases?: string[];
  category?: CATEGORY;
  onSelect?: (args: any) => void;
  isMulti?: boolean;
  tabIndex?: number;
  showText?: boolean;
  className?: string;
  iconVariant?: "progress" | "icon";
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

  // Filtra as fases disponíveis para a categoria, ou mostra todas se não houver categoria
  const PHASES_LIST = Object.values(PHASES);
  const availableSlugs = category ? CATEGORY_PHASES[category] : undefined;
  
  const filteredPhases = availableSlugs 
    ? PHASES_LIST.filter(p => availableSlugs.includes(p.slug as any))
    : PHASES_LIST;

  const phasesList = isMulti ? [ALL_PHASE, ...filteredPhases] : filteredPhases;

  // Determinar a(s) fase(s) atual(is) para o trigger
  let currentPhases = phasesList.filter((phase) =>
    isMulti
      ? selectedPhases.includes(phase.slug)
      : selectedPhase === phase.slug,
  );

  // Fallback se não encontrar nada (ex: estado inicial)
  if (currentPhases.length === 0 && !isMulti) {
    currentPhases = [filteredPhases[0] || PHASES_LIST[0]];
  }

  const hasRealSelection =
    isMulti && currentPhases.filter((s) => s.slug !== "all").length > 0;

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
                ? "Filtrar por fase"
                : currentPhases.map((s) => s.title).join(" • ")
            }
          >
            {!hasRealSelection ? (
              <FilterIcon />
            ) : (
              <div className="flex -space-x-2">
                {currentPhases.map((s) => (
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
              <PhaseIcon phase={currentPhases[0] as any} size="md" variant={iconVariant} />
            ) : (
              <>
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: currentPhases[0]?.color }}
                />
                {currentPhases[0]?.title}
              </>
            )}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-56" align="start">
        <Command>
          <CommandInput placeholder="Procurar fase..." />
          <CommandEmpty>Nenhuma fase encontrada.</CommandEmpty>
          <CommandList className="p-1 outline-none">
            {phasesList.map((phase) => (
              <Fragment key={phase.slug}>
                <CommandItem
                  className={cn("flex items-center gap-2")}
                  onSelect={() => {
                    if (isMulti) {
                      let newPhases: string[];

                      if (phase.slug === "all") {
                        newPhases = ["all"];
                      } else if (isShiftPressedRef.current) {
                        newPhases = [phase.slug];
                      } else {
                        newPhases = selectedPhases.filter(
                          (slug) => slug !== "all",
                        );
                        if (newPhases.includes(phase.slug)) {
                          newPhases = newPhases.filter(
                            (slug) => slug !== phase.slug,
                          );
                        } else {
                          newPhases = [...newPhases, phase.slug];
                        }
                        newPhases =
                          newPhases.length === 0 ? ["all"] : newPhases;
                      }

                      onSelect?.({
                        phases: newPhases,
                        phase: phase.slug,
                      });
                    } else {
                      onSelect?.(phase.slug);
                      setIsOpen(false);
                    }
                  }}
                >
                  <PhaseIcon phase={phase as any} size="xs" variant={iconVariant} />
                  <span className="truncate">{phase.title}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      isMulti
                        ? selectedPhases.includes(phase.slug)
                          ? "visible"
                          : "invisible"
                        : selectedPhase === phase.slug
                          ? "visible"
                          : "invisible",
                    )}
                  />
                </CommandItem>
                {phase.slug === "all" && <CommandSeparator className="my-1" />}
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
