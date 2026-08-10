import type { Action, Partner } from "~/types";
import { format } from "date-fns";
import { ArchiveIcon, HeartIcon, MessageSquareIcon, XIcon } from "lucide-react";
import { Icons } from "~/components/uzzina/UIcons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ActionFormFooter } from "./ActionFormFooter";
import { EssentialsTab } from "./EssentialsTab";
import { InstagramTab } from "./InstagramTab";
import { ObservationsTab } from "./ObservationsTab";
import { INTENT } from "~/lib/CONSTANTS";
import { isInstagramFeed, parseStrategies } from "~/lib/helpers";
import { useActionMutations } from "~/hooks/useActionMutations";
import { cn } from "cnfast";
import {
  PrismButton,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
} from "~/components/prism";
function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}
const DEFAULT_PARTNER_FILTERS: string[] = [];
const DEFAULT_PARTNERS: Partner[] = [];
import { useAppContext } from "~/contexts/AppContext";
import { callAI, type AIPayload } from "~/services/ai-client";
export function ActionFormDrawer({
  BaseAction,
  onClose,
  partnerFilters = DEFAULT_PARTNER_FILTERS,
}: {
  BaseAction: Action;
  onClose: () => void;
  partnerFilters?: string[];
}) {
  const [view, setView] = useState<"essential" | "instagram" | "observations">(
    "essential",
  );
  const { partners: routePartners, cloudName, uploadPreset } = useAppContext();
  const partners = routePartners ?? DEFAULT_PARTNERS;
  const { handleAction, isLoading: isMutationLoading } = useActionMutations();
  const [RawAction, setRawAction] = useState<Action>(() => {
    if (BaseAction.created_at) return BaseAction;
    const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
    let initialPartners = BaseAction.partners || [];
    let initialResponsibles = BaseAction.responsibles || [];
    if (initialPartners.length === 0 && partnerFilters.length > 0) {
      initialPartners = partnerFilters;
      // Busca o primeiro parceiro filtrado para pré-selecionar os responsáveis
      const matchedPartner = partners.find((p) => p.slug === partnerFilters[0]);
      if (matchedPartner && initialResponsibles.length === 0) {
        initialResponsibles = matchedPartner.users_ids;
      }
    }
    return {
      ...BaseAction,
      partners: initialPartners,
      responsibles: initialResponsibles,
      created_at: now,
      updated_at: now,
    };
  });

  // Ref always points to the latest RawAction to avoid stale closures
  const rawActionRef = useRef(RawAction);
  useEffect(() => {
    rawActionRef.current = RawAction;
  }, [RawAction]);

  // Lock to prevent race condition: onBlur + button click both firing create_action
  // simultaneously before the server responds with the new id.
  // useRef is synchronous — both callbacks share the same lock in the same call stack.
  const isCreatingRef = useRef(false);

  // Ref for the latest description typed in Tiptap — updated on every keystroke
  // without triggering re-renders. handleSave reads from here so Cmd+Enter
  // always saves the latest typed content even without blur.
  const descriptionRef = useRef(BaseAction.description || "");
  const contentDescriptionRef = useRef(BaseAction.content_description || "");
  const handleSave = useCallback(async () => {
    if (!RawAction.title) {
      toast.error("Erro / O título é obrigatório", {
        position: "top-center",
      });
      return;
    }
    if (RawAction.partners.length === 0) {
      toast.error("Erro / Pelo menos um parceiro deve ser selecionado", {
        position: "top-center",
      });
      return;
    }

    // Prevent double-create: if onBlur already fired a create, bail out
    if (!RawAction.id && isCreatingRef.current) return;
    if (!RawAction.id) isCreatingRef.current = true;
    const result = await handleAction({
      ...RawAction,
      description: descriptionRef.current,
      content_description: contentDescriptionRef.current,
      // always latest typed content
      intent: RawAction.id ? INTENT.update_action : INTENT.create_action,
    });
    if (result) {
      isCreatingRef.current = false;
      setRawAction(result);
    }
  }, [RawAction, handleAction]);

  // Ref always points to the latest handleSave to avoid stale closures in event listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);
  const prevBaseIdRef = useRef(BaseAction.id);
  useEffect(() => {
    const current = rawActionRef.current;
    if (current.id && !BaseAction.id) {
      handleAction({
        ...current,
        intent: INTENT.update_action,
      });
    }

    // Only reset state if the action we are viewing actually changed
    if (BaseAction.id !== prevBaseIdRef.current) {
      prevBaseIdRef.current = BaseAction.id;
      descriptionRef.current = BaseAction.description || "";
      contentDescriptionRef.current = BaseAction.content_description || "";
      setRawAction(BaseAction);
    }
  }, [BaseAction, handleAction]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [activeAIIntent, setActiveAIIntent] = useState<string | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [descriptionVersion, setDescriptionVersion] = useState(0);
  const isPending = isMutationLoading || isAIProcessing;
  const triggerAIAction = async (
    intent: string,
    customPayload?: Record<string, string | string[] | null>,
  ) => {
    setIsAIProcessing(true);
    setActiveAIIntent(intent);
    try {
      const aiPayload: AIPayload = {
        intent,
        title: RawAction.title || "",
        description: descriptionRef.current || "",
        partner_context: `${currentPartners[0]?.context || ""} — ${RawAction.category || ""}`,
        category: RawAction.category || "",
      };
      if (customPayload) {
        for (const [key, val] of Object.entries(customPayload)) {
          if (val !== null && val !== undefined) {
            (aiPayload as unknown as Record<string, string>)[key] = String(val);
          }
        }
      }
      const data = await callAI(aiPayload);
      if (data?.output) {
        const captionTail = captionTailRef.current;
        if (intent === INTENT.ai_strategy) {
          const newStrategies = parseStrategies(data.output);
          // Set strategies in local state FIRST
          setRawAction((prev) => ({
            ...prev,
            strategies: newStrategies,
          }));
          setIsStrategyModalOpen(true);
          // Save to DB — updateAction internally calls setRawAction(result) which
          // will overwrite strategies with the DB's Json type. We re-apply strategies after.
          await updateAction({
            strategies: newStrategies,
          });
          // Re-apply strategies after DB write since setRawAction(result) resets it
          setRawAction((prev) => ({
            ...prev,
            strategies: newStrategies,
          }));
        }
        if (intent === INTENT.ai_content) {
          const out = data.output as
            | {
                content?: string;
              }
            | string;
          const newContent = typeof out === "string" ? out : out.content || "";
          if (newContent) {
            contentDescriptionRef.current = newContent;
            setRawAction((prev) => ({
              ...prev,
              content_description: newContent,
            }));
            updateAction({
              content_description: newContent,
            });
          }
        }
        if (intent === INTENT.ai_caption) {
          const captionText =
            typeof data.output === "string"
              ? data.output
              : (
                  data.output as {
                    caption?: string;
                  }
                ).caption;
          const newCaption = (captionText || "").concat(
            getCaptionTail(captionTail),
          );
          setRawAction((prev) => ({
            ...prev,
            instagram_caption: newCaption,
          }));
          updateAction({
            instagram_caption: newCaption,
          });
        }
        if (
          [
            INTENT.ai_post,
            INTENT.ai_carousel,
            INTENT.ai_stories,
            INTENT.ai_reels,
          ].includes(
            intent as "ai-post" | "ai-carousel" | "ai-stories" | "ai-reels",
          )
        ) {
          const out = data.output as {
            content?: string;
            caption?: string;
          };
          const content = out.content || "";
          const caption = out.caption || "";
          const newCaption = (caption || "").concat(
            getCaptionTail(captionTail),
          );
          const currentDescription = rawActionRef.current.description || "";
          const newDescription = `${content}<hr />${currentDescription}`;
          setRawAction((prev) => ({
            ...prev,
            description: newDescription,
            instagram_caption: newCaption,
          }));
          descriptionRef.current = newDescription;
          setDescriptionVersion((v) => v + 1);
          updateAction({
            description: newDescription,
            instagram_caption: newCaption,
          });
        }
      }
      return data;
    } catch (err) {
      console.error("Erro no processamento de IA:", err);
      toast.error("Falha ao gerar conteúdo com IA.");
    } finally {
      setIsAIProcessing(false);
      setActiveAIIntent(null);
    }
  };
  const currentPartners = useMemo(() => {
    return RawAction.partners
      .map((slug) => partners.find((partner) => partner.slug === slug))
      .filter((partner): partner is Partner => partner !== undefined);
  }, [RawAction.partners, partners]);
  const [workFiles, setWorkFiles] = useState<string[]>(
    RawAction.work_files ?? [],
  );
  const [contentFiles, setContentFiles] = useState<string[]>(
    RawAction.content_files ?? [],
  );
  const handleDescriptionChange = useCallback((desc: string) => {
    descriptionRef.current = desc;
  }, []);
  const updateAction = useCallback(
    async (
      data?: {
        [key: string]: unknown;
      },
      forceCreate = false,
    ) => {
      const current = rawActionRef.current;
      if (
        current.id ||
        (forceCreate &&
          !current.id &&
          current.title &&
          current.partners.length > 0)
      ) {
        // Prevent double-create: if a creation is already in flight, bail out
        if (!current.id && isCreatingRef.current) return;
        if (!current.id) isCreatingRef.current = true;
        const result = await handleAction({
          ...current,
          ...data,
          intent: current.id ? INTENT.update_action : INTENT.create_action,
        });
        if (result) {
          isCreatingRef.current = false;
          setRawAction(result);
        }
      }
    },
    [handleAction],
  );
  const updateContentFiles = useCallback(
    (next: string[]) => {
      setContentFiles(next);
      setRawAction((prev) => ({
        ...prev,
        content_files: next,
      }));
      updateAction({
        content_files: next,
      });
    },
    [updateAction],
  );

  // Guard: only update color if it actually changed to avoid
  // triggering another render cycle via the partners effect above.
  useEffect(() => {
    if (!BaseAction.id && currentPartners.length > 0) {
      const newColor = currentPartners[0].colors[0];
      const newResponsibles = currentPartners.flatMap((p) =>
        p.users_ids.map((user) => user),
      );
      setRawAction((prev) =>
        prev.color === newColor
          ? prev
          : {
              ...prev,
              color: newColor,
              responsibles: newResponsibles,
            },
      );
    }
  }, [currentPartners, BaseAction.id]);
  const captionTailRef = useRef(currentPartners[0]?.instagram_caption_tail);
  useEffect(() => {
    captionTailRef.current = currentPartners[0]?.instagram_caption_tail;
  }, [currentPartners]);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLocaleLowerCase() === "escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (event.key.toLocaleLowerCase() === "enter" && event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        handleSaveRef.current();
        if (!event.shiftKey) {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return (
    <div
      className={cn(
        "fixed top-16 right-0 bottom-0 z-10 flex shrink-0 flex-col overflow-hidden border-l bg-background",
        view === "instagram" ? "lg:w-4xl" : "lg:w-2xl",
      )}
    >
      { RawAction.archived && (
        <div className="flex shrink-0 items-center justify-center gap-2 bg-error-background p-2 text-sm font-medium text-error border-b">
          <ArchiveIcon className="size-4" />
          Esta ação está arquivada.
          <button
            className="ml-2 underline hover:no-underline"
            onClick={() => {
              setRawAction((prev) => ({
                ...prev,
                archived: false,
              }));
              updateAction({
                archived: false,
              });
            }}
            type="button"
          >
            Desarquivar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex shrink-0 divide-x" role="tablist">
        <button
          aria-selected={view === "essential"}
          className={tabClass(view === "essential")}
          onClick={() => setView("essential")}
          role="tab"
          type="button"
        >
          ESSENCIAL <HeartIcon className="size-4" />
        </button>
        {isInstagramFeed(RawAction.category) && (
          <button
            aria-selected={view === "instagram"}
            className={tabClass(view === "instagram")}
            onClick={() => setView("instagram")}
            role="tab"
            type="button"
          >
            INSTAGRAM <Icons className="size-4" slug="instagram" />
          </button>
        )}
        <button
          aria-selected={view === "observations"}
          className={tabClass(view === "observations")}
          onClick={() => setView("observations")}
          role="tab"
          type="button"
        >
          OBSERVAÇÕES <MessageSquareIcon className="size-4" />
        </button>
        <div>
          <button
            aria-label="Fechar"
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-b p-5 text-sm font-medium"
            onClick={onClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative flex h-full grow flex-col overflow-hidden">
        {/* Essencial */}
        <div className="flex h-full w-full divide-x overflow-hidden bg-popover">
          {view === "essential" && (
            <div
              className={cn(
                view !== "essential" && "hidden",
                "w-full",
                "h-full",
              )}
            >
              <EssentialsTab
                cloudName={cloudName}
                currentPartners={currentPartners}
                descriptionVersion={descriptionVersion}
                isAIProcessing={isAIProcessing}
                onDescriptionChange={handleDescriptionChange}
                onOpenStrategyModal={() => setIsStrategyModalOpen(true)}
                RawAction={RawAction}
                setRawAction={setRawAction}
                setWorkFiles={setWorkFiles}
                triggerAIAction={triggerAIAction}
                updateAction={updateAction}
                uploadPreset={uploadPreset}
                workFiles={workFiles}
              />
            </div>
          )}
          {/* Instagram */}
          {view === "instagram" && (
            <div className={cn("w-full", "h-full")}>
              <InstagramTab
                activeAIIntent={activeAIIntent}
                cloudName={cloudName}
                contentFiles={contentFiles}
                currentPartners={currentPartners}
                isAIProcessing={isAIProcessing}
                RawAction={RawAction}
                setRawAction={setRawAction}
                triggerAIAction={triggerAIAction}
                updateAction={updateAction}
                updateContentFiles={updateContentFiles}
                uploadPreset={uploadPreset}
                contentDescription={contentDescriptionRef.current}
                onContentDescriptionChange={(html) => {
                  contentDescriptionRef.current = html;
                }}
              />
            </div>
          )}
          {view === "observations" && (
            <div className={cn("w-full", "h-full")}>
              <ObservationsTab
                actionId={RawAction.id}
                partnerUsersIds={currentPartners[0]?.users_ids || []}
              />
            </div>
          )}
        </div>
        {/* Criar e Atualizar */}
        <ActionFormFooter
          currentPartners={currentPartners}
          handleClose={onClose}
          handleSave={handleSave}
          isPending={isPending}
          RawAction={RawAction}
          setRawAction={setRawAction}
          updateAction={updateAction}
        />
      </div>

      <PrismDialog
        className="max-w-2xl sm:max-w-2xl"
        isOpen={isStrategyModalOpen}
        onOpenChange={setIsStrategyModalOpen}
      >
        <PrismDialogHeader>
          <PrismDialogTitle>5 Estratégias Sugeridas</PrismDialogTitle>
          <PrismDialogDescription>
            Escolha uma das 5 estratégias criativas abaixo para gerar o conteúdo da ação.
          </PrismDialogDescription>
        </PrismDialogHeader>
        <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto px-5 pb-6">
          {parseStrategies(RawAction.strategies).map((strat, i) => (
            <div
              key={strat.headline || i}
              className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 squircle transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    {strat.headline}
                  </h3>
                  <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {strat.angulo}
                  </span>
                </div>
                <PrismButton
                  onClick={() => {
                    triggerAIAction(INTENT.ai_content, {
                      headline: strat.headline,
                      angulo: strat.angulo,
                      racional: strat.racional,
                      direcionamento: strat.direcionamento,
                    });
                    setIsStrategyModalOpen(false);
                  }}
                  size="sm"
                  variant="default"
                >
                  USAR
                </PrismButton>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Racional:</strong>{" "}
                {strat.racional}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Direcionamento:</strong>{" "}
                {strat.direcionamento}
              </p>
            </div>
          ))}
        </div>
      </PrismDialog>
    </div>
  );
}
const tabClass = (active: boolean) =>
  cn(
    "flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium",
    active ? "bg-popover border-b-transparent" : "bg-muted border-border",
  );
