import { XIcon } from "lucide-react";

/**
 * Thumbnail compacto para trabalho (work_files):
 * - Imagens → preview real
 * - Tudo mais (vídeo, áudio, doc, etc.) → badge com extensão (MP3, MP4, PDF…)
 * Clicável para abrir em nova aba; hover mostra X para remover.
 */
export function WorkFileThumbnail({
  url,
  onRemove,
}: {
  url: string;
  onRemove?: () => void;
}) {
  // Extrai a extensão do final da URL (antes de ? ou #)
  const ext =
    url.split("?")[0].split("#")[0].split(".").pop()?.toUpperCase() ?? "FILE";
  const isImage = [
    "JPG",
    "JPEG",
    "PNG",
    "GIF",
    "WEBP",
    "SVG",
    "BMP",
    "TIFF",
    "ICO",
    "HEIC",
    "AVIF",
  ].includes(ext);
  return (
    <div className="group relative size-8 shrink-0">
      <a
        aria-label="Abrir anexo"
        className="block size-full rounded-2xl border border-transparent outline-none squircle focus-visible:border-ring/60 focus-visible:ring-3 focus-visible:ring-ring/30"
        href={url}
        rel="noopener noreferrer"
        target="_blank"
      >
        {isImage ? (
          <img
            alt=""
            className="size-full rounded-2xl object-cover squircle"
            src={url}
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-2xl border bg-secondary text-[10px] font-bold tracking-wide uppercase opacity-70 squircle">
            {ext.slice(0, 4)}
          </div>
        )}
      </a>
      {onRemove && (
        <button
          className="absolute -top-1.5 -right-1.5 hidden size-4 items-center justify-center rounded-full bg-error text-white outline-none group-focus-within:flex group-hover:flex focus-visible:ring-3 focus-visible:ring-ring/30"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remover anexo"
          type="button"
        >
          <XIcon className="size-2.5" />
        </button>
      )}
    </div>
  );
}
