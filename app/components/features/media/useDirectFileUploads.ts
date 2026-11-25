import { useEffect, useRef, useState } from "react";

import {
  MAX_IMAGE_BYTES as MAX_FILE_BYTES,
  MAX_VIDEO_BYTES,
} from "~/lib/instagram-reference";
const IMAGE_EXTENSIONS =
  /\.(avif|bmp|gif|heic|heif|ico|jpe?g|png|svg|tiff?|webp)$/i;
const VIDEO_EXTENSIONS = /\.(3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|ogv|webm|wmv)$/i;

const UPLOAD_FAILED = "Não foi possível enviar o arquivo.";
const NETWORK_FAILED = "O envio falhou. Verifique a conexão e tente novamente.";
const NO_SPACE = "O limite de arquivos foi atingido.";
const ACCEPT_MEDIA = "image/*,video/*,.heic,.heif,.mov,.m4v,.mkv";

type UploadStatus = "queued" | "uploading" | "failed" | "completed";
type UploadEntry = {
  id: number;
  batchId: number;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  uploadedUrl?: string;
};

export type UploadedBatchFile = {
  id: number;
  batchId: number;
  name: string;
  url: string;
};

const fileNameOrder = new Intl.Collator("pt-BR", {
  numeric: true,
  sensitivity: "base",
});

export function compareUploadedFiles(
  a: Pick<UploadedBatchFile, "name" | "id">,
  b: Pick<UploadedBatchFile, "name" | "id">,
) {
  return fileNameOrder.compare(a.name, b.name) || a.id - b.id;
}

export type FileUploadTransport = (
  file: File,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
) => Promise<string>;

type UploadOptions = {
  cloudName: string;
  uploadPreset: string;
  workFiles: boolean;
  getAvailableSlots: () => number;
  onUploaded: (url: string) => void;
  onBatchUploaded?: (files: UploadedBatchFile[]) => void;
  onActiveChange?: (active: boolean) => void;
  uploadTransport?: FileUploadTransport;
};

function getMediaType(file: File) {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("image/")) return "image";
  if (file.type && file.type !== "application/octet-stream") return "other";
  if (VIDEO_EXTENSIONS.test(file.name)) return "video";
  if (IMAGE_EXTENSIONS.test(file.name)) return "image";
  return "other";
}

function getFileError(file: File, workFiles: boolean) {
  const type = getMediaType(file);
  if (!workFiles && type === "other") return "Escolha uma imagem ou um vídeo.";
  if (file.size === 0) return "O arquivo está vazio.";
  const maxBytes = type === "video" ? MAX_VIDEO_BYTES : MAX_FILE_BYTES;
  if (file.size > maxBytes)
    return `O arquivo excede ${maxBytes / 1_000_000} MB.`;
  return null;
}

function readUploadedUrl(
  response: unknown,
  cloudName: string,
  workFiles: boolean,
) {
  if (typeof response !== "object" || response === null) return null;
  if (!("secure_url" in response) || !("resource_type" in response))
    return null;
  const { secure_url: url, resource_type: type } = response;
  if (
    typeof url !== "string" ||
    (type !== "image" && type !== "video" && (type !== "raw" || !workFiles))
  )
    return null;
  // Only accept the expected delivery URLs for this cloud and upload type.
  if (
    !url.startsWith(`https://res.cloudinary.com/${cloudName}/${type}/upload/`)
  )
    return null;
  return url;
}

