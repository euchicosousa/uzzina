import { CheckIcon, FilterIcon } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  CATEGORY_STATIONS,
  STATIONS,
  type STATION_TYPE,
} from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { StationIcon } from "./StationIcon";

const ALL_STATION = {
  slug: "all",
  title: "Todas as estações",
  color: "#888",
};

type StationItem = typeof ALL_STATION | STATION_TYPE;

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
  const allowedSlugs = category ? (CATEGORY_STATIONS[category] ?? Object.keys(STATIONS)) : Object.keys(STATIONS);
  const stationsList = Object.values(STATIONS).filter((s) =>
    allowedSlugs.includes(s.slug),
  );

  // Mapeamento de seleção múltipla
  const hasRealSelection = isMulti && selectedStations.length > 0 && !selectedStations.includes("all");
  const currentSelectedItems = hasRealSelection
    ? stationsList.filter((s) => selectedStations.includes(s.slug))
    : [ALL_STATION];

  // Caso seja seleção única
  const currentSingle: STATION_TYPE =
    (Object.values(STATIONS).find((s) => s.slug === selectedStation) as STATION_TYPE | undefined)
    ?? STATIONS.flow;

  const handleSelect = (slug: string) => {
    if (isMulti) {
      if (slug === "all") {
        onSelect?.({ stations: ["all"] });
      } else {
        const activeSelections = selectedStations.filter((s) => s !== "all");
        const next = activeSelections.includes(slug)
          ? activeSelections.filter((s) => s !== slug)
          : [...activeSelections, slug];
        
        onSelect?.({ stations: next.length === 0 ? ["all"] : next });
      }
    } else {
      onSelect?.({ station: slug, stations: [slug] });
      setIsOpen(false);
    }
  };

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen && !disabled}>
      <PopoverTrigger asChild>
        {isMulti ? (
          <button
            type="button"
            disabled={disabled}
            tabIndex={tabIndex}
            title={
              !hasRealSelection
                ? "Filtrar por estação"
                : currentSelectedItems.map((s) => s.title).join(" • ")
            }
            className={cn(
              "raised grid size-9 place-content-center rounded-xl border-b border-b-transparent squircle hover:text-foreground/50",
              hasRealSelection && "bg-muted text-foreground",
              className,
            )}
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
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            tabIndex={tabIndex}
            title={disabled ? "Ações com status Ideia ficam no Fluxo" : `Estação: ${currentSingle.title}`}
            className={cn(
              "flex items-center gap-1.5 transition-colors outline-none",
              size === "sm"
                ? cn(
                    "h-8 text-xs hover:bg-secondary disabled:opacity-40",
                    !showText ? "w-8 justify-center p-0" : "justify-start px-3",
                  )
                : "p-6 text-sm hover:bg-secondary focus:bg-secondary/50 disabled:opacity-40",
              className,
            )}
          >
            {showText ? (
              <StationIcon station={currentSingle} size="dot" showText />
            ) : (
              <StationIcon station={currentSingle} size="sm" />
            )}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-0">
        <Command>
          <CommandInput placeholder="Procurar estação..." />
          <CommandEmpty>Nenhuma estação encontrada.</CommandEmpty>
          <CommandList className="p-1 outline-none">
            {isMulti && (
              <>
                <CommandItem
                  onSelect={() => handleSelect("all")}
                  className="flex items-center gap-2 font-semibold"
                >
                  <div className="size-4 rounded-full border bg-secondary" />
                  <span>Todas as estações</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      selectedStations.includes("all") || selectedStations.length === 0
                        ? "visible"
                        : "invisible",
                    )}
                  />
                </CommandItem>
                <CommandSeparator className="my-1" />
              </>
            )}
            {stationsList.map((station) => {
              const isChecked = isMulti
                ? selectedStations.includes(station.slug)
                : selectedStation === station.slug;

              return (
                <CommandItem
                  key={station.slug}
                  className="flex items-center gap-2"
                  onSelect={() => handleSelect(station.slug)}
                >
                  <StationIcon station={station} size="sm" />
                  <span className="truncate">{station.title}</span>
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      isChecked ? "visible" : "invisible",
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
