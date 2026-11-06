import { UAIModelSelect } from "~/components/uzzina/UAIModelSelect";
import {
  actionAIModels,
  isActionAIModelId,
  lunaModelId,
} from "~/lib/action-ai-models";
import { getUserPreferences } from "~/lib/preferences";
import type { Action, Partner, StrategyItem } from "~/types";
import {
  ArchiveIcon,
  AlertTriangleIcon,
  HeartIcon,
  MessageSquareIcon,
  SmartphoneIcon,
  XIcon,
} from "lucide-react";
import { UIcons } from "~/components/uzzina/UIcons";
import { ULoader } from "~/components/uzzina/ULoader";
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
import { useDurableStrategies } from "./useDurableStrategies";
import { useCompactPanel } from "./useCompactPanel";
import { useLandscapeSpaceAdvisory } from "./useLandscapeSpaceAdvisory";
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
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
  PrismAccordion,
  PrismAccordionContent,
  PrismAccordionItem,
  PrismAccordionTrigger,
  PrismBadge,
  PrismButton,
  PrismButtonGroup,
  PrismCheckbox,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogFooter,
  PrismDialogTitle,
} from "~/components/prism";
import { tabVariants } from "~/components/prism/tabs";
const DEFAULT_PARTNER_FILTERS: string[] = [];
const DEFAULT_PARTNERS: Partner[] = [];
import { useAppContext } from "~/contexts/AppContext";
import { UAIProgressBar } from "~/components/uzzina/UAIProgressBar";
export type ActionDrawerView = "essential" | "instagram" | "observations";
export type TextDraftField = "title" | "instagram_caption";
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
  const {
    partners: routePartners,
    cloudName,
    uploadPreset,
    person,
    queueAIPreference,
  } = useAppContext();
  const preferences = getUserPreferences(person);
  const [strategyModel, setStrategyModel] = useState(
    preferences.defaultStrategyModel ?? lunaModelId,
  );
  const [captionModel, setCaptionModel] = useState(
    preferences.defaultCaptionModel ?? lunaModelId,
  );
  const [contentModel, setContentModel] = useState(
    preferences.defaultContentModel ?? lunaModelId,
  );
  const changeStrategyModel = (id: string) => {
    if (!isActionAIModelId(id)) return;
    setStrategyModel(id);
    queueAIPreference?.({ defaultStrategyModel: id });
  };
  const changeContentModel = (id: string) => {
    if (!isActionAIModelId(id)) return;
    setContentModel(id);
    queueAIPreference?.({ defaultContentModel: id });
  };
  const changeCaptionModel = (id: string) => {
    if (!isActionAIModelId(id)) return;
    setCaptionModel(id);
    queueAIPreference?.({ defaultCaptionModel: id });
  };
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

  // Plain text fields keep what is typed here until blur, so typing renders only
  // the field. Save and leave flush these drafts before reading the action.
  const textDraftsRef = useRef<Partial<Record<TextDraftField, string>>>({});
  const setTextDraft = useCallback((field: TextDraftField, value: string) => {
    textDraftsRef.current[field] = value;
  }, []);
  const commitTextDraft = useCallback(
    (field: TextDraftField, value: string) => {
      delete textDraftsRef.current[field];
      if ((rawActionRef.current[field] ?? "") === value) return;
      setRawAction((prev) => ({ ...prev, [field]: value }));
    },
    [setRawAction],
  );
  const flushTextDrafts = useCallback(() => {
    const drafts = textDraftsRef.current;
    if (Object.keys(drafts).length === 0) return;
    textDraftsRef.current = {};
    setRawAction((prev) => ({ ...prev, ...drafts }));
  }, [setRawAction]);

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
    flushTextDrafts();
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
  }, [flushTextDrafts]);

  // Ref always points to the latest handleSave to avoid stale closures in event listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [savingSelectionIndex, setSavingSelectionIndex] = useState<
    number | null
  >(null);
  const [strategySelectionError, setStrategySelectionError] = useState<
    string | null
  >(null);

  // Selecting a strategy also adopts its headline as the action title.
  // The selection is strictly exclusive (only one strategy can be selected: true).
  const selectStrategy = async (index: number, isSelected: boolean) => {
    if (strategyControlsBlocked) return false;
    setSavingSelectionIndex(index);
    setStrategySelectionError(null);
    try {
      const baseStrategies =
        parseStrategies(rawActionRef.current.strategies).length > 0
          ? parseStrategies(rawActionRef.current.strategies)
          : strategyOptions;
      const updated = baseStrategies.map((s, idx) => ({
        ...s,
        selected: idx === index ? isSelected : false,
      }));
      const headline = baseStrategies[index]?.headline.trim() ?? "";
      const title = isSelected && headline.length >= 2 ? headline : null;
      setRawAction((prev) => ({
        ...prev,
        strategies: updated,
        ...(title ? { title } : {}),
      }));
      const saved = await updateAction({
        strategies: updated,
        ...(title ? { title } : {}),
      });
      if (!saved) {
        if (coordinatorRef.current?.getState().status !== "conflict") {
          setStrategySelectionError(
            coordinatorRef.current?.getState().errorMessage ||
              "Não foi possível salvar a seleção.",
          );
        }
        return false;
      }
      return true;
    } catch (err) {
      setStrategySelectionError(
        err instanceof Error ? err.message : "Erro ao salvar a seleção.",
      );
      return false;
    } finally {
      setSavingSelectionIndex(null);
    }
  };
  const [contentVersion, setContentVersion] = useState(0);
  const [descriptionVersion, setDescriptionVersion] = useState(0);
  const currentPartners = useMemo(() => {
    return RawAction.partners
      .map((slug) => partners.find((partner) => partner.slug === slug))
      .filter((partner): partner is Partner => partner !== undefined);
  }, [RawAction.partners, partners]);
  const durableStrategies = useDurableStrategies({
    actionId: RawAction.id,
    isActive,
    queryClient,
    prepareAction: async () => {
      if (!(await handleSave())) {
        if (coordinatorRef.current?.getState().remoteVersion)
          setIsStrategyModalOpen(false);
        return null;
      }
      const state = coordinatorRef.current?.getState();
      return state &&
        !state.isDirty &&
        !state.remoteVersion &&
        !state.unavailable
        ? state.confirmedAction
        : null;
    },
    onComplete: () => {
      void queryClient.invalidateQueries({ queryKey: ["actions"] });
    },
  });
  const {
    isAIProcessing,
    aiProcessingRef,
    activeAIIntent,
    triggerAIAction,
    strategyGeneration,
  } = useActionAI({
    action: RawAction,
    queryClient,
    rawActionRef,
    descriptionRef,
    contentDescriptionRef,
    currentPartners,
    setRawAction,
    updateAction,
    setIsStrategyModalOpen,
    setDescriptionVersion,
    setContentVersion,
    startDurableStrategy: durableStrategies.start,
  });
  const strategiesPending = Object.hasOwn(
    coordinatorState.pendingPatch,
    "strategies",
  );
  const isSavingSelection =
    savingSelectionIndex !== null ||
    (strategiesPending &&
      (coordinatorState.status === "saving" ||
        coordinatorState.status === "creating"));
  const isPending =
    isMutationLoading ||
    isAIProcessing ||
    coordinatorState.status === "creating" ||
    coordinatorState.status === "saving";
  const strategyStatus =
    strategyGeneration.phase === "generating"
      ? "generating"
      : !durableStrategies.reconciled &&
          strategyGeneration.phase === "generation-error"
        ? "error"
        : durableStrategies.pending
          ? durableStrategies.operation?.state === "generated"
            ? "saving"
            : "generating"
          : isSavingSelection
            ? "saving-selection"
            : coordinatorState.status === "conflict"
              ? "conflict"
              : coordinatorState.status === "error" || strategySelectionError
                ? "error"
                : durableStrategies.operation
                  ? durableStrategies.operation.state === "succeeded"
                    ? "saved"
                    : durableStrategies.operation.result
                      ? "unsaved"
                      : "error"
                  : strategiesPending
                    ? coordinatorState.status === "saving" ||
                      coordinatorState.status === "creating"
                      ? "saving-selection"
                      : "unsaved"
                    : strategyGeneration.phase === "generation-error"
                      ? "error"
                      : null;
  const canonicalStrategies = parseStrategies(RawAction.strategies);
  const generatedOptions = durableStrategies.operation?.result;
  const isDurablePreview =
    !!generatedOptions &&
    (canonicalStrategies.length !== generatedOptions.length ||
      generatedOptions.some((strategy, index) =>
        (["headline", "angulo", "racional", "direcionamento"] as const).some(
          (field) => strategy[field] !== canonicalStrategies[index]?.[field],
        ),
      ));
  const strategyControlsBlocked =
    isSavingSelection ||
    durableStrategies.pending ||
    coordinatorState.status === "conflict" ||
    !!coordinatorState.remoteVersion ||
    isDurablePreview ||
    strategyStatus === "generating" ||
    strategyStatus === "saving";
  const strategyOptions: StrategyItem[] =
    isDurablePreview && generatedOptions
      ? generatedOptions
      : canonicalStrategies;
  const hasStrategyActivity = strategyStatus !== null;
  const isGenerating =
    strategyStatus === "generating" || strategyStatus === "saving";
  const hasPriorStrategies = canonicalStrategies.length > 0;
  const isInitialGenerating = isGenerating && !hasPriorStrategies;
  const isRecreating = isGenerating && hasPriorStrategies;

  const prevGeneratingRef = useRef(false);
  useEffect(() => {
    if (
      prevGeneratingRef.current &&
      !isGenerating &&
      strategyStatus === "saved"
    ) {
      toast.success(
        hasPriorStrategies
          ? "Estratégias recriadas com sucesso!"
          : "Estratégias criadas com sucesso!",
      );
    }
    prevGeneratingRef.current = isGenerating;
  }, [isGenerating, strategyStatus, hasPriorStrategies]);

  const [isRetryingStrategy, setIsRetryingStrategy] = useState(false);
  const retryStrategySave = async () => {
    if (isPending || isComparing || isRetryingStrategy) return;
    setIsRetryingStrategy(true);
    try {
      if (durableStrategies.operation?.result) {
        const changed =
          durableStrategies.operation.state === "conflict" ||
          durableStrategies.needsReview;
        if (
          changed &&
          !window.confirm(
            "Aplicar estas cinco estratégias preservadas à versão atual? Elas foram geradas antes das alterações e substituirão as estratégias atuais.",
          )
        )
          return;
        await durableStrategies.retry(changed);
        return;
      }
      if (
        coordinatorState.status === "conflict" ||
        coordinatorState.remoteVersion
      ) {
        await compareLatestForSave();
        return;
      }
      await handleSave();
      const remote = coordinatorRef.current?.getState().remoteVersion;
      if (remote && mountedRef.current) {
        setIsStrategyModalOpen(false);
        setComparison(remote);
      }
    } finally {
      if (mountedRef.current) setIsRetryingStrategy(false);
    }
  };
  const [workFiles, setWorkFiles] = useState<string[]>(
    RawAction.work_files ?? [],
  );
  const [contentFiles, setContentFiles] = useState<string[]>(
    RawAction.content_files ?? [],
  );
  // The editor reports to the coordinator on blur; save and leave read the ref.
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
    [updateAction, setRawAction],
  );
  // Editors read their content only when mounted; a new key reloads them.
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
  const [isSyncingStrategies, setIsSyncingStrategies] = useState(false);
  const checkRemoteVersion = useCallback(
    async (expectedStrategies?: StrategyItem[]) => {
      const coordinator = coordinatorRef.current;
      const id = coordinator?.getState().confirmedAction?.id;
      if (
        !coordinator ||
        !id ||
        !mountedRef.current ||
        (!expectedStrategies && isCheckingRef.current)
      )
        return;
      if (expectedStrategies) setIsSyncingStrategies(true);
      else isCheckingRef.current = true;
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
        const savedStrategies =
          expectedStrategies && parseStrategies(remote.strategies);
        if (
          expectedStrategies &&
          savedStrategies &&
          savedStrategies.length === expectedStrategies.length &&
          expectedStrategies.every((strategy, index) =>
            (
              ["headline", "angulo", "racional", "direcionamento"] as const
            ).every(
              (field) => strategy[field] === savedStrategies[index]?.[field],
            ),
          ) &&
          coordinator.adoptGeneratedStrategies(remote)
        ) {
          setRawAction((current) => ({
            ...current,
            strategies: remote.strategies,
            updated_at: remote.updated_at,
          }));
          applyCanonicalActionRef.current(remote);
          return;
        }
        const result = await coordinator.receiveRemoteVersion(
          remote,
          generation,
        );
        if (result !== "newer" || !isCurrent()) return;
        // Lists may show the canonical row; the form keeps its base until the user decides.
        applyCanonicalActionRef.current(remote);
        // A clean form has nothing to compare: adopt the server version silently.
        const base = coordinator.getState().confirmedAction;
        const normalize = (value: string | null | undefined) => value ?? "";
        const isClean =
          !!base &&
          !coordinator.getState().isDirty &&
          (Object.keys(textDraftsRef.current) as TextDraftField[]).every(
            (field) =>
              normalize(textDraftsRef.current[field]) ===
              normalize(base[field]),
          ) &&
          normalize(descriptionRef.current) === normalize(base.description) &&
          normalize(contentDescriptionRef.current) ===
            normalize(base.content_description);
        if (isClean && coordinator.adoptRemoteVersion(remote)) {
          syncFieldsFromBase(remote, {});
          setFocusRestoreRequest((request) => request + 1);
          return;
        }
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
        if (expectedStrategies) {
          if (isCurrent()) setIsSyncingStrategies(false);
        } else isCheckingRef.current = false;
      }
    },
    [queryClient, syncFieldsFromBase],
  );
  checkRemoteVersionRef.current = checkRemoteVersion;
  const completedStrategies =
    durableStrategies.operation?.state === "succeeded"
      ? generatedOptions
      : null;
  useEffect(() => {
    if (
      isActive &&
      isStrategyModalOpen &&
      isDurablePreview &&
      completedStrategies
    )
      void checkRemoteVersion(completedStrategies);
  }, [
    isActive,
    isStrategyModalOpen,
    isDurablePreview,
    completedStrategies,
    checkRemoteVersion,
  ]);
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

  const compareLatestForSave = async () => {
    const coordinator = coordinatorRef.current;
    const id = coordinator?.getState().confirmedAction?.id;
    if (!coordinator || !id || isComparing) return;
    const generation = coordinator.getGeneration();
    const session = getQuerySessionGeneration(queryClient);
    const isCurrent = () =>
      mountedRef.current &&
      generation === coordinator.getGeneration() &&
      session === getQuerySessionGeneration(queryClient);
    setIsComparing(true);
    try {
      const latest = await readActionClient(id);
      if (!isCurrent()) return;
      coordinator.setUnavailable(false);
      setIsStrategyModalOpen(false);
      setComparison(latest);
    } catch (error) {
      if (!isCurrent()) return;
      if (error instanceof ActionUnavailableError)
        coordinator.setUnavailable(true);
      else
        toast.error(
          "Não foi possível carregar a versão atual. Suas alterações continuam aqui.",
        );
    } finally {
      if (isCurrent()) setIsComparing(false);
    }
  };
  const prepareLeave = useCallback(async (): Promise<boolean> => {
    if (aiProcessingRef.current) {
      toast.info(
        "Aguarde a geração terminar antes de trocar ou fechar a ação.",
      );
      return false;
    }
    const coordinator = coordinatorRef.current;
    if (!coordinator) return true;
    flushTextDrafts();
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
  }, [aiProcessingRef, flushTextDrafts]);
  useEffect(() => {
    registerLeaveGuard?.(prepareLeave);
    return () => registerLeaveGuard?.(null);
  }, [registerLeaveGuard, prepareLeave]);
  const handleSafeClose = onClose;
  const contentRef = useRef<HTMLDivElement>(null);
  const compact = useCompactPanel(contentRef);
  const { lowSpace, reportEssentialHeight } =
    useLandscapeSpaceAdvisory(contentRef);
  // Only the visible form blocks; with two forms mounted just one overlay shows.
  const blocked = lowSpace && isActive;
  useEffect(() => {
    if (!blocked) return;
    // Close the on-screen keyboard; the content stays mounted but inert.
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      contentRef.current?.closest("[data-drawer-focus-scope]")?.contains(active)
    )
      active.blur();
  }, [blocked]);
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
            '[data-drawer-focus="title"] textarea, [data-drawer-navigation] [role="tab"][aria-selected="true"]',
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
      className="relative flex h-full w-full max-w-full flex-col overflow-hidden"
    >
      {/* Layout-neutral wrapper so the whole form can be made inert. */}
      <div className="contents" inert={blocked}>
        {RawAction.archived && (
          <div className="flex shrink-0 items-center justify-center gap-2 border-b bg-error-background p-2 text-sm font-medium text-error">
            <ArchiveIcon className="size-4" />
            Esta ação está arquivada.
            <PrismButton
              className="ml-2"
              onPress={() => {
                setRawAction((prev) => ({
                  ...prev,
                  archived: false,
                }));
                updateAction({
                  archived: false,
                });
              }}
              size="xs"
              variant="link"
            >
              Desarquivar
            </PrismButton>
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
              <PrismButton
                isDisabled={isComparing}
                onPress={compareLatestForSave}
                size="xs"
                variant="link"
              >
                Comparar e salvar
              </PrismButton>
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
              <PrismButton
                className="shrink-0"
                onPress={() => setComparison(coordinatorState.remoteVersion)}
                size="xs"
                variant="link"
              >
                Comparar
              </PrismButton>
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
            <PrismButton
              className="shrink-0"
              onPress={() => {
                handleSave();
              }}
              size="xs"
              variant="link"
            >
              Tentar novamente
            </PrismButton>
          </div>
        )}

        <PrismTabs
          selectedKey={view}
          keyboardActivation="manual"
          onSelectionChange={(key) => {
            if (
              key === "essential" ||
              key === "instagram" ||
              key === "observations"
            )
              setView(key);
          }}
          className="min-h-0 flex-1"
        >
          {/* Tabs */}
          <div
            className="flex w-full shrink-0"
            data-drawer-navigation
            onKeyDownCapture={(event) => {
              // These view tabs keep the drawer's existing full Tab sequence;
              // React Aria still handles arrows and activation within the list.
              if (event.key === "Tab") event.stopPropagation();
            }}
          >
            <PrismTabList
              aria-label="Seções da ação"
              className="h-16 min-w-0 flex-1"
            >
              <PrismTab
                id="essential"
                tabIndex={0}
                className="px-2 py-3 text-xs sm:p-4 sm:text-sm"
              >
                <span className="truncate">ESSENCIAL</span>
                <HeartIcon className="size-4 shrink-0" />
              </PrismTab>
              {isSocialMediaContent(RawAction.category) && (
                <PrismTab
                  id="instagram"
                  tabIndex={0}
                  className="px-2 py-3 text-xs sm:p-4 sm:text-sm"
                >
                  <span className="truncate">INSTAGRAM</span>
                  <UIcons className="size-4 shrink-0" slug="instagram" />
                </PrismTab>
              )}
              <PrismTab
                id="observations"
                tabIndex={0}
                className="px-2 py-3 text-xs sm:p-4 sm:text-sm"
              >
                <span className="truncate">OBSERVAÇÕES</span>
                <MessageSquareIcon className="size-4 shrink-0" />
              </PrismTab>
            </PrismTabList>
            <PrismButton
              aria-label="Fechar"
              className={cn(tabVariants(), "size-16 flex-none px-0")}
              onPress={handleSafeClose}
              variant="unstyled"
            >
              <XIcon className="size-4" />
            </PrismButton>
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
                <PrismTabPanel
                  id="essential"
                  className={cn(
                    view !== "essential" && "hidden",
                    "w-full max-w-full",
                    "h-full overflow-hidden",
                  )}
                >
                  <EssentialsTab
                    strategyModel={strategyModel}
                    onStrategyModelChange={changeStrategyModel}
                    autoFocus={isActive}
                    cloudName={cloudName}
                    compact={compact}
                    onNeededHeightChange={reportEssentialHeight}
                    detailsExpanded={detailsExpanded}
                    onDetailsExpandedChange={setDetailsExpanded}
                    currentPartners={currentPartners}
                    descriptionVersion={descriptionVersion}
                    isAIProcessing={isAIProcessing}
                    strategyStatus={strategyStatus}
                    hasStrategyActivity={hasStrategyActivity}
                    onDescriptionChange={handleDescriptionChange}
                    onOpenStrategyModal={() => setIsStrategyModalOpen(true)}
                    onTitleBlur={handleTitleBlur}
                    onTextDraft={setTextDraft}
                    onTextCommit={commitTextDraft}
                    RawAction={RawAction}
                    setRawAction={setRawAction}
                    setWorkFiles={setWorkFiles}
                    triggerAIAction={triggerAIAction}
                    updateAction={updateAction}
                    uploadPreset={uploadPreset}
                    workFiles={workFiles}
                  />
                </PrismTabPanel>
              )}
              {/* Instagram */}
              {view === "instagram" && (
                <PrismTabPanel
                  id="instagram"
                  className={cn("w-full", "h-full")}
                >
                  <InstagramTab
                    captionModel={captionModel}
                    onCaptionModelChange={changeCaptionModel}
                    contentModel={contentModel}
                    onContentModelChange={changeContentModel}
                    activeAIIntent={activeAIIntent}
                    cloudName={cloudName}
                    compact={compact}
                    contentDescription={contentDescriptionRef.current}
                    contentVersion={contentVersion}
                    contentFiles={contentFiles}
                    currentPartners={currentPartners}
                    isAIProcessing={isAIProcessing}
                    strategiesBlocked={strategyControlsBlocked}
                    onContentDescriptionChange={(html) => {
                      contentDescriptionRef.current = html;
                    }}
                    onOpenStrategyModal={() => setIsStrategyModalOpen(true)}
                    onTextDraft={setTextDraft}
                    onTextCommit={commitTextDraft}
                    RawAction={RawAction}
                    setRawAction={setRawAction}
                    triggerAIAction={triggerAIAction}
                    updateAction={updateAction}
                    updateContentFiles={updateContentFiles}
                    uploadPreset={uploadPreset}
                  />
                </PrismTabPanel>
              )}
              {view === "observations" && (
                <PrismTabPanel
                  id="observations"
                  className={cn("w-full", "h-full")}
                >
                  <ObservationsTab
                    actionId={RawAction.id}
                    partnerUsersIds={currentPartners[0]?.users_ids || []}
                  />
                </PrismTabPanel>
              )}
            </div>
          </div>
        </PrismTabs>
        {/* Create/update stays outside the tab collection. */}
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
      {blocked && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background p-6 text-center"
          role="status"
        >
          <SmartphoneIcon
            aria-hidden="true"
            className="size-8 text-muted-foreground"
          />
          <p className="text-base font-medium text-foreground">
            Gire o telefone
          </p>
          <p className="text-sm text-muted-foreground">
            A edição da ação precisa da tela na vertical.
          </p>
          <PrismButton variant="outline" size="sm" onPress={handleSafeClose}>
            Fechar ação
          </PrismButton>
        </div>
      )}
      <PrismDialog
        size="xl"
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
            Usar versão atual
          </PrismButton>
          {coordinatorState.isDirty && (
            <PrismButton
              isDisabled={isResolvingConflict || isPending}
              onPress={keepLocalChanges}
            >
              {isResolvingConflict ? "Salvando…" : "Usar minha versão"}
            </PrismButton>
          )}
        </PrismDialogFooter>
      </PrismDialog>

      <PrismDialog
        className="flex flex-col"
        size="xl"
        isOpen={isActive && isStrategyModalOpen}
        onOpenChange={(open) => {
          setIsStrategyModalOpen(open);
          if (!open && strategyStatus === "saved") {
            void checkRemoteVersionRef.current();
          }
        }}
      >
        <PrismDialogHeader className="shrink-0 px-6 pt-6 sm:px-8 sm:pt-8">
          <PrismDialogTitle className="text-2xl">
            5 Estratégias Sugeridas
          </PrismDialogTitle>

          {strategyOptions.length > 0 && !isGenerating ? (
            <PrismDialogDescription>
              Escolha uma das 5 estratégias criativas abaixo para gerar o
              conteúdo da ação.
            </PrismDialogDescription>
          ) : isInitialGenerating ? (
            <PrismDialogDescription className="text-muted-foreground">
              Aguarde a criação das opções para esta ação.
            </PrismDialogDescription>
          ) : isRecreating ? (
            <PrismDialogDescription className="text-muted-foreground">
              Uma nova geração de estratégias está em andamento.
            </PrismDialogDescription>
          ) : null}
        </PrismDialogHeader>
        <UAIProgressBar isGenerating={isGenerating} />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:px-8 sm:pb-8">
          {isSavingSelection && (
            <div
              className="flex items-center gap-2 py-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <ULoader size="sm" />
              <span>Salvando seleção…</span>
            </div>
          )}
          {isGenerating && (
            <div
              className="flex items-center justify-between gap-3 py-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2">
                <ULoader size="sm" />
                <span>
                  {strategyStatus === "saving"
                    ? "Salvando estratégias…"
                    : isRecreating
                      ? "Recriando estratégias…"
                      : "Criando estratégias…"}
                </span>
              </div>
              {isRecreating && (
                <PrismBadge variant="outline" className="text-muted-foreground">
                  Resultado anterior
                </PrismBadge>
              )}
            </div>
          )}
          {strategyStatus === "saved" && (
            <p
              className="py-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {isSyncingStrategies
                ? "Carregando estratégias salvas…"
                : canonicalStrategies.some((s) => s.selected)
                  ? "Seleção salva."
                  : "Estratégias salvas."}
            </p>
          )}
          {strategyStatus === "error" && (
            <div className="space-y-3 py-2">
              <p role="alert" className="text-sm text-destructive">
                {strategySelectionError ||
                  coordinatorState.errorMessage ||
                  durableStrategies.error ||
                  strategyGeneration.error ||
                  "Não foi possível salvar a seleção."}
              </p>
              <PrismButton
                isDisabled={isPending}
                onPress={() => {
                  if (strategySelectionError) {
                    const currentStrategies = parseStrategies(
                      rawActionRef.current.strategies,
                    );
                    const selectedIdx = currentStrategies.findIndex(
                      (s) => s.selected,
                    );
                    if (selectedIdx >= 0) {
                      void selectStrategy(selectedIdx, true);
                    } else {
                      void coordinatorRef.current?.scheduleUpdate();
                    }
                  } else {
                    void triggerAIAction(INTENT.ai_strategy);
                  }
                }}
              >
                {strategySelectionError
                  ? "Tentar salvar novamente"
                  : "Tentar gerar novamente"}
              </PrismButton>
            </div>
          )}
          {(strategyStatus === "conflict" ||
            coordinatorState.status === "conflict") && (
            <div className="space-y-3 py-2" role="alert">
              <p className="text-sm text-destructive">
                Conflito ao salvar a seleção: a ação foi alterada em outra
                sessão.
              </p>
              <PrismButton
                isDisabled={isPending}
                onPress={() => {
                  if (coordinatorState.remoteVersion) {
                    setComparison(coordinatorState.remoteVersion);
                  }
                }}
              >
                Revisar conflito
              </PrismButton>
            </div>
          )}
          {strategyStatus === "unsaved" && (
            <div className="space-y-3 py-2">
              <p role="alert" className="text-sm text-destructive">
                As estratégias ainda não foram salvas.{" "}
                {durableStrategies.error ||
                  coordinatorState.errorMessage ||
                  "Use o salvamento da ação para confirmar as alterações."}
              </p>
              <PrismButton
                isDisabled={
                  isPending || isRetryingStrategy || durableStrategies.pending
                }
                onPress={retryStrategySave}
              >
                {isRetryingStrategy
                  ? "Aplicando…"
                  : coordinatorState.remoteVersion ||
                      coordinatorState.status === "conflict"
                    ? "Revisar conflito"
                    : durableStrategies.operation?.result
                      ? durableStrategies.needsReview ||
                        durableStrategies.operation.state === "conflict"
                        ? "Revisar e aplicar resultado preservado"
                        : "Aplicar resultado preservado"
                      : "Tentar salvar estratégias"}
              </PrismButton>
            </div>
          )}
          <PrismAccordion
            className={cn(
              "border-none transition-opacity",
              isRecreating && "opacity-75",
            )}
          >
            {strategyOptions.map((strat, i) => (
              <PrismAccordionItem
                key={strat.headline || i}
                defaultExpanded={i === 0}
                id={String(i)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className="relative mt-5 flex shrink-0 items-center justify-center">
                    <PrismCheckbox
                      aria-label="Selecionar estratégia"
                      isSelected={!!strat.selected}
                      isDisabled={strategyControlsBlocked}
                      onChange={(isSelected) => {
                        void selectStrategy(i, isSelected);
                      }}
                    />
                    {savingSelectionIndex === i && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80"
                      >
                        <ULoader size="xs" className="text-primary" />
                      </span>
                    )}
                  </div>
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
                    <PrismButtonGroup
                      className="max-w-full self-end"
                      size="sm"
                      aria-label="Geração de conteúdo"
                    >
                      <PrismButton
                        isDisabled={strategyControlsBlocked || isAIProcessing}
                        onClick={async () => {
                          if (!(await selectStrategy(i, true))) return;
                          void triggerAIAction(INTENT.ai_content, {
                            model: contentModel,
                            headline: strat.headline,
                            racional: strat.racional,
                            direcionamento: strat.direcionamento,
                          });
                          setIsStrategyModalOpen(false);
                          setView("instagram");
                        }}
                        size="sm"
                        variant="secondary"
                      >
                        {savingSelectionIndex === i ? (
                          <span className="flex items-center gap-2">
                            <ULoader size="xs" inheritColor /> Salvando...
                          </span>
                        ) : (
                          "USAR ESTA ESTRATÉGIA"
                        )}
                      </PrismButton>
                      <UAIModelSelect
                        models={actionAIModels}
                        value={contentModel}
                        onChange={changeContentModel}
                        size="sm"
                        variant="secondary"
                        isDisabled={strategyControlsBlocked || isAIProcessing}
                      />
                    </PrismButtonGroup>
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
