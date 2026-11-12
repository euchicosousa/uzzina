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
  ScanSearchIcon,
  SlidersHorizontalIcon,
  SquareCheckIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "react-aria-components";
import { cn } from "cnfast";
import {
  PrismBadge,
  PrismButton,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismToggle,
} from "~/components/prism";
import { CloudinaryUpload } from "./CloudinaryUpload";
import {
  FileReadResults,
  fileNameFromUrl,
  isReadableWorkFile,
  useFileReading,
  type FileReadFileState,
  type ReadTarget,
} from "./FileReadPanel";
import { detectPostType, isImageUrl } from "./InstagramHelpers";

const LONG_PRESS_MS = 500;
const READ_STATUS: Record<FileReadFileState["state"], string> = {
  queued: "na fila",
  reading: "lendo…",
  done: "pronto",
  failed: "falhou",
};

function SortableThumbnail({
  id,
  url,
  index,
  canOpen,
  showNumber,
  selecting,
  selected,
  locked,
  status,
  onToggle,
}: {
  id: string;
  url: string;
  index: number;
  canOpen: boolean;
  /** The Instagram content keeps its order numbers; work files do not. */
  showNumber: boolean;
  selecting: boolean;
  selected: boolean;
  locked: boolean;
  status?: FileReadFileState["state"];
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isPdf = /\.pdf(\?|#|$)/i.test(url);
  const isImg = isImageUrl(url) && !isPdf;
  const ext =
    url.split("?")[0].split("#")[0].split(".").pop()?.toUpperCase() ?? "FILE";
  const fileName = fileNameFromUrl(url);

  const preview = isImg ? (
    <img src={url} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase opacity-60">
      {ext.slice(0, 4)}
    </div>
  );

  // Touch: holding the thumbnail turns selection on. Dragging stays on the handle.
  const pressTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const cancelPress = () => window.clearTimeout(pressTimer.current);

  // Controls appear on hover/focus; once something is selected they all stay.
  const showSelectControl = selecting
    ? "opacity-100"
    : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100";
  const showHandle = selecting
    ? "opacity-100"
    : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border bg-secondary squircle",
        selected && "outline-2 -outline-offset-2 outline-primary",
        selecting && !locked && "cursor-pointer",
      )}
      onClick={(event) => {
        if (longPressed.current) {
          longPressed.current = false;
          event.preventDefault();
          return;
        }
        if (!selecting || locked) return;
        if ((event.target as HTMLElement).closest("[data-thumb-control]"))
          return;
        onToggle();
      }}
      onContextMenu={(event) => {
        if (window.matchMedia?.("(pointer: coarse)").matches)
          event.preventDefault();
      }}
      onPointerCancel={cancelPress}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" || locked) return;
        if ((event.target as HTMLElement).closest("[data-thumb-control]"))
          return;
        longPressed.current = false;
        cancelPress();
        pressTimer.current = window.setTimeout(() => {
          longPressed.current = true;
          onToggle();
        }, LONG_PRESS_MS);
      }}
      onPointerLeave={cancelPress}
      onPointerMove={cancelPress}
      onPointerUp={cancelPress}
    >
      <PrismButton
        {...attributes}
        {...listeners}
        data-thumb-control
        aria-label={`Reordenar ${fileName}`}
        className={cn(
          "absolute top-1 left-1 z-10 cursor-grab touch-none bg-transparent image-icon transition-opacity hover:bg-transparent hover:no-underline active:cursor-grabbing",
          showHandle,
        )}
        size={"icon-xs"}
        variant={"link"}
      >
        <GripVerticalIcon />
      </PrismButton>

      {showNumber && (
        <PrismBadge className="absolute bottom-1 left-1 z-10">
          {index + 1}
        </PrismBadge>
      )}

      {status && (
        <span className="absolute bottom-1 left-1 z-10 text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
          {READ_STATUS[status]}
        </span>
      )}

      <Checkbox
        data-thumb-control
        aria-label={`Selecionar ${fileName}`}
        className={cn(
          "absolute top-1 right-1 z-10 flex size-6 cursor-pointer items-center justify-center rounded-lg image-icon transition-opacity outline-none data-[disabled]:cursor-not-allowed data-[focus-visible]:ring-2 data-[focus-visible]:ring-white",
          showSelectControl,
        )}
        isDisabled={locked}
        isSelected={selected}
        onChange={onToggle}
      >
        {selected ? (
          <SquareCheckIcon className="size-5" />
        ) : (
          <SquareIcon className="size-5" />
        )}
      </Checkbox>

      {/* Preview */}
      {canOpen && !selecting ? (
        <a
          aria-label={`Abrir ${fileName}`}
          className="block h-full w-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {preview}
        </a>
      ) : (
        preview
      )}
    </div>
  );
}

const MAX_CONTENT_FILES = 20;

type DialogItem = { id: string; url: string; addedAt?: number; name?: string };

