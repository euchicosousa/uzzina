import { useState } from "react";
import type { Database } from "types/database";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import { cn } from "~/lib/utils";

type Person = Database["public"]["Tables"]["people"]["Row"];

interface PartnerUsersSelectorProps {
  people: Person[];
  initialSelectedUserIds?: string[];
}

export function PartnerUsersSelector({
  people,
  initialSelectedUserIds = [],
}: PartnerUsersSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedUserIds,
  );

  const toggleUser = (userId: string) => {
    setSelectedIds((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      } else {
        return [...current, userId];
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {people.map((person) => {
        const isSelected = selectedIds.includes(person.user_id);
        return (
          <button
            key={person.id}
            type="button"
            onClick={() => toggleUser(person.user_id)}
            className={cn(
              "hover:bg-muted/50 relative flex flex-col items-center gap-2 rounded-lg p-4 transition-all",
              isSelected ? "text-foreground bg-muted" : "opacity-50",
            )}
          >
            <UAvatar
              image={person.image || undefined}
              fallback={person.initials}
              size={SIZE.lg}
            />

            <div className="text-center">
              <div className="mb-0.5 text-sm leading-none font-medium">
                {person.name}
              </div>
              <div className="text-xs opacity-50">{person.surname}</div>
            </div>

            {isSelected && (
              <input type="hidden" name="users_ids" value={person.user_id} />
            )}
          </button>
        );
      })}
    </div>
  );
}