export function useDirectFileUploads(options: UploadOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const [notice, setNotice] = useState("");
  const entriesRef = useRef<UploadEntry[]>([]);
  const nextId = useRef(0);
  const nextBatchId = useRef(0);
  const activeRef = useRef(false);
  const requestRef = useRef<{ id: number; abort: () => void } | null>(null);

  function commit(next: UploadEntry[]) {
    entriesRef.current = next;
    setEntries(next);
    const active = next.some((entry) => entry.status !== "failed");
    if (active !== activeRef.current) {
      activeRef.current = active;
      optionsRef.current.onActiveChange?.(active);
    }
  }

  function settleBatch(next: UploadEntry[], batchId: number) {
    const { onBatchUploaded, getAvailableSlots } = optionsRef.current;
    if (
      !onBatchUploaded ||
      next.some(
        (entry) =>
          entry.batchId === batchId &&
          (entry.status === "queued" || entry.status === "uploading"),
      )
    ) {
      commit(next);
      return;
    }

    const completed = next
      .flatMap((entry) =>
        entry.batchId === batchId &&
        entry.status === "completed" &&
        entry.uploadedUrl
          ? [
              {
                id: entry.id,
                batchId,
                name: entry.file.name,
                url: entry.uploadedUrl,
              },
            ]
          : [],
      )
      .sort(compareUploadedFiles);
    const ready = completed.slice(0, Math.max(0, getAvailableSlots()));
    if (ready.length > 0) {
      onBatchUploaded(ready);
      setNotice(
        `${ready.length === 1 ? "Arquivo adicionado" : "Arquivos adicionados"}: ${ready.map((entry) => entry.name).join(", ")}.`,
      );
    }
    const readyIds = new Set(ready.map((entry) => entry.id));
    commit(
      next.flatMap((entry) => {
        if (entry.batchId !== batchId || entry.status !== "completed")
          return [entry];
        if (readyIds.has(entry.id)) return [];
        return [{ ...entry, status: "failed", error: NO_SPACE }];
      }),
    );
  }

  useEffect(() => {
    return () => {
      const request = requestRef.current;
      requestRef.current = null;
      request?.abort();
      if (activeRef.current) {
        activeRef.current = false;
        optionsRef.current.onActiveChange?.(false);
      }
    };
  }, []);

  function startNext() {
    if (requestRef.current) return;
    const entry = entriesRef.current.find((item) => item.status === "queued");
    if (!entry) return;
    const {
      cloudName,
      uploadPreset,
      workFiles,
      getAvailableSlots,
      uploadTransport,
    } = optionsRef.current;

    function update(next: Partial<UploadEntry>) {
      if (!entry) return;
      settleBatch(
        entriesRef.current.map((item) =>
          item.id === entry.id ? { ...item, ...next } : item,
        ),
        entry.batchId,
      );
    }

    const available = getAvailableSlots() > 0;
    if (!available || (!uploadTransport && (!cloudName || !uploadPreset))) {
      update({ status: "failed", error: available ? UPLOAD_FAILED : NO_SPACE });
      startNext();
      return;
    }

    const controller = uploadTransport ? new AbortController() : null;
    const xhr = uploadTransport ? null : new XMLHttpRequest();
    const request = {
      id: entry.id,
      abort: () => {
        controller?.abort();
        xhr?.abort();
      },
    };
    requestRef.current = request;
    update({ status: "uploading", progress: 0 });

    function fail(message: string) {
      if (requestRef.current !== request) return;
      requestRef.current = null;
      update({ status: "failed", error: message });
      startNext();
    }

    function complete(url: string) {
      if (requestRef.current !== request || !entry) return;
      requestRef.current = null;
      if (optionsRef.current.onBatchUploaded) {
        update({ status: "completed", uploadedUrl: url });
      } else if (optionsRef.current.getAvailableSlots() <= 0) {
        update({ status: "failed", error: NO_SPACE, uploadedUrl: url });
      } else {
        optionsRef.current.onUploaded(url);
        setNotice(`Arquivo adicionado: ${entry.file.name}.`);
        commit(entriesRef.current.filter((item) => item.id !== entry.id));
      }
      startNext();
    }

    if (uploadTransport && controller) {
      void uploadTransport(entry.file, controller.signal, (progress) => {
        if (requestRef.current === request) update({ progress });
      }).then(complete, () => fail(NETWORK_FAILED));
      return;
    }
    if (!xhr) return;

    xhr.upload.addEventListener("progress", (event) => {
      if (
        requestRef.current === request &&
        event.lengthComputable &&
        event.total > 0
      ) {
        update({
          progress: Math.min(
            100,
            Math.round((event.loaded * 100) / event.total),
          ),
        });
      }
    });
    xhr.addEventListener("load", () => {
      if (requestRef.current !== request) return;
      const url =
        xhr.status >= 200 && xhr.status < 300
          ? readUploadedUrl(xhr.response, cloudName, workFiles)
          : null;
      if (!url) {
        fail(
          xhr.status === 413
            ? "O arquivo excede o limite de envio."
            : UPLOAD_FAILED,
        );
        return;
      }
      complete(url);
    });
    xhr.addEventListener("error", () => fail(NETWORK_FAILED));
    xhr.addEventListener("timeout", () => fail(NETWORK_FAILED));
    xhr.addEventListener("abort", () => fail(UPLOAD_FAILED));

    try {
      const data = new FormData();
      data.append("file", entry.file);
      data.append("upload_preset", uploadPreset);
      data.append("asset_folder", workFiles ? "uzzina/work" : "uzzina/content");
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/auto/upload`,
      );
      xhr.responseType = "json";
      xhr.timeout = 5 * 60 * 1000;
      xhr.send(data);
    } catch {
      fail(NETWORK_FAILED);
    }
  }

  function getFreeSlots() {
    const waiting = entriesRef.current.filter(
      (entry) => entry.status !== "failed",
    ).length;
    return optionsRef.current.getAvailableSlots() - waiting;
  }

  function enqueue(files: FileList | File[]) {
    setNotice("");
    let slots = getFreeSlots();
    const batchId = ++nextBatchId.current;
    const incoming = Array.from(files, (file): UploadEntry => {
      let error = getFileError(file, optionsRef.current.workFiles);
      if (!error && slots <= 0) error = NO_SPACE;
      if (!error) slots -= 1;
      return {
        id: ++nextId.current,
        batchId,
        file,
        status: error ? "failed" : "queued",
        progress: 0,
        error: error ?? undefined,
      };
    });
    commit([...entriesRef.current, ...incoming]);
    startNext();
  }

  function retry(id: number) {
    const entry = entriesRef.current.find((item) => item.id === id);
    if (
      entry?.status !== "failed" ||
      getFileError(entry.file, optionsRef.current.workFiles)
    )
      return;
    if (getFreeSlots() <= 0) {
      setNotice(NO_SPACE);
      return;
    }
    setNotice("");
    if (entry.uploadedUrl) {
      if (optionsRef.current.onBatchUploaded) {
        settleBatch(
          entriesRef.current.map((item) =>
            item.id === id
              ? { ...item, status: "completed", error: undefined }
              : item,
          ),
          entry.batchId,
        );
        return;
      }
      optionsRef.current.onUploaded(entry.uploadedUrl);
      setNotice(`Arquivo adicionado: ${entry.file.name}.`);
      commit(entriesRef.current.filter((item) => item.id !== id));
      return;
    }
    commit(
      entriesRef.current.map((item) =>
        item.id === id
          ? { ...item, status: "queued", progress: 0, error: undefined }
          : item,
      ),
    );
    startNext();
  }

  function remove(id: number) {
    const entry = entriesRef.current.find((item) => item.id === id);
    if (!entry) return;
    const request = requestRef.current;
    if (request?.id === id) {
      requestRef.current = null;
      request.abort();
    }
    settleBatch(
      entriesRef.current.filter((item) => item.id !== id),
      entry.batchId,
    );
    startNext();
  }

  return {
    entries: entries.filter(
      (
        entry,
      ): entry is UploadEntry & {
        status: Exclude<UploadStatus, "completed">;
      } => entry.status !== "completed",
    ),
    notice,
    accept: options.workFiles ? undefined : ACCEPT_MEDIA,
    canRetry: (file: File) => getFileError(file, options.workFiles) === null,
    enqueue,
    retry,
    remove,
  };
}
