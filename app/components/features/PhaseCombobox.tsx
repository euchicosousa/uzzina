import { CheckIcon, FilterIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { PHASES, type PHASE_TYPE } from "~/lib/CONSTANTS";
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
  onSelect,
  isMulti = false,
  tabIndex,
  showText = true,
  className,
  iconVariant = "progress",
  size = "lg",
}: {
  selectedPhase?: string;
  selectedPhases?: string[];
  // biome-ignore lint/suspicious/noExplicitAny: onSelect callback handles polymorphic inputs (string slug or multi-select object payload) depending on isMulti
  onSelect?: (args: any) => void;
  isMulti?: boolean;
  tabIndex?: number;
  showText?: boolean;
  className?: string;
  iconVariant?: "progress" | "icon";
  size?: "sm" | "lg";
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

  const PHASES_LIST = Object.values(PHASES);
  const phasesList = isMulti ? [ALL_PHASE, ...PHASES_LIST] : PHASES_LIST;

  // Determinar a(s) fase(s) atual(is) para o trigger
  let currentPhases = phasesList.filter((phase) =>
    isMulti
      ? selectedPhases.includes(phase.slug)
      : selectedPhase === phase.slug,
  );

  // Fallback se não encontrar nada (ex: estado inicial)
  if (currentPhases.length === 0 && !isMulti) {
    currentPhases = [PHASES_LIST[0]];
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
              "flex items-center gap-1.5 transition-colors outline-none",
              size === "sm"
                ? cn(
                    "h-8 text-xs hover:bg-secondary",
                    !showText ? "w-8 justify-center p-0" : "justify-start px-3",
                  )
                : "p-6 text-sm hover:bg-secondary focus:bg-secondary/50",
              className,
            )}
          >
            {!showText ? (
              <PhaseIcon
                phase={currentPhases[0] as PHASE_TYPE}
                size="md"
                variant={iconVariant}
              />
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
      <PopoverContent className="w-56 p-0" align="start">
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
                  <PhaseIcon phase={phase as PHASE_TYPE} variant={"icon"} />
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
