import type { Person, Partner } from "~/types";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import { CheckIcon, RabbitIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
  CommandSeparator,
} from "../ui/command";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";

interface SprintComboboxProps {
  selectedSprints: string[];
  responsibles: string[];
  currentPartners: Partner[];
  onSelect: (newSprints: string[], newResponsibles: string[]) => void;
  tabIndex?: number;
  className?: string;
  size?: "sm" | "lg";
}

export function SprintCombobox({
  selectedSprints,
  responsibles,
  currentPartners,
  onSelect,
  tabIndex,
  className,
  size = "lg",
}: SprintComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });

  const isShiftPressedRef = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center outline-none transition-colors",
            size === "sm"
              ? cn(
                "h-8 hover:bg-secondary text-xs justify-center",
                selectedSprints.length > 0 ? "px-1.5" : "w-8 p-0"
              )
              : cn(
                "hover:opacity-100 focus:opacity-100",
                selectedSprints.length > 0
                  ? "p-1 opacity-80"
                  : "p-2 opacity-50"
              ),
            className,
          )}
          title="Sprints"
          tabIndex={tabIndex}
        >
          {selectedSprints.length > 0 ? (
            <UAvatarGroup
              clampAt={2}
              size={size === "sm" ? "sm" : "md"}
              avatars={selectedPeople.map((person) => ({
                id: person.id,
                fallback: person.short,
                image: person.image,
              }))}
            />
          ) : (
            <RabbitIcon className="size-5 shrink-0" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Procurar usuário para sprint..." />
          <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
          <CommandList className="outline-none">
            {/* Responsible group */}
            {responsiblePeople.length > 0 && (
              <CommandGroup heading="Responsáveis">
                {responsiblePeople.map((person: Person) => (
                  <CommandItem
                    key={person.id}
                    className="flex cursor-pointer items-center gap-2"
                    onSelect={() => {
                      if (isShiftPressedRef.current) {
                        const newSprints = [person.user_id];
                        const newResponsibles = responsibles.includes(person.user_id)
                          ? responsibles
                          : [...responsibles, person.user_id];
                        onSelect(newSprints, newResponsibles);
                        setIsOpen(false);
                      } else {
                        let newSprints = [...selectedSprints];
                        const newResponsibles = [...responsibles];

                        if (newSprints.includes(person.user_id)) {
                          newSprints = newSprints.filter((id) => id !== person.user_id);
                        } else {
                          newSprints.push(person.user_id);
                          if (!newResponsibles.includes(person.user_id)) {
                            newResponsibles.push(person.user_id);
                          }
                        }
                        onSelect(newSprints, newResponsibles);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <UAvatar
                      fallback={person.short}
                      size="sm"
                      image={person.image}
                    />
                    <span className="text-sm font-medium">
                      {person.name} {person.surname}
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-auto size-4",
                        selectedSprints.includes(person.user_id)
                          ? "visible"
                          : "invisible",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {responsiblePeople.length > 0 &&
              nonResponsiblePeople.length > 0 && (
                <CommandSeparator className="my-1" />
              )}

            {/* Non-responsible group */}
            {nonResponsiblePeople.length > 0 && (
              <CommandGroup heading="Não estão na lista de responsáveis">
                {nonResponsiblePeople.map((person: Person) => (
                  <CommandItem
                    key={person.id}
                    className="flex cursor-pointer items-center gap-2"
                    onSelect={() => {
                      if (isShiftPressedRef.current) {
                        const newSprints = [person.user_id];
                        const newResponsibles = responsibles.includes(person.user_id)
                          ? responsibles
                          : [...responsibles, person.user_id];
                        onSelect(newSprints, newResponsibles);
                        setIsOpen(false);
                      } else {
                        let newSprints = [...selectedSprints];
                        const newResponsibles = [...responsibles];

                        if (newSprints.includes(person.user_id)) {
                          newSprints = newSprints.filter((id) => id !== person.user_id);
                        } else {
                          newSprints.push(person.user_id);
                          if (!newResponsibles.includes(person.user_id)) {
                            newResponsibles.push(person.user_id);
                          }
                        }
                        onSelect(newSprints, newResponsibles);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <UAvatar
                      fallback={person.short}
                      size="sm"
                      image={person.image}
                    />
                    <span className="text-sm font-medium">
                      {person.name} {person.surname}
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-auto size-4",
                        selectedSprints.includes(person.user_id)
                          ? "visible"
                          : "invisible",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
