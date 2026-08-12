import type { Action } from "~/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { parseDbDate } from "~/lib/uzzina-utils";

export function ActionTimeDisplay({ action }: { action: Action }) {
  const createdAt = parseDbDate(action.created_at);
  const updatedAt = parseDbDate(action.updated_at);

  return (
    <div>
      {createdAt.getTime() === updatedAt.getTime()
        ? `Criada ${formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })}`
        : `Atualizada ${formatDistanceToNow(updatedAt, { addSuffix: true, locale: ptBR })}`}
    </div>
  );
}

