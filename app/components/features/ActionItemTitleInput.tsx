import { useState } from "react";
import { cn } from "~/lib/utils";
export function ActionItemTitleInput({
  title,
  isDragging,
  isEditing,
  setIsEditing,
  className,
  InputButtonClassName,
  lines = 1,
  onChange,
}: {
  title: string;
  isDragging?: boolean;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
  className?: string;
  InputButtonClassName?: string;
  lines?: 1 | 2;
  onChange?: (title: string) => void;
}) {
  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);
  const localTitle = overrideTitle !== null ? overrideTitle : title;
  return (
    <div
      className={cn(
        "flex min-h-4 w-full overflow-hidden leading-snug",
        !isEditing && "@md:w-auto",
        className,
      )}
    >
      {isEditing ? (
        <input
          autoFocus
          className={cn("w-full outline-none", InputButtonClassName)}
          onBlur={() => {
            if (onChange) {
              onChange(localTitle);
            }
            setOverrideTitle(null);
            setIsEditing(false);
          }}
          onChange={(e) => setOverrideTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (onChange) {
                onChange(localTitle);
              }
              setOverrideTitle(null);
              setIsEditing(false);
            } else if (e.key === "Escape") {
              setOverrideTitle(null);
              setIsEditing(false);
            }
          }}
          type="text"
          value={localTitle}
          aria-label="Editar título da ação"
        />
      ) : (
        <button
          type="button"
          className={cn(
            "w-full cursor-text text-left",
            lines === 1
              ? "overflow-hidden text-ellipsis whitespace-nowrap"
              : "line-clamp-2",
            isDragging ? "cursor-grabbing" : "",
            InputButtonClassName,
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsEditing(true);
          }}
        >
          {localTitle}
        </button>
      )}
    </div>
  );
}
