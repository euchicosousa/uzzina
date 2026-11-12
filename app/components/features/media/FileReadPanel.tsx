import { CheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { PrismButton } from "~/components/prism";
import { publicAIModels } from "~/lib/ai-model-registry";
import { readWorkFiles } from "~/services/file-read-client";

// Reading of work files with AI (IA-M08, phase 1: images and PDF). Results are
// temporary: nothing is stored until the user inserts a block in the description.

/** Largest description the AI commands accept (see aiInputSchema). */
export const DESCRIPTION_LIMIT = 10000;

export type ReadTarget = { id: string; url: string; position: number };

export type FileReadFileState = {
  state: "queued" | "reading" | "done" | "failed";
  text?: string;
  error?: string;
};

type Transcription = {
  files: { target: ReadTarget; read: FileReadFileState }[];
  model?: string;
};

type Interpretation = {
  state: "reading" | "done" | "failed";
  text?: string;
  model?: string;
  error?: string;
};

const SUPPORTED = /\.(jpg|jpeg|png|webp|heic|heif|pdf)(\?|#|$)/i;

export function isReadableWorkFile(url: string): boolean {
  return SUPPORTED.test(url);
}

export function fileNameFromUrl(url: string): string {
  const raw = url.split("?")[0].split("#")[0].split("/").pop() ?? url;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function modelName(id: string): string {
  return publicAIModels.find((model) => model.id === id)?.name ?? id;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function paragraphs(text: string): string {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function messageOf(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível ler este arquivo.";
}

const check = (url: string) => url.slice(-40);

export function useFileReading(actionId: string | undefined) {
  const [careful, setCarefulState] = useState(false);
  const [transcription, setTranscription] = useState<Transcription | null>(
    null,
  );
  const [interpretation, setInterpretation] = useState<Interpretation | null>(
    null,
  );
  const [insertedTr, setInsertedTr] = useState(false);
  const [insertedIp, setInsertedIp] = useState(false);
  // Bumped to make results of an older run harmless after a reset or rerun.
  const trRun = useRef(0);
  const ipRun = useRef(0);
  const carefulRef = useRef(false);

  const transcribing =
    transcription?.files.some(
      (file) => file.read.state === "queued" || file.read.state === "reading",
    ) ?? false;
  const interpreting = interpretation?.state === "reading";
  const locked = transcribing || interpreting;

  const reset = useCallback(() => {
    trRun.current += 1;
    ipRun.current += 1;
    setTranscription(null);
    setInterpretation(null);
    setInsertedTr(false);
    setInsertedIp(false);
  }, []);

  const readOne = useCallback(
    async (target: ReadTarget, run: number): Promise<FileReadFileState> => {
      if (!actionId) return { state: "failed", error: "Ação indisponível." };
      try {
        const result = await readWorkFiles({
          intent: "ai-transcribe",
          action_id: actionId,
          positions: [target.position],
          checks: [check(target.url)],
        });
        if (run !== trRun.current) return { state: "queued" };
        setTranscription((previous) =>
          previous ? { ...previous, model: result.model } : previous,
        );
        return { state: "done", text: result.output.text };
      } catch (error) {
        return { state: "failed", error: messageOf(error) };
      }
    },
    [actionId],
  );

  const patchFile = useCallback(
    (id: string, read: FileReadFileState) =>
      setTranscription((previous) =>
        previous
          ? {
              ...previous,
              files: previous.files.map((file) =>
                file.target.id === id ? { ...file, read } : file,
              ),
            }
          : previous,
      ),
    [],
  );

  const transcribe = useCallback(
    async (targets: ReadTarget[]) => {
      const run = ++trRun.current;
      setInsertedTr(false);
      setTranscription({
        files: targets.map((target) => ({
          target,
          read: { state: "queued" },
        })),
      });
      for (const target of targets) {
        if (run !== trRun.current) return;
        patchFile(target.id, { state: "reading" });
        const read = await readOne(target, run);
        if (run !== trRun.current) return;
        patchFile(target.id, read);
        // No point asking again once the allowance or the session is gone.
        if (
          read.state === "failed" &&
          read.error &&
          /franquia|limite|sess/i.test(read.error)
        ) {
          const rest = targets.slice(targets.indexOf(target) + 1);
          for (const other of rest)
            patchFile(other.id, { state: "failed", error: read.error });
          return;
        }
      }
    },
    [readOne, patchFile],
  );

  const retry = useCallback(
    async (target: ReadTarget) => {
      const run = trRun.current;
      setInsertedTr(false);
      patchFile(target.id, { state: "reading" });
      const read = await readOne(target, run);
      if (run !== trRun.current) return;
      patchFile(target.id, read);
    },
    [readOne, patchFile],
  );

  const interpret = useCallback(
    async (targets: ReadTarget[], useCareful: boolean) => {
      if (!actionId) return;
      const run = ++ipRun.current;
      setInsertedIp(false);
      // Display only; the server decides the model from `careful`.
      setInterpretation({
        state: "reading",
        model: useCareful ? "gpt-6.1-terra" : "gpt-6-luna",
      });
      try {
        const result = await readWorkFiles({
          intent: "ai-interpret",
          action_id: actionId,
          positions: targets.map((target) => target.position),
          checks: targets.map((target) => check(target.url)),
          careful: useCareful,
        });
        if (run !== ipRun.current) return;
        setInterpretation({
          state: "done",
          text: result.output.text,
          model: result.model,
        });
      } catch (error) {
        if (run !== ipRun.current) return;
        setInterpretation({
          state: "failed",
          error:
            error instanceof Error
              ? error.message
              : "Não foi possível interpretar os arquivos.",
        });
      }
    },
    [actionId],
  );

  const setCareful = useCallback((value: boolean) => {
    carefulRef.current = value;
    setCarefulState(value);
  }, []);

  return {
    careful,
    carefulRef,
    setCareful,
    transcription,
    interpretation,
    insertedTr,
    insertedIp,
    setInsertedTr,
    setInsertedIp,
    locked,
    reset,
    transcribe,
    retry,
    interpret,
    discardTranscription: () => {
      trRun.current += 1;
      setTranscription(null);
      setInsertedTr(false);
    },
    discardInterpretation: () => {
      ipRun.current += 1;
      setInterpretation(null);
      setInsertedIp(false);
    },
  };
}

export type FileReading = ReturnType<typeof useFileReading>;

/** HTML inserted in the description for each kind of result. */
export function transcriptionHtml(transcription: Transcription): string {
  const done = transcription.files.filter(
    (file) => file.read.state === "done" && file.read.text,
  );
  return (
    "<h2>Transcrição</h2>" +
    done
      .map(
        (file, index) =>
          `<h3>${escapeHtml(`Arquivo ${index + 1} · ${fileNameFromUrl(file.target.url)}`)}</h3>${paragraphs(file.read.text ?? "")}`,
      )
      .join("")
  );
}

export function interpretationHtml(interpretation: Interpretation): string {
  return `<h2>Interpretação</h2>${paragraphs(interpretation.text ?? "")}`;
}

function plainTranscription(transcription: Transcription): string {
  return transcription.files
    .filter((file) => file.read.state === "done")
    .map(
      (file, index) =>
        `Arquivo ${index + 1} · ${fileNameFromUrl(file.target.url)}\n${file.read.text ?? ""}`,
    )
    .join("\n\n");
}

function SizeNote({
  length,
  descriptionLength,
}: {
  length: number;
  descriptionLength: number;
}) {
  const over = descriptionLength + length > DESCRIPTION_LIMIT;
  return (
    <p
      className={
        over ? "text-xs text-warning" : "text-xs text-secondary-foreground"
      }
    >
      {length.toLocaleString("pt-BR")} caracteres ao inserir
      {over
        ? `. A descrição passaria de ${DESCRIPTION_LIMIT.toLocaleString("pt-BR")} caracteres e gerar estratégia, conteúdo ou legenda com IA deixa de funcionar nesta ação até você reduzir o texto.`
        : "."}
    </p>
  );
}

function ResultActions({
  inserted,
  copyText,
  onInsert,
  onDiscard,
}: {
  inserted: boolean;
  copyText: string;
  onInsert: () => void;
  onDiscard: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <PrismButton size="xs" variant="link" onClick={onDiscard}>
        Descartar
      </PrismButton>
      <PrismButton
        size="xs"
        variant="ghost"
        onClick={() => {
          void navigator.clipboard
            ?.writeText(copyText)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            })
            .catch(() => undefined);
        }}
      >
        {copied ? "Copiado" : "Copiar"}
        {copied ? <CheckIcon /> : <CopyIcon />}
      </PrismButton>
      <PrismButton size="xs" isDisabled={inserted} onClick={onInsert}>
        {inserted ? "Inserida" : "Inserir na descrição"}
        {inserted && <CheckIcon />}
      </PrismButton>
    </div>
  );
}

export function FileReadResults({
  reading,
  skipped,
  retryTargets,
  onRetry,
  onInsert,
  getDescriptionLength,
}: {
  reading: FileReading;
  /** Selected files that cannot be read (unsupported format). */
  skipped: number;
  retryTargets: Map<string, ReadTarget>;
  onRetry: (target: ReadTarget) => void;
  onInsert: (html: string, kind: "tr" | "ip") => void;
  getDescriptionLength: () => number;
}) {
  const { transcription, interpretation } = reading;
  if (!transcription && !interpretation) return null;
  const descriptionLength = getDescriptionLength();
  const trDone = transcription
    ? transcription.files.every(
        (file) => file.read.state === "done" || file.read.state === "failed",
      )
    : false;
  const trHasText =
    transcription?.files.some((file) => file.read.state === "done") ?? false;
  const trHtml =
    transcription && trHasText ? transcriptionHtml(transcription) : "";
  const ipHtml =
    interpretation?.state === "done" ? interpretationHtml(interpretation) : "";

  return (
    <div
      className="flex flex-col gap-4 border-t px-5 py-3"
      aria-live="polite"
      data-slot="file-read-results"
    >
      {skipped > 0 && (
        <p className="text-xs text-secondary-foreground">
          {skipped === 1
            ? "1 arquivo não será lido (formato sem suporte)."
            : `${skipped} arquivos não serão lidos (formato sem suporte).`}
        </p>
      )}

      {transcription && (
        <section className="flex flex-col gap-2" aria-label="Transcrição">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Transcrição</h3>
            {trDone ? (
              <span className="text-xs text-secondary-foreground">
                {modelName(transcription.model ?? "gpt-6-luna")}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-secondary-foreground">
                <Loader2Icon className="size-3 animate-spin" />
                lendo{" "}
                {
                  transcription.files.filter(
                    (file) => file.read.state === "done",
                  ).length
                }{" "}
                de {transcription.files.length}…
              </span>
            )}
          </div>
          {trDone && (
            <>
              <div className="flex flex-col gap-2">
                {transcription.files.map((file, index) => (
                  <div key={file.target.id} className="flex flex-col gap-1">
                    <h4 className="text-xs font-semibold">
                      Arquivo {index + 1} · {fileNameFromUrl(file.target.url)}
                    </h4>
                    {file.read.state === "done" ? (
                      <p className="text-sm whitespace-pre-wrap text-secondary-foreground">
                        {file.read.text}
                      </p>
                    ) : (
                      <p className="flex flex-wrap items-center gap-2 text-sm text-error">
                        {file.read.error ?? "Falhou."}
                        <PrismButton
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            const target = retryTargets.get(file.target.id);
                            if (target) onRetry(target);
                          }}
                        >
                          Tentar de novo
                        </PrismButton>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {trHasText && (
                <>
                  <SizeNote
                    length={trHtml.length}
                    descriptionLength={descriptionLength}
                  />
                  <ResultActions
                    copyText={plainTranscription(transcription)}
                    inserted={reading.insertedTr}
                    onDiscard={reading.discardTranscription}
                    onInsert={() => onInsert(trHtml, "tr")}
                  />
                </>
              )}
            </>
          )}
        </section>
      )}

      {interpretation && (
        <section className="flex flex-col gap-2" aria-label="Interpretação">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Interpretação</h3>
            {interpretation.state === "reading" ? (
              <span className="flex items-center gap-1 text-xs text-secondary-foreground">
                <Loader2Icon className="size-3 animate-spin" />
                interpretando com{" "}
                {modelName(interpretation.model ?? "gpt-6-luna")}…
              </span>
            ) : (
              interpretation.model && (
                <span className="text-xs text-secondary-foreground">
                  {modelName(interpretation.model)}
                </span>
              )
            )}
          </div>
          {interpretation.state === "done" && (
            <>
              <p className="text-sm whitespace-pre-wrap text-secondary-foreground">
                {interpretation.text}
              </p>
              <SizeNote
                length={ipHtml.length}
                descriptionLength={descriptionLength}
              />
              <ResultActions
                copyText={interpretation.text ?? ""}
                inserted={reading.insertedIp}
                onDiscard={reading.discardInterpretation}
                onInsert={() => onInsert(ipHtml, "ip")}
              />
            </>
          )}
          {interpretation.state === "failed" && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-error">
              {interpretation.error}
              <PrismButton
                size="xs"
                variant="link"
                onClick={reading.discardInterpretation}
              >
                Descartar
              </PrismButton>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
