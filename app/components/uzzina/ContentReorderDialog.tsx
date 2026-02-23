import { useEffect, useState, useRef } from "react";
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
  IconGripVertical,
  IconPlus,
  IconAdjustments,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { detectPostType, isImageUrl } from "./InstagramHelpers";

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
        <IconGripVertical className="size-3 text-white" />
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
        <IconX className="size-2.5" />
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
  const [items, setItems] = useState<
    { id: string; url: string; addedAt?: number; name?: string }[]
  >(() => files.map((url, i) => ({ id: `${url}-${i}`, url })));

  // Sincroniza quando `files` prop muda externamente (ex: reset)
  useEffect(() => {
    setItems(files.map((url, i) => ({ id: `${url}-${i}`, url })));
  }, [files]);

  const itemsRef = useRef(items);
  itemsRef.current = items;

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

  function handleAdd(
    url: string,
    meta: { resourceType?: string; format?: string; originalFilename?: string },
  ) {
    if (itemsRef.current.length >= MAX_FILES) return;
    const now = Date.now();
    const newItem = {
      id: `${url}-${now}-${Math.random().toString(36).substring(7)}`,
      url,
      name: meta.originalFilename || url,
      addedAt: now,
    };

    let nextItems = [...itemsRef.current, newItem];

    // Sort only the recently uploaded batch (last 5 seconds)
    const splitIndex = nextItems.findIndex(
      (i) => i.addedAt && i.addedAt > now - 5000,
    );

    if (splitIndex !== -1) {
      const oldItems = nextItems.slice(0, splitIndex);
      const recentItems = nextItems.slice(splitIndex);
      recentItems.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      nextItems = [...oldItems, ...recentItems];
    }

    itemsRef.current = nextItems;
    setItems(nextItems);
    onChange(nextItems.map((i) => i.url));
  }

  const postType = detectPostType(items.map((i) => i.url));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconAdjustments className="size-4" />
            Gerenciar conteúdo
          </DialogTitle>
          <DialogDescription className="sr-only">
            Selecione, reordene ou remova os arquivos de mídia desta ação.
          </DialogDescription>
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
              <IconPlus className="size-4" />
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
                <IconTrash className="size-4" />
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
