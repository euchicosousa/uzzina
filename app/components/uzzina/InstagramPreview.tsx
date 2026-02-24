import { useState } from "react";
import { detectPostType } from "./InstagramHelpers";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";

interface InstagramPreviewProps {
  files: string[];
}

/**
 * Prévia visual de um post do Instagram com base nos content_files.
 * - 0 arquivos → placeholder
 * - 1 imagem → imagem estática
 * - N imagens → carrossel com navegação
 * - 1 vídeo → player de vídeo (com capa opcional em files[1])
 */
export function InstagramPreview({ files }: InstagramPreviewProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const type = detectPostType(files);

  // Proporção Instagram feed padrão 4:5
  const frameClass =
    "relative w-full overflow-hidden rounded-xl bg-black/5 border";
  const aspectClass = "aspect-[4/5]";

  if (type === "empty") {
    return (
      <div className={`${frameClass} ${aspectClass}`}>
        <div className="flex h-full flex-col items-center justify-center gap-2 opacity-30">
          <Image className="size-10" />
          <span className="text-xs">Nenhum conteúdo</span>
        </div>
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className={`${frameClass} ${aspectClass}`}>
        <img src={files[0]} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  if (type === "video") {
    const cover = files[1]; // opcional
    return (
      <div className={`${frameClass} ${aspectClass}`}>
        <video
          src={files[0]}
          poster={cover}
          controls
          className="h-full w-full object-cover"
        />
        {/* Badge vídeo */}
        <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          Vídeo
        </div>
      </div>
    );
  }

  // Carrossel
  const total = files.length;
  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex < total - 1;

  return (
    <div className={`${frameClass} ${aspectClass}`}>
      <img
        src={files[carouselIndex]}
        alt={`Slide ${carouselIndex + 1}`}
        className="h-full w-full object-cover"
      />

      {/* Setas de navegação */}
      {canPrev && (
        <button
          type="button"
          onClick={() => setCarouselIndex((i) => i - 1)}
          className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => setCarouselIndex((i) => i + 1)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Indicador de pontos */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {files.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCarouselIndex(i)}
            className={`size-1.5 rounded-full transition ${
              i === carouselIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
        {carouselIndex + 1}/{total}
      </div>
    </div>
  );
}
