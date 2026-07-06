import { useCallback, useEffect, useRef, useState } from "react";
import { useMatches } from "react-router";
import { CheckIcon } from "lucide-react";
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
import { ComboboxTrigger } from "./ComboboxTrigger";
export function PartnersCombobox({
  selectedPartners,
  onSelect,
  tabIndex,
  showText,
  variant = "form-footer",
}: {
  selectedPartners?: string[];
  onSelect?: (partners: string[]) => void;
  tabIndex?: number;
  showText?: boolean;
  variant?: "filter" | "form-footer";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { partners } = useMatches()[1].loaderData as {
    partners: Partner[];
  };
  const [selected, setSelected] = useState<string[]>(selectedPartners || []);
  // Keep a ref so the memoized handleSelect callback always reads the latest
  // selected array without being recreated on every render.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const currentPartners = selected
    .map((slug) => partners.find((partner) => partner.slug === slug))
    .filter((partner): partner is Partner => partner !== undefined);

  // Stable per-partner callback — only recreated when partner.slug changes
  // (i.e. never, since slugs are static). This prevents cmdk from
  // re-registering items on every render and calling setState in a loop.
  const handleSelect = useCallback(
    (slug: string) => {
      const current = selectedRef.current;
      let newPartners: string[];
      if (isShiftPressedRef.current) {
        newPartners = [slug];
        setIsOpen(false);
      } else {
        newPartners = current.includes(slug)
          ? current.filter((s) => s !== slug)
          : [...current, slug];
        setIsOpen(false);
      }
      setSelected(newPartners);
      onSelect?.(newPartners);
    },
    // onSelect is from parent — stabilise with useCallback there if needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSelect],
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

  const shouldShowText = showText !== undefined ? showText : variant !== "filter";

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <ComboboxTrigger
          tabIndex={tabIndex}
          title={getFormattedPartnersName(currentPartners) || "Parceiros"}
          variant={variant}
          hasSelection={selected.length > 0}
        >
          {selected.length > 0 ? (
            <UAvatarGroup
              avatars={currentPartners.map((partner) => ({
                id: partner.id,
                fallback: partner?.short,
                image: partner.image,
                backgroundColor: partner?.colors[0],
                color: partner?.colors[1],
              }))}
              clampAt={2}
              size="sm"
            />
          ) : (
            <UAvatar fallback="PR" size="sm" />
          )}
          {shouldShowText && currentPartners.length > 0 && (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
              {getFormattedPartnersName(currentPartners)}
            </div>
          )}
        </ComboboxTrigger>
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
                onSelect={() => handleSelect(partner.slug)}
                value={partner.slug}
              >
                <UAvatar
                  backgroundColor={partner.colors[0]}
                  color={partner.colors[1]}
                  fallback={partner.short}
                  image={partner.image}
                  size="sm"
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
}
