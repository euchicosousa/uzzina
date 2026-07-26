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
import { getFormattedPeopleName } from "~/lib/helpers";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import { cn } from "cnfast";
import type { Partner } from "~/types";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import { ComboboxTrigger } from "./ComboboxTrigger";
export function ResponsiblesCombobox({
  selectedResponsibles = [],
  currentPartners,
  onSelect,
  variant = "default",
  className,
  disabled = false,
}: {
  selectedResponsibles: string[];
  currentPartners: Partner[];
  onSelect?: (responsibles: string[]) => void;
  variant?: "default" | "filter";
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: allPeople = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
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
  const handleSelect = (userId: string) => {
    const isShiftPressed = (window.event as MouseEvent | undefined)?.shiftKey;
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
        className={cn(className, "overflow-hidden")}
        disabled={disabled}
        title={getFormattedPeopleName(currentResponsibles)}
        variant={variant === "filter" ? "filter" : "form-link"}
      >
        <ActionResponsiblesDisplay
          responsibles={selectedResponsibles}
          size={SIZE.sm}
          variant={variant}
        />
      </ComboboxTrigger>

      <PrismPopover className="w-[320px] p-0 border rounded-3xl squircle shadow-xl bg-popover overflow-hidden">
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
                  className="flex items-center gap-2 cursor-pointer"
                  isSelected={selected.includes(person.user_id)}
                  onAction={() => handleSelect(person.user_id)}
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
  variant = "default",
}: {
  responsibles: string[];
  size?: (typeof SIZE)[keyof typeof SIZE];
  variant?: "default" | "filter";
}) {
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const responsibles = Array.from(new Set(responsibles_))
    .map((r) => people.find((p) => p.user_id === r))
    .filter((p) => p !== undefined);
  return (
    <div className="flex items-center overflow-hidden gap-2 text-xs text-muted-foreground">
      {responsibles.length === 0 ? (
        variant === "filter" && (
          <>
            <User2Icon className="size-4" />
            <span className="truncate">Responsáveis</span>
          </>
        )
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
