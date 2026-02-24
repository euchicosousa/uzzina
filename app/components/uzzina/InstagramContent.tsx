import { useState, useRef } from "react";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { ContentReorderDialog } from "./ContentReorderDialog";
import { detectPostType } from "./InstagramHelpers";
import { Plus, SlidersHorizontal } from "lucide-react";
export { InstagramPreview } from "./InstagramPreview";

// ---------------------------------------------------------------------------
// ContentFilesManager (toolbar compacta inline)
// ---------------------------------------------------------------------------

interface ContentFilesManagerProps {
  files: string[];
  onChange: (files: string[]) => void;
  cloudName: string;
  uploadPreset: string;
}

/**
 * Barra de controle compacta que fica abaixo do InstagramPreview.
 * Exibe o tipo detectado e botões de gerenciamento.
 */
export function ContentFilesManager({
  files,
  onChange,
  cloudName,
  uploadPreset,
}: ContentFilesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const type = detectPostType(files);

  const filesRef = useRef(files);
  filesRef.current = files;

  // Track metadata for the duration of the component to allow sorting new batches
  const filesMetaRef = useRef<
    Record<string, { name: string; addedAt: number }>
  >({});

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          {/* Upload rápido (primeiro arquivo) */}
          {files.length === 0 ? (
            <CloudinaryUpload
              cloudName={cloudName}
              uploadPreset={uploadPreset}
              folder="uzzina/content"
              resourceType="auto"
              multiple
              onUpload={(url, meta) => {
                const now = Date.now();
                filesMetaRef.current[url] = {
                  name: meta.originalFilename || url,
                  addedAt: now,
                };

                let next = [...filesRef.current, url];

                // Sort only the recently uploaded batch (last 5 seconds) to prevent mixing with old files
                const splitIndex = next.findIndex((u) => {
                  const m = filesMetaRef.current[u];
                  return m && m.addedAt > now - 5000;
                });

                if (splitIndex !== -1) {
                  const oldUrls = next.slice(0, splitIndex);
                  const recentUrls = next.slice(splitIndex);
                  recentUrls.sort((a, b) => {
                    const nameA = filesMetaRef.current[a]?.name || a;
                    const nameB = filesMetaRef.current[b]?.name || b;
                    return nameA.localeCompare(nameB);
                  });
                  next = [...oldUrls, ...recentUrls];
                }

                filesRef.current = next;
                onChange(next);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs opacity-60 transition hover:opacity-100"
            >
              <Plus className="size-3.5" />
              Adicionar conteúdo
            </CloudinaryUpload>
          ) : (
            <span className="bg-muted rounded-full px-2 py-0.5 text-[10px] font-medium capitalize">
              {type === "image"
                ? "Imagem"
                : type === "video"
                  ? "Vídeo"
                  : `Carrossel · ${files.length}`}
            </span>
          )}
        </div>

        {/* Botão gerenciar (sempre visível quando há arquivos, ou para adicionar) */}
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="hover:bg-muted flex items-center gap-1 rounded-lg px-2 py-1 text-xs opacity-50 transition hover:opacity-100"
        >
          <SlidersHorizontal className="size-3.5" />
          {files.length === 0
            ? "Gerenciar"
            : `${files.length} arquivo${files.length !== 1 ? "s" : ""}`}
        </button>
      </div>

      <ContentReorderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        files={files}
        onChange={onChange}
        cloudName={cloudName}
        uploadPreset={uploadPreset}
      />
    </>
  );
}
