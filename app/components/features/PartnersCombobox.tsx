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
import { getFormattedPartnersName } from "~/utils";
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
  allowAll = false,
}: {
  selectedPartners?: string[];
  onSelect?: (partners: string[]) => void;
  tabIndex?: number;
  showText?: boolean;
  variant?: "filter" | "form-footer";
  disabled?: boolean;
  allowAll?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { partners } = useAppContext();
  const currentPartners = selectedPartners
    .map((slug) => partners.find((partner) => partner.slug === slug))
    .filter((partner): partner is Partner => partner !== undefined);
  const hasSelection = currentPartners.length > 0;
  const emptyLabel = allowAll ? "Todos os parceiros" : "Parceiros";
  const handleSelect = (slug: string, isShiftPressed: boolean) => {
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
        aria-label={getFormattedPartnersName(currentPartners) || emptyLabel}
        className={cn(
          "flex items-center gap-2 overflow-hidden",
          allowAll &&
            variant === "filter" &&
            "max-w-full min-w-0 shrink border-0 px-2 font-normal focus-visible:border-transparent focus-visible:ring-0",
        )}
        disabled={disabled}
        hasSelection={hasSelection}
        tabIndex={tabIndex}
        title={getFormattedPartnersName(currentPartners) || emptyLabel}
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
          <UAvatar fallback="P" size="sm" />
        )}
        {showText && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            {hasSelection
              ? getFormattedPartnersName(currentPartners)
              : emptyLabel}
          </div>
        )}
      </ComboboxTrigger>

      <PrismPopover
        className={cn(
          "w-[320px] overflow-hidden rounded-3xl border bg-popover p-0 shadow-xl squircle",
          allowAll && "ring-0",
        )}
      >
        <PrismCommand className="p-0">
          <PrismCommandInput placeholder="Procurar parceiro..." />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum parceiro encontrado.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {allowAll && (
                <PrismCommandItem
                  id="all-partners"
                  textValue="Todos os parceiros"
                  data-selected={
                    selectedPartners.length === 0 ? "true" : undefined
                  }
                  onAction={() => {
                    onSelect?.([]);
                    setIsOpen(false);
                  }}
                >
                  Todos os parceiros
                </PrismCommandItem>
              )}
              {partners.map((partner) => (
                <PrismCommandItem
                  key={partner.id}
                  shouldCloseOnSelect={!allowAll}
                  className="flex cursor-pointer items-center gap-2"
                  data-selected={
                    selectedPartners.includes(partner.slug) ? "true" : undefined
                  }
                  onAction={({ shiftKey }) =>
                    handleSelect(partner.slug, shiftKey)
                  }
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
