import { useQuery } from "@tanstack/react-query";
import { RabbitIcon } from "lucide-react";
import { useState } from "react";
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
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import { cn } from "cnfast";
import type { Partner, Person } from "~/types";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import { ComboboxTrigger } from "./ComboboxTrigger";
interface SprintComboboxProps {
  selectedSprints: string[];
  responsibles: string[];
  currentPartners: Partner[];
  onSelect: (newSprints: string[], newResponsibles: string[]) => void;
  tabIndex?: number;
  className?: string;
  size?: "sm" | "lg";
  disabled?: boolean;
}
export function SprintCombobox({
  selectedSprints = [],
  responsibles = [],
  currentPartners,
  onSelect,
  tabIndex,
  className,
  size = "lg",
  disabled = false,
}: SprintComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });

  // Filter people to only those who have access to current partners
  const availablePeople = people.filter((person: Person) =>
    currentPartners.some((partner) =>
      partner.users_ids.includes(person.user_id),
    ),
  );

  // Group people into responsibles and non-responsibles
  const responsiblePeople = availablePeople.filter((p: Person) =>
    responsibles.includes(p.user_id),
  );
  const nonResponsiblePeople = availablePeople.filter(
    (p: Person) => !responsibles.includes(p.user_id),
  );
  const selectedPeople = selectedSprints
    .map((id) => people.find((p: Person) => p.user_id === id))
    .filter((p): p is Person => !!p);
  const handleSelect = (userId: string) => {
    const isShiftPressed = (window.event as MouseEvent | undefined)?.shiftKey;
    if (isShiftPressed) {
      const newSprints = [userId];
      const newResponsibles = responsibles.includes(userId)
        ? responsibles
        : [...responsibles, userId];
      onSelect(newSprints, newResponsibles);
      setIsOpen(false);
    } else {
      let newSprints = [...selectedSprints];
      const newResponsibles = [...responsibles];
      if (newSprints.includes(userId)) {
        newSprints = newSprints.filter((id) => id !== userId);
      } else {
        newSprints.push(userId);
        if (!newResponsibles.includes(userId)) {
          newResponsibles.push(userId);
        }
      }
      onSelect(newSprints, newResponsibles);
      setIsOpen(false);
    }
  };
  return (
    <PrismPopoverTrigger
      isOpen={isOpen && !disabled}
      onOpenChange={(open) => !disabled && setIsOpen(open)}
    >
      <ComboboxTrigger
        className={cn(
          size === "lg" &&
            cn(
              "hover:opacity-100 focus:opacity-100 rounded-xl",
              selectedSprints.length > 0 ? "p-1 opacity-80" : "p-2 opacity-50",
            ),
          className,
        )}
        disabled={disabled}
        size={size}
        tabIndex={tabIndex}
        title="Sprints"
        variant="form-inline"
      >
        {selectedSprints.length > 0 ? (
          <UAvatarGroup
            avatars={selectedPeople.map((person) => ({
              id: person.id,
              fallback: person.short,
              image: person.image,
            }))}
            clampAt={2}
            size={size === "sm" ? "sm" : "md"}
          />
        ) : (
          <RabbitIcon className="size-5 shrink-0" />
        )}
      </ComboboxTrigger>

      <PrismPopover
        className="w-75 p-0 border rounded-3xl squircle shadow-xl bg-popover overflow-hidden"
        placement="bottom end"
      >
        <PrismCommand className="p-0">
          <PrismCommandInput placeholder="Procurar usuário para sprint..." />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum usuário encontrado.</PrismCommandEmpty>
            )}
          >
            {/* Responsible group */}
            {responsiblePeople.length > 0 && (
              <PrismCommandGroup heading="Responsáveis">
                {responsiblePeople.map((person: Person) => (
                  <PrismCommandItem
                    key={person.id}
                    className="flex cursor-pointer items-center gap-2"
                    isSelected={selectedSprints.includes(person.user_id)}
                    onAction={() => handleSelect(person.user_id)}
                    textValue={`${person.name} ${person.surname}`}
                  >
                    <UAvatar
                      fallback={person.short}
                      image={person.image}
                      size="sm"
                    />
                    <span className="truncate">
                      {person.name} {person.surname}
                    </span>
                  </PrismCommandItem>
                ))}
              </PrismCommandGroup>
            )}

            {responsiblePeople.length > 0 &&
              nonResponsiblePeople.length > 0 && (
                <PrismCommandSeparator className="-mx-2 my-1" />
              )}

            {/* Non-responsible group */}
            {nonResponsiblePeople.length > 0 && (
              <PrismCommandGroup heading="Não estão na lista de responsáveis">
                {nonResponsiblePeople.map((person: Person) => (
                  <PrismCommandItem
                    key={person.id}
                    className="flex cursor-pointer items-center gap-2"
                    isSelected={selectedSprints.includes(person.user_id)}
                    onAction={() => handleSelect(person.user_id)}
                    textValue={`${person.name} ${person.surname}`}
                  >
                    <UAvatar
                      fallback={person.short}
                      image={person.image}
                      size="sm"
                    />
                    <span className="truncate">
                      {person.name} {person.surname}
                    </span>
                  </PrismCommandItem>
                ))}
              </PrismCommandGroup>
            )}
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
