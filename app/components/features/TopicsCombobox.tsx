import { TagIcon } from "lucide-react";
import { cn } from "cnfast";
import type { PartnerTopic } from "~/types";
interface TopicsComboboxProps {
  availableTopics: PartnerTopic[];
  selectedTopicIds: string[];
  onSelect: (ids: string[]) => void;
}
export function TopicsCombobox({
  availableTopics,
  selectedTopicIds = [],
  onSelect,
}: TopicsComboboxProps) {
  if (availableTopics.length === 0) return null;
  const handleToggle = (id: string) => {
    const isSelected = selectedTopicIds.includes(id);
    const nextIds = isSelected
      ? selectedTopicIds.filter((tId) => tId !== id)
      : [...selectedTopicIds, id];
    onSelect(nextIds);
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      <div className="flex items-center gap-1 opacity-40 text-xs font-semibold mr-1 uppercase tracking-wider select-none">
        <TagIcon className="size-3" />
        Tópicos:
      </div>
      {availableTopics.map((topic) => {
        const isSelected = selectedTopicIds.includes(topic.id);
        return (
          <button
            key={topic.id}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-0.5 border text-xs font-medium transition cursor-pointer select-none outline-none",
              isSelected
                ? "ring-2 ring-primary ring-offset-1"
                : "opacity-60 hover:opacity-100 hover:border-foreground/30",
            )}
            onClick={() => handleToggle(topic.id)}
            style={{
              borderColor: isSelected ? topic.color : `${topic.color}40`,
              backgroundColor: isSelected
                ? `${topic.color}25`
                : `${topic.color}10`,
            }}
            type="button"
          >
            <div
              className="size-1.5 rounded-full"
              style={{
                backgroundColor: topic.color,
              }}
            />
            <span>{topic.title}</span>
          </button>
        );
      })}
    </div>
  );
}
