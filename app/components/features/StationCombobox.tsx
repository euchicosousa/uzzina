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
import {
  CATEGORY_STATIONS,
  STATIONS,
  type STATION_TYPE,
} from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { ComboboxTrigger } from "./ComboboxTrigger";
import { StationIcon } from "./StationIcon";
const ALL_STATION = {
  slug: "all",
  title: "Todas as estações",
  color: "#888",
};
const DEFAULT_SELECTED_STATIONS: string[] = [];
export function StationCombobox({
  selectedStation,
  selectedStations = DEFAULT_SELECTED_STATIONS,
  category,
  onSelect,
  isMulti = false,
  tabIndex,
  showText = true,
  size = "lg",
  disabled = false,
  className,
}: {
  selectedStation?: string | null;
  selectedStations?: string[];
  category?: string;
  onSelect?: (value: { station?: string; stations: string[] }) => void;
  isMulti?: boolean;
  tabIndex?: number;
  showText?: boolean;
  size?: "sm" | "lg";
  disabled?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Determinar slugs válidos (filtrados por categoria se fornecida)
  const allowedSlugs = category
    ? (CATEGORY_STATIONS[category] ?? Object.keys(STATIONS))
    : Object.keys(STATIONS);
  const stationsList = Object.values(STATIONS).filter((s) =>
    allowedSlugs.includes(s.slug),
  );

  // Mapeamento de seleção múltipla
  const hasRealSelection =
    isMulti && selectedStations.length > 0 && !selectedStations.includes("all");
  const currentSelectedItems = hasRealSelection
    ? stationsList.filter((s) => selectedStations.includes(s.slug))
    : [ALL_STATION];

  // Caso seja seleção única
  const currentSingle: STATION_TYPE =
    (Object.values(STATIONS).find((s) => s.slug === selectedStation) as
      STATION_TYPE | undefined) ?? STATIONS.flow;
  const handleSelect = (slug: string) => {
    if (isMulti) {
      if (slug === "all") {
        onSelect?.({
          stations: ["all"],
        });
      } else {
        const activeSelections = selectedStations.filter((s) => s !== "all");
        const next = activeSelections.includes(slug)
          ? activeSelections.filter((s) => s !== slug)
          : [...activeSelections, slug];
        onSelect?.({
          stations: next.length === 0 ? ["all"] : next,
        });
      }
    } else {
      onSelect?.({
        station: slug,
        stations: [slug],
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
        <ComboboxTrigger
          className={className}
          disabled={disabled}
          hasSelection={hasRealSelection}
          tabIndex={tabIndex}
          title={
            !hasRealSelection
              ? "Filtrar por estação"
              : currentSelectedItems.map((s) => s.title).join(" • ")
          }
          variant="filter"
        >
          {!hasRealSelection ? (
            <FilterIcon className="size-4" />
          ) : (
            <div className="flex -space-x-2">
              {currentSelectedItems.map((s) => (
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
        </ComboboxTrigger>
      ) : (
        <ComboboxTrigger
          className={cn(
            disabled && "opacity-40 pointer-events-none",
            className,
          )}
          disabled={disabled}
          size={size}
          tabIndex={tabIndex}
          title={
            disabled
              ? "Ações com status Ideia ficam no Fluxo"
              : `Estação: ${currentSingle.title}`
          }
          variant="form-inline"
        >
          {showText ? (
            <StationIcon showText size="dot" station={currentSingle} />
          ) : (
            <StationIcon
              size={size === "sm" ? "sm" : "md"}
              station={currentSingle}
            />
          )}
        </ComboboxTrigger>
      )}
      <PrismPopover className="w-52 p-0">
        <PrismCommand>
          <PrismCommandInput placeholder="Procurar estação..." />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhuma estação encontrada.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {isMulti && (
                <>
                  <PrismCommandItem
                    isSelected={
                      selectedStations.includes("all") ||
                      selectedStations.length === 0
                    }
                    onAction={() => handleSelect("all")}
                    textValue="Todas as estações"
                  >
                    <div className="size-4 rounded-full border bg-secondary" />
                    <span className="truncate">Todas as estações</span>
                  </PrismCommandItem>
                  <PrismCommandSeparator className="-mx-2" />
                </>
              )}
              {stationsList.map((station) => {
                const isChecked = isMulti
                  ? selectedStations.includes(station.slug)
                  : selectedStation === station.slug;
                return (
                  <PrismCommandItem
                    key={station.slug}
                    className="flex items-center gap-2 cursor-pointer"
                    isSelected={isChecked}
                    onAction={() => handleSelect(station.slug)}
                    textValue={station.title}
                  >
                    <StationIcon size="sm" station={station} />
                    <span className="truncate">{station.title}</span>
                  </PrismCommandItem>
                );
              })}
            </PrismCommandGroup>
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
