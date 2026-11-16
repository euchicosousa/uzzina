import { Fragment, useState } from "react";
import {
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismCommandSeparator,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { cn } from "cnfast";
import type { PartnerTopicGroup } from "~/utils/topics";
import { safeColor } from "~/utils/uzzina-utils";
import {
  UComboboxTrigger,
  getTriggerContentSizeClass,
  type UComboboxTriggerProps,
} from "./UComboboxTrigger";

export interface UTopicComboboxProps {
  /** Topics of every partner involved, grouped by partner (see `groupTopicsByPartner`). */
  groups: PartnerTopicGroup[];
  selectedTopicId?: string | null;
  /** Color shown on the trigger while there is no topic (the action's own color). */
  fallbackColor?: string | null;
  /** Receives the chosen topic ID, or null for "Sem tópico". */
  onSelect?: (topicId: string | null) => void;
  showText?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  variant?: UComboboxTriggerProps["variant"];
  size?: UComboboxTriggerProps["size"];
}

function ColorDot({
  color,
  size,
}: {
  color: string;
  size?: UComboboxTriggerProps["size"];
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        getTriggerContentSizeClass(size),
        "shrink-0 rounded-full border border-border shadow-xs",
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export function UTopicCombobox({
  groups,
  selectedTopicId = null,
  fallbackColor,
  onSelect,
  showText = false,
  tabIndex,
  disabled = false,
  variant,
  size,
}: UTopicComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const allTopics = groups.flatMap((group) => group.topics);
  const selected = allTopics.find((topic) => topic.id === selectedTopicId);
  const triggerColor = selected
    ? selected.color
    : safeColor(fallbackColor ?? undefined);
  const hasTopics = allTopics.length > 0;
  // Without topics there is nothing to choose: "Sem tópico" is the only state.
  const isDisabled = disabled || !hasTopics;
  const label = hasTopics
    ? `Tópico: ${selected?.title ?? "Sem tópico"}`
    : "Sem tópico: este parceiro ainda não tem tópicos (crie em Admin → Parceiro)";
  const showHeadings = groups.length > 1;

  const choose = (topicId: string | null) => {
    onSelect?.(topicId);
    setIsOpen(false);
  };

  return (
    <PrismPopoverTrigger
      isOpen={isOpen && !isDisabled}
      onOpenChange={(open) => !isDisabled && setIsOpen(open)}
    >
      <UComboboxTrigger
        aria-label={label}
        className={showText ? "gap-1.5" : undefined}
        disabled={isDisabled}
        size={size}
        tabIndex={tabIndex}
        title={label}
        variant={variant}
      >
        <ColorDot color={triggerColor} size={size} />
        {showText && (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {selected?.title ?? "Sem tópico"}
          </span>
        )}
      </UComboboxTrigger>
      <PrismPopover className="overflow-hidden p-0" size="sm">
        <PrismCommand className="p-0">
          {hasTopics && <PrismCommandInput placeholder="Procurar tópico..." />}
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum tópico encontrado.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              <PrismCommandItem
                isSelected={!selected}
                onAction={() => choose(null)}
                textValue="Sem tópico"
              >
                <ColorDot color={safeColor(fallbackColor ?? undefined)} />
                <span className="truncate">Sem tópico</span>
              </PrismCommandItem>
            </PrismCommandGroup>
            {groups.map((group) => (
              <Fragment key={group.partner.id}>
                <PrismCommandSeparator className="-mx-1 my-1" />
                <PrismCommandGroup
                  heading={showHeadings ? group.partner.title : undefined}
                >
                  {group.topics.length === 0 ? (
                    <PrismCommandItem
                      isDisabled
                      textValue={`${group.partner.title} sem tópicos`}
                    >
                      <span className="truncate text-xs text-secondary-foreground">
                        {showHeadings ? "" : `${group.partner.title}: `}sem
                        tópicos (crie em Admin → Parceiro)
                      </span>
                    </PrismCommandItem>
                  ) : (
                    group.topics.map((topic) => (
                      <PrismCommandItem
                        key={topic.id}
                        isSelected={topic.id === selectedTopicId}
                        onAction={() => choose(topic.id)}
                        textValue={`${group.partner.title} ${topic.title}`}
                      >
                        <ColorDot color={topic.color} />
                        <span className="truncate">{topic.title}</span>
                      </PrismCommandItem>
                    ))
                  )}
                </PrismCommandGroup>
              </Fragment>
            ))}
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
