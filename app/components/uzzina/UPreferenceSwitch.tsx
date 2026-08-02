import { PrismLabel, PrismToggle } from "~/components/prism";
import { cn } from "cnfast";
interface PreferenceSwitchProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}
export function UPreferenceSwitch({
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
          : "border-border bg-surface/25 text-muted-foreground",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <PrismLabel
          className="cursor-pointer text-sm font-semibold"
          htmlFor={id}
        >
          {label}
        </PrismLabel>
        <span className="pr-4 text-xs text-muted-foreground">
          {description}
        </span>
      </div>
      <PrismToggle
        id={id}
        isSelected={checked}
        onChange={onCheckedChange}
        size="sm"
        variant="outline"
      >
        {checked ? "Ativo" : "Inativo"}
      </PrismToggle>
    </div>
  );
}
