import { useMemo, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import type { Celebration } from "~/types";
import { cn } from "cnfast";
import {
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
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

  // Agrupa datas por mês (01 a 12)
  const celebrationsByMonth = useMemo(() => {
    const map = new Map<string, Celebration[]>();
    for (let i = 1; i <= 12; i++) {
      const key = String(i).padStart(2, "0");
      map.set(key, []);
    }
    for (const c of celebrations) {
      const monthKey = c.date.slice(5, 7);
      const list = map.get(monthKey);
      if (list) {
        list.push(c);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.date.localeCompare(b.date));
    }
    return map;
  }, [celebrations]);

  if (isLoading) {
    return (
      <div className="h-48 w-full animate-pulse rounded-xl bg-muted/20 squircle" />
    );
  }

  if (celebrations.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        Nenhuma data comemorativa cadastrada no sistema ainda.
      </div>
    );
  }

  // Meses a renderizar de acordo com a aba selecionada
  const monthsToRender =
    activeMonth === "all"
      ? MONTHS.filter((m) => m.key !== "all")
      : MONTHS.filter((m) => m.key === activeMonth);

  return (
    <div className="flex w-full max-w-full min-w-0 flex-col gap-3">
      {/* Barra superior: contadores, busca e limpar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {selectedIds.length} de {celebrations.length}{" "}
            {selectedIds.length === 1
              ? "data selecionada"
              : "datas selecionadas"}
          </span>
          {saving && (
            <span className="animate-pulse text-[11px] text-muted-foreground">
              Salvando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-44 sm:w-52">
            <PrismInputGroup size="sm">
              <PrismInputGroupAddon>
                <SearchIcon className="size-3.5" />
              </PrismInputGroupAddon>
              <PrismInputGroupInput
                placeholder="Filtrar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-xs"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Limpar filtro"
                  onClick={() => setSearch("")}
                  className="mr-1 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </PrismInputGroup>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              className="cursor-pointer text-xs font-medium text-primary hover:underline"
              onClick={onClear}
            >
              Limpar todas
            </button>
          )}
        </div>
      </div>

      {/* Seletor de mês (pills simples sem cartão) */}
      <div className="flex w-full min-w-0 gap-1 overflow-x-auto pb-1 text-xs">
        {MONTHS.map((m) => {
          const isSelected = activeMonth === m.key;
          const monthDates =
            m.key === "all"
              ? celebrations
              : celebrationsByMonth.get(m.key) || [];
          const selectedInMonth = monthDates.filter((c) =>
            selectedSet.has(c.id),
          ).length;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveMonth(m.key)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors squircle",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-input/50 text-muted-foreground hover:bg-input hover:text-foreground",
              )}
            >
              <span>{m.short}</span>
              {selectedInMonth > 0 && (
                <span
                  className={cn(
                    "py-0.2 rounded-full px-1.5 text-[10px] leading-none font-semibold",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/15 text-primary",
                  )}
                >
                  {selectedInMonth}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista com rolagem vertical sem moldura de cartão */}
      <div className="flex max-h-80 min-h-36 flex-col gap-3 overflow-y-auto pr-1">
        {monthsToRender.map((m) => {
          const list = celebrationsByMonth.get(m.key) || [];
          const filtered = searchNormalized
            ? list.filter(
                (c) =>
                  c.title.toLowerCase().includes(searchNormalized) ||
                  c.date.includes(searchNormalized),
              )
            : list;

          if (filtered.length === 0) {
            if (activeMonth !== "all") {
              return (
                <div
                  key={m.key}
                  className="py-6 text-center text-xs text-muted-foreground/60 italic"
                >
                  {searchNormalized
                    ? `Nenhuma data em ${m.name} para "${search}"`
                    : `Nenhuma data comemorativa cadastrada em ${m.name}`}
                </div>
              );
            }
            return null;
          }

          return (
            <div key={m.key} className="flex flex-col gap-1.5">
              {activeMonth === "all" && (
                <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 py-1 backdrop-blur-xs">
                  <span className="text-xs font-semibold text-foreground">
                    {m.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {filtered.length} {filtered.length === 1 ? "data" : "datas"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {filtered.map((c) => {
                  const isChecked = selectedSet.has(c.id);
                  const day = c.date.slice(8, 10);

                  return (
                    <div
                      key={c.id}
                      onClick={() => onToggle(c.id, !isChecked)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          onToggle(c.id, !isChecked);
                        }
                      }}
                      className={cn(
                        "group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors select-none squircle",
                        isChecked
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => onToggle(c.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="size-3.5 shrink-0 cursor-pointer rounded border-border accent-primary squircle"
                      />
                      <span className="w-5 shrink-0 text-center font-bold text-foreground/80">
                        {day}
                      </span>
                      <span className="flex-1 truncate leading-tight">
                        {c.title}
                      </span>
                      {c.is_holiday && (
                        <span className="py-0.2 shrink-0 rounded border border-amber-500/30 bg-amber-500/15 px-1.5 text-[9px] font-semibold text-amber-600 squircle dark:text-amber-400">
                          Feriado
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
