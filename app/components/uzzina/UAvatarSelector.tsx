import { useState } from "react";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { toast } from "sonner";
type AvatarSize = (typeof SIZE)[keyof typeof SIZE];
export interface AvatarSelectorOption {
  id: string; // O ID ou Slug original que será enviado no form state
  fallback: string;
  image?: string | null;
  backgroundColor?: string;
  color?: string;
  title: string;
  subtitle?: string;
}
interface UAvatarSelectorProps {
  options: AvatarSelectorOption[];
  initialSelectedIds?: string[];
  selectedIds?: string[];
  name?: string; // Nome do input para FormData (ex: 'users_ids' ou 'partner_slugs')
  onChange?: (selectedIds: string[]) => void;
  minSelected?: number;
  avatarSize?: AvatarSize;
  showLabel?: boolean;
  className?: string;
  isDisabled?: boolean;
  ariaLabel?: string;
}
const DEFAULT_INITIAL_SELECTED_IDS: string[] = [];
export function UAvatarSelector({
  options,
  initialSelectedIds = DEFAULT_INITIAL_SELECTED_IDS,
  selectedIds: controlledSelectedIds,
  name,
  onChange,
  minSelected,
  avatarSize = SIZE.lg,
  showLabel = true,
  className,
  isDisabled = false,
  ariaLabel,
}: UAvatarSelectorProps) {
  const [uncontrolledSelectedIds, setUncontrolledSelectedIds] =
    useState<string[]>(initialSelectedIds);
  const selectedIds = controlledSelectedIds ?? uncontrolledSelectedIds;
  const isCompact = avatarSize === SIZE.sm || avatarSize === SIZE.xs;

  const toggleOption = (id: string) => {
    if (isDisabled) return;
    const isSelected = selectedIds.includes(id);
    let next: string[];
    if (isSelected) {
      if (minSelected !== undefined && selectedIds.length <= minSelected) {
        toast.warning(
          `Você precisa manter pelo menos ${minSelected} selecionado(s).`,
        );
        return;
      }
      next = selectedIds.filter((currentId) => currentId !== id);
    } else {
      next = [...selectedIds, id];
    }
    if (controlledSelectedIds === undefined) {
      setUncontrolledSelectedIds(next);
    }
    onChange?.(next);
  };
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "grid auto-rows-max grid-cols-2 content-start gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        className,
      )}
      role={ariaLabel ? "group" : undefined}
    >
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <button
            key={option.id}
            aria-label={showLabel ? undefined : option.title}
            aria-pressed={isSelected}
            className={cn(
              "relative flex flex-col items-center justify-center overflow-hidden border-t border-transparent ring-foreground/5 transition-all duration-500 outline-none squircle hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
              !showLabel
                ? "rounded-2xl p-2"
                : isCompact
                  ? "gap-1.5 rounded-2xl p-2.5"
                  : "gap-2 rounded-3xl p-4",
              isSelected
                ? "border-border bg-action text-foreground shadow-xs ring hover:bg-action-hover hover:shadow-lg"
                : "",
            )}
            disabled={isDisabled}
            onClick={() => toggleOption(option.id)}
            title={option.title}
            type="button"
          >
            <UAvatar
              backgroundColor={option.backgroundColor}
              color={option.color}
              fallback={option.fallback}
              image={option.image}
              size={avatarSize}
            />

            {showLabel && (
              <div className="flex w-full shrink-0 flex-col overflow-hidden text-center">
                <div className="w-full truncate text-sm leading-tight font-medium">
                  {option.title}
                </div>
                {option.subtitle && (
                  <div className="truncate text-xs leading-tight text-secondary-foreground">
                    {option.subtitle}
                  </div>
                )}
              </div>
            )}

            {isSelected && name && (
              <input name={name} type="hidden" value={option.id} />
            )}
          </button>
        );
      })}
    </div>
  );
}
