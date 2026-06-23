import { useState } from "react";
import { UBadge } from "~/components/uzzina/UBadge";
import { cn } from "~/lib/utils";
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
  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);
  const localTitle = overrideTitle !== null ? overrideTitle : title;
  return (
    <div
      className={cn(
        "relative px-4 py-2 focus-within:bg-secondary/50",
        className,
      )}
    >
      <textarea
        autoFocus={autoFocus}
        className={cn(
          "w-full shrink-0 resize-none overflow-hidden pt-2 pb-1 leading-none outline-none",
          textareaClassName ||
            (localTitle.length > 70 ? "text-error text-4xl" : "text-5xl"),
        )}
        maxLength={100}
        onBlur={(e) => {
          onBlur(e.target.value);
          setOverrideTitle(null);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setOverrideTitle(e.target.value);
        }}
        placeholder="Título"
        style={{
          fieldSizing: "content",
        }}
        tabIndex={tabIndex}
        value={localTitle}
      />
      {localTitle.length > 70 && !textareaClassName && (
        <div className="absolute right-0 bottom-0">
          <UBadge isDynamic value={localTitle.length} />
        </div>
      )}
    </div>
  );
}
