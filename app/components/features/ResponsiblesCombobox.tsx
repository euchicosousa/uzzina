import { useAppContext } from "~/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { User2Icon } from "lucide-react";
import { useState } from "react";
import {
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { SIZE } from "~/lib/CONSTANTS";
import { getFormattedPeopleName } from "~/utils";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import type { Partner } from "~/types";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import {
  ComboboxTrigger,
  getTriggerAvatarPadding,
  getTriggerAvatarSize,
  type ComboboxTriggerProps,
} from "./ComboboxTrigger";
export function ResponsiblesCombobox({
  selectedResponsibles = [],
  currentPartners,
  onSelect,
  disabled = false,
  variant,
  size,
}: {
  selectedResponsibles: string[];
  currentPartners: Partner[];
  onSelect?: (responsibles: string[]) => void;
  disabled?: boolean;
  variant?: ComboboxTriggerProps["variant"];
  size?: ComboboxTriggerProps["size"];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { person } = useAppContext();
  const { data: allPeople = [] } = useQuery({
    queryKey: QUERY_KEYS.people(person.user_id),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const selected = Array.from(new Set(selectedResponsibles || []));
  const currentResponsibles = selected
    .map((slug) => allPeople.find((person) => person.user_id === slug))
    .filter(
      (person): person is (typeof allPeople)[number] => person !== undefined,
    );
  const peopleFiltered = allPeople.filter((person) =>
    currentPartners
      .map((partner) => partner.users_ids.includes(person.user_id))
      .includes(true),
  );
  const handleSelect = (userId: string, isShiftPressed: boolean) => {
    let newResponsibles: string[];
    if (isShiftPressed) {
      newResponsibles = [userId];
      setIsOpen(false);
    } else {
      newResponsibles = selected.includes(userId)
        ? selected.filter((slug) => slug !== userId)
        : [...selected, userId];
    }
    onSelect?.(newResponsibles);
  };
  return (
    <PrismPopoverTrigger
      isOpen={isOpen && !disabled}
      onOpenChange={(open) => !disabled && setIsOpen(open)}
    >
      <ComboboxTrigger
        aria-label="Responsáveis"
        disabled={disabled}
        title={getFormattedPeopleName(currentResponsibles)}
        className={
          (variant ?? "link") === "link"
            ? undefined
            : getTriggerAvatarPadding(size)
        }
        size={size}
        variant={variant ?? "link"}
      >
        <ActionResponsiblesDisplay
          responsibles={selectedResponsibles}
          size={getTriggerAvatarSize(size)}
        />
      </ComboboxTrigger>

      <PrismPopover className="overflow-hidden p-0" size="lg">
        <PrismCommand className="p-0">
          <PrismCommandInput placeholder="Procurar responsável..." />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>
                Nenhum responsável encontrado.
              </PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {peopleFiltered.map((person) => (
                <PrismCommandItem
                  key={person.id}
                  className="flex cursor-pointer items-center gap-2"
                  data-selected={
                    selected.includes(person.user_id) ? "true" : undefined
                  }
                  onAction={({ shiftKey }) =>
                    handleSelect(person.user_id, shiftKey)
                  }
                  textValue={person.name}
                >
                  <UAvatar
                    fallback={person.name}
                    image={person.image}
                    size="sm"
                  />
                  <span className="truncate">{person.name}</span>
                </PrismCommandItem>
              ))}
            </PrismCommandGroup>
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
function ActionResponsiblesDisplay({
  responsibles: responsibles_,
  size = SIZE.md,
}: {
  responsibles: string[];
  size?: (typeof SIZE)[keyof typeof SIZE];
}) {
  const { person } = useAppContext();
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(person.user_id),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const responsibles = Array.from(new Set(responsibles_))
    .map((r) => people.find((p) => p.user_id === r))
    .filter((p) => p !== undefined);
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      {responsibles.length === 0 ? (
        <>
          <User2Icon />
          <span className="truncate">Responsáveis</span>
        </>
      ) : (
        <>
          <UAvatarGroup
            avatars={responsibles.map((p) => ({
              image: p?.image,
              id: p?.id,
              fallback: p?.short,
            }))}
            size={size}
          />
          <div className="truncate">
            {responsibles.length > 1
              ? responsibles.map((p) => p.name).join(", ")
              : `${responsibles[0]?.name} ${responsibles[0]?.surname}`}
          </div>
        </>
      )}
    </div>
  );
}
