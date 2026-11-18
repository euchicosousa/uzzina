import type { ActionVariantRendererProps } from "./types";

export function ActionTimelineVariant({ action }: ActionVariantRendererProps) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <span className="line-clamp-2 w-full text-xs leading-tight font-medium wrap-break-word whitespace-normal">
        {action.title}
      </span>
    </div>
  );
}
