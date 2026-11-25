import { useEffect, useRef, useState } from "react";
import {
  isInstagramCloudinaryFile,
  type InstagramReferenceKind,
} from "~/lib/instagram-reference";
import {
  prepareInstagramReference,
  transferInstagramReference,
  type ReferenceContext,
} from "~/models/instagram-reference";

type Entry = {
  position: number;
  kind: InstagramReferenceKind;
  state: "queued" | "uploading" | "failed" | "completed" | "dismissed";
  url: string | null;
  error?: string;
};
type Batch = { context: ReferenceContext; ticket: string; entries: Entry[] };
const noSpace = "Não há espaço para todos os arquivos desta referência.";

function message(error: unknown) {
  if (error instanceof Error && error.name !== "ZodError") return error.message;
  return "Não foi possível importar agora. Tente novamente.";
}

export function useInstagramReference(options: {
  cloudName: string;
  getFiles: () => readonly string[];
  getAvailableSlots: () => number;
  isManualUploadActive: () => boolean;
  onActiveChange: (active: boolean) => void;
  onImported: (
    url: string,
    before: readonly string[],
    after: readonly string[],
  ) => void;
}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const batch = useRef<Batch | null>(null);
  const operation = useRef<AbortController | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState(false);

  useEffect(
    () => () => {
      operation.current?.abort();
      operation.current = null;
    },
    [],
  );

  function setOperation(controller: AbortController | null) {
    operation.current = controller;
    setActive(controller !== null);
    optionsRef.current.onActiveChange(controller !== null);
  }

  function snapshot(current: Batch) {
    setEntries([...current.entries]);
  }

  async function upload(
    current: Batch,
    entry: Entry,
    retry: boolean,
    signal: AbortSignal,
  ) {
    const previous = entry.url;
    entry.state = "uploading";
    entry.error = undefined;
    snapshot(current);
    try {
      if (optionsRef.current.getAvailableSlots() < 1) throw new Error(noSpace);
      const result = await transferInstagramReference(
        current.context,
        current.ticket,
        entry.position,
        retry,
        signal,
      );
      if (signal.aborted) return;
      if (
        result.position !== entry.position ||
        !isInstagramCloudinaryFile(
          result.url,
          optionsRef.current.cloudName,
          entry.kind,
        )
      )
        throw new Error("O destino do arquivo importado é inválido.");
      current.ticket = result.ticket;
      const before = current.entries
        .slice(0, entry.position)
        .flatMap((item) => item.url ?? []);
      const after = current.entries
        .slice(entry.position + 1)
        .flatMap((item) => item.url ?? []);
      optionsRef.current.onImported(result.url, before, after);
      entry.url = result.url;
      entry.state = "completed";
      setNotice(`Item ${entry.position + 1} adicionado aos arquivos.`);
    } catch (error) {
      if (signal.aborted) return;
      entry.url = previous;
      entry.state = "failed";
      entry.error = message(error);
      setNotice("");
    }
    snapshot(current);
  }

  async function start(
    context: ReferenceContext,
    url: string,
    onPrepared: () => void,
  ) {
    if (operation.current || optionsRef.current.isManualUploadActive())
      return "Aguarde o envio atual de arquivos.";
    if (batch.current?.entries.some((entry) => entry.state === "failed"))
      return "Finalize ou remova os itens pendentes da importação anterior.";
    if (optionsRef.current.getAvailableSlots() < 1) return noSpace;
    const controller = new AbortController();
    setOperation(controller);
    try {
      const prepared = await prepareInstagramReference(
        context,
        url,
        controller.signal,
      );
      if (controller.signal.aborted) return null;
      const currentFiles = optionsRef.current.getFiles();
      const missing = prepared.items.filter(
        (item) => !item.url || !currentFiles.includes(item.url),
      ).length;
      if (optionsRef.current.getAvailableSlots() < missing) return noSpace;
      const current: Batch = {
        context,
        ticket: prepared.ticket,
        entries: prepared.items.map((item) => ({
          ...item,
          state:
            item.url && currentFiles.includes(item.url)
              ? "completed"
              : "queued",
        })),
      };
      batch.current = current;
      snapshot(current);
      onPrepared();
      for (const entry of current.entries) {
        if (controller.signal.aborted) break;
        if (entry.state === "queued")
          await upload(current, entry, false, controller.signal);
      }
      return null;
    } catch (error) {
      return controller.signal.aborted ? null : message(error);
    } finally {
      if (operation.current === controller) setOperation(null);
    }
  }

  async function retry(position: number) {
    const current = batch.current;
    const entry = current?.entries[position];
    if (
      !current ||
      !entry ||
      entry.state !== "failed" ||
      operation.current ||
      optionsRef.current.isManualUploadActive()
    )
      return;
    const controller = new AbortController();
    setOperation(controller);
    try {
      await upload(current, entry, true, controller.signal);
    } finally {
      if (operation.current === controller) setOperation(null);
    }
  }

  function dismiss(position: number) {
    const current = batch.current;
    const entry = current?.entries[position];
    if (
      !current ||
      !entry ||
      (entry.state !== "failed" && entry.state !== "queued")
    )
      return;
    entry.state = "dismissed";
    snapshot(current);
  }

  return {
    entries,
    notice,
    active,
    isActive: () => operation.current !== null,
    start,
    retry,
    dismiss,
  };
}
