import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { isLateAction } from "~/utils/validation";

export function ActionTimeDisplay({ action }: { action: Action }) {
  return (
    <div
      className={cn(isLateAction(action) ? "text-destructive" : "opacity-50")}
    >
      {action.created_at === action.updated_at
        ? `Criada ${formatDistanceToNow(action.created_at, { addSuffix: true, locale: ptBR })}`
        : `Atualizada ${formatDistanceToNow(action.updated_at, { addSuffix: true, locale: ptBR })}`}
    </div>
  );
}
