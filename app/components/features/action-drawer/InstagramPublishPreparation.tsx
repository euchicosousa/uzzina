import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "cnfast";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PrismButton,
  PrismDialog,
  PrismDialogBody,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismTab,
  PrismTabList,
  PrismTabPanel,
  PrismTabs,
} from "~/components/prism";
import {
  instagramPublishRequest,
  InstagramPublishError,
  type PublishInput,
  type PublishState,
} from "~/models/instagram-publish";
import {
  getInstagramPublishMediaKind,
  instagramPublishMediaError,
} from "~/lib/instagram-publish-media";
import { UActionDatePicker } from "~/components/uzzina/UActionDatePicker";
import { GripVerticalIcon, XIcon } from "lucide-react";

type Format = PublishInput["format"];
type PublishMode = "publish" | "schedule";

function usernameWithoutAt(username: string | null) {
  return username?.replace(/^@+/, "") ?? "";
}

const categoryOptions = [
  { id: "post", label: "Post" },
  { id: "carousel", label: "Carrossel" },
  { id: "reels", label: "Reel" },
  { id: "stories", label: "Stories" },
] as const;

function getFormat(category: string, files: string[]): Format | null {
  if (category === "post") {
    return files.length === 1 &&
      getInstagramPublishMediaKind(files[0]) === "video"
      ? "video"
      : "feed";
  }
  if (category === "carousel") return "feed";
  if (category === "reels") return "reel";
  if (category === "stories") return "stories";
  return null;
}

function SortablePublishFile({
  fileIndex,
  index,
  url,
  busy,
  onRemove,
}: {
  fileIndex: number;
  index: number;
  url: string;
  busy: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fileIndex });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-xl bg-card p-2 squircle",
        isDragging && "z-10 opacity-60",
      )}
    >
      <PrismButton
        {...attributes}
        {...listeners}
        aria-label={`Arrastar arquivo ${index + 1} para reordenar`}
        className="shrink-0 touch-none"
        isDisabled={busy}
        size="icon-sm"
        variant="ghost"
      >
        <GripVerticalIcon />
      </PrismButton>
      {getInstagramPublishMediaKind(url) === "image" ? (
        <img
          src={url}
          alt=""
          className="size-12 shrink-0 rounded-xl object-cover squircle"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary squircle"
        >
          ▶
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm" title={url}>
        {index + 1}. {url.split("/").pop()}
      </span>
      <PrismButton
        size="sm"
        variant="ghost"
        isDisabled={busy}
        onPress={onRemove}
      >
        Remover
      </PrismButton>
    </div>
  );
}

