import React from "react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

interface PreferenceSwitchProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function PreferenceSwitch({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: PreferenceSwitchProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border p-4 transition-all duration-200",
        checked
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border bg-card/25 text-muted-foreground",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-semibold">
          {label}
        </Label>
        <span className="pr-4 text-xs text-muted-foreground">
          {description}
        </span>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
