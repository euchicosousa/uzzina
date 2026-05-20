import { cn } from "~/lib/utils";
import { UBadge } from "~/components/uzzina/UBadge";
import { useEffect, useState } from "react";

interface ActionTitleInputProps {
  title: string;
  onChange: (title: string) => void;
  onBlur: (title: string) => void;
  tabIndex?: number;
  className?: string;
  textareaClassName?: string;
  autoFocus?: boolean;
}

export function ActionTitleInput({
  title,
  onBlur,
  onChange,
  tabIndex,
  className,
  textareaClassName,
  autoFocus = false,
}: ActionTitleInputProps) {
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  return (
    <div className={cn("focus-within:bg-secondary/50 relative px-4 py-2", className)}>
      <textarea
        value={localTitle}
        onChange={(e) => {
          onChange(e.target.value);
          setLocalTitle(e.target.value);
        }}
        onBlur={(e) => {
          onBlur(e.target.value);
        }}
        placeholder="Título"
        className={cn(
          "font-inter w-full shrink-0 resize-none overflow-hidden pt-2 pb-1 leading-none font-medium tracking-tight outline-none",
          textareaClassName || (localTitle.length > 70 ? "text-error text-4xl" : "text-5xl"),
        )}
        // @ts-ignore
        style={{ fieldSizing: "content" }}
        autoFocus={autoFocus}
        maxLength={100}
        tabIndex={tabIndex}
      />
      {localTitle.length > 70 && !textareaClassName && (
        <div className="absolute right-0 bottom-0">
          <UBadge isDynamic value={localTitle.length} />
        </div>
      )}
    </div>
  );
}
