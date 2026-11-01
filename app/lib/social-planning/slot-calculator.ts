import {
  addDays,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns";
import type { PlanFormat } from "./types";
import { parseU } from "~/utils";

// Mapeamento dos IDs de dia (domingo = 0 até sábado = 6)
export const DAY_ID_TO_INDEX: Record<string, number> = {
  dom: 0,
  seg: 1,
  ter: 2,
  qua: 3,
  qui: 4,
  sex: 5,
  sab: 6,
};

export const INDEX_TO_DAY_ID: Record<number, string> = {
  0: "dom",
  1: "seg",
  2: "ter",
  3: "qua",
  4: "qui",
  5: "sex",
  6: "sab",
};

/**
 * Calcula os slots de data (YYYY-MM-DD) para um período civil inclusivo,
 * respeitando os dias da semana selecionados e o limite de posts por semana.
 */
export function calculatePeriodSlots({
  startDate,
  endDate,
  postsPerWeek,
  selectedDays,
}: {
  startDate: string;
  endDate: string;
  postsPerWeek: number;
  selectedDays: string[];
}): string[] {
  if (!startDate || !endDate) return [];

  const start = parseU(startDate);
  const end = parseU(endDate);
  if (start > end) return [];

  const targetDayIndices = new Set(
    selectedDays
      .map((d) => DAY_ID_TO_INDEX[d])
      .filter((idx) => idx !== undefined),
  );

  if (targetDayIndices.size === 0) return [];

  // Agrupa dias por semana calendário (começando no domingo)
  const allDays = eachDayOfInterval({ start, end });
  const weeklyBuckets: Map<string, Date[]> = new Map();

  for (const day of allDays) {
    const dayOfWeek = getDay(day);
    if (!targetDayIndices.has(dayOfWeek)) continue;

    // Chave da semana civil (domingo correspondente)
    const sundayOffset = dayOfWeek;
    const weekSunday = addDays(day, -sundayOffset);
    const weekKey = format(weekSunday, "yyyy-MM-dd");

    if (!weeklyBuckets.has(weekKey)) {
      weeklyBuckets.set(weekKey, []);
    }
    weeklyBuckets.get(weekKey)?.push(day);
  }

  const selectedDates: string[] = [];

  // Para cada semana, pega até postsPerWeek dias
  for (const [, daysInWeek] of weeklyBuckets) {
    // Ordena os dias cronologicamente
    daysInWeek.sort((a, b) => a.getTime() - b.getTime());
    const capped = daysInWeek.slice(0, postsPerWeek);
    for (const d of capped) {
      selectedDates.push(format(d, "yyyy-MM-dd"));
    }
  }

  // Ordena todas as datas resultantes
  return selectedDates.sort();
}

/**
 * Distribui os formatos de conteúdo (reels, carousel, static)
 * para a quantidade total de slots.
 */
export function distributeFormats({
  totalCount,
  formatMode,
  reelsCount = 0,
  staticCount = 0,
  carouselCount = 0,
}: {
  totalCount: number;
  formatMode: "auto" | "manual";
  reelsCount?: number;
  staticCount?: number;
  carouselCount?: number;
}): PlanFormat[] {
  if (totalCount <= 0) return [];

  if (formatMode === "manual") {
    const list: PlanFormat[] = [];
    for (let i = 0; i < reelsCount; i++) list.push("reels");
    for (let i = 0; i < carouselCount; i++) list.push("carousel");
    for (let i = 0; i < staticCount; i++) list.push("static");

    // Se o manual ultrapassar o total, trunca
    if (list.length >= totalCount) {
      return list.slice(0, totalCount);
    }

    // Se o manual for menor que o total, preenche o restante ciclicamente
    const cycle: PlanFormat[] = ["reels", "carousel", "static"];
    let idx = 0;
    while (list.length < totalCount) {
      list.push(cycle[idx % cycle.length]);
      idx++;
    }
    return list;
  }

  // Modo auto: rotação equilibrada: reels -> carrossel -> estático
  const cycle: PlanFormat[] = ["reels", "carousel", "static"];
  const list: PlanFormat[] = [];
  for (let i = 0; i < totalCount; i++) {
    list.push(cycle[i % cycle.length]);
  }
  return list;
}

/**
 * Mescla as datas comemorativas selecionadas com os slots calculados.
 * Se uma data comemorativa coincidir com um slot existente, marca o slot como comemorativo.
 * Se a comemoração cair em um dia que não tem slot, adiciona um slot extra específico.
 */
export function mergeCommemorativeSlots({
  slots,
  celebrations,
  selectedCelebrationIds,
}: {
  slots: string[];
  celebrations: Array<{ id: string; title: string; date: string }>;
  selectedCelebrationIds: string[];
}): Array<{
  date: string;
  isCommemorative: boolean;
  celebrationTitle?: string;
}> {
  const selectedHolidays = celebrations.filter((c) =>
    selectedCelebrationIds.includes(c.id),
  );

  const holidayByDate = new Map<string, string>();
  for (const h of selectedHolidays) {
    const existing = holidayByDate.get(h.date);
    holidayByDate.set(h.date, existing ? `${existing} / ${h.title}` : h.title);
  }

  const slotSet = new Set(slots);
  const result: Array<{
    date: string;
    isCommemorative: boolean;
    celebrationTitle?: string;
  }> = [];

  for (const slot of slots) {
    const holidayTitle = holidayByDate.get(slot);
    result.push({
      date: slot,
      isCommemorative: Boolean(holidayTitle),
      celebrationTitle: holidayTitle,
    });
  }

  // Adiciona comemorações que não caíram em slots regulares
  for (const [hDate, hTitle] of holidayByDate.entries()) {
    if (!slotSet.has(hDate)) {
      result.push({
        date: hDate,
        isCommemorative: true,
        celebrationTitle: hTitle,
      });
    }
  }

  // Ordena por data
  return result.sort((a, b) => a.date.localeCompare(b.date));
}
