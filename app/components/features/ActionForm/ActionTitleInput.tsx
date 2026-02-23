import { cn } from "~/lib/utils";
import { UBadge } from "~/components/uzzina/UBadge";
import { useEffect, useState } from "react";

interface ActionTitleInputProps {
  title: string;
  onUpdate: (title: string) => void;
  tabIndex?: number;
}

export function ActionTitleInput({
  title,
  onUpdate,
  tabIndex,
}: ActionTitleInputProps) {
  const [localTitle, setLocalTitle] = useState(title);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  return (
    <div className="focus-within:bg-secondary/50 relative px-4 py-2">
      <textarea
        value={localTitle}
        onChange={(e) => setLocalTitle(e.target.value)}
        onBlur={() => {
          if (localTitle !== title) {
            onUpdate(localTitle);
          }
        }}
        placeholder="Título"
        className={cn(
          "font-inter w-full shrink-0 resize-none overflow-hidden pt-2 pb-1 leading-none font-medium outline-none",
          localTitle.length > 70 ? "text-error text-4xl" : "text-5xl",
        )}
        // @ts-ignore
        style={{ fieldSizing: "content" }}
        autoFocus
        maxLength={100}
        tabIndex={tabIndex}
      />
      {localTitle.length > 70 && (
        <div className="absolute right-0 bottom-0">
          <UBadge isDynamic value={localTitle.length} />
        </div>
      )}
    </div>
  );
}