export function InstagramPublishPreparation({
  actionId,
  files,
  caption,
  actionCategory,
  partnerSlugs,
}: {
  actionId: string | null | undefined;
  files: string[];
  caption: string | null;
  actionCategory: string;
  partnerSlugs: string[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PublishMode>("publish");
  const [selected, setSelected] = useState<number[]>([]);
  const [state, setState] = useState<PublishState | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [scheduleDates, setScheduleDates] = useState<(Date | null)[]>([null]);
  const sendLock = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleFileDragEnd(event: DragEndEvent) {
    const activeId = event.active.id;
    const overId = event.over?.id;
    if (overId === undefined || activeId === overId) return;
    if (typeof activeId !== "number" || typeof overId !== "number") return;

    setSelected((current) => {
      const from = current.indexOf(activeId);
      const to = current.indexOf(overId);
      if (from < 0 || to < 0) return current;
      return arrayMove(current, from, to);
    });
  }

  const refresh = useCallback(
    async (silent = false) => {
      if (!actionId) return;
      try {
        const next = await instagramPublishRequest(actionId);
        setState(next);
        setConnectionFailed(false);
      } catch (error) {
        setState(null);
        setConnectionFailed(true);
        if (!silent)
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível consultar os perfis.",
          );
      }
    },
    [actionId],
  );

  useEffect(() => {
    if (!actionId) return;
    setLoading(true);
    void refresh().finally(() => setLoading(false));
  }, [actionId, refresh]);

  useEffect(() => {
    if (!open || !actionId) return;
    const timer = setInterval(() => void refresh(true), 5000);
    return () => clearInterval(timer);
  }, [open, actionId, refresh]);

  const connectedPartners =
    state?.partners.filter(
      (item) => partnerSlugs.includes(item.slug) && item.username,
    ) ?? [];
  const partner = connectedPartners.length === 1 ? connectedPartners[0] : null;
  const format = getFormat(
    actionCategory,
    selected.map((index) => files[index]),
  );
  const categorySelected = categoryOptions.some(
    (option) => option.id === actionCategory,
  );
  const mediaError =
    actionCategory === "post" && selected.length > 1
      ? "Post estático aceita um arquivo. Para vários arquivos, use a categoria Carrossel."
      : format
        ? instagramPublishMediaError(
            format,
            selected.map((index) => files[index]),
          )
        : "A categoria desta ação não corresponde a um formato publicável.";
  const blocked = state?.attempts.some(
    (item) =>
      item.partner_id === partner?.id &&
      ["pending", "uncertain", "partial"].includes(item.status),
  );
  const scheduleHasInvalidDate = scheduleDates.some(
    (date) => date !== null && date.getTime() <= Date.now(),
  );
  const scheduledCount = scheduleDates.filter((date) => date !== null).length;

  function openDialog() {
    setSelected(files.map((_, index) => index));
    setMode("publish");
    setUncertain(false);
    setOpen(true);
    setLoading(true);
    void refresh().finally(() => setLoading(false));
  }

  function updateScheduleDate(index: number, date: Date) {
    setScheduleDates((previous) => {
      const next = [...previous];
      next[index] = date;
      if (next.length < 10 && next[next.length - 1] !== null) next.push(null);
      return next;
    });
  }

  function removeScheduleDate(index: number) {
    setScheduleDates((previous) => {
      const next = previous.filter((_, itemIndex) => itemIndex !== index);
      if (next.length === 0) return [null];
      if (next.length < 10 && next[next.length - 1] !== null) next.push(null);
      return next;
    });
  }

  async function publish() {
    if (
      !actionId ||
      !partner?.username ||
      !format ||
      mediaError ||
      blocked ||
      busy ||
      uncertain ||
      sendLock.current
    )
      return;
    sendLock.current = true;
    setBusy(true);
    try {
      await instagramPublishRequest(actionId, {
        actionId,
        partnerSlug: partner.slug,
        profileUsername: partner.username,
        format,
        files: selected.map((index) => files[index]),
        caption: caption ?? "",
        confirmed: true,
      });
      toast.success("Publicação enviada ao Instagram.");
    } catch (error) {
      setUncertain(
        !(error instanceof InstagramPublishError) ||
          (error.status >= 500 && error.outcome !== "failed"),
      );
      toast.error(
        error instanceof Error
          ? error.message
          : "Resultado incerto. Confira o Instagram antes de tentar novamente.",
      );
    } finally {
      await refresh(true);
      setBusy(false);
      sendLock.current = false;
    }
  }

  const hasConnectedProfile = connectedPartners.length > 0;
  if (!actionId) return null;

  return (
    <>
      {loading && state === null ? (
        <p className="text-sm text-secondary-foreground">
          Verificando conexão do Instagram…
        </p>
      ) : connectionFailed || state === null ? (
        <p className="text-sm text-secondary-foreground">
          Não foi possível verificar a conexão do Instagram agora.
        </p>
      ) : !hasConnectedProfile ? (
        <p className="text-sm text-secondary-foreground">
          Conecte o perfil do Instagram para ter acesso às ferramentas de
          publicação.
        </p>
      ) : (
        <PrismButton
          className="w-full"
          isDisabled={files.length === 0}
          size="sm"
          variant="secondary"
          onPress={openDialog}
        >
          Publicar ou programar
        </PrismButton>
      )}

      <PrismDialog isOpen={open} onOpenChange={setOpen} size="lg">
        <PrismDialogHeader>
          <PrismDialogTitle>Instagram</PrismDialogTitle>
          <PrismDialogDescription className="text-base">
            Confira o perfil conectado e o conteúdo da ação.
          </PrismDialogDescription>
        </PrismDialogHeader>
        <PrismTabs
          className="min-h-0"
          selectedKey={mode}
          variant="drawer"
          onSelectionChange={(key) => {
            if (key === "publish" || key === "schedule") setMode(key);
          }}
        >
          <PrismDialogBody className="flex flex-col gap-4">
            {loading && <p className="text-base">Consultando perfil…</p>}
            {connectedPartners.length > 1 ? (
              <p className="text-base text-error">
                Esta ação está vinculada a mais de um Instagram conectado. Para
                evitar publicar no perfil errado, vincule-a a um único parceiro
                antes de continuar.
              </p>
            ) : partner ? (
              <div className="flex items-center gap-3 rounded-2xl bg-card p-3 squircle">
                {partner.avatarUrl ? (
                  <img
                    src={partner.avatarUrl}
                    alt=""
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-base font-medium">
                    {usernameWithoutAt(partner.username)
                      .slice(0, 1)
                      .toUpperCase() || "@"}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base font-medium">
                    @{usernameWithoutAt(partner.username)}
                  </p>
                  <p className="text-sm text-secondary-foreground">
                    Perfil conectado
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-base text-error">
                Não foi possível confirmar um perfil conectado para esta ação.
              </p>
            )}

            {!categorySelected && (
              <p className="text-base text-error">
                A categoria desta ação não permite publicação no Instagram.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-base font-medium">Arquivos da ação</p>
              {selected.length === 0 && (
                <p className="text-base">Nenhum arquivo selecionado.</p>
              )}
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleFileDragEnd}
                sensors={sensors}
              >
                <SortableContext
                  items={selected}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {selected.map((fileIndex, index) => (
                      <SortablePublishFile
                        busy={busy}
                        fileIndex={fileIndex}
                        index={index}
                        key={fileIndex}
                        onRemove={() =>
                          setSelected((current) =>
                            current.filter((item) => item !== fileIndex),
                          )
                        }
                        url={files[fileIndex]}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {actionCategory !== "stories" && (
              <div>
                <p className="text-base font-medium">Legenda</p>
                <p className="whitespace-pre-wrap">
                  {caption || (
                    <span className="text-secondary-foreground">
                      Sem legenda.
                    </span>
                  )}
                </p>
              </div>
            )}

            {partner &&
              (state?.attempts.filter((item) => item.partner_id === partner.id)
                .length ?? 0) > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-base font-medium">
                    Histórico de envios desta ação
                  </p>
                  {state?.attempts
                    .filter((item) => item.partner_id === partner.id)
                    .map((item) => (
                      <div key={item.id} className="text-base">
                        <p>
                          {new Date(item.created_at).toLocaleString("pt-BR")} —{" "}
                          {item.status === "published"
                            ? "Publicado"
                            : item.status === "pending"
                              ? "Em andamento ou aguardando verificação"
                              : item.status === "failed"
                                ? "Não publicado"
                                : "Precisa de conferência"}
                        </p>
                        {item.detail && <p>{item.detail}</p>}
                        {item.results.map((result) => (
                          <p key={result.id}>
                            ID: {result.id}{" "}
                            {result.permalink && (
                              <a
                                href={result.permalink}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                Ver publicação
                              </a>
                            )}
                          </p>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            {(mediaError || blocked || uncertain) && (
              <p className="text-base text-error">
                {mediaError ||
                  (blocked
                    ? "Há um envio pendente ou parcial. Confira o Instagram antes de tentar novamente."
                    : "Confira o resultado no Instagram antes de tentar novamente.")}
              </p>
            )}
          </PrismDialogBody>
          <PrismTabList aria-label="Modo de publicação">
            <PrismTab id="publish">Publicar</PrismTab>
            <PrismTab id="schedule">Programar</PrismTab>
          </PrismTabList>
          <PrismTabPanel id="publish" className="w-full p-4">
            <PrismButton
              className="w-full"
              isDisabled={
                busy ||
                !partner?.username ||
                !format ||
                selected.length === 0 ||
                !!mediaError ||
                !!blocked ||
                uncertain
              }
              onPress={() => void publish()}
            >
              {busy ? "Publicando…" : "Publicar agora"}
            </PrismButton>
          </PrismTabPanel>

          <PrismTabPanel id="schedule">
            <PrismDialogBody className="flex flex-col gap-4 p-4">
              <p className="text-warning-foreground">
                O salvamento e o envio automático ainda não estão ligados. Esta
                etapa prepara a interface; o botão será ativado quando o fluxo
                de agendamento estiver pronto.
              </p>

              <div className="flex flex-col gap-2">
                {scheduleDates.map((date, index) => (
                  <div
                    className="flex items-center justify-between gap-2"
                    key={index}
                  >
                    <span className="text-sm">{index + 1}.</span>
                    <UActionDatePicker
                      ariaLabel={`Data e hora da publicação ${index + 1}`}
                      date={date ?? undefined}
                      onSelect={(nextDate) =>
                        updateScheduleDate(index, nextDate)
                      }
                      size="sm"
                    />
                    {(date !== null || scheduleDates.length > 1) && (
                      <PrismButton
                        aria-label={`Remover data ${index + 1}`}
                        isRounded
                        size="icon-sm"
                        variant="ghost"
                        onPress={() => removeScheduleDate(index)}
                      >
                        <XIcon />
                      </PrismButton>
                    )}
                  </div>
                ))}
                {scheduledCount === 10 && (
                  <p className="text-sm text-secondary-foreground">
                    Limite de 10 programações por vez.
                  </p>
                )}
              </div>
              <p className="text-xs text-secondary-foreground">
                O mesmo conteúdo será programado para cada data e hora. Fuso
                horário: {Intl.DateTimeFormat().resolvedOptions().timeZone}.
              </p>
              {(scheduleHasInvalidDate || mediaError) && (
                <p className="text-base text-error">
                  {scheduleHasInvalidDate
                    ? "Escolha horários futuros."
                    : mediaError}
                </p>
              )}
              <PrismButton isDisabled>Programar publicação</PrismButton>
            </PrismDialogBody>
          </PrismTabPanel>
        </PrismTabs>
      </PrismDialog>
    </>
  );
}
