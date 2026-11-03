import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVerticalIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  PrismButton,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
} from "~/components/prism";
import { CloudinaryUpload } from "./CloudinaryUpload";
import { detectPostType, isImageUrl } from "./InstagramHelpers";

function SortableThumbnail({
  id,
  url,
  index,
  onRemove,
  removeRef,
}: {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
  removeRef: (element: HTMLButtonElement | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // opacity: isDragging ? 0.4 : 1,
  };

  const isImg = isImageUrl(url);
  const ext =
    url.split("?")[0].split("#")[0].split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted squircle"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reordenar arquivo ${index + 1}`}
        className="absolute top-1 left-1 z-10 flex size-8 cursor-grab touch-none items-center justify-center rounded bg-black/70 text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30 active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-4" />
      </button>

      {/* Número de ordem */}
      <div className="absolute bottom-1 left-1 z-10 rounded bg-black/70 px-1 text-xs font-bold text-white squircle">
        {index + 1}
      </div>

      {/* Remover */}
      <button
        ref={removeRef}
        type="button"
        aria-label={`Remover arquivo ${index + 1}`}
        onClick={onRemove}
        className="absolute top-1 right-1 z-10 flex size-8 items-center justify-center rounded bg-destructive text-white outline-none squircle focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <XIcon className="size-4" />
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

  // Sincroniza quando `files` prop muda externamente apenas se o modal estiver fechado.
  // Isso previne que "stale props" sobrescrevam o estado local durante uploads múltiplos rápidos.
  useEffect(() => {
    if (!open) {
      setItems(files.map((url, i) => ({ id: `${url}-${i}`, url })));
      setDragging(false);
    }
  }, [files, open]);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const removeRefs = useRef(new Map<string, HTMLButtonElement>());
  const addRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    const nextItem = items.find((item) => item.id === target);
    const button =
      (nextItem && removeRefs.current.get(nextItem.id)) ??
      addRef.current?.querySelector("button");
    button?.focus();
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const previous = itemsRef.current;
    const oldIndex = previous.findIndex((item) => item.id === active.id);
    const newIndex = previous.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(previous, oldIndex, newIndex);
    itemsRef.current = next;
    setItems(next);
    onChange(next.map((item) => item.url));
  }

  function handleRemove(id: string) {
    const previous = itemsRef.current;
    const index = previous.findIndex((item) => item.id === id);
    if (index < 0) return;
    const next = previous.filter((item) => item.id !== id);
    pendingFocus.current = next[Math.min(index, next.length - 1)]?.id ?? "";
    itemsRef.current = next;
    setItems(next);
    onChange(next.map((item) => item.url));
  }

  function handleAdd(
    url: string,
    meta: { resourceType?: string; format?: string; originalFilename?: string },
  ) {
    if (itemsRef.current.length >= MAX_FILES) return;
    const getNow = () => Date.now();
    const now = getNow();
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
    <PrismDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      isKeyboardDismissDisabled={dragging}
    >
      <PrismDialogHeader className="border-b">
        <PrismDialogTitle className="flex items-center gap-2">
          <SlidersHorizontalIcon />
          Gerenciar conteúdo
        </PrismDialogTitle>
        <PrismDialogDescription className="sr-only">
          Selecione, reordene ou remova os arquivos de mídia desta ação.
        </PrismDialogDescription>
      </PrismDialogHeader>

      {/* InfoIcon do tipo detectado */}
      <div className="flex items-center justify-between px-5 pt-3 text-xs text-muted-foreground">
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
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground squircle">
          <strong>Vídeo:</strong> 1º arquivo = vídeo principal. 2º arquivo
          (opcional) = capa/thumbnail que aparece antes do play.
        </p>
      )}

      {/* Grid DnD */}
      {items.length === 0 ? (
        <div className="m-5 flex h-32 items-center justify-center rounded-xl border border-dashed bg-muted text-sm text-muted-foreground squircle">
          Nenhum arquivo adicionado ainda
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={() => setDragging(true)}
          onDragCancel={() => setDragging(false)}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-2 px-5 py-3 sm:grid-cols-4">
              {items.map((item, index) => (
                <SortableThumbnail
                  key={item.id}
                  id={item.id}
                  url={item.url}
                  index={index}
                  onRemove={() => handleRemove(item.id)}
                  removeRef={(element) => {
                    if (element) removeRefs.current.set(item.id, element);
                    else removeRefs.current.delete(item.id);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Toolbar inferior */}
      <div className="flex items-center justify-between border-t px-5 py-3">
        <div ref={addRef} className="flex items-center gap-2">
          <CloudinaryUpload
            cloudName={cloudName}
            uploadPreset={uploadPreset}
            folder="uzzina/content"
            resourceType="auto"
            multiple
            onUpload={handleAdd}
          >
            <PlusIcon />
            Adicionar
          </CloudinaryUpload>

          {items.length > 0 && (
            <PrismButton
              variant="destructive"
              size="xs"
              onClick={() => {
                pendingFocus.current = "";
                itemsRef.current = [];
                setItems([]);
                onChange([]);
              }}
              aria-label="Limpar"
            >
              <Trash2Icon className="size-4" />
            </PrismButton>
          )}
        </div>

        <PrismButton size="xs" onClick={() => onOpenChange(false)}>
          Concluir
        </PrismButton>
      </div>
    </PrismDialog>
  );
}
