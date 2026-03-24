import { useEffect, useState } from "react";
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
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  return (
    <div
      className={cn(
        "flex min-h-4 w-full overflow-hidden leading-snug font-light",
        !isEditing && "@md:w-auto",
        className,
      )}
    >
      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          className={cn("w-full outline-none", InputButtonClassName)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (onChange) {
                onChange(localTitle);
              }
              setIsEditing(false);
            } else if (e.key === "Escape") {
              setIsEditing(false);
            }
          }}
          onBlur={() => {
            if (onChange) {
              onChange(localTitle);
            }
            setIsEditing(false);
          }}
        />
      ) : (
        <button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsEditing(true);
          }}
          className={cn(
            "w-full cursor-text text-left",
            lines === 1
              ? "overflow-hidden text-ellipsis whitespace-nowrap"
              : "line-clamp-2",
            isDragging ? "cursor-grabbing" : "",
            InputButtonClassName,
          )}
        >
          {localTitle}
        </button>
      )}
    </div>
  );
}
