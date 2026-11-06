import { cn } from "cnfast";
import { PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { useRef, useState } from "react";
import { CloudinaryUpload } from "./CloudinaryUpload";
import { PrismButton } from "~/components/prism";
import { ContentReorderDialog } from "./ContentReorderDialog";
export { InstagramPreview } from "./InstagramPreview";

// ---------------------------------------------------------------------------
// ContentFilesManager (toolbar compacta inline)
// ---------------------------------------------------------------------------

interface ContentFilesManagerProps {
  files: string[];
  onChange: (files: string[]) => void;
  cloudName: string;
  uploadPreset: string;
  /**
   * Phone-width panel: without files only Adicionar conteúdo is shown; with
   * files both Adicionar conteúdo and Gerenciar stay visible.
   */
  compact?: boolean;
}

/**
 * Barra de controle compacta que fica abaixo do InstagramPreview.
 */
export function ContentFilesManager({
  files,
  onChange,
  cloudName,
  uploadPreset,
  compact = false,
}: ContentFilesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
      <div
        className={cn(
          "flex items-center justify-between py-2",
          compact && "flex-wrap gap-2",
        )}
      >
        <div className="flex items-center gap-2">
          {/* Same element in every state: the widget must stay mounted while a
              multiple upload is still delivering files. */}
          <CloudinaryUpload
            className={cn(!compact && files.length > 0 && "hidden")}
            cloudName={cloudName}
            folder="uzzina/content"
            multiple
            onUpload={handleUpload}
            resourceType="auto"
            uploadPreset={uploadPreset}
          >
            Adicionar conteúdo
            <PlusIcon className="size-3.5" />
          </CloudinaryUpload>
        </div>

        {/* Botão gerenciar (sempre visível quando há arquivos, ou para adicionar) */}
        {(!compact || files.length > 0) && (
          <PrismButton
            variant={"ghost"}
            size={"xs"}
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            {compact || files.length === 0
              ? "Gerenciar"
              : `${files.length} arquivo${files.length !== 1 ? "s" : ""}`}
            <SlidersHorizontalIcon />
          </PrismButton>
        )}
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
