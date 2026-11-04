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
import { UAvatar, UAvatarGroup } from "./UAvatar";
import {
  UComboboxTrigger,
  getTriggerAvatarPadding,
  getTriggerAvatarSize,
  type UComboboxTriggerProps,
} from "./UComboboxTrigger";

export interface UPartnersComboboxProps {
  selectedPartners?: string[];
  onSelect?: (partners: string[]) => void;
  tabIndex?: number;
  showText?: boolean;
  variant?: UComboboxTriggerProps["variant"];
  size?: UComboboxTriggerProps["size"];
  disabled?: boolean;
  allowAll?: boolean;
}

export function UPartnersCombobox({
  selectedPartners = [],
  onSelect,
  tabIndex,
  showText,
  variant,
  size,
  disabled = false,
  allowAll = false,
}: UPartnersComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { partners } = useAppContext();
  const currentPartners = selectedPartners
    .map((slug) => partners.find((partner) => partner.slug === slug))
    .filter((partner): partner is Partner => partner !== undefined);
  const hasSelection = currentPartners.length > 0;
  const footerAvatarSize = getTriggerAvatarSize(size);
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
      <UComboboxTrigger
        aria-label={getFormattedPartnersName(currentPartners) || emptyLabel}
        className={cn(
          allowAll &&
            (variant ?? "ghost") === "ghost" &&
            "w-40 max-w-full min-w-0 shrink gap-3",
          getTriggerAvatarPadding(size),
        )}
        disabled={disabled}
        tabIndex={tabIndex}
        title={getFormattedPartnersName(currentPartners) || emptyLabel}
        size={size}
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
            size={footerAvatarSize}
          />
        ) : (
          <UAvatar fallback="P" size={footerAvatarSize} />
        )}
        {showText && (
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            {hasSelection
              ? getFormattedPartnersName(currentPartners)
              : emptyLabel}
          </div>
        )}
      </UComboboxTrigger>

      <PrismPopover className="overflow-hidden p-0" size="lg">
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
