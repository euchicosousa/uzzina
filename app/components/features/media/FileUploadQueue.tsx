import { cn } from "cnfast";
import { PrismButton } from "~/components/prism";

export type FileUploadQueueRow = {
  id: number;
  name: string;
  status: "queued" | "uploading" | "failed";
  progress: number | null;
  error?: string;
  canRetry: boolean;
  canRemove?: boolean;
};

export function FileUploadQueue({
  entries,
  label = "Envio de arquivos",
  notice,
  onRetry,
  onRemove,
}: {
  entries: readonly FileUploadQueueRow[];
  notice?: string;
  label?: string;
  onRetry: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <>
      <p className="sr-only" role="status">
        {notice}
      </p>
      {entries.length > 0 && (
        <ul
          aria-label={label}
          className="max-h-60 overflow-y-auto px-5 py-2 text-sm"
        >
          {entries.map((entry) => (
            <li
              className="flex items-center justify-between gap-2 border-b py-2 last:border-b-0"
              key={entry.id}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate">{entry.name}</p>

                {entry.status === "uploading" && entry.progress === null ? (
                  <p
                    className="text-xs text-secondary-foreground"
                    role="status"
                  >
                    Importando…
                  </p>
                ) : entry.status === "uploading" ? (
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      aria-label={`Enviando ${entry.name}`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={entry.progress ?? undefined}
                      className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-input"
                      role="progressbar"
                    >
                      <div
                        className="h-full rounded-full bg-success transition-[width]"
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-secondary-foreground">
                      {entry.progress}%
                    </span>
                  </div>
                ) : (
                  <p
                    className={cn(
                      "text-xs",
                      entry.error ? "text-error" : "text-secondary-foreground",
                    )}
                    role={entry.error ? "alert" : undefined}
                  >
                    {entry.error ?? "Na fila"}
                  </p>
                )}
              </div>
              {entry.error && entry.canRetry && (
                <PrismButton
                  aria-label={`Tentar novamente: ${entry.name}`}
                  size="xs"
                  variant="secondary"
                  onPress={() => onRetry(entry.id)}
                >
                  Tentar novamente
                </PrismButton>
              )}
              {entry.canRemove !== false && (
                <PrismButton
                  aria-label={`${entry.error ? "Remover" : "Cancelar envio de"} ${entry.name}`}
                  size="xs"
                  variant="ghost"
                  onPress={() => onRemove(entry.id)}
                >
                  {entry.error ? "Remover" : "Cancelar envio"}
                </PrismButton>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
