import { useMemo } from "react";
import { cn } from "~/lib/utils";
import { SIZE } from "~/lib/CONSTANTS";
import type { Partner } from "~/types";
import { PrismButton } from "~/components/prism";
import { UAvatarSelector } from "~/components/uzzina/UAvatarSelector";

export interface UCelebrationPartnersSelectorProps {
  partners: Partner[];
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
  isLoading?: boolean;
  loadError?: string | null;
  onRetryLoad?: () => void;
  isDisabled?: boolean;
  listClassName?: string;
}

export function UCelebrationPartnersSelector({
  partners,
  selectedIds,
  onChange,
  isLoading = false,
  loadError = null,
  onRetryLoad,
  isDisabled = false,
  listClassName,
}: UCelebrationPartnersSelectorProps) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const partnerOptions = useMemo(
    () =>
      partners.map((partner) => ({
        id: partner.id,
        fallback: partner.short,
        image: partner.image,
        backgroundColor: partner.colors[0],
        color: partner.colors[1],
        title: partner.title,
      })),
    [partners],
  );

  const selectedCount = useMemo(
    () => partners.filter((partner) => selectedSet.has(partner.id)).length,
    [partners, selectedSet],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">
            Parceiros ativos
          </span>
          {!isLoading && !loadError && partners.length > 0 && (
            <span className="text-xs text-secondary-foreground">
              {selectedCount} de {partners.length}
            </span>
          )}
        </div>
        {!isLoading && !loadError && selectedCount > 0 && (
          <PrismButton
            type="button"
            variant="link"
            size="xs"
            isDisabled={isDisabled}
            onPress={() => onChange([])}
          >
            Limpar
          </PrismButton>
        )}
      </div>

      {isLoading ? (
        <p className="py-4 text-sm text-secondary-foreground" role="status">
          Carregando parceiros vinculados...
        </p>
      ) : loadError ? (
        <div className="flex flex-col items-start gap-2 py-2" role="alert">
          <p className="text-base text-error">{loadError}</p>
          {onRetryLoad && (
            <PrismButton
              type="button"
              size="sm"
              variant="outline"
              isDisabled={isDisabled}
              onPress={onRetryLoad}
            >
              Tentar novamente
            </PrismButton>
          )}
        </div>
      ) : partners.length === 0 ? (
        <p className="py-4 text-sm text-secondary-foreground">
          Nenhum parceiro ativo disponível.
        </p>
      ) : (
        <UAvatarSelector
          ariaLabel="Parceiros ativos"
          avatarSize={SIZE.md}
          className={cn(
            "min-h-0 grid-cols-5 gap-1.5 p-1 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-5",
            listClassName,
          )}
          isDisabled={isDisabled}
          onChange={onChange}
          options={partnerOptions}
          selectedIds={selectedIds}
          showLabel={false}
          variant={"ghost"}
        />
      )}
    </div>
  );
}
