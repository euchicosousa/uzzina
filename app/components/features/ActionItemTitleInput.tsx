import { useState, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
export function ActionItemTitleInput({
  title,
  isDragging,
  isEditing,
  setIsEditing,
  className,
  InputButtonClassName,
  lines = 1,
  onBlur,
}: {
  title: string;
  isDragging?: boolean;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
  className?: string;
  InputButtonClassName?: string;
  lines?: 1 | 2;
  onBlur?: (title: string) => void;
}) {
  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);
  const localTitle = overrideTitle !== null ? overrideTitle : title;
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

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
          ref={inputRef}
          className={cn("w-full outline-none", InputButtonClassName)}
          onBlur={() => {
            if (onBlur) {
              onBlur(localTitle);
            }
            setOverrideTitle(null);
            setIsEditing(false);
          }}
          onChange={(e) => setOverrideTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (onBlur) {
                onBlur(localTitle);
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
