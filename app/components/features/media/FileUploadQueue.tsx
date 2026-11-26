import { useEffect, useId, useState } from "react";
import { FileNameLabel } from "./FileNameLabel";
import { getMediaType } from "./useDirectFileUploads";
import { cn } from "cnfast";
import { PrismButton } from "~/components/prism";

export type FileUploadQueueRow = {
  id: number;
  name: string;
  status: "queued" | "uploading" | "failed";
  progress: number | null;
  previewFile?: File;
  error?: string;
  canRetry: boolean;
  canRemove?: boolean;
};

function LocalUploadPreview({ file }: { file: File }) {
  const type = getMediaType(file);
  const [source, setSource] = useState("");
  const [failedSource, setFailedSource] = useState("");
  useEffect(() => {
    const browserUrl = window.URL;
    if (type === "other" || typeof browserUrl.createObjectURL !== "function")
      return;
    let url: string;
    try {
      url = browserUrl.createObjectURL(file);
    } catch {
      // A missing local preview must never interrupt the upload queue.
      return;
    }
    setSource(url);
    return () => browserUrl.revokeObjectURL(url);
  }, [file, type]);

  if (!source || source === failedSource) return null;
  const className = "size-12 shrink-0 rounded-xl bg-card object-cover squircle";
  return type === "video" ? (
    <video
      aria-hidden="true"
      className={className}
      muted
      playsInline
      preload="auto"
      src={`${source}#t=0.1`}
      onError={() => setFailedSource(source)}
    />
  ) : (
    <img
      alt=""
      className={className}
      src={source}
      onError={() => setFailedSource(source)}
    />
  );
}

export function FileUploadQueue({
  entries,
  label = "Envio de arquivos",
  notice,
  batchProgress,
  onRetry,
  onRemove,
}: {
  entries: readonly FileUploadQueueRow[];
  notice?: string;
  label?: string;
  batchProgress?: { completed: number; total: number };
  onRetry: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const batchProgressLabel = useId();
  return (
    <>
      <p className="sr-only" role="status">
        {notice}
      </p>
      {batchProgress && (
        <div className="px-5 pt-2">
          <p
            id={batchProgressLabel}
            className="text-sm text-secondary-foreground"
          >
            {batchProgress.completed} de {batchProgress.total} arquivos
            importados
          </p>
          <div
            aria-labelledby={batchProgressLabel}
            aria-valuemax={batchProgress.total}
            aria-valuemin={0}
            aria-valuenow={batchProgress.completed}
            className="mt-1 h-2 overflow-hidden rounded-full bg-input"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-success transition-[width] motion-reduce:transition-none"
              style={{
                width: `${(100 * batchProgress.completed) / batchProgress.total}%`,
              }}
            />
          </div>
        </div>
      )}
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
              {entry.previewFile && (
                <LocalUploadPreview file={entry.previewFile} />
              )}
              <div className="min-w-0 flex-1">
                <FileNameLabel name={entry.name} />

                {entry.status === "uploading" && entry.progress === null ? (
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      aria-label={`Importando ${entry.name}`}
                      className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-input"
                      role="progressbar"
                    >
                      <div className="h-full w-1/3 rounded-full bg-success motion-safe:animate-pulse" />
                    </div>
                    <span className="text-xs text-secondary-foreground">
                      Importando…
                    </span>
                  </div>
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
