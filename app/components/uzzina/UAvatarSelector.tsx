import { useState, type ComponentProps } from "react";
import { PrismToggle } from "~/components/prism";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "cnfast";
import { toast } from "sonner";
type AvatarSize = (typeof SIZE)[keyof typeof SIZE];
type ToggleVariant = ComponentProps<typeof PrismToggle>["variant"];
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
  variant?: ToggleVariant;
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
  variant = "secondary",
  className,
  isDisabled = false,
  ariaLabel,
}: UAvatarSelectorProps) {
  const [uncontrolledSelectedIds, setUncontrolledSelectedIds] =
    useState<string[]>(initialSelectedIds);
  const selectedIds = controlledSelectedIds ?? uncontrolledSelectedIds;
  const isCompact = avatarSize === SIZE.sm || avatarSize === SIZE.xs;
  const toggleSize = !showLabel
    ? isCompact
      ? "icon"
      : "icon-lg"
    : isCompact
      ? "default"
      : "lg";

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
          <PrismToggle
            key={option.id}
            aria-label={showLabel ? undefined : option.title}
            className={cn(
              !showLabel
                ? "justify-self-center"
                : isCompact
                  ? "h-auto w-full flex-col gap-1.5 rounded-2xl p-2.5"
                  : "h-auto w-full flex-col gap-2 rounded-3xl p-4",
            )}
            isDisabled={isDisabled}
            isSelected={isSelected}
            onChange={() => toggleOption(option.id)}
            size={toggleSize}
            variant={variant}
          >
            <span
              className={cn(
                "flex flex-col items-center overflow-hidden",
                showLabel && (isCompact ? "w-full gap-1.5" : "w-full gap-2"),
              )}
              title={option.title}
            >
              <UAvatar
                backgroundColor={option.backgroundColor}
                color={option.color}
                fallback={option.fallback}
                image={option.image}
                size={avatarSize}
              />

              {showLabel && (
                <span className="flex w-full shrink-0 flex-col overflow-hidden text-center">
                  <span className="w-full truncate text-sm leading-tight font-medium">
                    {option.title}
                  </span>
                  {option.subtitle && (
                    <span
                      className={cn(
                        "truncate text-xs leading-tight text-secondary-foreground",
                        variant === "secondary" &&
                          "group-data-selected/toggle:text-primary-foreground/70",
                      )}
                    >
                      {option.subtitle}
                    </span>
                  )}
                </span>
              )}
            </span>
          </PrismToggle>
        );
      })}
      {name &&
        selectedIds.map((id) => (
          <input key={id} name={name} type="hidden" value={id} />
        ))}
    </div>
  );
}
