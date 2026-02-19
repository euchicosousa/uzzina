import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  ImageIcon,
  PlusIcon,
  Settings2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Detecta o tipo de post com base nos arquivos de conteúdo. */
export type PostType = "empty" | "image" | "video" | "carousel";

export function detectPostType(files: string[]): PostType {
  if (files.length === 0) return "empty";
  const first = files[0];
  const isVideo =
    first.includes("/video/upload/") ||
    /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(first);
  if (isVideo) return "video";
  if (files.length === 1) return "image";
  return "carousel";
}

/** Detecta se uma URL é de imagem (Cloudinary image ou extensão comum). */
export function isImageUrl(url: string): boolean {
  return (
    url.includes("/image/upload/") ||
    /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url)
  );
}

// ---------------------------------------------------------------------------
// InstagramPreview
// ---------------------------------------------------------------------------

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
          <ChevronLeftIcon className="size-4" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => setCarouselIndex((i) => i + 1)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
        >
          <ChevronRightIcon className="size-4" />
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

// ---------------------------------------------------------------------------
// SortableThumbnail (item DnD dentro do modal)
// ---------------------------------------------------------------------------

function SortableThumbnail({
  id,
  url,
  index,
  onRemove,
}: {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isImg = isImageUrl(url);
  const ext =
    url.split("?")[0].split("#")[0].split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-muted relative aspect-square overflow-hidden rounded-lg border"
    >
      {/* Handle de drag */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 cursor-grab rounded bg-black/40 p-0.5 opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-3 text-white" />
      </div>

      {/* Número de ordem */}
      <div className="absolute top-1 right-6 z-10 rounded bg-black/40 px-1 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100">
        {index + 1}
      </div>

      {/* Remover */}
      <button
        type="button"
        onClick={onRemove}
        className="bg-destructive absolute top-1 right-1 z-10 hidden size-4 items-center justify-center rounded-full text-white group-hover:flex"
      >
        <XIcon className="size-2.5" />
      </button>

      {/* Preview */}
      {isImg ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase opacity-60">
          {ext.slice(0, 4)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContentReorderDialog
// ---------------------------------------------------------------------------

const MAX_FILES = 20;

interface ContentReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: string[];
  onChange: (files: string[]) => void;
  cloudName: string;
  uploadPreset: string;
}

/**
 * Modal para gerenciar e reordenar os content_files via drag and drop.
 * Permite adicionar (até 20), remover e reordenar arquivos de mídia.
 */
export function ContentReorderDialog({
  open,
  onOpenChange,
  files,
  onChange,
  cloudName,
  uploadPreset,
}: ContentReorderDialogProps) {
  // Estado interno com id único para o DnD
  const [items, setItems] = useState<{ id: string; url: string }[]>(() =>
    files.map((url, i) => ({ id: `${url}-${i}`, url })),
  );

  // Sincroniza quando `files` prop muda externamente (ex: reset)
  useEffect(() => {
    setItems(files.map((url, i) => ({ id: `${url}-${i}`, url })));
  }, [files]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      onChange(next.map((i) => i.url));
      return next;
    });
  }

  function handleRemove(id: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      onChange(next.map((i) => i.url));
      return next;
    });
  }

  function handleAdd(url: string) {
    if (items.length >= MAX_FILES) return;
    const newItem = { id: `${url}-${Date.now()}`, url };
    setItems((prev) => {
      const next = [...prev, newItem];
      onChange(next.map((i) => i.url));
      return next;
    });
  }

  const postType = detectPostType(items.map((i) => i.url));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2Icon className="size-4" />
            Gerenciar conteúdo
          </DialogTitle>
        </DialogHeader>

        {/* Info do tipo detectado */}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            Tipo detectado:{" "}
            <strong className="text-foreground capitalize">
              {postType === "empty"
                ? "vazio"
                : postType === "image"
                  ? "imagem"
                  : postType === "video"
                    ? "vídeo"
                    : "carrossel"}
            </strong>
          </span>
          <span>
            {items.length}/{MAX_FILES} arquivo{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {postType === "video" && (
          <p className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-xs">
            <strong>Vídeo:</strong> 1º arquivo = vídeo principal. 2º arquivo
            (opcional) = capa/thumbnail que aparece antes do play.
          </p>
        )}

        {/* Grid DnD */}
        {items.length === 0 ? (
          <div className="text-muted-foreground flex h-32 items-center justify-center rounded-xl border border-dashed text-sm">
            Nenhum arquivo adicionado ainda
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-4 gap-2">
                {items.map((item, index) => (
                  <SortableThumbnail
                    key={item.id}
                    id={item.id}
                    url={item.url}
                    index={index}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Toolbar inferior */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex gap-2">
            <CloudinaryUpload
              cloudName={cloudName}
              uploadPreset={uploadPreset}
              folder="uzzina/content"
              resourceType="auto"
              multiple
              onUpload={handleAdd}
              className="hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition disabled:opacity-50"
            >
              <PlusIcon className="size-4" />
              Adicionar
            </CloudinaryUpload>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setItems([]);
                  onChange([]);
                }}
              >
                <Trash2Icon className="size-4" />
                Limpar
              </Button>
            )}
          </div>

          <Button size="sm" onClick={() => onOpenChange(false)}>
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
