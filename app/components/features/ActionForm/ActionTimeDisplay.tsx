import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Action } from "~/models/actions.server";

export function ActionTimeDisplay({ action }: { action: Action }) {
  return (
    <div>
      {action.created_at === action.updated_at
        ? `Criada ${formatDistanceToNow(action.created_at, { addSuffix: true, locale: ptBR })}`
        : `Atualizada ${formatDistanceToNow(action.updated_at, { addSuffix: true, locale: ptBR })}`}
    </div>
  );
}
