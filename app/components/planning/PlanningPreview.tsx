import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import type { CSSProperties } from "react";
import { CalendarGrid } from "~/components/features/Calendar";
import { PrismBadge } from "~/components/prism";
import { UIcons } from "~/components/uzzina/UIcons";
import { CATEGORIES } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";
import type { PlanFormat } from "~/lib/social-planning/types";
import { parseU } from "~/utils/date";

export const PLANNING_FORMAT_LABELS = {
  static: "Estático",
  carousel: "Carrossel",
  reels: "Reels",
} satisfies Record<PlanFormat, string>;

const calendarCategories = {
  static: CATEGORIES.post,
  carousel: CATEGORIES.carousel,
  reels: CATEGORIES.reels,
} satisfies Record<PlanFormat, (typeof CATEGORIES)[keyof typeof CATEGORIES]>;

export interface PlanningPreviewItem {
  format: PlanFormat;
  /** Celebration name; only set for commemorative slots. */
  celebrationTitle?: string;
}

export function PlanningPreview({
  formats,
  itemsByDate,
  period,
}: {
  formats: PlanFormat[];
  itemsByDate: ReadonlyMap<string, PlanningPreviewItem[]>;
  period: { start: string; end: string } | null;
}) {
  if (!formats.length) return null;

  const days = period
    ? eachDayOfInterval({
        start: startOfWeek(parseU(period.start), { weekStartsOn: 0 }),
        end: endOfWeek(parseU(period.end), { weekStartsOn: 0 }),
      })
    : [];

  return (
    <div className="min-w-0 px-6 py-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">
          {period ? "Prévia do calendário" : "Prévia da lista"}
        </h2>
        <p className="text-base text-secondary-foreground">
          {formats.length} {formats.length === 1 ? "conteúdo" : "conteúdos"}
        </p>
      </div>
      {period ? (
        <CalendarGrid compact>
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const isInPeriod = key >= period.start && key <= period.end;
            return (
              <div
                aria-label={format(day, "dd/MM/yyyy")}
                className="min-h-20 border-b border-border p-2"
                key={key}
                role="group"
              >
                <time
                  className={
                    isInPeriod
                      ? "text-sm font-medium"
                      : "text-sm text-secondary-foreground"
                  }
                  dateTime={key}
                >
                  {format(day, "dd/MM")}
                </time>
                <ul className="mt-1 grid items-start gap-1">
                  {itemsByDate.get(key)?.map((item, index) => {
                    const category = calendarCategories[item.format];
                    return (
                      <li
                        className={cn(
                          "flex w-full max-w-24 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border border-(--category-color)/50 bg-[color-mix(in_srgb,var(--category-color)_10%,transparent)] px-0.5 text-center text-(--category-ink) [--category-ink:color-mix(in_srgb,var(--category-color)_80%,black)] squircle dark:[--category-ink:color-mix(in_srgb,var(--category-color)_80%,white)]",
                          item.celebrationTitle ? "py-1.5" : "aspect-square",
                        )}
                        // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no persistent identity.
                        key={index}
                        style={
                          {
                            "--category-color": category.color,
                          } as CSSProperties
                        }
                      >
                        <UIcons
                          className="size-5 shrink-0"
                          slug={category.slug}
                        />
                        <span className="max-w-full truncate text-xs tracking-tight text-[color-mix(in_srgb,var(--category-ink)_75%,var(--foreground))]">
                          {PLANNING_FORMAT_LABELS[item.format]}
                        </span>
                        {item.celebrationTitle && (
                          <span
                            className="line-clamp-2 max-w-full text-sm leading-tight wrap-anywhere text-foreground"
                            title={item.celebrationTitle}
                          >
                            {item.celebrationTitle}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </CalendarGrid>
      ) : (
        <ol className="divide-y divide-border">
          {formats.map((item, index) => (
            <li
              className="flex items-center justify-between gap-2 py-2 text-sm"
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no persistent identity.
              key={index}
            >
              <span>Ideia {index + 1}</span>
              <PrismBadge variant="outline">
                {PLANNING_FORMAT_LABELS[item]}
              </PrismBadge>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
