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
      // Flows on the page background (no card box), per the surfaces rule;
      // the toggle carries the on/off state.
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <div className="flex flex-col gap-0.5">
        <PrismLabel
          className="cursor-pointer text-sm font-semibold"
          htmlFor={id}
        >
          {label}
        </PrismLabel>
        <span className="pr-4 text-xs text-secondary-foreground">
          {description}
        </span>
      </div>
      <PrismToggle
        className="shrink-0 px-4"
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
