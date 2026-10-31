import { useState, useEffect, useRef } from "react";
import { cn } from "cnfast";
export function ActionItemTitleInput({
  title,
  isDragging,
  isEditing,
  setIsEditing,
  className,
  InputButtonClassName,
  onBlur,
}: {
  title: string;
  isDragging?: boolean;
  isEditing?: boolean;
  setIsEditing: (value: boolean) => void;
  className?: string;
  InputButtonClassName?: string;
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
          aria-label="Editar título da ação"
          className={cn(
            "w-full text-[length:inherit] leading-[inherit] outline-none",
            InputButtonClassName,
          )}
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
        />
      ) : (
        <button
          className={cn(
            "w-full cursor-text overflow-hidden text-left text-ellipsis whitespace-nowrap",
            isDragging ? "cursor-grabbing" : "",
            InputButtonClassName,
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsEditing(true);
          }}
          type="button"
        >
          {localTitle}
        </button>
      )}
    </div>
  );
}
