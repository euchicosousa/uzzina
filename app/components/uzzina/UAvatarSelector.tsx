import { useState } from "react";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

export interface AvatarSelectorOption {
  id: string; // O ID ou Slug original que será enviado no form state
  fallback: string;
  image?: string;
  backgroundColor?: string;
  color?: string;
  title: string;
  subtitle?: string;
}

interface UAvatarSelectorProps {
  options: AvatarSelectorOption[];
  initialSelectedIds?: string[];
  name: string; // Nome do input para FormData (ex: 'users_ids' ou 'partner_slugs')
  isSquircle?: boolean;
}

export function UAvatarSelector({
  options,
  initialSelectedIds = [],
  name,
  isSquircle = false,
}: UAvatarSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const toggleOption = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((currentId) => currentId !== id);
      } else {
        return [...current, id];
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleOption(option.id)}
            className={cn(
              "hover:bg-muted/50 relative flex flex-col items-center gap-2 overflow-hidden rounded-lg p-4 transition-all",
              isSelected ? "text-foreground bg-muted" : "opacity-50",
            )}
          >
            <UAvatar
              image={option.image}
              fallback={option.fallback}
              backgroundColor={option.backgroundColor}
              color={option.color}
              size={SIZE.lg}
              isSquircle={isSquircle}
            />

            <div className="flex w-full flex-col overflow-hidden text-center">
              <div className="w-full truncate text-sm leading-none font-medium">
                {option.title}
              </div>
              {option.subtitle && (
                <div className="text-muted-foreground truncate text-xs leading-tight">
                  {option.subtitle}
                </div>
              )}
            </div>

            {isSelected && (
              <input type="hidden" name={name} value={option.id} />
            )}
          </button>
        );
      })}
    </div>
  );
}
