import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMatches } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { getFormattedPeopleName } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";

export const ResponsiblesCombobox = ({
  selectedResponsibles,
  currentPartners,
  onSelect,
}: {
  selectedResponsibles: string[];
  currentPartners: Partner[];
  onSelect?: (responsibles: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  let { people } = useMatches()[1].loaderData as { people: Person[] };
  const [selected, setSelected] = useState<string[]>(
    selectedResponsibles || [],
  );
  let currentResponsibles = selected.map(
    (slug) => people.find((person) => person.user_id === slug)!,
  );

  people = people.filter((person) =>
    currentPartners
      .map((partner) => partner.users_ids.includes(person.user_id))
      .includes(true),
  );

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="cursor-pointer underline-offset-4 outline-none hover:underline"
          title={getFormattedPeopleName(currentResponsibles)}
        >
          <ActionResponsiblesDisplay
            responsibles={selectedResponsibles}
            size={SIZE.sm}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Procurar responsável..." />
          <CommandEmpty>Nenhum responsável encontrado.</CommandEmpty>
          <CommandList className="p-2 outline-none">
            {people.map((person) => (
              <CommandItem
                key={person.id}
                className={cn("flex items-center gap-2")}
                onSelect={() => {
                  if (isShiftPressedRef.current) {
                    setSelected([person.user_id]);
                    onSelect?.([person.user_id]);
                    setOpen(false);
                  } else {
                    let newResponsibles = [...selected];
                    if (selected.includes(person.user_id)) {
                      newResponsibles = newResponsibles.filter(
                        (slug) => slug !== person.user_id,
                      );
                    } else {
                      newResponsibles.push(person.user_id);
                    }

                    setSelected(newResponsibles);
                    onSelect?.(newResponsibles);
                    setOpen(false);
                  }
                }}
              >
                <UAvatar
                  fallback={person.name}
                  size="sm"
                  image={person.image}
                />
                {person.name}
                <CheckIcon
                  className={cn(
                    "ml-auto size-4",
                    selected?.includes(person.user_id)
                      ? "visible"
                      : "invisible",
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const ActionResponsiblesDisplay = ({
  responsibles: responsibles_,
  size = SIZE.md,
}: {
  responsibles: string[];
  size?: (typeof SIZE)[keyof typeof SIZE];
}) => {
  const { people } = useMatches()[1].loaderData as { people: Person[] };
  const responsibles = responsibles_
    .map((r) => people.find((p) => p.user_id === r))
    .filter((p) => p !== undefined);

  return (
    <div className="flex items-center gap-2">
      <UAvatarGroup
        avatars={responsibles.map((p) => ({
          image: p!.image,
          id: p!.id,
          fallback: p!.short,
        }))}
        size={size}
      />
      <div className="opacity-50">
        {responsibles.length > 1
          ? responsibles.map((p) => p.name).join(", ")
          : `${responsibles[0].name} ${responsibles[0].surname}`}
      </div>
    </div>
  );
};
