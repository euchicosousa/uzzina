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
  ImageIcon,
  PlayIcon,
  PlusIcon,
  ScanSearchIcon,
  SlidersHorizontalIcon,
  SquareCheckIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { cn } from "cnfast";
import {
  PrismBadge,
  PrismButton,
  PrismCheckbox,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { MAX_INSTAGRAM_FILES } from "~/lib/instagram-reference";
import { CloudinaryUpload } from "./CloudinaryUpload";
import {
  FilePreviewPanel,
  getCloudinaryVideoPosterUrl,
  getFilePreviewDetails,
} from "./FilePreviewPanel";
import { FileUploadQueue } from "./FileUploadQueue";
import {
  InstagramReferencePopover,
  type ReferenceTarget,
} from "./InstagramReferencePopover";
import { useInstagramReference } from "./useInstagramReference";
import {
  compareUploadedFiles,
  useDirectFileUploads,
  type FileUploadTransport,
  type UploadedBatchFile,
} from "./useDirectFileUploads";
import {
  FileReadResults,
  isReadableWorkFile,
  useFileReading,
  type FileReadFileState,
  type ReadTarget,
} from "./FileReadPanel";
import { detectPostType } from "./InstagramHelpers";

const LONG_PRESS_MS = 500;
const PREVIEW_MIN_WIDTH = 960;
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
  onToggleAll,
  onPreview,
  previewPanelId,
  maxWidth,
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
  onToggleAll?: () => void;
  onPreview?: (trigger: HTMLButtonElement) => void;
  previewPanelId?: string;
  maxWidth?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    maxWidth,
  };

  const [failedPosterUrl, setFailedPosterUrl] = useState<string | null>(null);
  const { name: fileName, extension, type } = getFilePreviewDetails(url);
  const posterUrl = type === "video" ? getCloudinaryVideoPosterUrl(url) : null;
  const showPoster = Boolean(posterUrl && failedPosterUrl !== url);

  const preview =
    type === "image" ? (
      <img src={url} alt="" className="h-full w-full object-cover" />
    ) : showPoster && posterUrl ? (
      <>
        <img
          src={posterUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailedPosterUrl(url)}
        />
        <PlayIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 size-6 -translate-1/2 image-icon text-white"
        />
      </>
    ) : (
      <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase opacity-60">
        {(extension ?? "FILE").slice(0, 4)}
      </div>
    );

  // Touch: holding the thumbnail turns selection on. Dragging stays on the handle.
  const pressTimer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const shiftSelectRef = useRef(false);
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
      data-focus-thumbnail=""
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border bg-card squircle",
        maxWidth && "w-full justify-self-center",
        selected &&
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[calc(var(--radius-xl)-2px)] after:border-2 after:border-primary after:squircle",
        previewPanelId &&
          "ring-2 ring-primary ring-offset-2 ring-offset-popover",
        !onPreview && selecting && !locked && "cursor-pointer",
      )}
      onClick={(event) => {
        if (longPressed.current) {
          longPressed.current = false;
          event.preventDefault();
          return;
        }
        if (onPreview || !selecting || locked) return;
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
        onKeyDown={(event) => {
          listeners?.onKeyDown?.(event);
          event.continuePropagation();
        }}
        // Keep the document-level drag sensor reachable for Space and Enter.
        onPressStart={(event) => {
          if (event.pointerType === "keyboard") event.continuePropagation();
        }}
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

      <PrismCheckbox
        data-thumb-control
        aria-label={`Selecionar ${fileName}`}
        className={cn(
          "absolute top-1 right-1 z-10 flex size-6 cursor-pointer items-center justify-center rounded-lg transition-opacity outline-none data-disabled:cursor-not-allowed",
          showSelectControl,
        )}
        boxClassName="bg-transparent border-2 border-white"
        isDisabled={locked}
        isSelected={selected}
        onChange={() => {
          const shouldToggleAll = shiftSelectRef.current;
          shiftSelectRef.current = false;
          if (shouldToggleAll && onToggleAll) onToggleAll();
          else onToggle();
        }}
        onClickCapture={(event) => {
          if (event.shiftKey) shiftSelectRef.current = true;
        }}
        onPointerDown={(event) => {
          shiftSelectRef.current =
            event.pointerType !== "touch" && event.shiftKey;
        }}
      >
        {selected ? (
          <SquareCheckIcon className="size-5" />
        ) : (
          <SquareIcon className="size-5" />
        )}
      </PrismCheckbox>

      {/* Preview */}
      {onPreview ? (
        <button
          aria-controls={previewPanelId}
          aria-label={`Visualizar ${fileName}`}
          data-focus-thumbnail-control=""
          aria-pressed={Boolean(previewPanelId)}
          className="block h-full w-full cursor-pointer"
          type="button"
          onClick={(event) => {
            if (!longPressed.current) onPreview(event.currentTarget);
          }}
        >
          {preview}
        </button>
      ) : canOpen && !selecting ? (
        <a
          aria-label={`Abrir ${fileName}`}
          data-focus-thumbnail-control=""
          className="block h-full w-full"
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

const THUMBNAIL_SIZES = [
  { id: "small", label: <ImageIcon className="size-3" />, maxWidth: 80 },
  { id: "medium", label: <ImageIcon className="size-4" />, maxWidth: 112 },
  { id: "large", label: <ImageIcon className="size-5" />, maxWidth: 160 },
] as const;
const DEFAULT_THUMBNAIL_SIZE = THUMBNAIL_SIZES[1];
const THUMBNAIL_MIN_RATIO = 0.85;

type DialogItem = {
  id: string;
  url: string;
  addedAt?: number;
  name?: string;
  upload?: UploadedBatchFile;
};

interface FileManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: string[];
  onChange: (files: string[]) => void;
  cloudName: string;
  uploadPreset: string;
  workFiles?: boolean;
  directUpload?: boolean;
  uploadTransport?: FileUploadTransport;
  instagramReference?: ReferenceTarget;
  onUploadActiveChange?: (active: boolean) => void;
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
export function FileManagerDialog({
  open,
  onOpenChange,
  files,
  onChange,
  cloudName,
  uploadPreset,
  workFiles = false,
  directUpload = false,
  uploadTransport,
  instagramReference,
  onUploadActiveChange,
  resetVersion,
  ai,
}: FileManagerDialogProps) {
  const maxFiles = workFiles ? 100 : MAX_INSTAGRAM_FILES;
  const lastResetVersion = useRef(resetVersion);
  const reading = useFileReading(workFiles ? ai?.actionId : undefined);
  const resetReading = reading.reset;

  // Estado interno com id único para o DnD
  const [items, setItems] = useState<DialogItem[]>(() =>
    files.map((url, i) => ({ id: `${url}-${i}`, url })),
  );
  const itemsRef = useRef(items);
  const nextId = useRef(0);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [undo, setUndo] = useState<{
    items: DialogItem[];
    count: number;
  } | null>(null);
  const [insertNotice, setInsertNotice] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [thumbnailSize, setThumbnailSize] = useState<
    (typeof THUMBNAIL_SIZES)[number]
  >(DEFAULT_THUMBNAIL_SIZE);
  const isDesktop = useIsDesktop(PREVIEW_MIN_WIDTH);
  const isCoarsePointer =
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(pointer: coarse)").matches);
  const canPreview = directUpload && isDesktop;
  const [previewId, setPreviewId] = useState<string | null>(null);
  const panelId = useId();
  const previewTrigger = useRef<HTMLButtonElement | null>(null);
  const previewItem = canPreview
    ? items.find((item) => item.id === previewId)
    : undefined;

  useEffect(() => {
    if (!open || !previewItem) {
      setPreviewId(null);
      previewTrigger.current = null;
    }
  }, [open, previewItem]);

  function closePreview() {
    setPreviewId(null);
    previewTrigger.current?.focus({ preventScroll: true });
  }

  const clearSelection = () => {
    resetReading();
    setSelected(new Set());
    setSelectMode(false);
    setInsertNotice(null);
  };

  // Reconcile external updates without replacing the IDs of remaining items.
  useEffect(() => {
    if (directUpload) {
      const previous = itemsRef.current;
      if (
        files.length !== previous.length ||
        files.some((url, index) => url !== previous[index]?.url)
      ) {
        const remaining = [...previous];
        const next = files.map((url) => {
          const match = remaining.findIndex((item) => item.url === url);
          if (match >= 0) {
            const [existing] = remaining.splice(match, 1);
            if (existing) return existing;
          }
          return { id: `file-${nextId.current++}`, url };
        });
        itemsRef.current = next;
        setItems(next);
        setSelected(new Set());
        setUndo(null);
        resetReading();
      }
    } else if (!open || resetVersion !== lastResetVersion.current) {
      lastResetVersion.current = resetVersion;
      const next = files.map((url, i) => ({ id: `${url}-${i}`, url }));
      itemsRef.current = next;
      setItems(next);
      setDragging(false);
    }
    if (!open) {
      setDropActive(false);
      resetReading();
      setSelected(new Set());
      setSelectMode(false);
      setUndo(null);
      setInsertNotice(null);
    }
  }, [directUpload, files, open, resetVersion, resetReading]);

  const addRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [referencePopoverOpen, setReferencePopoverOpen] = useState(false);
  useEffect(() => {
    if (!open) setReferencePopoverOpen(false);
  }, [open]);
  const manualUploadActive = useRef(false);
  const reference = useInstagramReference({
    cloudName,
    getFiles: () => itemsRef.current.map((item) => item.url),
    getAvailableSlots: () => maxFiles - itemsRef.current.length,
    isManualUploadActive: () => manualUploadActive.current,
    onActiveChange: (active) =>
      onUploadActiveChange?.(active || manualUploadActive.current),
    onImported: (url, before, after) => {
      addReferenceFile(url, before, after);
    },
  });
  const referenceRows = reference.entries.flatMap((entry) => {
    if (entry.state === "completed" || entry.state === "dismissed") return [];
    const kind = entry.kind === "image" ? "Imagem" : "Vídeo";
    return [
      {
        id: entry.position,
        name: `Instagram · ${entry.position + 1}. ${kind}`,
        status: entry.state,
        progress: null,
        error: entry.error,
        canRetry: !reference.active && !manualUploadActive.current,
        canRemove: entry.state !== "uploading",
      },
    ];
  });
  const uploads = useDirectFileUploads({
    cloudName,
    uploadPreset,
    uploadTransport,
    workFiles,
    getAvailableSlots: () => maxFiles - itemsRef.current.length,
    onUploaded: (url) => {
      setUndo(null);
      commit([...itemsRef.current, { id: `file-${nextId.current++}`, url }]);
    },
    onBatchUploaded: workFiles ? undefined : addInstagramBatch,
    onActiveChange: (active) => {
      manualUploadActive.current = active;
      onUploadActiveChange?.(active || reference.isActive());
    },
  });

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

  function addReferenceFile(
    url: string,
    before: readonly string[],
    after: readonly string[],
  ) {
    const current = itemsRef.current;
    if (current.some((item) => item.url === url)) return;
    const next = [...current];
    const successor = after
      .map((anchor) => next.findIndex((item) => item.url === anchor))
      .find((index) => index >= 0);
    const predecessor = [...before]
      .reverse()
      .map((anchor) => next.findIndex((item) => item.url === anchor))
      .find((index) => index >= 0);
    const position =
      successor ?? (predecessor === undefined ? next.length : predecessor + 1);
    next.splice(position, 0, { id: `file-${nextId.current++}`, url });
    setUndo(null);
    commit(next);
  }

  function addInstagramBatch(batch: UploadedBatchFile[]) {
    const next = [...itemsRef.current];
    for (const upload of batch) {
      const item = { id: `file-${nextId.current++}`, url: upload.url, upload };
      // A retry rejoins its own batch without rearranging items already placed.
      let position = next.length;
      for (const [index, { upload: other }] of next.entries()) {
        if (other?.batchId !== upload.batchId) continue;
        if (compareUploadedFiles(other, upload) > 0) {
          position = index;
          break;
        }
        position = index + 1;
      }
      next.splice(position, 0, item);
    }
    setUndo(null);
    commit(next);
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

  function isExternalDrop(event: DragEvent) {
    return directUpload && event.dataTransfer.types.includes("Files");
  }

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
    setUndo(null);
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
    finishRef.current?.focus();
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
      className={cn(
        directUpload && "grid-rows-[minmax(0,1fr)] overflow-hidden",
        previewItem && "h-[min(48rem,100%)] sm:max-w-6xl",
      )}
      size="2xl"
      isOpen={open}
      onOpenChange={onOpenChange}
      isKeyboardDismissDisabled={
        dragging || Boolean(previewItem) || referencePopoverOpen
      }
    >
      <div
        className={cn(directUpload && "flex min-h-0 flex-col")}
        onKeyDownCapture={(event) => {
          if (
            event.key !== "Escape" ||
            !previewItem ||
            dragging ||
            referencePopoverOpen
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          closePreview();
        }}
      >
        <PrismDialogHeader className="shrink-0 border-b">
          <PrismDialogTitle className="flex items-center gap-2">
            <SlidersHorizontalIcon />
            {directUpload
              ? "Arquivos"
              : workFiles
                ? "Gerenciar arquivos"
                : "Gerenciar conteúdo"}
          </PrismDialogTitle>
          <PrismDialogDescription className="sr-only">
            {directUpload
              ? "Adicione, selecione, reordene ou remova os arquivos desta ação."
              : "Selecione, reordene ou remova os arquivos desta ação."}
          </PrismDialogDescription>
        </PrismDialogHeader>

        <div
          className={cn(
            directUpload && "grid min-h-0 flex-1",
            previewItem && "grid-cols-[minmax(0,1fr)_clamp(18rem,38%,28rem)]",
          )}
        >
          <div
            className={cn(
              "px-4 pb-4",
              directUpload &&
                "min-h-0 min-w-0 overflow-y-auto overscroll-contain",
            )}
            data-file-manager-list
          >
            {/* Contagem, seleção e desfazer */}
            <div className="flex min-h-8 items-center justify-between gap-2 px-5 text-xs text-secondary-foreground">
              <span aria-live="polite">
                {selecting ? (
                  plural(selected.size, "selecionado", "selecionados")
                ) : undo ? (
                  <>
                    {plural(
                      undo.count,
                      "arquivo removido",
                      "arquivos removidos",
                    )}{" "}
                    ·{" "}
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
                  <PrismButton
                    size="xs"
                    variant="link"
                    onClick={clearSelection}
                  >
                    Cancelar
                  </PrismButton>
                </span>
              ) : (
                <span>
                  {items.length}/{maxFiles} arquivo
                  {items.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {!workFiles && postType === "video" && (
              <p className="rounded-xl bg-card px-3 py-2 text-xs text-secondary-foreground squircle">
                <strong>Vídeo:</strong> 1º arquivo = vídeo principal. 2º arquivo
                (opcional) = capa/thumbnail que aparece antes do play.
              </p>
            )}

            {directUpload && (
              <input
                accept={uploads.accept}
                hidden
                id={inputId}
                multiple
                ref={inputRef}
                type="file"
                onChange={(event) => {
                  const input = event.currentTarget;
                  if (input.files?.length && !reference.isActive())
                    uploads.enqueue(input.files);
                  input.value = "";
                }}
              />
            )}
            <div
              className={cn(
                "rounded-2xl border bg-card squircle hover:bg-secondary",
                dropActive && "bg-secondary",
              )}
              onDragOver={(event) => {
                if (!isExternalDrop(event)) return;
                event.preventDefault();
                const blocked = locked || reference.isActive();
                event.dataTransfer.dropEffect = blocked ? "none" : "copy";
                if (!blocked) setDropActive(true);
              }}
              onDragLeave={(event) => {
                if (!isExternalDrop(event)) return;
                if (
                  event.relatedTarget instanceof Node &&
                  event.currentTarget.contains(event.relatedTarget)
                )
                  return;
                setDropActive(false);
              }}
              onDrop={(event) => {
                if (!isExternalDrop(event)) return;
                event.preventDefault();
                setDropActive(false);
                if (!locked && !reference.isActive())
                  uploads.enqueue(event.dataTransfer.files);
              }}
            >
              {items.length === 0 ? (
                directUpload ? (
                  <label
                    className="flex min-h-32 cursor-pointer items-center justify-center px-5 py-3 text-center text-sm text-secondary-foreground"
                    htmlFor={inputId}
                  >
                    Arraste arquivos aqui ou clique para escolher
                  </label>
                ) : (
                  <div className="m-5 flex h-32 items-center justify-center rounded-xl border border-dashed bg-card text-sm text-secondary-foreground squircle">
                    Nenhum arquivo adicionado ainda
                  </div>
                )
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
                    <div
                      className={cn(
                        "grid gap-2 px-5 py-3",
                        !directUpload && "grid-cols-3 sm:grid-cols-4",
                      )}
                      style={
                        directUpload
                          ? {
                              gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${Math.round(thumbnailSize.maxWidth * THUMBNAIL_MIN_RATIO)}px), 1fr))`,
                            }
                          : undefined
                      }
                    >
                      {items.map((item, index) => (
                        <SortableThumbnail
                          key={item.id}
                          canOpen={workFiles}
                          id={item.id}
                          index={index}
                          locked={locked}
                          maxWidth={
                            directUpload ? thumbnailSize.maxWidth : undefined
                          }
                          onToggle={() => toggleItem(item.id)}
                          onToggleAll={
                            isDesktop && !isCoarsePointer
                              ? toggleAll
                              : undefined
                          }
                          onPreview={
                            canPreview
                              ? (trigger) => {
                                  previewTrigger.current = trigger;
                                  setPreviewId((current) =>
                                    current === item.id ? null : item.id,
                                  );
                                }
                              : undefined
                          }
                          previewPanelId={
                            previewItem?.id === item.id ? panelId : undefined
                          }
                          selected={selected.has(item.id)}
                          selecting={selecting}
                          showNumber={!workFiles}
                          status={
                            selected.has(item.id)
                              ? statusById.get(item.id)
                              : undefined
                          }
                          url={item.url}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {directUpload && (
              <FileUploadQueue
                entries={uploads.entries.map((entry) => ({
                  id: entry.id,
                  name: entry.file.name,
                  status: entry.status,
                  progress: entry.progress,
                  error: entry.error,
                  canRetry: !reference.active && uploads.canRetry(entry.file),
                }))}
                notice={uploads.notice}
                onRetry={(id) => {
                  if (!reference.isActive()) uploads.retry(id);
                }}
                onRemove={uploads.remove}
              />
            )}

            {instagramReference && (
              <FileUploadQueue
                label="Importar arquivos por link"
                entries={referenceRows}
                notice={reference.notice}
                onRetry={(position) => void reference.retry(position)}
                onRemove={reference.dismiss}
              />
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
          </div>
          {previewItem && (
            <FilePreviewPanel
              id={panelId}
              key={previewItem.id}
              onClose={closePreview}
              url={previewItem.url}
            />
          )}
        </div>

        {/* Toolbar inferior */}
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-popover px-5 py-3",
            !directUpload && "sticky bottom-0",
          )}
        >
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
            <div ref={addRef} className="flex items-center gap-2">
              {directUpload ? (
                <PrismButton
                  isDisabled={items.length >= maxFiles || reference.active}
                  onPress={() => inputRef.current?.click()}
                  size="sm"
                  variant="secondary"
                >
                  Adicionar
                  <PlusIcon />
                </PrismButton>
              ) : (
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
              )}

              {instagramReference && directUpload && (
                <InstagramReferencePopover
                  target={instagramReference}
                  busy={reference.active || manualUploadActive.current}
                  start={reference.start}
                  onOpenChange={setReferencePopoverOpen}
                />
              )}

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
          )}
          {directUpload && items.length > 0 && (
            <PrismToggleGroup
              aria-label="Tamanho das miniaturas"
              disallowEmptySelection
              onSelectionChange={(keys) => {
                const size = THUMBNAIL_SIZES.find(({ id }) => keys.has(id));
                if (size) setThumbnailSize(size);
              }}
              selectedKeys={[thumbnailSize.id]}
              selectionMode="single"
              size="icon-sm"
              variant="ghost"
            >
              {THUMBNAIL_SIZES.map(({ id, label }) => (
                <PrismToggleGroupItem id={id} key={id}>
                  {label}
                </PrismToggleGroupItem>
              ))}
            </PrismToggleGroup>
          )}
          {!selecting && (
            <PrismButton
              ref={finishRef}
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {directUpload &&
              (reference.active ||
                uploads.entries.some((entry) => !entry.error))
                ? "Fechar janela"
                : "Concluir"}
            </PrismButton>
          )}
        </div>
      </div>
    </PrismDialog>
  );
}
