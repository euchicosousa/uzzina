import { useState, useEffect, useRef } from "react";
import { cn } from "cnfast";
import { useMultiSelection } from "~/hooks/useMultiSelection";
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
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
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
        // A native button, not PrismButton: react-aria's usePress stops the
        // mousedown/touch events, which would keep dnd-kit's mouse and touch
        // sensors from starting a drag on the title. A plain click still edits.
        <button
          type="button"
          className={cn(
            "w-full cursor-text truncate text-left leading-[inherit] focus-visible:underline",
            isDragging ? "cursor-grabbing" : "",
            InputButtonClassName,
          )}
          // dnd-kit ignores a press whose default was prevented, so the press
          // itself must stay untouched. Instead, a focus that comes from the
          // mouse is dropped right away: no underline or focus mark on the item
          // left behind during a drag. Keyboard focus is kept.
          onFocus={(event) => {
            try {
              if (!event.currentTarget.matches(":focus-visible"))
                event.currentTarget.blur();
            } catch {
              // Selector unsupported: keep the focus.
            }
          }}
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
