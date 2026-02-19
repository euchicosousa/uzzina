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
  onRemove: () => void;
}) {
  const isImage = url.includes("/image/upload/");
  // Extrai a extensão do final da URL (antes de ? ou #)
  const ext =
    url.split("?")[0].split("#")[0].split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <div className="group relative size-10 shrink-0">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block size-full"
      >
        {isImage ? (
          <img
            src={url}
            alt=""
            className="size-full rounded-lg border object-cover"
          />
        ) : (
          <div className="bg-muted flex size-full items-center justify-center rounded-lg border text-[8px] font-bold tracking-wide uppercase opacity-70">
            {ext.slice(0, 4)}
          </div>
        )}
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="bg-destructive absolute -top-1.5 -right-1.5 hidden size-4 items-center justify-center rounded-full text-white group-hover:flex"
      >
        <XIcon className="size-2.5" />
      </button>
    </div>
  );
}
