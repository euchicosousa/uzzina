import type { Action, Partner } from "~/types";
import {
  ArchiveIcon,
  AlertTriangleIcon,
  HeartIcon,
  MessageSquareIcon,
  XIcon,
} from "lucide-react";
import { Icons } from "~/components/uzzina/UIcons";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getQuerySessionGeneration } from "~/lib/query-client";
import {
  ActionUnavailableError,
  readActionClient,
} from "~/lib/supabase.mutations";
import { ActionFormFooter } from "./ActionFormFooter";
import { ActionDrawerFocusScope } from "./ActionDrawerFocusScope";
import { useActionAI } from "./useActionAI";
import { useCompactPanel } from "./useCompactPanel";
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
export type ActionDrawerView = "essential" | "instagram" | "observations";
export function ActionFormDrawer({
  initialAction,
  onClose,
  partnerFilters = DEFAULT_PARTNER_FILTERS,
  registerLeaveGuard,
  view,
  onViewChange: setView,
  isActive,
  onActionChange,
}: {
  initialAction: Action;
  onClose: () => Promise<void>;
  partnerFilters?: string[];
  registerLeaveGuard?: (guard: (() => Promise<boolean>) | null) => void;
  view: ActionDrawerView;
  onViewChange: (view: ActionDrawerView) => void;
  isActive: boolean;
  onActionChange: (action: Action) => void;
}) {
  // Server snapshot shown in the comparison dialog; never the form's base by itself.
  const [comparison, setComparison] = useState<Action | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const { partners: routePartners, cloudName, uploadPreset } = useAppContext();
  const partners = routePartners ?? DEFAULT_PARTNERS;
  const queryClient = useQueryClient();
  const {
    handleAction,
    applyCanonicalAction,
    isLoading: isMutationLoading,
  } = useActionMutations();
  const applyCanonicalActionRef = useRef(applyCanonicalAction);
  applyCanonicalActionRef.current = applyCanonicalAction;
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const [RawAction, commitRawAction] = useState<Action>(() => {
    if (initialAction.id) return initialAction;
    const now = toDbTimestamp();
    let initialPartners = initialAction.partners || [];
    let initialResponsibles = initialAction.responsibles || [];
    let initialColor = initialAction.color;
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
      ...initialAction,
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

  useEffect(() => {
    onActionChange(RawAction);
  }, [RawAction, onActionChange]);

  // Saved title reference — initialized from initialAction.title, updated only on confirmed save

  const draftId = useId();
  const coordinatorKey = initialAction.id || draftId;
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
        status: initialAction.id ? "saved" : "draft",
        errorMessage: null,
        savedTitle: initialAction.title || "",
        confirmedAction: initialAction,
        pendingPatch: {},
        isDirty: false,
        remoteVersion: null,
        unavailable: false,
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
  const descriptionRef = useRef(initialAction.description || "");
  const contentDescriptionRef = useRef(initialAction.content_description || "");

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

    const saved = await coordinator.saveNow({
      ...(!current.id ? current : {}),
      title: titleTrimmed,
      description: descriptionRef.current,
      content_description: contentDescriptionRef.current,
    });
    // Writes wait for an explicit decision about a known newer version.
    const remote = coordinator.getState().remoteVersion;
    if (!saved && remote && mountedRef.current) setComparison(remote);
    return saved;
  }, []);

  // Ref always points to the latest handleSave to avoid stale closures in event listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  // Selecting a strategy also adopts its headline as the action title.
  const selectStrategy = (index: number, isSelected: boolean) => {
    const strategies = parseStrategies(rawActionRef.current.strategies);
    const updated = strategies.map((s, idx) => ({
      ...s,
      selected: idx === index ? isSelected : false,
    }));
    const headline = strategies[index]?.headline.trim() ?? "";
    const title = isSelected && headline.length >= 2 ? headline : null;
    setRawAction((prev) => ({
      ...prev,
      strategies: updated,
      ...(title ? { title } : {}),
    }));
    updateAction({
      strategies: updated,
      ...(title ? { title } : {}),
    });
  };
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
  // Editors read their content only when mounted; a new key reloads them.
  const [contentVersion, setContentVersion] = useState(0);
  // Applies a base the user explicitly chose to the form, including state kept
  // outside RawAction (editors and media), except fields still being changed.
  // RawAction is committed here so remounted editors read the new content.
  const syncFieldsFromBase = useCallback(
    (base: Action, pending: Record<string, unknown>) => {
      const next = { ...rawActionRef.current, ...base, ...pending } as Action;
      rawActionRef.current = next;
      commitRawAction(next);
      const description = base.description || "";
      if (
        !Object.hasOwn(pending, "description") &&
        descriptionRef.current !== description
      ) {
        descriptionRef.current = description;
        setDescriptionVersion((version) => version + 1);
      }
      const contentDescription = base.content_description || "";
      if (
        !Object.hasOwn(pending, "content_description") &&
        contentDescriptionRef.current !== contentDescription
      ) {
        contentDescriptionRef.current = contentDescription;
        setContentVersion((version) => version + 1);
      }
      if (!Object.hasOwn(pending, "work_files"))
        setWorkFiles(base.work_files ?? []);
      if (!Object.hasOwn(pending, "content_files"))
        setContentFiles(base.content_files ?? []);
    },
    [],
  );

  // One authorized read per opening of an existing action. The form stays
  // editable meanwhile; a newer row is only offered for comparison.
  const isCheckingRef = useRef(false);
  const checkRemoteVersionRef = useRef<() => Promise<void>>(async () => {});
  const checkRemoteVersion = useCallback(async () => {
    const coordinator = coordinatorRef.current;
    const id = coordinator?.getState().confirmedAction?.id;
    if (!coordinator || !id || !mountedRef.current || isCheckingRef.current)
      return;
    isCheckingRef.current = true;
    const generation = coordinator.getGeneration();
    const session = getQuerySessionGeneration(queryClient);
    const isCurrent = () =>
      mountedRef.current &&
      generation === coordinator.getGeneration() &&
      session === getQuerySessionGeneration(queryClient);
    try {
      const remote = await readActionClient(id);
      if (!isCurrent()) return;
      coordinator.setUnavailable(false);
      const result = await coordinator.receiveRemoteVersion(remote, generation);
      if (result !== "newer" || !isCurrent()) return;
      // Lists may show the canonical row; the form keeps its base until the user decides.
      applyCanonicalActionRef.current(remote);
      setComparison((current) => current ?? remote);
    } catch (error) {
      if (!isCurrent()) return;
      if (error instanceof ActionUnavailableError)
        coordinator.setUnavailable(true);
      else
        toast.error(
          "Não foi possível verificar se esta ação mudou em outra sessão. Você pode continuar editando; o salvamento confere a versão.",
          {
            action: {
              label: "Tentar novamente",
              onClick: () => void checkRemoteVersionRef.current(),
            },
          },
        );
    } finally {
      isCheckingRef.current = false;
    }
  }, [queryClient]);
  checkRemoteVersionRef.current = checkRemoteVersion;
  // Drafts and refocusing an already open action do not start a new check.
  const checkedOpeningRef = useRef(false);
  useEffect(() => {
    if (!initialAction.id || checkedOpeningRef.current) return;
    checkedOpeningRef.current = true;
    void checkRemoteVersion();
  }, [initialAction.id, checkRemoteVersion]);

  const acceptServerVersion = useCallback(() => {
    const coordinator = coordinatorRef.current;
    const remote = comparison;
    if (!coordinator || !remote || !coordinator.adoptRemoteVersion(remote))
      return;
    syncFieldsFromBase(remote, {});
    // A version found after the reviewed one is offered next.
    setComparison(coordinator.getState().remoteVersion);
    setFocusRestoreRequest((request) => request + 1);
  }, [comparison, syncFieldsFromBase]);

  const keepLocalChanges = useCallback(async () => {
    const coordinator = coordinatorRef.current;
    const remote = comparison;
    if (!coordinator || !remote || isResolvingConflict) return;
    setIsResolvingConflict(true);
    try {
      // The reviewed version becomes the expected one; only real local changes are sent.
      if (!coordinator.rebase(remote)) return;
      syncFieldsFromBase(remote, coordinator.getState().pendingPatch);
      const saved = await coordinator.saveNow();
      // Writes stay paused while a newer version than the reviewed one is known.
      if (mountedRef.current)
        setComparison(saved ? null : coordinator.getState().remoteVersion);
    } finally {
      if (mountedRef.current) setIsResolvingConflict(false);
    }
  }, [comparison, isResolvingConflict, syncFieldsFromBase]);

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
    const canLeave = await coordinator.safeClose({
      snapshot: !current.id ? current : undefined,
      title: current.title,
      description: descriptionRef.current,
      content_description: contentDescriptionRef.current,
    });
    if (canLeave) return true;
    const { remoteVersion, unavailable } = coordinator.getState();
    // Nothing can be saved to an action this user can no longer read; leaving
    // requires an explicit discard, and the edits stay visible until then.
    if (unavailable)
      return window.confirm(
        "Esta ação não está disponível ou você não tem acesso a ela. Descartar as alterações não salvas e fechar?",
      );
    if (remoteVersion && mountedRef.current) setComparison(remoteVersion);
    return false;
  }, [aiProcessingRef]);
  useEffect(() => {
    registerLeaveGuard?.(prepareLeave);
    return () => registerLeaveGuard?.(null);
  }, [registerLeaveGuard, prepareLeave]);
  const handleSafeClose = onClose;
  const contentRef = useRef<HTMLDivElement>(null);
  const compact = useCompactPanel(contentRef);
  // Accepting a version remounts the editors, which drops their focus; return
  // it to the remounted editor or the form instead of the page.
  const lastFocusRef = useRef<Element | null>(null);
  const [focusRestoreRequest, setFocusRestoreRequest] = useState(0);
  useEffect(() => {
    if (focusRestoreRequest === 0) return;
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      const content = contentRef.current;
      if (
        !content ||
        (active && active !== document.body && active.isConnected)
      )
        return;
      const last = lastFocusRef.current;
      const editor =
        last instanceof HTMLElement && last.matches(".tiptap")
          ? content.querySelector<HTMLElement>(
              '.tiptap[contenteditable="true"]',
            )
          : null;
      const target =
        editor ??
        content
          .closest("[data-drawer-focus-scope]")
          ?.querySelector<HTMLElement>(
            '[data-drawer-focus="title"] textarea, [data-drawer-navigation] button[aria-selected="true"]',
          );
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusRestoreRequest]);
  // Lives here so switching tabs keeps the compact details open.
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Guard: only update color and initial fallback responsibles on fresh draft
  // Preserve any explicit responsibles already set by creator or user
  const prevPrimaryPartnerRef = useRef(currentPartners[0]?.slug);
  useEffect(() => {
    const currentPrimarySlug = currentPartners[0]?.slug;
    const isNewDraft = !rawActionRef.current.id && !initialAction.id;
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
  }, [currentPartners, initialAction.id, setRawAction]);
  return (
    <ActionDrawerFocusScope
      enabled={isActive && view === "essential"}
      onKeyDown={async (event) => {
        if (!isActive || comparison || event.defaultPrevented) return;
        if (event.key.toLowerCase() === "enter" && event.metaKey) {
          event.preventDefault();
          event.stopPropagation();
          const success = await handleSaveRef.current();
          if (success && !event.shiftKey) await handleSafeClose();
        }
      }}
      className="flex h-full w-full max-w-full flex-col overflow-hidden"
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
                  const latest = await readActionClient(id);
                  coordinatorRef.current?.setUnavailable(false);
                  setComparison(latest);
                } catch (error) {
                  if (error instanceof ActionUnavailableError)
                    coordinatorRef.current?.setUnavailable(true);
                  else
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

      {coordinatorState.remoteVersion &&
        coordinatorState.status !== "conflict" && (
          <div
            data-testid="drawer-remote-version-banner"
            className="flex shrink-0 items-center justify-between gap-3 border-b bg-warning-background p-3 text-sm font-medium text-warning"
          >
            <div className="flex min-w-0 items-center gap-2">
              <AlertTriangleIcon className="size-4 shrink-0" />
              <span className="truncate">
                {coordinatorState.isDirty
                  ? "Há uma versão mais recente. Suas alterações aguardam a comparação."
                  : "Há uma versão mais recente desta ação."}
              </span>
            </div>
            <button
              className="shrink-0 text-xs font-semibold underline hover:no-underline"
              onClick={() => setComparison(coordinatorState.remoteVersion)}
              type="button"
            >
              Comparar
            </button>
          </div>
        )}

      {coordinatorState.unavailable && (
        <p
          data-testid="drawer-unavailable-banner"
          className="shrink-0 border-b bg-error-background p-3 text-sm font-medium text-error"
          role="alert"
        >
          Esta ação não está disponível ou você não tem acesso a ela.
        </p>
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
        data-drawer-navigation
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
        <div className="flex shrink-0">
          <button
            aria-label="Fechar"
            className="flex cursor-pointer items-center justify-center border-b px-3 py-3 text-sm font-medium outline-none focus-visible:bg-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:p-5"
            onClick={handleSafeClose}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="relative flex h-full w-full max-w-full grow flex-col overflow-hidden"
        data-action-layout-width={compact ? "compact" : "regular"}
        onFocusCapture={(event) => {
          lastFocusRef.current = event.target;
        }}
        ref={contentRef}
      >
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
                autoFocus={isActive}
                cloudName={cloudName}
                compact={compact}
                detailsExpanded={detailsExpanded}
                onDetailsExpandedChange={setDetailsExpanded}
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
                compact={compact}
                contentDescription={contentDescriptionRef.current}
                contentVersion={contentVersion}
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
          compact={compact}
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
        className="sm:max-w-3xl lg:max-w-5xl"
        isOpen={isActive && comparison !== null && !isStrategyModalOpen}
        isDismissable={!isResolvingConflict}
        showCloseButton={false}
        onOpenChange={(open) => {
          if (!open && !isResolvingConflict) setComparison(null);
        }}
      >
        <PrismDialogHeader>
          <PrismDialogTitle>Comparar alterações</PrismDialogTitle>
          <PrismDialogDescription>
            {coordinatorState.isDirty
              ? "Outra pessoa ou sessão modificou esta ação. Confira os campos abaixo. Ao salvar, somente os campos que você alterou serão gravados sobre a versão atual."
              : "Outra pessoa ou sessão modificou esta ação depois que ela foi aberta aqui. Você não tem alterações pendentes; use a versão atual para continuar a partir dela."}
          </PrismDialogDescription>
        </PrismDialogHeader>
        {comparison && (
          <ConflictComparison
            base={coordinatorState.confirmedAction}
            latest={comparison}
            local={RawAction as unknown as Record<string, unknown>}
            pending={coordinatorState.pendingPatch}
          />
        )}
        <PrismDialogFooter>
          <PrismButton
            autoFocus
            isDisabled={isResolvingConflict}
            variant="outline"
            onPress={() => setComparison(null)}
          >
            Cancelar
          </PrismButton>
          <PrismButton
            isDisabled={isResolvingConflict || isPending}
            variant={coordinatorState.isDirty ? "destructive" : "default"}
            onPress={acceptServerVersion}
          >
            {coordinatorState.isDirty
              ? "Descartar minhas alterações e usar a atual"
              : "Usar versão atual"}
          </PrismButton>
          {coordinatorState.isDirty && (
            <PrismButton
              isDisabled={isResolvingConflict || isPending}
              onPress={keepLocalChanges}
            >
              {isResolvingConflict ? "Salvando…" : "Salvar minhas alterações"}
            </PrismButton>
          )}
        </PrismDialogFooter>
      </PrismDialog>

      <PrismDialog
        className="flex flex-col sm:max-w-2xl"
        isOpen={isActive && isStrategyModalOpen}
        onOpenChange={setIsStrategyModalOpen}
      >
        <PrismDialogHeader className="shrink-0 px-10 pt-8">
          <PrismDialogTitle className="text-2xl">
            5 Estratégias Sugeridas
          </PrismDialogTitle>
          <PrismDialogDescription>
            Escolha uma das 5 estratégias criativas abaixo para gerar o conteúdo
            da ação.
          </PrismDialogDescription>
        </PrismDialogHeader>
        <div className="max-h-[70vh] min-h-0 overflow-y-auto px-5 pb-6">
          <PrismAccordion className={"border-none"}>
            {parseStrategies(RawAction.strategies).map((strat, i) => (
              <PrismAccordionItem
                key={strat.headline || i}
                defaultExpanded={i === 0}
                id={String(i)}
              >
                <div className="flex w-full items-start gap-3 px-2">
                  <PrismCheckbox
                    aria-label="Selecionar estratégia"
                    className="mt-5 shrink-0"
                    isSelected={!!strat.selected}
                    onChange={(isSelected) => selectStrategy(i, isSelected)}
                  />
                  <PrismAccordionTrigger className="min-w-0 flex-1 px-2">
                    <div
                      className="min-w-0 flex-1 truncate text-lg font-normal tracking-tight group-aria-expanded/accordion-trigger:whitespace-normal"
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
                        selectStrategy(i, true);
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
    </ActionDrawerFocusScope>
  );
}
const tabClass = (active: boolean) =>
  cn(
    "flex flex-1 min-w-0 cursor-pointer items-center justify-center gap-1.5 border-t-2 border-t-transparent border-b px-2 py-3 sm:p-4 text-xs sm:text-sm font-medium outline-none focus-visible:border-t-primary",
    active ? "bg-popover border-b-transparent" : "bg-muted border-b-border",
  );
