import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2Icon, ClockIcon } from "lucide-react";
import { PrismBadge } from "~/components/prism";
import { cn } from "cnfast";
interface LeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
}
export function LeadCard({ lead, isSelected, onClick }: LeadCardProps) {
  const formattedTime = lead.created_at
    ? formatDistanceToNow(parseISO(lead.created_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : null;
  return (
    <button
      className={cn(
        "flex w-full flex-col gap-2 squircle rounded-2xl p-4 text-left transition-all cursor-pointer",
        isSelected ? "bg-primary text-background" : "hover:bg-secondary/50",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="font-medium truncate">{lead.name}</span>
        {lead.completed ? (
          <CheckCircle2Icon className="size-4 shrink-0 opacity-50" />
        ) : (
          <ClockIcon className="size-4 shrink-0 opacity-50" />
        )}
      </div>

      <div className="flex w-full items-center opacity-50 justify-between gap-2 text-xs">
        {lead.main_need ? (
          <PrismBadge
            className="capitalize border border-current py-0 px-2 h-5"
            variant="ghost"
          >
            {lead.main_need}
          </PrismBadge>
        ) : (
          <span />
        )}

        {formattedTime && <span className="text-xs">{formattedTime}</span>}
      </div>
    </button>
  );
}
