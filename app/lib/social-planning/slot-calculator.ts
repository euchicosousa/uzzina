import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  getDay,
  parseISO,
} from "date-fns";
import type { PlanFormat } from "./types";

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

export const MAX_PLANNING_PERIOD_DAYS = 60;
export const PLANNING_PERIOD_LIMIT_MESSAGE = `Selecione um período de até ${MAX_PLANNING_PERIOD_DAYS} dias.`;

export function isPlanningPeriodTooLong(start: Date, end: Date) {
  return differenceInCalendarDays(end, start) >= MAX_PLANNING_PERIOD_DAYS;
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

  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    format(start, "yyyy-MM-dd") !== startDate ||
    format(end, "yyyy-MM-dd") !== endDate
  ) {
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

  if (isPlanningPeriodTooLong(start, end)) {
    return {
      isValid: false,
      error: PLANNING_PERIOD_LIMIT_MESSAGE,
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

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (start > end) return [];

  const targetDayIndices = new Set(
    selectedDays
      .map((d) => DAY_ID_TO_INDEX[d])
      .filter((idx) => idx !== undefined),
  );

  if (targetDayIndices.size === 0) return [];

  const preferredDays = [...targetDayIndices].sort((a, b) => a - b);
  const base = Math.floor(postsPerWeek / preferredDays.length);
  const remainder = postsPerWeek % preferredDays.length;
  const extraPositions = new Set(
    Array.from({ length: remainder }, (_, index) =>
      remainder === 1
        ? 0
        : Math.round((index * (preferredDays.length - 1)) / (remainder - 1)),
    ),
  );
  const countsByDay = new Map(
    preferredDays.map((day, index) => [
      day,
      base + Number(extraPositions.has(index)),
    ]),
  );

  return eachDayOfInterval({ start, end }).flatMap((day) =>
    Array.from({ length: countsByDay.get(getDay(day)) ?? 0 }, () =>
      format(day, "yyyy-MM-dd"),
    ),
  );
}

export const PLANNING_FORMATS = ["static", "carousel", "reels"] as const;
export type PlanningFormatCounts = [number, number, number];

export function normalizePlanningFormats(
  total: number,
  previous: PlanningFormatCounts | null,
): PlanningFormatCounts {
  const weights: PlanningFormatCounts = previous?.some(Boolean)
    ? previous
    : [1, 1, 1];
  const sum = weights.reduce((result, weight) => result + weight, 0);
  const amounts = weights.map((weight) => (total * weight) / sum);
  const counts: PlanningFormatCounts = [
    Math.floor(amounts[0]),
    Math.floor(amounts[1]),
    Math.floor(amounts[2]),
  ];
  const remainder = total - counts.reduce((result, count) => result + count, 0);
  const ranked = ([0, 1, 2] as const)
    .slice()
    .sort((a, b) => amounts[b] - counts[b] - (amounts[a] - counts[a]) || a - b);
  for (const index of ranked.slice(0, remainder)) counts[index]++;
  return counts;
}

export function redistributePlanningFormats(
  baseline: PlanningFormatCounts,
  index: 0 | 1 | 2,
  quantity: number,
): PlanningFormatCounts {
  const counts: PlanningFormatCounts = [...baseline];
  const [higher, lower] = ([0, 1, 2] as const).filter(
    (candidate) => candidate !== index,
  );
  const delta = quantity - counts[index];
  counts[index] = quantity;
  if (delta < 0) {
    const higherShare = Math.round((-delta * 2) / 3);
    counts[higher] += higherShare;
    counts[lower] += -delta - higherShare;
  } else {
    const lowerShare = Math.min(
      counts[lower],
      Math.max(Math.round((delta * 2) / 3), delta - counts[higher]),
    );
    counts[lower] -= lowerShare;
    counts[higher] -= delta - lowerShare;
  }
  return counts;
}

export function sequencePlanningFormats(
  counts: PlanningFormatCounts,
): PlanFormat[] {
  const total = counts.reduce((result, count) => result + count, 0);
  const used: PlanningFormatCounts = [0, 0, 0];
  return Array.from({ length: total }, (_, position) => {
    const ranked = ([0, 1, 2] as const).filter(
      (index) => used[index] < counts[index],
    );
    const [choice] = ranked.sort(
      (a, b) =>
        (position + 1) * (counts[b] - counts[a]) -
          total * (used[b] - used[a]) || a - b,
    );
    used[choice]++;
    return PLANNING_FORMATS[choice];
  });
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
 * Merges the selected celebrations with the calculated regular slots (C03).
 * Strictly limited to [startDate, endDate]. Every selected celebration enters,
 * including several on the same day: each one is its own slot with its own title.
 *
 * With `replaceRegularPost` (default), the first celebration of a day that already
 * has a regular post takes over that post; the others on that day are extras.
 * Without it, every celebration is an extra on top of the regular posts.
 */
export function mergeCommemorativeSlots({
  slots,
  celebrations,
  selectedCelebrationIds,
  startDate,
  endDate,
  replaceRegularPost = true,
}: {
  slots: string[];
  celebrations: Array<{ id: string; title: string; date: string }>;
  selectedCelebrationIds: string[];
  startDate?: string;
  endDate?: string;
  replaceRegularPost?: boolean;
}): MergedSlot[] {
  const selectedHolidays = celebrations.filter((c) => {
    if (!selectedCelebrationIds.includes(c.id)) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) return false;
    if (startDate && c.date < startDate) return false;
    if (endDate && c.date > endDate) return false;
    return true;
  });

  const tookOver = new Set<string>();
  const regularDates = new Set(slots);
  const extras: MergedSlot[] = [];
  const takeovers = new Map<string, string>();
  for (const h of selectedHolidays) {
    if (
      replaceRegularPost &&
      regularDates.has(h.date) &&
      !tookOver.has(h.date)
    ) {
      tookOver.add(h.date);
      takeovers.set(h.date, h.title);
      continue;
    }
    extras.push({
      date: h.date,
      isCommemorative: true,
      celebrationTitle: h.title,
      isExtra: true,
    });
  }

  const regular: MergedSlot[] = slots.map((slot) => {
    const title = takeovers.get(slot);
    return {
      date: slot,
      isCommemorative: title !== undefined,
      celebrationTitle: title,
      isExtra: false,
    };
  });

  return [...regular, ...extras].sort((a, b) => a.date.localeCompare(b.date));
}
