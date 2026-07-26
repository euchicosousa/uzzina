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
import { useAppContext } from "~/contexts/AppContext";
import { getFormattedPartnersName } from "~/lib/helpers";
import { cn } from "cnfast";
import type { Partner } from "~/types";
import { UAvatar, UAvatarGroup } from "../uzzina/UAvatar";
import { ComboboxTrigger } from "./ComboboxTrigger";
export function PartnersCombobox({
  selectedPartners = [],
  onSelect,
  tabIndex,
  showText,
  variant = "form-footer",
  disabled = false,
}: {
  selectedPartners?: string[];
  onSelect?: (partners: string[]) => void;
  tabIndex?: number;
  showText?: boolean;
  variant?: "filter" | "form-footer";
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { partners } = useAppContext();
  const currentPartners = selectedPartners
    .map((slug) => partners.find((partner) => partner.slug === slug))
    .filter((partner): partner is Partner => partner !== undefined);
  const hasSelection = currentPartners.length > 0;
  const handleSelect = (slug: string) => {
    const isShiftPressed = (window.event as MouseEvent | undefined)?.shiftKey;
    let newPartners: string[];
    if (isShiftPressed) {
      newPartners = [slug];
      setIsOpen(false);
    } else {
      newPartners = selectedPartners.includes(slug)
        ? selectedPartners.filter((s) => s !== slug)
        : [...selectedPartners, slug];
    }
    onSelect?.(newPartners);
  };
  return (
    <PrismPopoverTrigger
      isOpen={isOpen && !disabled}
      onOpenChange={(open) => !disabled && setIsOpen(open)}
    >
      <ComboboxTrigger
        className={cn("flex items-center gap-2 overflow-hidden")}
        disabled={disabled}
        hasSelection={hasSelection}
        tabIndex={tabIndex}
        title={getFormattedPartnersName(currentPartners) || "Parceiros"}
        variant={variant}
      >
        {hasSelection ? (
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
          <UAvatar fallback="PA" size="sm" />
        )}
        {showText && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            {hasSelection
              ? getFormattedPartnersName(currentPartners)
              : "Parceiros"}
          </div>
        )}
      </ComboboxTrigger>

      <PrismPopover className="w-[320px] p-0 border rounded-3xl squircle shadow-xl bg-popover overflow-hidden">
        <PrismCommand className="p-0">
          <PrismCommandInput placeholder="Procurar parceiro..." />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum parceiro encontrado.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {partners.map((partner) => (
                <PrismCommandItem
                  key={partner.id}
                  className="flex items-center gap-2 cursor-pointer"
                  isSelected={selectedPartners.includes(partner.slug)}
                  onAction={() => handleSelect(partner.slug)}
                  textValue={partner.title}
                >
                  <UAvatar
                    backgroundColor={partner.colors[0]}
                    color={partner.colors[1]}
                    fallback={partner.short}
                    image={partner.image}
                    size="sm"
                  />
                  <span className="truncate">{partner.title}</span>
                </PrismCommandItem>
              ))}
            </PrismCommandGroup>
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
