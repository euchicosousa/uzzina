import { FilterIcon } from "lucide-react";
import { useState } from "react";
import {
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismCommandSeparator,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { PHASES, type PHASE_TYPE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import { ComboboxTrigger } from "./ComboboxTrigger";
import { PhaseIcon } from "./PhaseIcon";
const DEFAULT_SELECTED_PHASES: string[] = [];
function MultiPhaseTrigger({
  tabIndex,
  className,
  currentPhases,
  hasRealSelection,
  showText,
  disabled,
  ...props
}: {
  tabIndex?: number;
  className?: string;
  currentPhases: PHASE_TYPE[];
  hasRealSelection: boolean;
  showText?: boolean;
  disabled?: boolean;
}) {
  return (
    <ComboboxTrigger
      className={cn(className, "overflow-hidden")}
      disabled={disabled}
      hasSelection={hasRealSelection}
      tabIndex={tabIndex}
      title={
        !hasRealSelection
          ? "Filtrar por fase"
          : currentPhases.map((s) => s.title).join(" • ")
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
  disabled,
  ...props
}: {
  tabIndex?: number;
  className?: string;
  size?: "sm" | "lg";
  showText?: boolean;
  iconVariant?: "progress" | "icon";
  currentPhase: PHASE_TYPE;
  disabled?: boolean;
}) {
  return (
    <ComboboxTrigger
      className={cn(disabled && "opacity-40 pointer-events-none", className)}
      disabled={disabled}
      size={size}
      tabIndex={tabIndex}
      title={`Fase: ${currentPhase?.title}`}
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
  disabled = false,
}: {
  selectedPhase?: string | null;
  selectedPhases?: string[];
  onSelect?: (value: { phase?: string; phases: string[] }) => void;
  isMulti?: boolean;
  tabIndex?: number;
  showText?: boolean;
  className?: string;
  iconVariant?: "progress" | "icon";
  size?: "sm" | "lg";
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const PHASES_LIST = Object.values(PHASES);
  const phasesList = PHASES_LIST;

  // Determinar a(s) fase(s) atual(is) para o trigger
  const hasRealSelection =
    isMulti && selectedPhases.length > 0 && !selectedPhases.includes("all");
  let currentPhases = phasesList.filter((phase) =>
    isMulti
      ? selectedPhases.includes(phase.slug)
      : selectedPhase === phase.slug,
  );

  // Fallback se não encontrar nada (ex: estado inicial)
  if (currentPhases.length === 0 && !isMulti) {
    currentPhases = [PHASES_LIST[0]];
  }
  const handleSelect = (slug: string) => {
    if (isMulti) {
      if (slug === "all") {
        onSelect?.({
          phases: ["all"],
        });
      } else {
        const isShiftPressed = (window.event as MouseEvent | undefined)
          ?.shiftKey;
        if (isShiftPressed) {
          onSelect?.({
            phases: [slug],
          });
        } else {
          const activeSelections = selectedPhases.filter((s) => s !== "all");
          const next = activeSelections.includes(slug)
            ? activeSelections.filter((s) => s !== slug)
            : [...activeSelections, slug];
          onSelect?.({
            phases: next.length === 0 ? ["all"] : next,
          });
        }
      }
    } else {
      onSelect?.({
        phase: slug,
        phases: [slug],
      });
      setIsOpen(false);
    }
  };
  return (
    <PrismPopoverTrigger
      isOpen={isOpen && !disabled}
      onOpenChange={(open) => !disabled && setIsOpen(open)}
    >
      {isMulti ? (
        <MultiPhaseTrigger
          className={className}
          currentPhases={currentPhases}
          disabled={disabled}
          hasRealSelection={hasRealSelection}
          showText
          tabIndex={tabIndex}
        />
      ) : (
        <SinglePhaseTrigger
          className={className}
          currentPhase={currentPhases[0]}
          disabled={disabled}
          iconVariant={iconVariant}
          showText={showText}
          size={size}
          tabIndex={tabIndex}
        />
      )}
      <PrismPopover className="w-56 p-0">
        <PrismCommand className="p-0">
          <PrismCommandInput placeholder="Procurar fase..." />

          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhuma fase encontrada.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {isMulti && (
                <>
                  <PrismCommandItem
                    isSelected={
                      selectedPhases.includes("all") ||
                      selectedPhases.length === 0
                    }
                    onAction={() => handleSelect("all")}
                    textValue="Todas as fases"
                  >
                    <div className="size-4 rounded-full border bg-secondary" />
                    <span className="truncate">Todas as fases</span>
                  </PrismCommandItem>
                  <PrismCommandSeparator className="-mx-2" />
                </>
              )}

              {phasesList.map((phase) => (
                <PrismCommandItem
                  key={phase.slug}
                  className="flex items-center gap-2 cursor-pointer"
                  isSelected={
                    isMulti
                      ? selectedPhases.includes(phase.slug)
                      : selectedPhase === phase.slug
                  }
                  onAction={() => handleSelect(phase.slug)}
                  textValue={phase.title}
                >
                  <PhaseIcon phase={phase as PHASE_TYPE} variant="icon" />
                  <span className="truncate">{phase.title}</span>
                </PrismCommandItem>
              ))}
            </PrismCommandGroup>
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
