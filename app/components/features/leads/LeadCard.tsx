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
        "flex w-full cursor-pointer flex-col gap-2 rounded-2xl p-4 text-left transition-all squircle",
        isSelected ? "bg-primary text-background" : "hover:bg-secondary/50",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="truncate font-medium">{lead.name}</span>
        {lead.completed ? (
          <CheckCircle2Icon className="size-4 shrink-0 opacity-50" />
        ) : (
          <ClockIcon className="size-4 shrink-0 opacity-50" />
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-2 text-xs opacity-50">
        {lead.main_need ? (
          <PrismBadge
            className="h-5 border border-current px-2 py-0 capitalize"
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
