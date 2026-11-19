import { useState } from "react";
import { ExternalLinkIcon, XIcon } from "lucide-react";
import { PrismButton } from "~/components/prism";
import { fileNameFromUrl } from "./FileReadPanel";
import { isImageUrl } from "./InstagramHelpers";

export function getFilePreviewDetails(url: string) {
  const name = fileNameFromUrl(
    url.startsWith("blob:") ? (url.split("#/")[1] ?? url) : url,
  );
  const extension = name.includes(".") ? name.split(".").pop() : undefined;
  const isPdf = extension?.toLowerCase() === "pdf";
  const isAudio = /\.(aac|flac|m4a|mp3|oga|ogg|opus|wav|wma)$/i.test(name);
  const canShowVideo =
    /\.(3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|ogv|webm|wmv)$/i.test(name) ||
    (url.includes("/video/upload/") && !isAudio);
  const canShowImage = !isPdf && (isImageUrl(url) || isImageUrl(name));
  return {
    name,
    extension,
    type: canShowVideo ? "video" : canShowImage ? "image" : null,
  };
}

export function FilePreviewPanel({
  id,
  url,
  onClose,
}: {
  id: string;
  url: string;
  onClose: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const { name, extension, type } = getFilePreviewDetails(url);

  return (
    <aside
      id={id}
      aria-label="Prévia do arquivo"
      className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] border-l"
    >
      <div className="flex min-w-0 items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium break-words">{name}</p>
          <p className="text-xs text-secondary-foreground">
            {extension?.toUpperCase() ?? "Arquivo"}
          </p>
        </div>
        <PrismButton
          aria-label="Fechar prévia"
          className="shrink-0"
          onPress={onClose}
          size="icon-xs"
          variant="ghost"
        >
          <XIcon />
        </PrismButton>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-4">
        {failed || !type ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-secondary-foreground">
              Não foi possível visualizar este arquivo.
            </p>
            <a
              className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
              href={url}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir original
              <ExternalLinkIcon className="size-4" />
            </a>
          </div>
        ) : type === "video" ? (
          <video
            aria-label={name}
            className="h-full w-full object-contain"
            controls
            onError={() => setFailed(true)}
            playsInline
            preload="metadata"
            src={url}
          />
        ) : (
          <img
            alt={name}
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
            src={url}
          />
        )}
      </div>
    </aside>
  );
}
