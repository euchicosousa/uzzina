import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_STATES,
  CATEGORY_ATTRIBUTES,
  STATES,
} from "~/lib/CONSTANTS";
import type { CATEGORY, STATE } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Command, CommandItem, CommandList } from "~/components/ui/command";
import { useState } from "react";
import { CheckIcon } from "lucide-react";

interface AttributesSectionProps {
  RawAction: Action;
  setRawAction: (action: Action | ((prev: Action) => Action)) => void;
  updateAction: (data?: { [key: string]: any }) => Promise<void>;
}

export function AttributesSection({
  RawAction,
  setRawAction,
  updateAction,
}: AttributesSectionProps) {
  const slugs = CATEGORY_ATTRIBUTES[RawAction.category as CATEGORY] ?? [];

  if (slugs.length === 0) return null;

  const currentAttrs = (RawAction.attributes ?? {}) as Record<string, string>;

  return (
    <div className="border-b px-4 py-1">
      <div className="flex w-full gap-px overflow-hidden">
        {slugs.map((slug, i) => (
          <AttributePill
            key={slug}
            slug={slug}
            currentState={currentAttrs[slug] ?? STATES.do.slug}
            onSelect={async (newState) => {
              const updated = { ...currentAttrs, [slug]: newState };
              // @ts-ignore
              setRawAction((prev: Action) => ({
                ...prev,
                attributes: updated,
              }));
              await updateAction({ attributes: updated });
            }}
            className={cn(
              "min-w-0",
              i === 0
                ? "rounded-r-none"
                : i === slugs.length - 1
                  ? "rounded-l-none"
                  : "rounded-none",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function AttributePill({
  slug,
  className,
  currentState,
  onSelect,
}: {
  slug: string;
  className?: string;
  currentState: string;
  onSelect: (state: string) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const stateData = STATES[currentState as STATE] || STATES.do;
  const label = ATTRIBUTE_LABELS[slug] ?? slug;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "squircle flex items-center justify-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-white transition-all outline-none hover:brightness-110 active:scale-[0.98]",
            className,
          )}
          style={{
            backgroundColor: stateData?.color,
          }}
          title={label}
        >
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandList className="p-1 outline-none">
            {ATTRIBUTE_STATES.map((stateSlug) => {
              const state = STATES[stateSlug];
              return (
                <CommandItem
                  key={state.slug}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                  onSelect={() => {
                    onSelect(state.slug);
                    setIsOpen(false);
                  }}
                >
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: state.color }}
                  />
                  {state.title}
                  <CheckIcon
                    className={cn(
                      "ml-auto size-3",
                      currentState === state.slug ? "visible" : "invisible",
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
