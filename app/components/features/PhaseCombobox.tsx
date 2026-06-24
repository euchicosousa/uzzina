import { CheckIcon, FilterIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import type * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { PHASES, type PHASE_TYPE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
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
type PhaseItem = typeof ALL_PHASE | PHASE_TYPE;

const DEFAULT_SELECTED_PHASES: string[] = [];

function MultiPhaseTrigger({
  tabIndex,
  className,
  currentPhases,
  hasRealSelection,
  ref,
  ...props
}: {
  tabIndex?: number;
  className?: string;
  currentPhases: PhaseItem[];
  hasRealSelection: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        "raised grid size-9 place-content-center rounded-xl border-b border-b-transparent squircle hover:text-foreground/50",
        className,
      )}
      data-state={hasRealSelection && "on"}
      tabIndex={tabIndex}
      title={
        !hasRealSelection
          ? "Filtrar por fase"
          : currentPhases.map((s) => s.title).join(" • ")
      }
      type="button"
    >
      {!hasRealSelection ? (
        <FilterIcon className="size-4" />
      ) : (
        <div className="flex -space-x-2">
          {currentPhases.map((s) => (
            <div
              key={s.slug}
              className="size-4 rounded-full border"
              style={{
                backgroundColor: s.color,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

function SinglePhaseTrigger({
  tabIndex,
  className,
  size,
  showText,
  iconVariant,
  currentPhase,
  ref,
  ...props
}: {
  tabIndex?: number;
  className?: string;
  size?: "sm" | "lg";
  showText?: boolean;
  iconVariant?: "progress" | "icon";
  currentPhase: PhaseItem;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      {...props}
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
      tabIndex={tabIndex}
      type="button"
    >
      {!showText ? (
        <PhaseIcon
          phase={currentPhase as PHASE_TYPE}
          size="md"
          variant={iconVariant}
        />
      ) : (
        <>
          <div
            className="size-2 rounded-full"
            style={{
              backgroundColor: currentPhase?.color,
            }}
          />
          {currentPhase?.title}
        </>
      )}
    </button>
  );
}
export function PhaseCombobox({
  selectedPhase,
  selectedPhases = DEFAULT_SELECTED_PHASES,
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
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        {isMulti ? (
          <MultiPhaseTrigger
            className={className}
            currentPhases={currentPhases}
            hasRealSelection={hasRealSelection}
            tabIndex={tabIndex}
          />
        ) : (
          <SinglePhaseTrigger
            className={className}
            currentPhase={currentPhases[0]}
            iconVariant={iconVariant}
            showText={showText}
            size={size}
            tabIndex={tabIndex}
          />
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
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
