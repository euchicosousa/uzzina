import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMatches } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { getFormattedPartnersName } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";

export const PartnersCombobox = ({
  selectedPartners,
  onSelect,
}: {
  selectedPartners?: string[];
  onSelect?: (partners: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { partners } = useMatches()[1].loaderData as { partners: Partner[] };
  const [selected, setSelected] = useState<string[]>(selectedPartners || []);
  let currentPartners = selected.map(
    (slug) => partners.find((partner) => partner.slug === slug)!,
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
          className="hover:bg-secondary flex w-full items-center gap-2 overflow-hidden px-6 py-5.5 text-sm outline-none"
          title={getFormattedPartnersName(currentPartners)}
        >
          {selected.length > 0 ? (
            <UAvatarGroup
              clampAt={2}
              size="sm"
              avatars={currentPartners.map((partner) => ({
                id: partner.id,
                fallback: partner?.short,
                backgroundColor: partner?.colors[0],
                color: partner?.colors[1],
              }))}
            />
          ) : (
            <UAvatar size="sm" fallback="PR" />
          )}

          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            {getFormattedPartnersName(currentPartners)}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Procurar parceiro..." />
          <CommandEmpty>Nenhum parceiro encontrado.</CommandEmpty>
          <CommandList className="p-2 outline-none">
            {partners.map((partner) => (
              <CommandItem
                key={partner.id}
                className={cn("flex items-center gap-2")}
                onSelect={() => {
                  if (isShiftPressedRef.current) {
                    setSelected([partner.slug]);
                    onSelect?.([partner.slug]);
                    setOpen(false);
                  } else {
                    let newPartners = [...selected];
                    if (selected.includes(partner.slug)) {
                      newPartners = newPartners.filter(
                        (slug) => slug !== partner.slug,
                      );
                    } else {
                      newPartners.push(partner.slug);
                    }

                    setSelected(newPartners);
                    onSelect?.(newPartners);
                    setOpen(false);
                  }
                }}
              >
                <UAvatar
                  fallback={partner.short}
                  size="sm"
                  backgroundColor={partner.colors[0]}
                  color={partner.colors[1]}
                />
                {partner.title}
                <CheckIcon
                  className={cn(
                    "ml-auto size-4",
                    selected?.includes(partner.slug) ? "visible" : "invisible",
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
