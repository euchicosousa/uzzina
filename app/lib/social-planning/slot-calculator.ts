import { addDays, eachDayOfInterval, format, getDay } from "date-fns";
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

export interface PeriodValidationResult {
  isValid: boolean;
  error?: string;
  calculatedSlots: string[];
}

/**
 * Valida os parâmetros de entrada para o modo período.
 * Retorna resultado determinístico com motivo legível de erro e os slots válidos.
 */
export function validatePeriodInput({
  startDate,
  endDate,
  postsPerWeek,
  selectedDays,
}: {
  startDate: string;
  endDate: string;
  postsPerWeek: number;
  selectedDays: string[];
}): PeriodValidationResult {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      error: "Selecione as datas de início e fim do período.",
      calculatedSlots: [],
    };
  }

  // Validação estrita do formato civil YYYY-MM-DD
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return {
      isValid: false,
      error: "Formato de data inválido. Use o padrão AAAA-MM-DD.",
      calculatedSlots: [],
    };
  }

  const start = parseU(startDate);
  const end = parseU(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      isValid: false,
      error: "Data civil inválida.",
      calculatedSlots: [],
    };
  }

  if (startDate > endDate) {
    return {
      isValid: false,
      error: "A data de início não pode ser posterior à data de fim.",
      calculatedSlots: [],
    };
  }

  if (!Number.isInteger(postsPerWeek) || postsPerWeek < 1 || postsPerWeek > 7) {
    return {
      isValid: false,
      error:
        "A frequência deve ser um número inteiro entre 1 e 7 conteúdos por semana.",
      calculatedSlots: [],
    };
  }

  const validDayIds = Object.keys(DAY_ID_TO_INDEX);
  const filteredDays = (selectedDays || []).filter((d) =>
    validDayIds.includes(d),
  );

  if (filteredDays.length === 0) {
    return {
      isValid: false,
      error: "Selecione pelo menos um dia da semana para publicação.",
      calculatedSlots: [],
    };
  }

  const slots = calculatePeriodSlots({
    startDate,
    endDate,
    postsPerWeek,
    selectedDays: filteredDays,
  });

  if (slots.length === 0) {
    return {
      isValid: false,
      error:
        "Nenhum dia selecionado ocorre dentro do intervalo de datas informado.",
      calculatedSlots: [],
    };
  }

  return {
    isValid: true,
    calculatedSlots: slots,
  };
}

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
 * No modo manual, valida estritamente a soma sem truncamento ou preenchimento silencioso.
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
    const sum = reelsCount + carouselCount + staticCount;
    if (sum !== totalCount) {
      throw new Error(
        `A soma das quantidades manuais (${sum}) deve equivaler exatamente ao total regular (${totalCount}). Ajuste os valores manuais.`,
      );
    }

    const list: PlanFormat[] = [];
    for (let i = 0; i < reelsCount; i++) list.push("reels");
    for (let i = 0; i < carouselCount; i++) list.push("carousel");
    for (let i = 0; i < staticCount; i++) list.push("static");

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

export interface FormatValidationResult {
  isValid: boolean;
  error?: string;
  reelsCount: number;
  staticCount: number;
  carouselCount: number;
  sum: number;
  targetCount: number;
}

/**
 * Validação pura de formatos de conteúdo (C04).
 */
export function validateFormatDistribution({
  formatMode,
  targetCount,
  reelsCount = 0,
  staticCount = 0,
  carouselCount = 0,
}: {
  formatMode: "auto" | "manual";
  targetCount: number;
  reelsCount?: number;
  staticCount?: number;
  carouselCount?: number;
}): FormatValidationResult {
  if (formatMode === "auto") {
    return {
      isValid: true,
      reelsCount: 0,
      staticCount: 0,
      carouselCount: 0,
      sum: targetCount,
      targetCount,
    };
  }

  const r =
    typeof reelsCount === "number" && !Number.isNaN(reelsCount)
      ? reelsCount
      : 0;
  const s =
    typeof staticCount === "number" && !Number.isNaN(staticCount)
      ? staticCount
      : 0;
  const c =
    typeof carouselCount === "number" && !Number.isNaN(carouselCount)
      ? carouselCount
      : 0;

  if (
    r < 0 ||
    s < 0 ||
    c < 0 ||
    !Number.isInteger(r) ||
    !Number.isInteger(s) ||
    !Number.isInteger(c)
  ) {
    return {
      isValid: false,
      error:
        "As quantidades de formatos devem ser números inteiros não negativos.",
      reelsCount: r,
      staticCount: s,
      carouselCount: c,
      sum: r + s + c,
      targetCount,
    };
  }

  const sum = r + s + c;
  if (sum !== targetCount) {
    return {
      isValid: false,
      error: `A soma dos formatos manuais (${sum}) difere do total de publicações (${targetCount}). Ajuste os valores para somar exatamente ${targetCount}.`,
      reelsCount: r,
      staticCount: s,
      carouselCount: c,
      sum,
      targetCount,
    };
  }

  return {
    isValid: true,
    reelsCount: r,
    staticCount: s,
    carouselCount: c,
    sum,
    targetCount,
  };
}

export interface MergedSlot {
  date: string;
  isCommemorative: boolean;
  celebrationTitle?: string;
  isExtra?: boolean;
}

export interface MergedSlotsResult {
  regularCount: number;
  extraCount: number;
  totalCount: number;
  slots: MergedSlot[];
}

/**
 * Mescla as datas comemorativas selecionadas com os slots calculados (C03).
 * Restringe estritamente ao período [startDate, endDate].
 * Distingue slots regulares de extras comemorativas.
 */
export function mergeCommemorativeSlots({
  slots,
  celebrations,
  selectedCelebrationIds,
  startDate,
  endDate,
}: {
  slots: string[];
  celebrations: Array<{ id: string; title: string; date: string }>;
  selectedCelebrationIds: string[];
  startDate?: string;
  endDate?: string;
}): MergedSlot[] {
  // Filtra celebrações selecionadas com data estrita dentro do período
  const selectedHolidays = celebrations.filter((c) => {
    if (!selectedCelebrationIds.includes(c.id)) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) return false;
    if (startDate && c.date < startDate) return false;
    if (endDate && c.date > endDate) return false;
    return true;
  });

  const holidayByDate = new Map<string, string>();
  for (const h of selectedHolidays) {
    const existing = holidayByDate.get(h.date);
    holidayByDate.set(h.date, existing ? `${existing} / ${h.title}` : h.title);
  }

  const slotSet = new Set(slots);
  const result: MergedSlot[] = [];

  // Slots regulares (podem coincidir com comemoração)
  for (const slot of slots) {
    const holidayTitle = holidayByDate.get(slot);
    result.push({
      date: slot,
      isCommemorative: Boolean(holidayTitle),
      celebrationTitle: holidayTitle,
      isExtra: false,
    });
  }

  // Comemorações que não caíram em slots regulares entram como extras
  for (const [hDate, hTitle] of holidayByDate.entries()) {
    if (!slotSet.has(hDate)) {
      result.push({
        date: hDate,
        isCommemorative: true,
        celebrationTitle: hTitle,
        isExtra: true,
      });
    }
  }

  // Ordena por data
  return result.sort((a, b) => a.date.localeCompare(b.date));
}
