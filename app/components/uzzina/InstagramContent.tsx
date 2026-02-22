import { PlusIcon, Settings2Icon } from "lucide-react";
import { useState } from "react";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
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
  const type = detectPostType(files);

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
              onUpload={(url) => onChange([...files, url])}
              className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs opacity-60 transition hover:opacity-100"
            >
              <PlusIcon className="size-3.5" />
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
          <Settings2Icon className="size-3.5" />
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
