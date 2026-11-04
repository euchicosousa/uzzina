import { useMemo, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import type { Celebration } from "~/types";
import {
  PrismBadge,
  PrismButton,
  PrismCheckbox,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupButton,
  PrismInputGroupInput,
  PrismTab,
  PrismTabList,
  PrismTabPanel,
  PrismTabs,
} from "~/components/prism";

const MONTHS = [
  { key: "all", name: "Todos", short: "Todos" },
  { key: "01", name: "Janeiro", short: "Jan" },
  { key: "02", name: "Fevereiro", short: "Fev" },
  { key: "03", name: "Março", short: "Mar" },
  { key: "04", name: "Abril", short: "Abr" },
  { key: "05", name: "Maio", short: "Mai" },
  { key: "06", name: "Junho", short: "Jun" },
  { key: "07", name: "Julho", short: "Jul" },
  { key: "08", name: "Agosto", short: "Ago" },
  { key: "09", name: "Setembro", short: "Set" },
  { key: "10", name: "Outubro", short: "Out" },
  { key: "11", name: "Novembro", short: "Nov" },
  { key: "12", name: "Dezembro", short: "Dez" },
];

interface PartnerCelebrationsSelectorProps {
  celebrations: Celebration[];
  selectedIds: string[];
  isLoading: boolean;
  onToggle: (id: string, isChecked: boolean) => void;
  onClear: () => void;
  saving?: boolean;
}

export function PartnerCelebrationsSelector({
  celebrations,
  selectedIds,
  isLoading,
  onToggle,
  onClear,
  saving = false,
}: PartnerCelebrationsSelectorProps) {
  const [activeMonth, setActiveMonth] = useState("all");
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const searchNormalized = search.trim().toLowerCase();

  const celebrationsByMonth = useMemo(() => {
    const map = new Map<string, Celebration[]>();
    for (const month of MONTHS) {
      if (month.key !== "all") map.set(month.key, []);
    }
    for (const celebration of celebrations) {
      map.get(celebration.date.slice(5, 7))?.push(celebration);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.date.localeCompare(b.date));
    }
    return map;
  }, [celebrations]);

  const visibleMonths = MONTHS.filter(
    (month) =>
      month.key !== "all" &&
      (activeMonth === "all" || month.key === activeMonth),
  )
    .map((month) => ({
      ...month,
      celebrations: (celebrationsByMonth.get(month.key) ?? []).filter(
        (celebration) =>
          celebration.title.toLowerCase().includes(searchNormalized) ||
          celebration.date.includes(searchNormalized),
      ),
    }))
    .filter((month) => month.celebrations.length > 0);

  if (isLoading) {
    return (
      <p className="py-6 text-sm text-muted-foreground" role="status">
        Carregando datas comemorativas...
      </p>
    );
  }

  if (celebrations.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        Nenhuma data comemorativa cadastrada no sistema ainda.
      </p>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {selectedIds.length} de {celebrations.length}{" "}
            {selectedIds.length === 1
              ? "data selecionada"
              : "datas selecionadas"}
          </span>
          {saving && (
            <span className="text-xs text-muted-foreground" role="status">
              Salvando...
            </span>
          )}
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
          <div className="min-w-0 flex-1 sm:w-64 sm:flex-none">
            <PrismInputGroup>
              <PrismInputGroupAddon>
                <SearchIcon />
              </PrismInputGroupAddon>
              <PrismInputGroupInput
                aria-label="Filtrar datas comemorativas"
                placeholder="Filtrar por nome..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <PrismInputGroupAddon align="inline-end">
                  <PrismInputGroupButton
                    aria-label="Limpar filtro"
                    onPress={() => setSearch("")}
                  >
                    <XIcon />
                  </PrismInputGroupButton>
                </PrismInputGroupAddon>
              )}
            </PrismInputGroup>
          </div>
          {selectedIds.length > 0 && (
            <PrismButton isDisabled={saving} onPress={onClear} variant="link">
              Limpar todas
            </PrismButton>
          )}
        </div>
      </div>

      <PrismTabs
        className="min-w-0"
        onSelectionChange={(key) => setActiveMonth(String(key))}
        selectedKey={activeMonth}
      >
        <PrismTabList
          aria-label="Filtrar por mês"
          className="h-10 scrollbar-none overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {MONTHS.map((month) => {
            const dates =
              month.key === "all"
                ? celebrations
                : (celebrationsByMonth.get(month.key) ?? []);
            const selectedCount = dates.filter((date) =>
              selectedSet.has(date.id),
            ).length;
            return (
              <PrismTab
                aria-label={`${month.name}, ${selectedCount} selecionadas`}
                id={month.key}
                key={month.key}
                className="flex-none px-3"
              >
                {month.short}
                {selectedCount > 0 && (
                  <PrismBadge variant="secondary">{selectedCount}</PrismBadge>
                )}
              </PrismTab>
            );
          })}
        </PrismTabList>

        <PrismTabPanel
          className="flex max-h-80 min-h-36 flex-col gap-4 overflow-y-auto px-1 pt-0 pb-1"
          id={activeMonth}
        >
          {visibleMonths.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground" role="status">
              {searchNormalized
                ? `Nenhuma data encontrada para "${search}".`
                : `Nenhuma data comemorativa cadastrada em ${MONTHS.find((month) => month.key === activeMonth)?.name}.`}
            </p>
          ) : (
            visibleMonths.map((month) => (
              <div className="flex flex-col gap-2" key={month.key}>
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background py-2">
                  <span className="text-sm font-semibold">{month.name}</span>
                  {month.celebrations.some(
                    (celebration) => celebration.is_holiday,
                  ) && <PrismBadge variant="warning">Feriado</PrismBadge>}
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {month.celebrations.map((celebration) => (
                    <PrismCheckbox
                      className="min-w-0 py-2"
                      isDisabled={saving}
                      isSelected={selectedSet.has(celebration.id)}
                      key={celebration.id}
                      onChange={(isChecked) =>
                        onToggle(celebration.id, isChecked)
                      }
                    >
                      <span className="w-5 shrink-0 text-center text-sm text-muted-foreground">
                        {celebration.date.slice(8, 10)}
                      </span>
                      <span
                        className="min-w-0 flex-1 truncate text-sm whitespace-nowrap"
                        title={celebration.title}
                      >
                        {celebration.title}
                      </span>
                    </PrismCheckbox>
                  ))}
                </div>
              </div>
            ))
          )}
        </PrismTabPanel>
      </PrismTabs>
    </div>
  );
}
