import { SparklesIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type React from "react";

interface UButtonAIProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function UButtonAI({
  children,
  className,
  disabled,
  ...props
}: UButtonAIProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative overflow-hidden rounded-full p-0.5 disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <div
        className="absolute inset-0 animate-spin-gradient"
        style={{
          background:
            "conic-gradient(from var(--gradient-angle), #fc6, #f63, #96f, #6cf, #fc6)",
        }}
      />
      <div className="bg-background relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide">
        {children}
        <SparklesIcon className="size-3" />
      </div>
    </button>
  );
}
