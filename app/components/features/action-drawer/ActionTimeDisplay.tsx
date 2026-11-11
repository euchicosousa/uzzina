import type { Action } from "~/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { parseDbDate } from "~/utils/uzzina-utils";
import { cn } from "cnfast";

export function ActionTimeDisplay({
  action,
  className,
}: {
  action: Action;
  className?: string;
}) {
  const createdAt = parseDbDate(action.created_at);
  const updatedAt = parseDbDate(action.updated_at);

  return (
    <div
      className={cn(
        "flex h-8 items-center text-sm text-secondary-foreground",
        className,
      )}
    >
      {createdAt.getTime() === updatedAt.getTime()
        ? `Criada ${formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })}`
        : `Atualizada ${formatDistanceToNow(updatedAt, { addSuffix: true, locale: ptBR })}`}
    </div>
  );
}
