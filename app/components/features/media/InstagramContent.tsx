import { cn } from "cnfast";
import { PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { useRef, useState } from "react";
import { CloudinaryUpload } from "./CloudinaryUpload";
import { PrismButton } from "~/components/prism";
import { ContentReorderDialog } from "./ContentReorderDialog";
import { detectPostType } from "./InstagramHelpers";
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
  const type = !files || files.length === 0 ? "empty" : detectPostType(files);
  const filesRef = useRef(files);
  filesRef.current = files;
  const filesMetaRef = useRef<
    Record<
      string,
      {
        name: string;
        addedAt: number;
      }
    >
  >({});
  const handleUpload = (
    url: string,
    meta: {
      originalFilename?: string;
    },
  ) => {
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
  };
  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          {/* UploadIcon rápido (primeiro arquivo) */}
          <CloudinaryUpload
            className={cn(
              files.length > 0 && "hidden",
            )}
            cloudName={cloudName}
            folder="uzzina/content"
            multiple
            onUpload={handleUpload}
            resourceType="auto"
            uploadPreset={uploadPreset}
          >
            <PlusIcon className="size-3.5" />
            Adicionar conteúdo
          </CloudinaryUpload>

          {files.length > 0 && (
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
        <PrismButton
          variant={"ghost"}
          size={"xs"}
          onClick={() => setDialogOpen(true)}
          type="button"
        >
          <SlidersHorizontalIcon/>
          {files.length === 0
            ? "Gerenciar"
            : `${files.length} arquivo${files.length !== 1 ? "s" : ""}`}
        </PrismButton>
      </div>

      <ContentReorderDialog
        cloudName={cloudName}
        files={files}
        onChange={onChange}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        uploadPreset={uploadPreset}
      />
    </>
  );
}
