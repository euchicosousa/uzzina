import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ActionTimeDisplay = ({ action }: { action: Action }) => (
  <div>
    {action.created_at === action.updated_at
      ? `Criada ${formatDistanceToNow(action.created_at, { addSuffix: true, locale: ptBR })}`
      : `Atualizada ${formatDistanceToNow(action.updated_at, { addSuffix: true, locale: ptBR })}`}
  </div>
);
