import { useState, useEffect, useRef } from "react";
import { cn } from "cnfast";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { PrismButton } from "../prism";
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
  const { isSelectionMode } = useMultiSelection();
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
            "-mx-1.5 -my-0.5 w-full px-1.5 py-0.5 text-[length:inherit] leading-[inherit] text-foreground outline-none focus:outline-none",
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
          // Keep typing and text selection away from dnd-kit's sortable
          // keyboard/pointer activators on the wrapper.
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
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
      ) : isSelectionMode ? (
        // Plain text in selection mode: PrismButton's usePress would swallow
        // the click, so the card (which toggles selection) never received it.
        <span
          className={cn(
            "block w-full truncate text-left leading-[inherit]",
            InputButtonClassName,
          )}
        >
          {localTitle}
        </span>
      ) : (
        <PrismButton
          variant={"unstyled"}
          className={cn(
            "w-full cursor-text truncate text-left leading-[inherit] focus:underline",
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
        </PrismButton>
      )}
    </div>
  );
}
