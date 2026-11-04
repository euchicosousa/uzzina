import { useAppContext } from "~/contexts/AppContext";
import { User2Icon, ZapIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "cnfast";
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
  UComboboxTrigger,
  getTriggerAvatarPadding,
  getTriggerAvatarSize,
  getTriggerContentSizeClass,
  type UComboboxTriggerProps,
} from "./UComboboxTrigger";
import { UAvatar, UAvatarGroup } from "./UAvatar";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import { getFormattedPeopleName } from "~/utils";
import type { Partner, Person } from "~/types";

export type PeopleComboboxMode = "responsibles" | "sprint";

export interface UPeopleComboboxProps {
  /**
   * Operational mode:
   * - "responsibles": multi-select keeps popover open and updates the responsibles list.
   * - "sprint": selection closes popover; adding someone outside responsibles adds to both;
   *   removing from sprint preserves responsibility; Shift makes only sprint exclusive.
   */
  mode?: PeopleComboboxMode;
  /** Shorthand boolean equivalent for mode="sprint" */
  isSprint?: boolean;

  /** Active partners used to filter available people */
  currentPartners?: Partner[];

  /** Selected user IDs in active mode (sprints in sprint mode, responsibles in responsibles mode) */
  selected?: string[];
  /** Explicit alias for selected in responsibles mode */
  selectedResponsibles?: string[];
  /** Explicit alias for selected in sprint mode */
  selectedSprints?: string[];

  /**
   * Responsibles list.
   * Used in sprint mode to categorize users and update responsibles when adding sprint users.
   */
  responsibles?: string[];

  /**
   * Selection callback:
   * - Responsibles mode: called with (newResponsibles, newResponsibles).
   * - Sprint mode: called with (newSprints, newResponsibles).
   */
  onSelect?: (
    selected: string[],
    responsibles: string[],
  ) => void | Promise<void>;

  disabled?: boolean;
  tabIndex?: number;
  variant?: UComboboxTriggerProps["variant"];
  size?: UComboboxTriggerProps["size"];
  className?: string;
  placement?: Parameters<typeof PrismPopover>[0]["placement"];
  placeholder?: string;
  "aria-label"?: string;
  title?: string;
  clampAt?: number;
}

