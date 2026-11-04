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
import { cn } from "cnfast";
import {
  UComboboxTrigger,
  getTriggerContentSizeClass,
  getTriggerPhaseIconSize,
  type UComboboxTriggerProps,
} from "./UComboboxTrigger";
import { UPhaseIcon } from "./UPhaseIcon";

const DEFAULT_SELECTED_PHASES: string[] = [];

function MultiPhaseTrigger({
  tabIndex,
  currentPhases,
  hasRealSelection,
  showText,
  disabled,
  variant,
  size,
  ...props
}: {
  tabIndex?: number;
  currentPhases: PHASE_TYPE[];
  hasRealSelection: boolean;
  showText?: boolean;
  disabled?: boolean;
  variant?: UComboboxTriggerProps["variant"];
  size?: UComboboxTriggerProps["size"];
}) {
  return (
    <UComboboxTrigger
      disabled={disabled}
      tabIndex={tabIndex}
      title={
        !hasRealSelection
          ? "Filtrar por fase"
          : currentPhases.map((s) => s.title).join(" • ")
      }
      size={size}
      variant={variant}
      {...props}
    >
      {!hasRealSelection ? (
        <>
          <FilterIcon />
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
                className={cn(
                  getTriggerContentSizeClass(size),
                  "rounded-full border",
                )}
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
    </UComboboxTrigger>
  );
}

function SinglePhaseTrigger({
  tabIndex,
  showText,
  iconVariant,
  currentPhase,
  disabled,
  variant,
  size,
  ...props
}: {
  tabIndex?: number;
  showText?: boolean;
  iconVariant?: "progress" | "icon";
  currentPhase: PHASE_TYPE;
  disabled?: boolean;
  variant?: UComboboxTriggerProps["variant"];
  size?: UComboboxTriggerProps["size"];
}) {
  return (
    <UComboboxTrigger
      aria-label={
        !showText ? `Fase: ${currentPhase?.title ?? "Sem fase"}` : undefined
      }
      disabled={disabled}
      tabIndex={tabIndex}
      title={`Fase: ${currentPhase?.title}`}
      size={size}
      variant={variant}
      {...props}
    >
      {!showText ? (
        <UPhaseIcon
          phase={currentPhase as PHASE_TYPE}
          size={getTriggerPhaseIconSize(size)}
          variant={iconVariant}
        />
      ) : (
        <>
          <div
            className={cn(
              size === "xs" ? "size-1.5" : "size-2",
              "rounded-full",
            )}
            style={{
              backgroundColor: currentPhase?.color,
            }}
          />
          {currentPhase?.title}
        </>
      )}
    </UComboboxTrigger>
  );
}

export interface UPhaseComboboxProps {
  selectedPhase?: string | null;
  selectedPhases?: string[];
  onSelect?: (value: { phase?: string; phases: string[] }) => void;
  isMulti?: boolean;
  tabIndex?: number;
  showText?: boolean;
  iconVariant?: "progress" | "icon";
  disabled?: boolean;
  variant?: UComboboxTriggerProps["variant"];
  size?: UComboboxTriggerProps["size"];
}

export function UPhaseCombobox({
  selectedPhase,
  selectedPhases = DEFAULT_SELECTED_PHASES,
  onSelect,
  isMulti = false,
  tabIndex,
  showText = true,
  iconVariant = "progress",
  disabled = false,
  variant,
  size,
}: UPhaseComboboxProps) {
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
  const handleSelect = (slug: string, isShiftPressed: boolean) => {
    if (isMulti) {
      if (slug === "all") {
        onSelect?.({
          phases: ["all"],
        });
      } else {
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
          currentPhases={currentPhases}
          disabled={disabled}
          hasRealSelection={hasRealSelection}
          showText
          size={size}
          tabIndex={tabIndex}
          variant={variant}
        />
      ) : (
        <SinglePhaseTrigger
          currentPhase={currentPhases[0]}
          disabled={disabled}
          iconVariant={iconVariant}
          showText={showText}
          tabIndex={tabIndex}
          size={size}
          variant={variant}
        />
      )}
      <PrismPopover className="overflow-hidden p-0" size="sm">
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
                    data-selected={
                      selectedPhases.includes("all") ||
                      selectedPhases.length === 0
                    }
                    onAction={({ shiftKey }) => handleSelect("all", shiftKey)}
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
                  className="flex cursor-pointer items-center gap-2"
                  isSelected={
                    isMulti
                      ? selectedPhases.includes(phase.slug)
                      : selectedPhase === phase.slug
                  }
                  onAction={({ shiftKey }) =>
                    handleSelect(phase.slug, shiftKey)
                  }
                  textValue={phase.title}
                >
                  <UPhaseIcon phase={phase as PHASE_TYPE} variant="icon" />
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
