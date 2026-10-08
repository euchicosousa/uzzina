import type { Action, Partner } from "~/types";
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
import { useActionAI } from "./useActionAI";
import { EssentialsTab } from "./EssentialsTab";
import { InstagramTab } from "./InstagramTab";
import { ObservationsTab } from "./ObservationsTab";
import { ConflictComparison } from "./conflict-comparison";
import {
  ActionSaveCoordinator,
  type CoordinatorState,
} from "./action-save-coordinator";
import { INTENT } from "~/lib/CONSTANTS";
import { isSocialMediaContent, parseStrategies } from "~/utils";
import { isDefaultActionColor, toDbTimestamp } from "~/utils/uzzina-utils";
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
  PrismDialogFooter,
  PrismDialogTitle,
} from "~/components/prism";
const DEFAULT_PARTNER_FILTERS: string[] = [];
const DEFAULT_PARTNERS: Partner[] = [];
import { useAppContext } from "~/contexts/AppContext";
export function ActionFormDrawer({
  BaseAction,
  onClose,
  partnerFilters = DEFAULT_PARTNER_FILTERS,
  registerLeaveGuard,
}: {
  BaseAction: Action;
  onClose: () => void;
  partnerFilters?: string[];
  registerLeaveGuard?: (guard: (() => Promise<boolean>) | null) => void;
}) {
  const [conflictVersion, setConflictVersion] = useState<Action | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const [view, setView] = useState<"essential" | "instagram" | "observations">(
    "essential",
  );
  const { partners: routePartners, cloudName, uploadPreset } = useAppContext();
  const partners = routePartners ?? DEFAULT_PARTNERS;
  const { handleAction, isLoading: isMutationLoading } = useActionMutations();
  const [RawAction, commitRawAction] = useState<Action>(() => {
    if (BaseAction.id) return BaseAction;
    const now = toDbTimestamp();
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
        isDefaultActionColor(initialColor) &&
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

  const draftKeyRef = useRef(`draft-${Date.now()}`);
  const coordinatorKey = BaseAction.id || draftKeyRef.current;
  const coordinatorRef = useRef<ActionSaveCoordinator | null>(null);
  if (!coordinatorRef.current) {
    coordinatorRef.current = new ActionSaveCoordinator({
      key: coordinatorKey,
      initialAction: RawAction,
      writeFn: async (payload: Record<string, unknown>) =>
        (await handleAction(payload as unknown as SingleActionInput)) as
          Action | null | undefined,
    });
  }

  const setRawAction = useCallback(
    (value: Action | ((prev: Action) => Action)) => {
      const previous = rawActionRef.current;
      const next = typeof value === "function" ? value(previous) : value;
      const patch: Record<string, unknown> = {};
      for (const [field, entry] of Object.entries(next)) {
        if (
          JSON.stringify(entry) !==
          JSON.stringify(
            (previous as unknown as Record<string, unknown>)[field],
          )
        )
          patch[field] = entry;
      }
      rawActionRef.current = next;
      coordinatorRef.current?.recordLocalChanges(patch);
      commitRawAction(next);
    },
    [],
  );

  const [coordinatorState, setCoordinatorState] = useState<CoordinatorState>(
    () =>
      coordinatorRef.current?.getState() ?? {
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

  // Server metadata is canonical; queued local fields keep their latest values.
  useEffect(() => {
    const confirmed = coordinatorState.confirmedAction;
    if (confirmed) {
      const next = {
        ...rawActionRef.current,
        ...confirmed,
        ...coordinatorState.pendingPatch,
      } as Action;
      rawActionRef.current = next;
      commitRawAction(next);
      if (!Object.hasOwn(coordinatorState.pendingPatch, "description"))
        descriptionRef.current = confirmed.description || "";
      if (!Object.hasOwn(coordinatorState.pendingPatch, "content_description"))
        contentDescriptionRef.current = confirmed.content_description || "";
    }
  }, [coordinatorState.confirmedAction, coordinatorState.pendingPatch]);

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

      if (data) coordinator.recordLocalChanges(data);
      // A draft retains edits even while its INSERT is in flight.
      if (!current.id && !forceCreate) {
        if (coordinator.getStatus() === "creating")
          return coordinator.scheduleUpdate();
        return null;
      }
      // Se for rascunho e forceCreate solicitado
      if (!current.id && forceCreate) {
        const finalTitle = (
          (data?.title as string) ||
          current.title ||
          ""
        ).trim();
        if (finalTitle.length < 2) return null;
        const partnersList =
          (data?.partners as string[]) || current.partners || [];
        if (partnersList.length === 0) return null;

        const payload = {
          ...current,
          ...data,
          title: finalTitle,
          partners: partnersList,
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
      ...(!current.id ? current : {}),
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
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [descriptionVersion, setDescriptionVersion] = useState(0);
  const currentPartners = useMemo(() => {
    return RawAction.partners
      .map((slug) => partners.find((partner) => partner.slug === slug))
      .filter((partner): partner is Partner => partner !== undefined);
  }, [RawAction.partners, partners]);
  const { isAIProcessing, aiProcessingRef, activeAIIntent, triggerAIAction } =
    useActionAI({
      action: RawAction,
      rawActionRef,
      descriptionRef,
      contentDescriptionRef,
      currentPartners,
      setRawAction,
      updateAction,
      setIsStrategyModalOpen,
      setDescriptionVersion,
    });
  const isPending =
    isMutationLoading ||
    isAIProcessing ||
    coordinatorState.status === "creating" ||
    coordinatorState.status === "saving";
  const [workFiles, setWorkFiles] = useState<string[]>(
    RawAction.work_files ?? [],
  );
  const [contentFiles, setContentFiles] = useState<string[]>(
    RawAction.content_files ?? [],
  );
  const handleDescriptionChange = useCallback((desc: string) => {
    descriptionRef.current = desc;
    coordinatorRef.current?.recordLocalChanges({ description: desc });
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
    [updateAction, setRawAction],
  );

  const prepareLeave = useCallback(async (): Promise<boolean> => {
    if (aiProcessingRef.current) {
      toast.info(
        "Aguarde a geração terminar antes de trocar ou fechar a ação.",
      );
      return false;
    }
    const coordinator = coordinatorRef.current;
    if (!coordinator) return true;
    const current = rawActionRef.current;
    if (!current.id && (current.title || "").trim().length < 2) {
      const hasText = Boolean(
        current.title?.trim() ||
        descriptionRef.current ||
        contentDescriptionRef.current,
      );
      return !hasText || window.confirm("Descartar este rascunho incompleto?");
    }
    return coordinator.safeClose({
      snapshot: !current.id ? current : undefined,
      title: current.title,
      description: descriptionRef.current,
      content_description: contentDescriptionRef.current,
    });
  }, [aiProcessingRef]);
  useEffect(() => {
    registerLeaveGuard?.(prepareLeave);
    return () => registerLeaveGuard?.(null);
  }, [registerLeaveGuard, prepareLeave]);
  const handleSafeClose = useCallback(async () => {
    if (await prepareLeave()) onClose();
  }, [onClose, prepareLeave]);

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
  }, [currentPartners, BaseAction.id, setRawAction]);
  useEffect(() => {
    async function handleKeyDown(event: KeyboardEvent) {
      if (conflictVersion) return;
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
  }, [handleSafeClose, conflictVersion]);
  return (
    <div
      className={cn(
        "fixed top-16 right-0 bottom-0 z-10 flex w-full max-w-full flex-col overflow-hidden border-l bg-background sm:max-w-2xl",
        view === "instagram"
          ? "lg:w-4xl lg:max-w-4xl"
          : "lg:w-2xl lg:max-w-2xl",
      )}
    >
      {RawAction.archived && (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b bg-error-background p-2 text-sm font-medium text-error">
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
          className="flex shrink-0 items-center justify-between gap-3 border-b bg-warning-background p-3 text-sm font-medium text-warning"
        >
          <div className="flex min-w-0 items-center gap-2">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span className="truncate">
              {coordinatorState.errorMessage ||
                "Esta ação foi modificada em outra sessão. Suas edições foram retidas localmente."}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="text-xs font-semibold underline hover:no-underline"
              disabled={isComparing}
              onClick={async () => {
                const id =
                  coordinatorRef.current?.getState().confirmedAction?.id;
                if (!id || isComparing) return;
                setIsComparing(true);
                try {
                  const { readActionClient } =
                    await import("~/lib/supabase.mutations");
                  setConflictVersion(await readActionClient(id));
                } catch {
                  toast.error(
                    "Não foi possível carregar a versão atual. Suas alterações continuam aqui.",
                  );
                } finally {
                  setIsComparing(false);
                }
              }}
              type="button"
            >
              Comparar e salvar
            </button>
          </div>
        </div>
      )}

      {coordinatorState.status === "error" && (
        <div
          data-testid="drawer-error-banner"
          className="flex shrink-0 items-center justify-between gap-3 border-b bg-error-background p-3 text-sm font-medium text-error"
        >
          <div className="flex min-w-0 items-center gap-2">
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span className="truncate">
              {coordinatorState.errorMessage || "Erro ao salvar alterações."}
            </span>
          </div>
          <button
            className="shrink-0 text-xs font-semibold underline hover:no-underline"
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
            className="flex cursor-pointer items-center justify-center border-b px-3 py-3 text-sm font-medium sm:p-5"
            onClick={handleSafeClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative flex h-full w-full max-w-full grow flex-col overflow-hidden">
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
                  coordinatorRef.current?.recordLocalChanges({
                    content_description: html,
                  });
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
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl lg:max-w-5xl"
        isOpen={conflictVersion !== null}
        isDismissable={!isResolvingConflict}
        showCloseButton={false}
        onOpenChange={(open) => {
          if (!open && !isResolvingConflict) setConflictVersion(null);
        }}
      >
        <PrismDialogHeader>
          <PrismDialogTitle>Comparar alterações</PrismDialogTitle>
          <PrismDialogDescription>
            Outra pessoa ou sessão modificou esta ação. Confira os campos
            abaixo. Ao confirmar, somente suas alterações pendentes serão salvas
            sobre a versão carregada.
          </PrismDialogDescription>
        </PrismDialogHeader>
        {conflictVersion && (
          <ConflictComparison
            latest={conflictVersion}
            pending={coordinatorState.pendingPatch}
          />
        )}
        <PrismDialogFooter>
          <PrismButton
            autoFocus
            isDisabled={isResolvingConflict}
            variant="outline"
            onPress={() => setConflictVersion(null)}
          >
            Cancelar
          </PrismButton>
          <PrismButton
            isDisabled={isResolvingConflict}
            onPress={async () => {
              const coordinator = coordinatorRef.current;
              if (!coordinator || !conflictVersion || isResolvingConflict)
                return;
              setIsResolvingConflict(true);
              try {
                coordinator.rebase(conflictVersion);
                await coordinator.saveNow();
                setConflictVersion(null);
              } finally {
                setIsResolvingConflict(false);
              }
            }}
          >
            {isResolvingConflict ? "Salvando…" : "Salvar minhas alterações"}
          </PrismButton>
        </PrismDialogFooter>
      </PrismDialog>

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
                <div className="flex w-full items-center gap-3 px-2">
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
                  <PrismAccordionTrigger className="min-w-0 flex-1 overflow-hidden px-2">
                    <div
                      className="min-w-0 flex-1 truncate text-lg font-normal tracking-tight"
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
