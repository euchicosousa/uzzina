import { FilterIcon } from "lucide-react";
import { useState } from "react";
import {
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { PHASES, type PHASE_TYPE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { ComboboxTrigger } from "./ComboboxTrigger";
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
  showText,
  ...props
}: {
  tabIndex?: number;
  className?: string;
  currentPhases: PhaseItem[];
  hasRealSelection: boolean;
  showText?: boolean;
}) {
  return (
    <ComboboxTrigger
      className={cn(className, "overflow-hidden")}
      hasSelection={hasRealSelection}
      tabIndex={tabIndex}
      title={
        !hasRealSelection
          ? "Filtrar por fase"
          : currentPhases.map((s) => s.title).join(", ")
      }
      variant="filter"
      {...props}
    >
      {!hasRealSelection ? (
        <>
          <FilterIcon className="size-4 shrink-0" />
          {showText && (
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              Fases
            </span>
          )}
        </>
      ) : (
        <>
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
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            {currentPhases.map((s) => s.title).join(", ")}
          </div>
        </>
      )}
    </ComboboxTrigger>
  );
}

function SinglePhaseTrigger({
  tabIndex,
  className,
  size,
  showText,
  iconVariant,
  currentPhase,
  ...props
}: {
  tabIndex?: number;
  className?: string;
  size?: "sm" | "lg";
  showText?: boolean;
  iconVariant?: "progress" | "icon";
  currentPhase: PhaseItem;
}) {
  return (
    <ComboboxTrigger
      className={className}
      size={size}
      tabIndex={tabIndex}
      variant="form-inline"
      {...props}
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
    </ComboboxTrigger>
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
  // biome-ignore lint/suspicious/noExplicitAny: polymorphic inputs onSelect
  onSelect?: (args: any) => void;
  isMulti?: boolean;
  tabIndex?: number;
  showText?: boolean;
  className?: string;
  iconVariant?: "progress" | "icon";
  size?: "sm" | "lg";
}) {
  const [isOpen, setIsOpen] = useState(false);
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
    <PrismPopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      {isMulti ? (
        <MultiPhaseTrigger
          className={className}
          currentPhases={currentPhases}
          hasRealSelection={hasRealSelection}
          showText
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
      <PrismPopover className="w-56 p-0 border rounded-3xl squircle shadow-xl bg-popover overflow-hidden">
        <PrismCommand className="p-0">
          <PrismCommandInput placeholder="Procurar fase..." />
          <PrismCommandList
            className="p-1 outline-none border-t"
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhuma fase encontrada.</PrismCommandEmpty>
            )}
          >
            {phasesList.map((phase) => (
              <PrismCommandItem
                key={phase.slug}
                className={cn("flex items-center gap-2 cursor-pointer")}
                isSelected={
                  isMulti
                    ? selectedPhases.includes(phase.slug)
                    : selectedPhase === phase.slug
                }
                onAction={() => {
                  if (isMulti) {
                    let newPhases: string[];
                    const isShiftPressed = (
                      window.event as MouseEvent | undefined
                    )?.shiftKey;
                    if (phase.slug === "all") {
                      newPhases = ["all"];
                    } else if (isShiftPressed) {
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
                textValue={phase.title}
              >
                <PhaseIcon phase={phase as PHASE_TYPE} variant={"icon"} />
                <span className="truncate">{phase.title}</span>
              </PrismCommandItem>
            ))}
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
