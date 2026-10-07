import type { Action, Partner } from "~/types";
import { format } from "date-fns";
import {
  ArchiveIcon,
  AlertTriangleIcon,
  HeartIcon,
  MessageSquareIcon,
  XIcon,
} from "lucide-react";
import { Icons } from "~/components/uzzina/UIcons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ActionFormFooter } from "./ActionFormFooter";
import { EssentialsTab } from "./EssentialsTab";
import { InstagramTab } from "./InstagramTab";
import { ObservationsTab } from "./ObservationsTab";
import { ActionSaveCoordinator, type CoordinatorState } from "./action-save-coordinator";
import { INTENT } from "~/lib/CONSTANTS";
import { isSocialMediaContent, parseStrategies } from "~/lib/helpers";
import {
  useActionMutations,
  type SingleActionInput,
} from "~/hooks/useActionMutations";
import { cn } from "cnfast";
import {
  PrismAccordion,
  PrismAccordionContent,
  PrismAccordionItem,
  PrismAccordionTrigger,
  PrismBadge,
  PrismButton,
  PrismCheckbox,
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
    let initialColor = BaseAction.color;
    if (initialPartners.length === 0 && partnerFilters.length > 0) {
      initialPartners = partnerFilters;
    }
    const matchedPartner = partners.find((p) =>
      initialPartners.includes(p.slug),
    );
    if (matchedPartner) {
      if (initialResponsibles.length === 0) {
        initialResponsibles = matchedPartner.users_ids;
      }
      if (
        (!initialColor ||
          initialColor === "#666666" ||
          initialColor === "#666") &&
        matchedPartner.colors &&
        matchedPartner.colors.length > 0
      ) {
        initialColor = matchedPartner.colors[0];
      }
    }
    return {
      ...BaseAction,
      partners: initialPartners,
      responsibles: initialResponsibles,
      color: initialColor,
      created_at: now,
      updated_at: now,
    };
  });

  // Ref always points to the latest RawAction to avoid stale closures
  const rawActionRef = useRef(RawAction);
  useEffect(() => {
    rawActionRef.current = RawAction;
  }, [RawAction]);

  // Saved title reference — initialized from BaseAction.title, updated only on confirmed save
  const savedTitleRef = useRef(BaseAction.title || "");

  const draftKeyRef = useRef(`draft-${Date.now()}`);
  const coordinatorKey = BaseAction.id || draftKeyRef.current;
  const coordinatorRef = useRef<ActionSaveCoordinator | null>(null);
  if (!coordinatorRef.current) {
    coordinatorRef.current = new ActionSaveCoordinator({
      key: coordinatorKey,
      initialAction: BaseAction,
      writeFn: async (payload: Record<string, unknown>) =>
        (await handleAction(
          payload as unknown as SingleActionInput,
        )) as Action | null | undefined,
    });
  }

  const [coordinatorState, setCoordinatorState] = useState<CoordinatorState>(
    () => coordinatorRef.current?.getState() ?? {
      key: coordinatorKey,
      status: BaseAction.id ? "saved" : "draft",
      errorMessage: null,
      savedTitle: BaseAction.title || "",
      confirmedAction: BaseAction,
      pendingPatch: {},
      isDirty: false,
    },
  );

  useEffect(() => {
    if (coordinatorRef.current) {
      return coordinatorRef.current.subscribe(setCoordinatorState);
    }
  }, []);

  // Quando o coordenador confirma uma ação persistida ou nova versão, sincroniza o RawAction
  useEffect(() => {
    if (coordinatorState.confirmedAction) {
      setRawAction((prev) => ({
        ...prev,
        ...coordinatorState.confirmedAction,
        id: coordinatorState.confirmedAction?.id ?? prev.id,
        created_at: coordinatorState.confirmedAction?.created_at ?? prev.created_at,
        updated_at: coordinatorState.confirmedAction?.updated_at ?? prev.updated_at,
      }));
    }
  }, [coordinatorState.confirmedAction]);

  // Ref for the latest description typed in Tiptap — updated on every keystroke
  // without triggering re-renders. handleSave reads from here so Cmd+Enter
  // always saves the latest typed content even without blur.
  const descriptionRef = useRef(BaseAction.description || "");
  const contentDescriptionRef = useRef(BaseAction.content_description || "");

  const updateAction = useCallback(
    async (
      data?: {
        [key: string]: unknown;
      },
      forceCreate = false,
    ): Promise<Action | null> => {
      const coordinator = coordinatorRef.current;
      if (!coordinator) return null;
      const current = rawActionRef.current;

      // Se for rascunho e forceCreate solicitado
      if (!current.id && forceCreate) {
        if (!current.title || current.title.trim().length < 2) return null;
        if (current.partners.length === 0) return null;

        const payload = {
          ...current,
          ...data,
          title: ((data?.title as string) || current.title).trim(),
          description: descriptionRef.current,
          content_description: contentDescriptionRef.current,
          intent: INTENT.create_action,
        };
        return await coordinator.createAction(payload);
      }

      // Se for ação existente (atualização parcial / patch)
      if (current.id) {
        const patchData = data || {};
        return await coordinator.scheduleUpdate(patchData);
      }
      return null;
    },
    [],
  );

  const handleTitleBlur = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      const current = rawActionRef.current;
      const coordinator = coordinatorRef.current;
      if (!coordinator) return;

      // Se o título não mudou em relação ao último salvo/confirmado pelo coordenador, não grava
      if (trimmed === coordinator.getState().savedTitle) {
        return;
      }

      // Se for ação existente e título válido, atualiza
      if (current.id) {
        if (trimmed.length >= 2) {
          await coordinator.scheduleUpdate({
            title: trimmed,
          });
        }
        return;
      }

      // Se for rascunho novo com parceiro selecionado e título válido, cria no blur
      if (!current.id && trimmed.length >= 2 && current.partners.length > 0) {
        await updateAction(
          {
            title: trimmed,
          },
          true,
        );
      }
    },
    [updateAction],
  );

  const handleSave = useCallback(async (): Promise<boolean> => {
    const current = rawActionRef.current;
    const coordinator = coordinatorRef.current;
    if (!coordinator) return false;

    const titleTrimmed = (current.title || "").trim();
    if (titleTrimmed.length < 2) {
      toast.error("Erro / O título deve ter pelo menos 2 caracteres", {
        position: "top-center",
      });
      return false;
    }
    if (current.partners.length === 0) {
      toast.error("Erro / Pelo menos um parceiro deve ser selecionado", {
        position: "top-center",
      });
      return false;
    }

    return await coordinator.saveNow({
      title: titleTrimmed,
      description: descriptionRef.current,
      content_description: contentDescriptionRef.current,
    });
  }, []);

  // Ref always points to the latest handleSave to avoid stale closures in event listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);
  const prevBaseIdRef = useRef(BaseAction.id);
  const prevBaseActionRef = useRef(BaseAction);
  useEffect(() => {
    // Reset state se mudou de ação (id diferente ou novo rascunho)
    const isNewDraft = !BaseAction.id && !rawActionRef.current.id;
    const isDifferentAction =
      (BaseAction.id && BaseAction.id !== prevBaseIdRef.current) ||
      (isNewDraft && BaseAction !== prevBaseActionRef.current);
    if (isDifferentAction) {
      prevBaseIdRef.current = BaseAction.id;
      prevBaseActionRef.current = BaseAction;
      savedTitleRef.current = BaseAction.title || "";
      descriptionRef.current = BaseAction.description || "";
      contentDescriptionRef.current = BaseAction.content_description || "";
      coordinatorRef.current?.reset(BaseAction);
      let initialPartners = BaseAction.partners || [];
      if (initialPartners.length === 0) {
        if (
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/app/partner/")
        ) {
          const slug = window.location.pathname
            .replace(/^\/app\/partner\//, "")
            .split("/")[0]
            ?.split("?")[0];
          if (slug) initialPartners = [slug];
        } else if (partnerFilters.length > 0) {
          initialPartners = partnerFilters;
        }
      }
      const matchedPartner = partners.find((p) =>
        initialPartners.includes(p.slug),
      );
      const initialResponsibles =
        BaseAction.responsibles && BaseAction.responsibles.length > 0
          ? BaseAction.responsibles
          : matchedPartner?.users_ids || [];
      let initialColor = BaseAction.color;
      if (
        (!initialColor ||
          initialColor === "#666666" ||
          initialColor === "#666") &&
        matchedPartner?.colors &&
        matchedPartner.colors.length > 0
      ) {
        initialColor = matchedPartner.colors[0];
      }
      setRawAction({
        ...BaseAction,
        partners: initialPartners,
        responsibles: initialResponsibles,
        color: initialColor,
      });
    }
  }, [BaseAction, partnerFilters, partners]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [activeAIIntent, setActiveAIIntent] = useState<string | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [descriptionVersion, setDescriptionVersion] = useState(0);
  const isPending =
    isMutationLoading ||
    isAIProcessing ||
    coordinatorState.status === "creating" ||
    coordinatorState.status === "saving";
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
        description: `DESCRIÇÃO: ${descriptionRef.current} DESCRIÇÃO DO CONTEÚDO: ${contentDescriptionRef.current}`,
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

  // Safe close that coordinates with any in-flight creation and unsaved edits
  const handleSafeClose = useCallback(async () => {
    const coordinator = coordinatorRef.current;
    if (coordinator) {
      const canClose = await coordinator.safeClose({
        title: rawActionRef.current.title,
        description: descriptionRef.current,
        content_description: contentDescriptionRef.current,
      });
      if (canClose) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [onClose]);

  // Guard: only update color and initial fallback responsibles on fresh draft
  // Preserve any explicit responsibles already set by creator or user
  const prevPrimaryPartnerRef = useRef(currentPartners[0]?.slug);
  useEffect(() => {
    const currentPrimarySlug = currentPartners[0]?.slug;
    const isNewDraft = !rawActionRef.current.id && !BaseAction.id;
    if (
      isNewDraft &&
      currentPrimarySlug &&
      currentPrimarySlug !== prevPrimaryPartnerRef.current
    ) {
      prevPrimaryPartnerRef.current = currentPrimarySlug;
      const primaryPartner = currentPartners[0];
      if (primaryPartner) {
        const newColor = primaryPartner.colors?.[0] || "#666666";
        setRawAction((prev) => ({
          ...prev,
          color:
            !prev.color || prev.color === "#666666" || prev.color === "#666"
              ? newColor
              : prev.color,
          responsibles:
            prev.responsibles && prev.responsibles.length > 0
              ? prev.responsibles
              : primaryPartner.users_ids || [],
        }));
      }
    }
  }, [currentPartners, BaseAction.id]);
  const captionTailRef = useRef(currentPartners[0]?.instagram_caption_tail);
  useEffect(() => {
    captionTailRef.current = currentPartners[0]?.instagram_caption_tail;
  }, [currentPartners]);
  useEffect(() => {
    async function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLocaleLowerCase() === "escape") {
        event.preventDefault();
        event.stopPropagation();
        handleSafeClose();
      } else if (event.key.toLocaleLowerCase() === "enter" && event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        const success = await handleSaveRef.current();
        if (success && !event.shiftKey) {
          handleSafeClose();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSafeClose]);
  return (
    <div
      className={cn(
        "fixed top-16 right-0 bottom-0 z-10 flex flex-col overflow-hidden border-l bg-background w-full max-w-full sm:max-w-2xl",
        view === "instagram"
          ? "lg:w-4xl lg:max-w-4xl"
          : "lg:w-2xl lg:max-w-2xl",
      )}
    >
      {RawAction.archived && (
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

      {coordinatorState.status === "conflict" && (
        <div
          data-testid="drawer-conflict-banner"
          className="flex shrink-0 items-center justify-between gap-3 bg-warning-background p-3 text-sm font-medium text-warning border-b"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span className="truncate">
              {coordinatorState.errorMessage ||
                "Esta ação foi modificada em outra sessão. Suas edições foram retidas localmente."}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="text-xs underline hover:no-underline font-semibold"
              onClick={async () => {
                const coordinator = coordinatorRef.current;
                if (!coordinator) return;
                await coordinator.forceSave();
              }}
              type="button"
            >
              Sobrescrever
            </button>
          </div>
        </div>
      )}

      {coordinatorState.status === "error" && (
        <div
          data-testid="drawer-error-banner"
          className="flex shrink-0 items-center justify-between gap-3 bg-error-background p-3 text-sm font-medium text-error border-b"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span className="truncate">
              {coordinatorState.errorMessage || "Erro ao salvar alterações."}
            </span>
          </div>
          <button
            className="text-xs underline hover:no-underline font-semibold shrink-0"
            onClick={() => {
              handleSave();
            }}
            type="button"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex w-full shrink-0 divide-x overflow-hidden"
        role="tablist"
      >
        <button
          aria-selected={view === "essential"}
          className={tabClass(view === "essential")}
          onClick={() => setView("essential")}
          role="tab"
          type="button"
        >
          <span className="truncate">ESSENCIAL</span>
          <HeartIcon className="size-4 shrink-0" />
        </button>
        {isSocialMediaContent(RawAction.category) && (
          <button
            aria-selected={view === "instagram"}
            className={tabClass(view === "instagram")}
            onClick={() => setView("instagram")}
            role="tab"
            type="button"
          >
            <span className="truncate">INSTAGRAM</span>
            <Icons className="size-4 shrink-0" slug="instagram" />
          </button>
        )}
        <button
          aria-selected={view === "observations"}
          className={tabClass(view === "observations")}
          onClick={() => setView("observations")}
          role="tab"
          type="button"
        >
          <span className="truncate">OBSERVAÇÕES</span>
          <MessageSquareIcon className="size-4 shrink-0" />
        </button>
        <div className="shrink-0">
          <button
            aria-label="Fechar"
            className="flex cursor-pointer items-center justify-center border-b px-3 py-3 sm:p-5 text-sm font-medium"
            onClick={handleSafeClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative flex h-full grow flex-col overflow-hidden w-full max-w-full">
        {/* Essencial */}
        <div className="flex h-full w-full divide-x overflow-hidden bg-popover">
          {view === "essential" && (
            <div
              className={cn(
                view !== "essential" && "hidden",
                "w-full max-w-full",
                "h-full overflow-hidden",
              )}
            >
              <EssentialsTab
                cloudName={cloudName}
                currentPartners={currentPartners}
                descriptionVersion={descriptionVersion}
                isAIProcessing={isAIProcessing}
                onDescriptionChange={handleDescriptionChange}
                onOpenStrategyModal={() => setIsStrategyModalOpen(true)}
                onTitleBlur={handleTitleBlur}
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
                contentDescription={contentDescriptionRef.current}
                contentFiles={contentFiles}
                currentPartners={currentPartners}
                isAIProcessing={isAIProcessing}
                onContentDescriptionChange={(html) => {
                  contentDescriptionRef.current = html;
                }}
                onOpenStrategyModal={() => setIsStrategyModalOpen(true)}
                RawAction={RawAction}
                setRawAction={setRawAction}
                triggerAIAction={triggerAIAction}
                updateAction={updateAction}
                updateContentFiles={updateContentFiles}
                uploadPreset={uploadPreset}
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
          handleClose={handleSafeClose}
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
        <PrismDialogHeader className="px-10 pt-8">
          <PrismDialogTitle className="text-2xl">
            5 Estratégias Sugeridas
          </PrismDialogTitle>
          <PrismDialogDescription>
            Escolha uma das 5 estratégias criativas abaixo para gerar o conteúdo
            da ação.
          </PrismDialogDescription>
        </PrismDialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-5 pb-6">
          <PrismAccordion className={"border-none"}>
            {parseStrategies(RawAction.strategies).map((strat, i) => (
              <PrismAccordionItem
                key={strat.headline || i}
                defaultExpanded={i === 0}
                id={String(i)}
              >
                <div className="flex items-center gap-3 w-full px-2">
                  <PrismCheckbox
                    aria-label="Selecionar estratégia"
                    isSelected={!!strat.selected}
                    onChange={(isSelected) => {
                      const currentStrats = parseStrategies(
                        RawAction.strategies,
                      );
                      const updated = currentStrats.map((s, idx) => ({
                        ...s,
                        selected: idx === i ? isSelected : false,
                      }));
                      setRawAction((prev) => ({
                        ...prev,
                        strategies: updated,
                      }));
                      updateAction({
                        strategies: updated,
                      });
                    }}
                  />
                  <PrismAccordionTrigger className="overflow-hidden flex-1 px-2 min-w-0">
                    <div
                      className="text-lg tracking-tight font-normal truncate flex-1 min-w-0"
                      title={strat.headline}
                    >
                      {strat.headline}
                    </div>
                  </PrismAccordionTrigger>
                </div>
                <PrismAccordionContent>
                  <div className="flex flex-col gap-3 text-base">
                    <PrismBadge>{strat.angulo}</PrismBadge>
                    <p>
                      <strong className="text-foreground">Racional:</strong>{" "}
                      {strat.racional}
                    </p>
                    <p>
                      <strong className="text-foreground">
                        Direcionamento:
                      </strong>{" "}
                      {strat.direcionamento}
                    </p>
                    <PrismButton
                      className="self-end"
                      onClick={() => {
                        const currentStrats = parseStrategies(
                          RawAction.strategies,
                        );
                        const updated = currentStrats.map((s, idx) => ({
                          ...s,
                          selected: idx === i,
                        }));
                        setRawAction((prev) => ({
                          ...prev,
                          strategies: updated,
                        }));
                        updateAction({
                          strategies: updated,
                        });
                        triggerAIAction(INTENT.ai_content, {
                          headline: strat.headline,
                          angulo: strat.angulo,
                          racional: strat.racional,
                          direcionamento: strat.direcionamento,
                        });
                        setIsStrategyModalOpen(false);
                      }}
                      size="sm"
                      variant="secondary"
                    >
                      USAR ESTA ESTRATÉGIA
                    </PrismButton>
                  </div>
                </PrismAccordionContent>
              </PrismAccordionItem>
            ))}
          </PrismAccordion>
        </div>
      </PrismDialog>
    </div>
  );
}
const tabClass = (active: boolean) =>
  cn(
    "flex flex-1 min-w-0 cursor-pointer items-center justify-center gap-1.5 border-b px-2 py-3 sm:p-4 text-xs sm:text-sm font-medium",
    active ? "bg-popover border-b-transparent" : "bg-muted border-border",
  );
