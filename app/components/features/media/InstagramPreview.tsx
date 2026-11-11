import { useEffect, useRef, useState } from "react";
import { PrismButton } from "~/components/prism";
import { detectPostType } from "./InstagramHelpers";
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react";

interface InstagramPreviewProps {
  files?: string[] | null;
  /** Phone-width panel: keep the 4:5 frame but cap its height. */
  compact?: boolean;
}

/** Keeps a slide index inside the carousel bounds. */
function clampIndex(index: number, total: number) {
  return Math.min(Math.max(index, 0), Math.max(total - 1, 0));
}

/**
 * Prévia visual de um post do Instagram com base nos content_files.
 * - 0 arquivos → placeholder
 * - 1 imagem → imagem estática
 * - N imagens → carrossel com swipe (scroll-snap) e navegação
 * - 1 vídeo → player de vídeo (com capa opcional em files[1])
 */
export function InstagramPreview({ files, compact }: InstagramPreviewProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const type = detectPostType(files as string[]);
  const total = files?.length ?? 0;
  const filesKey = files?.join("\n") ?? "";

  // Cancel a pending scroll frame when the preview unmounts.
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // When the slides change, keep the index in bounds and re-align without animation.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || total === 0 || track.clientWidth === 0) return;
    const index = clampIndex(
      Math.round(track.scrollLeft / track.clientWidth),
      total,
    );
    track.scrollTo({ left: index * track.clientWidth, behavior: "auto" });
    setCarouselIndex(index);
  }, [filesKey, total]);

  // Proporção Instagram feed padrão 4:5
  // On a compact panel the height is fixed and the width follows the ratio, so
  // the preview leaves room for writing without cropping the post.
  const frameClass = compact
    ? "relative mx-auto h-[min(18rem,45svh)] w-auto max-w-full overflow-hidden rounded-xl border bg-secondary squircle"
    : "relative w-full overflow-hidden rounded-xl border bg-secondary squircle";
  const aspectClass = "aspect-[4/5]";

  if (!files || files.length === 0) {
    return (
      <div className={`${frameClass} ${aspectClass}`}>
        <div className="flex h-full flex-col items-center justify-center gap-2 opacity-30">
          <ImageIcon className="size-10" />
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
          aria-label="Vídeo do Instagram"
        >
          <track kind="captions" />
        </video>
        {/* Badge vídeo */}
        <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          Vídeo
        </div>
      </div>
    );
  }

  // Carrossel
  const canPrev = carouselIndex > 0;
  const canNext = carouselIndex < total - 1;

  const scrollToSlide = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  // Scroll position drives the index; at most one update per frame.
  const handleScroll = () => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const track = trackRef.current;
      if (!track || track.clientWidth === 0) return;
      const next = clampIndex(
        Math.round(track.scrollLeft / track.clientWidth),
        total,
      );
      setCarouselIndex((prev) => (prev === next ? prev : next));
    });
  };

  return (
    <div className={`${frameClass} ${aspectClass}`}>
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Imagens do post"
        onScroll={handleScroll}
        className="flex h-full w-full touch-pan-x touch-pan-y snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
      >
        {files.map((url, i) => (
          <div
            key={`${i}-${url}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} de ${total}`}
            className="h-full w-full shrink-0 snap-center snap-always"
          >
            <img
              src={url}
              alt={`Slide ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Setas de navegação */}
      {canPrev && (
        <PrismButton
          size="icon-xs"
          variant="ghost"
          onClick={() => scrollToSlide(carouselIndex - 1)}
          className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          aria-label="Imagem anterior"
        >
          <ChevronLeftIcon className="size-4 opacity-100" />
        </PrismButton>
      )}
      {canNext && (
        <PrismButton
          size="icon-xs"
          variant="ghost"
          onClick={() => scrollToSlide(carouselIndex + 1)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          aria-label="Próxima imagem"
        >
          <ChevronRightIcon className="size-4 opacity-100" />
        </PrismButton>
      )}

      {/* Indicador de pontos */}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {files.map((url, i) => (
          <PrismButton
            key={`${i}-${url}`}
            variant="unstyled"
            onClick={() => scrollToSlide(i)}
            aria-label={`Ir para o slide ${i + 1}`}
            className={`size-1.5 rounded-full transition outline-none focus-visible:ring-3 focus-visible:ring-ring/30 ${
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