interface ContentReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: string[];
  onChange: (files: string[]) => void;
  cloudName: string;
  uploadPreset: string;
  workFiles?: boolean;
  resetVersion?: number;
  /**
   * Reading of the selected work files with AI (transcription and
   * interpretation). Omit to keep the dialog without AI controls.
   */
  ai?: {
    actionId: string;
    /** Inserts HTML at the end of the description; false when it could not. */
    onInsert: (html: string) => boolean | Promise<boolean>;
    getDescriptionLength: () => number;
  };
}

/**
 * Modal para gerenciar e reordenar os content_files via drag and drop.
 * Permite adicionar (até 20), selecionar, excluir (com desfazer) e reordenar
 * arquivos de mídia. Nos arquivos de trabalho de uma ação, a seleção também lê
 * os arquivos com IA.
 */
export function ContentReorderDialog({
  open,
  onOpenChange,
  files,
  onChange,
  cloudName,
  uploadPreset,
  workFiles = false,
  resetVersion,
  ai,
}: ContentReorderDialogProps) {
  const maxFiles = workFiles ? 100 : MAX_CONTENT_FILES;
  const lastResetVersion = useRef(resetVersion);
  const reading = useFileReading(workFiles ? ai?.actionId : undefined);
  const resetReading = reading.reset;

  // Estado interno com id único para o DnD
  const [items, setItems] = useState<DialogItem[]>(() =>
    files.map((url, i) => ({ id: `${url}-${i}`, url })),
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [undo, setUndo] = useState<{
    items: DialogItem[];
    count: number;
  } | null>(null);
  const [insertNotice, setInsertNotice] = useState<string | null>(null);

  const clearSelection = () => {
    resetReading();
    setSelected(new Set());
    setSelectMode(false);
    setInsertNotice(null);
  };

  // Sincroniza quando `files` prop muda externamente apenas se o modal estiver fechado.
  // Isso previne que "stale props" sobrescrevam o estado local durante uploads múltiplos rápidos.
  useEffect(() => {
    if (!open || resetVersion !== lastResetVersion.current) {
      lastResetVersion.current = resetVersion;
      setItems(files.map((url, i) => ({ id: `${url}-${i}`, url })));
      setDragging(false);
    }
    if (!open) {
      resetReading();
      setSelected(new Set());
      setSelectMode(false);
      setUndo(null);
      setInsertNotice(null);
    }
  }, [files, open, resetVersion, resetReading]);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const addRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function commit(next: DialogItem[]) {
    itemsRef.current = next;
    setItems(next);
    onChange(next.map((item) => item.url));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const previous = itemsRef.current;
    const oldIndex = previous.findIndex((item) => item.id === active.id);
    const newIndex = previous.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    // Positions change, so any result read for the old order is stale.
    resetReading();
    setUndo(null);
    commit(arrayMove(previous, oldIndex, newIndex));
  }

  function handleAdd(
    url: string,
    meta: { resourceType?: string; format?: string; originalFilename?: string },
  ) {
    if (itemsRef.current.length >= maxFiles) return;
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

    setUndo(null);
    commit(nextItems);
  }

  const selecting = selected.size > 0 || selectMode;
  const locked = reading.locked;

  function toggleItem(id: string) {
    if (locked) return;
    resetReading();
    setUndo(null);
    setInsertNotice(null);
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (locked) return;
    resetReading();
    setInsertNotice(null);
    setSelected(
      selected.size === items.length
        ? new Set()
        : new Set(items.map((item) => item.id)),
    );
  }

  function deleteSelected() {
    if (locked || selected.size === 0) return;
    const previous = itemsRef.current;
    const next = previous.filter((item) => !selected.has(item.id));
    const count = previous.length - next.length;
    clearSelection();
    setUndo({ items: previous, count });
    commit(next);
    window.requestAnimationFrame(() =>
      addRef.current?.querySelector("button")?.focus(),
    );
  }

  function undoDelete() {
    if (!undo) return;
    const restored = undo.items;
    setUndo(null);
    commit(restored);
  }

  const selectedTargets: ReadTarget[] = items
    .map((item, position) => ({ id: item.id, url: item.url, position }))
    .filter((target) => selected.has(target.id));
  const readable = selectedTargets.filter((target) =>
    isReadableWorkFile(target.url),
  );
  const skipped = selectedTargets.length - readable.length;
  const retryTargets = new Map(readable.map((target) => [target.id, target]));
  const statusById = new Map(
    reading.transcription?.files.map((file) => [
      file.target.id,
      file.read.state,
    ]),
  );

  async function insertResult(html: string, kind: "tr" | "ip") {
    if (!ai) return;
    setInsertNotice(null);
    const done = await ai.onInsert(html);
    if (!done) {
      setInsertNotice(
        "Não foi possível inserir agora. Aguarde a descrição ficar disponível e tente de novo.",
      );
      return;
    }
    if (kind === "tr") reading.setInsertedTr(true);
    else reading.setInsertedIp(true);
  }

  const postType = detectPostType(items.map((i) => i.url));
  const aiEnabled = workFiles && ai !== undefined;
  const plural = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`;

  return (
    <PrismDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      isKeyboardDismissDisabled={dragging}
    >
      <PrismDialogHeader className="border-b">
        <PrismDialogTitle className="flex items-center gap-2">
          <SlidersHorizontalIcon />
          {workFiles ? "Gerenciar arquivos" : "Gerenciar conteúdo"}
        </PrismDialogTitle>
        <PrismDialogDescription className="sr-only">
          Selecione, reordene ou remova os arquivos desta ação.
        </PrismDialogDescription>
      </PrismDialogHeader>

      {/* Contagem, seleção e desfazer */}
      <div className="flex min-h-8 items-center justify-between gap-2 px-5 pt-3 text-xs text-secondary-foreground">
        <span aria-live="polite">
          {selecting ? (
            plural(selected.size, "selecionado", "selecionados")
          ) : undo ? (
            <>
              {plural(undo.count, "arquivo removido", "arquivos removidos")} ·{" "}
              <PrismButton size="xs" variant="link" onClick={undoDelete}>
                Desfazer
              </PrismButton>
            </>
          ) : (
            !workFiles && (
              <>
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
              </>
            )
          )}
        </span>
        {selecting ? (
          <span className="flex items-center gap-1">
            {!locked && (
              <PrismButton size="xs" variant="link" onClick={toggleAll}>
                {selected.size === items.length
                  ? "Limpar seleção"
                  : "Selecionar todos"}
              </PrismButton>
            )}
            <PrismButton size="xs" variant="link" onClick={clearSelection}>
              Cancelar
            </PrismButton>
          </span>
        ) : (
          <span>
            {items.length}/{maxFiles} arquivo{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {!workFiles && postType === "video" && (
        <p className="rounded-xl bg-secondary px-3 py-2 text-xs text-secondary-foreground squircle">
          <strong>Vídeo:</strong> 1º arquivo = vídeo principal. 2º arquivo
          (opcional) = capa/thumbnail que aparece antes do play.
        </p>
      )}

      {/* Grid DnD */}
      {items.length === 0 ? (
        <div className="m-5 flex h-32 items-center justify-center rounded-xl border border-dashed bg-secondary text-sm text-secondary-foreground squircle">
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
                  canOpen={workFiles}
                  id={item.id}
                  index={index}
                  locked={locked}
                  onToggle={() => toggleItem(item.id)}
                  selected={selected.has(item.id)}
                  selecting={selecting}
                  showNumber={!workFiles}
                  status={
                    selected.has(item.id) ? statusById.get(item.id) : undefined
                  }
                  url={item.url}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {aiEnabled && (
        <FileReadResults
          getDescriptionLength={ai.getDescriptionLength}
          onInsert={(html, kind) => void insertResult(html, kind)}
          onRetry={(target) => void reading.retry(target)}
          reading={reading}
          retryTargets={retryTargets}
          skipped={
            reading.transcription || reading.interpretation ? skipped : 0
          }
        />
      )}
      {insertNotice && (
        <p className="px-5 pb-2 text-xs text-error" role="alert">
          {insertNotice}
        </p>
      )}

      {/* Toolbar inferior */}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t bg-popover px-5 py-3">
        {selecting ? (
          <>
            <PrismButton
              isDisabled={selected.size === 0 || locked}
              onClick={deleteSelected}
              size="sm"
              variant="error"
            >
              Excluir
              <Trash2Icon />
            </PrismButton>
            {aiEnabled && (
              <div
                aria-label="Ler os arquivos selecionados"
                className="flex items-center gap-2"
                role="group"
              >
                <PrismButton
                  isDisabled={readable.length === 0}
                  onClick={() => void reading.transcribe(readable)}
                  size="sm"
                >
                  Transcrição
                </PrismButton>
                <PrismButton
                  isDisabled={readable.length === 0}
                  onClick={() =>
                    void reading.interpret(readable, reading.careful)
                  }
                  size="sm"
                >
                  Interpretação
                </PrismButton>
                <span
                  className="contents"
                  title="Leitura cuidadosa: a interpretação usa um modelo mais forte. Mais lenta e um pouco mais cara. Não muda a transcrição."
                >
                  <PrismToggle
                    aria-label="Leitura cuidadosa"
                    isDisabled={readable.length === 0}
                    isSelected={reading.careful}
                    onChange={(value) => {
                      reading.setCareful(value);
                      if (reading.interpretation)
                        void reading.interpret(readable, value);
                    }}
                    size="icon-sm"
                    variant="secondary"
                  >
                    <ScanSearchIcon />
                  </PrismToggle>
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <div ref={addRef} className="flex items-center gap-2">
              <CloudinaryUpload
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                folder={workFiles ? "uzzina/work" : "uzzina/content"}
                resourceType="auto"
                multiple
                onUpload={handleAdd}
              >
                Adicionar
                <PlusIcon />
              </CloudinaryUpload>

              {items.length > 0 && (
                <PrismButton
                  className="pointer-fine:hidden"
                  onClick={() => setSelectMode(true)}
                  size="xs"
                  variant="ghost"
                >
                  Selecionar
                </PrismButton>
              )}
            </div>

            <PrismButton size="xs" onClick={() => onOpenChange(false)}>
              Concluir
            </PrismButton>
          </>
        )}
      </div>
    </PrismDialog>
  );
}
