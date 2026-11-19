import { PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";
import { PrismButton, PrismButtonGroup } from "~/components/prism";
import { FileManagerDialog } from "./FileManagerDialog";
export { InstagramPreview } from "./InstagramPreview";

// ---------------------------------------------------------------------------
// ContentFilesManager (toolbar compacta inline)
// ---------------------------------------------------------------------------

interface ContentFilesManagerProps {
  files: string[];
  onChange: (files: string[]) => void;
  cloudName: string;
  uploadPreset: string;
  onUploadActiveChange?: (active: boolean) => void;
}

/**
 * Barra de controle compacta que fica abaixo do InstagramPreview.
 */
export function ContentFilesManager({
  files,
  onChange,
  cloudName,
  uploadPreset,
  onUploadActiveChange,
}: ContentFilesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const openFiles = () => setDialogOpen(true);
  return (
    <>
      <div className="flex items-center py-2">
        {files.length === 0 ? (
          <PrismButton
            onClick={openFiles}
            size="sm"
            type="button"
            variant="secondary"
          >
            Adicionar conteúdo
            <PlusIcon className="size-3.5" />
          </PrismButton>
        ) : (
          <PrismButtonGroup
            aria-label="Arquivos do Instagram"
            size="sm"
            className="w-full"
          >
            <PrismButton
              onClick={openFiles}
              size="sm"
              type="button"
              variant="secondary"
              className="flex-1"
            >
              <SlidersHorizontalIcon />
              Gerenciar arquivos
            </PrismButton>
            <PrismButton
              aria-label="Adicionar conteúdo"
              onClick={openFiles}
              size="icon-sm"
              type="button"
              variant="secondary"
              className="shrink-0"
            >
              <PlusIcon />
            </PrismButton>
          </PrismButtonGroup>
        )}
      </div>

      <FileManagerDialog
        cloudName={cloudName}
        directUpload
        files={files}
        onUploadActiveChange={onUploadActiveChange}
        onChange={onChange}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        uploadPreset={uploadPreset}
      />
    </>
  );
}