export function UPeopleCombobox({
  mode = "responsibles",
  isSprint = false,
  currentPartners,
  selected,
  selectedResponsibles,
  selectedSprints,
  responsibles,
  onSelect,
  disabled = false,
  tabIndex,
  variant,
  size,
  className,
  placement,
  placeholder,
  "aria-label": ariaLabelProp,
  title: titleProp,
  clampAt,
}: UPeopleComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { person } = useAppContext();
  const isSprintMode = mode === "sprint" || Boolean(isSprint);

  const { data: allPeople = [] } = useQuery({
    queryKey: QUERY_KEYS.people(person?.user_id ?? ""),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
    enabled: Boolean(person?.user_id),
  });

  const availablePeople = currentPartners
    ? allPeople.filter((p: Person) =>
        currentPartners.some((partner) =>
          partner.users_ids?.includes(p.user_id),
        ),
      )
    : allPeople;

  const rawSelected = isSprintMode
    ? (selectedSprints ?? selected ?? [])
    : (selectedResponsibles ?? selected ?? []);
  const selectedUnique = Array.from(new Set(rawSelected));

  const responsiblesList = Array.from(
    new Set(responsibles ?? (isSprintMode ? [] : selectedUnique)),
  );

  const responsiblePeople = availablePeople.filter((p: Person) =>
    responsiblesList.includes(p.user_id),
  );
  const nonResponsiblePeople = availablePeople.filter(
    (p: Person) => !responsiblesList.includes(p.user_id),
  );

  const currentSelectedPeople = selectedUnique
    .map((userId) => allPeople.find((p: Person) => p.user_id === userId))
    .filter((p): p is Person => p !== undefined);

  const isIconOnly = typeof size === "string" && size.startsWith("icon");
  const avatarSize = getTriggerAvatarSize(size);
  const contentSizeClass = getTriggerContentSizeClass(size);
  const Icon = isSprintMode ? ZapIcon : User2Icon;
  const defaultLabel = isSprintMode ? "Sprints" : "Responsáveis";
  const defaultTitle =
    currentSelectedPeople.length > 0
      ? getFormattedPeopleName(currentSelectedPeople)
      : defaultLabel;

  const inputPlaceholder =
    placeholder ??
    (isSprintMode
      ? "Procurar usuário para sprint..."
      : "Procurar responsável...");
  const emptyText = isSprintMode
    ? "Nenhum usuário encontrado."
    : "Nenhum responsável encontrado.";

  const effectiveVariant = variant ?? (isSprintMode ? "ghost" : "link");
  const triggerPadding =
    effectiveVariant === "link" || isIconOnly
      ? undefined
      : getTriggerAvatarPadding(size);

  const handleSelect = (userId: string, isShiftPressed: boolean) => {
    if (isSprintMode) {
      if (isShiftPressed) {
        const nextSprints = [userId];
        const nextResponsibles = responsiblesList.includes(userId)
          ? responsiblesList
          : [...responsiblesList, userId];
        onSelect?.(nextSprints, nextResponsibles);
        setIsOpen(false);
      } else {
        let nextSprints = [...selectedUnique];
        const nextResponsibles = [...responsiblesList];
        if (nextSprints.includes(userId)) {
          nextSprints = nextSprints.filter((id) => id !== userId);
        } else {
          nextSprints.push(userId);
          if (!nextResponsibles.includes(userId)) {
            nextResponsibles.push(userId);
          }
        }
        onSelect?.(nextSprints, nextResponsibles);
        setIsOpen(false);
      }
    } else {
      let nextResponsibles: string[];
      if (isShiftPressed) {
        nextResponsibles = [userId];
        setIsOpen(false);
      } else {
        nextResponsibles = selectedUnique.includes(userId)
          ? selectedUnique.filter((slug) => slug !== userId)
          : [...selectedUnique, userId];
      }
      onSelect?.(nextResponsibles, nextResponsibles);
    }
  };

  const renderCommandItem = (targetPerson: Person) => {
    const isSelected = selectedUnique.includes(targetPerson.user_id);
    const itemLabel = isSprintMode
      ? `${targetPerson.name}${targetPerson.surname ? ` ${targetPerson.surname}` : ""}`
      : targetPerson.name;

    return (
      <PrismCommandItem
        key={targetPerson.id}
        className="flex cursor-pointer items-center gap-2"
        data-selected={isSelected ? "true" : undefined}
        onAction={({ shiftKey }) =>
          handleSelect(targetPerson.user_id, shiftKey)
        }
        textValue={itemLabel}
      >
        <UAvatar
          fallback={isSprintMode ? targetPerson.short : targetPerson.name}
          image={targetPerson.image}
          size="sm"
        />
        <span className="truncate">{itemLabel}</span>
      </PrismCommandItem>
    );
  };

  return (
    <PrismPopoverTrigger
      isOpen={isOpen && !disabled}
      onOpenChange={(open) => !disabled && setIsOpen(open)}
    >
      <UComboboxTrigger
        aria-label={ariaLabelProp ?? defaultLabel}
        className={cn(triggerPadding, className)}
        disabled={disabled}
        size={size}
        tabIndex={tabIndex}
        title={titleProp ?? defaultTitle}
        variant={effectiveVariant}
      >
        {isIconOnly ? (
          currentSelectedPeople.length > 0 ? (
            <UAvatarGroup
              avatars={currentSelectedPeople.map((p) => ({
                id: p.id,
                fallback: p.short,
                image: p.image,
              }))}
              clampAt={clampAt ?? 2}
              size={avatarSize}
            />
          ) : (
            <Icon className={contentSizeClass} />
          )
        ) : (
          <div className="flex items-center gap-2 overflow-hidden">
            {currentSelectedPeople.length === 0 ? (
              <>
                <Icon className={contentSizeClass} />
                <span className="truncate">{defaultLabel}</span>
              </>
            ) : (
              <>
                <UAvatarGroup
                  avatars={currentSelectedPeople.map((p) => ({
                    id: p.id,
                    fallback: p.short,
                    image: p.image,
                  }))}
                  clampAt={clampAt}
                  size={avatarSize}
                />
                <div className="truncate">
                  {currentSelectedPeople.length > 1
                    ? currentSelectedPeople.map((p) => p.name).join(", ")
                    : `${currentSelectedPeople[0]?.name} ${currentSelectedPeople[0]?.surname}`}
                </div>
              </>
            )}
          </div>
        )}
      </UComboboxTrigger>

      <PrismPopover
        className="overflow-hidden p-0"
        placement={placement ?? (isSprintMode ? "bottom end" : undefined)}
        size="lg"
      >
        <PrismCommand className="p-0">
          <PrismCommandInput placeholder={inputPlaceholder} />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>{emptyText}</PrismCommandEmpty>
            )}
          >
            {isSprintMode ? (
              <>
                {responsiblePeople.length > 0 && (
                  <PrismCommandGroup heading="Responsáveis">
                    {responsiblePeople.map((p) => renderCommandItem(p))}
                  </PrismCommandGroup>
                )}

                {responsiblePeople.length > 0 &&
                  nonResponsiblePeople.length > 0 && (
                    <PrismCommandSeparator className="-mx-2 my-1" />
                  )}

                {nonResponsiblePeople.length > 0 && (
                  <PrismCommandGroup heading="Não estão na lista de responsáveis">
                    {nonResponsiblePeople.map((p) => renderCommandItem(p))}
                  </PrismCommandGroup>
                )}
              </>
            ) : (
              <PrismCommandGroup>
                {availablePeople.map((p) => renderCommandItem(p))}
              </PrismCommandGroup>
            )}
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
