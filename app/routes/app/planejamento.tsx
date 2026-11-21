import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowRightIcon,
  CalendarIcon,
  FolderOpenIcon,
  ListIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { z } from "zod";
import { AdminGuard } from "~/components/features/AdminGuard";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { PlanningCalendarView } from "~/components/planning/PlanningCalendarView";
import {
  PlanningPreview,
  PLANNING_FORMAT_LABELS,
} from "~/components/planning/PlanningPreview";
import { PlanningSuggestionEditor } from "~/components/planning/PlanningSuggestionEditor";
import { PlanningFinalizeDialog } from "~/components/planning/PlanningFinalizeDialog";
import {
  countSuggestions,
  PlanningFilterTabs,
  PlanningSuggestionsList,
  resolveSuggestionFilter,
  type SuggestionFilter,
} from "~/components/planning/PlanningSuggestionsList";
import {
  PrismBadge,
  PrismButton,
  PrismButtonGroup,
  PrismCheckbox,
  PrismDateRangePicker,
  PrismDialog,
  PrismDialogBody,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismDialogTrigger,
  PrismLabel,
  PrismRadio,
  PrismRadioGroup,
  PrismSlider,
  PrismSliderFill,
  PrismSliderThumb,
  PrismSliderTrack,
  PrismTab,
  PrismTabList,
  PrismTabPanel,
  PrismTabs,
  PrismTextarea,
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
  toast,
} from "~/components/prism";
import { UAIModelSelect } from "~/components/uzzina/UAIModelSelect";
import { UAIProgressBar } from "~/components/uzzina/UAIProgressBar";
import { UPartnersCombobox } from "~/components/uzzina/UPartnersCombobox";
import { useAppContext, useLeaveOpenActions } from "~/contexts/AppContext";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { usePlanningGeneration } from "~/hooks/usePlanningGeneration";
import {
  getAvailableAIModels,
  isActionAIModelId,
  lunaModelId,
  type ActionAIModelId,
} from "~/lib/action-ai-models";
import { getUserPreferences } from "~/lib/preferences";
import { QUERY_KEYS } from "~/lib/query-keys";
import { cn } from "~/lib/utils";
import {
  buildPlanningPeriodSlots,
  PLANNING_PERIOD_BATCH_SIZE,
} from "~/lib/social-planning/period-plan";
import {
  MAX_PLANNING_PERIOD_DAYS,
  normalizePlanningFormats,
  PLANNING_FORMATS,
  redistributePlanningFormats,
  sequencePlanningFormats,
  type PlanningFormatCounts,
  validatePeriodInput,
} from "~/lib/social-planning/slot-calculator";
import type {
  PlanFormat,
  PlanSuggestion,
  PlanSuggestionStatus,
  SocialPlan,
} from "~/lib/social-planning/types";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { fetchCelebrations } from "~/lib/supabase.queries";
import { getPartnerBySlug } from "~/models/partners";
import {
  finalizeSocialPlanClient,
  releaseSocialPlanSuggestionClient,
  listSocialPlansByPartner,
  updateSocialPlanClient,
} from "~/models/social_plans";
import { getMonthCalendarPeriod, parseU } from "~/utils";

export const Route = createFileRoute("/app/planejamento")({
  validateSearch: z.object({ partner: z.string().optional() }),
  component: AdminPlanningPage,
});

function AdminPlanningPage() {
  const { person } = useAppContext();
  return (
    <AdminGuard>
      <PlanningPage key={person.user_id} />
    </AdminGuard>
  );
}

const EMPTY_CELEBRATIONS: Awaited<ReturnType<typeof fetchCelebrations>> = [];

type DirectionDraft = {
  scope: string;
  period?: string;
  theme?: string;
};

const DAYS_OF_WEEK = [
  { id: "dom", label: "Dom", full: "Domingo" },
  { id: "seg", label: "Seg", full: "Segunda-feira" },
  { id: "ter", label: "Ter", full: "Terça-feira" },
  { id: "qua", label: "Qua", full: "Quarta-feira" },
  { id: "qui", label: "Qui", full: "Quinta-feira" },
  { id: "sex", label: "Sex", full: "Sexta-feira" },
  { id: "sab", label: "Sáb", full: "Sábado" },
];

function PlanningPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  useFillScrollViewport(pageRef);
  const navigate = useNavigate({ from: "/app/planejamento" });
  const leaveOpenActions = useLeaveOpenActions();
  const { person, partners } = useAppContext();
  const [selectedPlanningModel, setSelectedPlanningModel] =
    useState<ActionAIModelId | null>(null);
  const preferences = getUserPreferences(person);
  const planningModels = getAvailableAIModels(preferences.contentModels);
  const preferredPlanningModel =
    selectedPlanningModel ?? preferences.defaultContentModel;
  const planningModel =
    planningModels.find((model) => model.id === preferredPlanningModel)?.id ??
    planningModels[0]?.id ??
    lunaModelId;

  const { partner: partnerSlug } = Route.useSearch();
  const selectedPartner = partners.find(
    (partner) => partner.slug === partnerSlug,
  );
  const selectedPartnerSlug = selectedPartner?.slug ?? "";
  const planningGeneration = usePlanningGeneration(
    person.user_id,
    selectedPartnerSlug,
  );
  const directionScope = JSON.stringify([
    person.user_id,
    selectedPartner?.id,
    selectedPartnerSlug,
  ]);

  // Month period based on today, aligned with the app's monthly calendar bounds
  const [initialPeriod] = useState(() => getMonthCalendarPeriod());

  // Local state for demonstration and testing the UI
  const [mode, setMode] = useState<string>("period");
  const [startDate, setStartDate] = useState(initialPeriod.startDateString);
  const [endDate, setEndDate] = useState(initialPeriod.endDateString);
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "seg",
    "qua",
    "sex",
  ]);
  const [themeCount, setThemeCount] = useState(6);
  const [directionDraft, setDirectionDraft] = useState<DirectionDraft | null>(
    null,
  );

  const [manualFormats, setManualFormats] =
    useState<PlanningFormatCounts | null>(null);
  const formatEdit = useRef<{
    index: number;
    direction: number;
    total: number;
    baseline: PlanningFormatCounts;
  } | null>(null);

  const [considerHolidays, setConsiderHolidays] = useState(false);
  const [selectedCelebrationIds, setSelectedCelebrationIds] = useState<
    string[]
  >([]);

  // Query celebrations
  const { data: celebrations = EMPTY_CELEBRATIONS } = useQuery({
    queryKey: QUERY_KEYS.celebrations(person.user_id),
    queryFn: fetchCelebrations,
    staleTime: 30 * 60 * 1000,
  });

  // Filter celebrations strictly within the selected civil period bounds (C03)
  const periodCelebrations = useMemo(() => {
    if (!celebrations.length || !startDate || !endDate) return [];
    return celebrations
      .filter((c) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) return false;
        return c.date >= startDate && c.date <= endDate;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [celebrations, startDate, endDate]);

  // Limpa IDs de celebrações fora do período ou quando a opção é desmarcada (C03)
  useEffect(() => {
    if (!considerHolidays) {
      setSelectedCelebrationIds((prev) => (prev.length ? [] : prev));
      return;
    }
    const validIds = new Set(periodCelebrations.map((c) => c.id));
    setSelectedCelebrationIds((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [periodCelebrations, considerHolidays]);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const partnerDetail = useQuery({
    queryKey: ["partner", "team", person.user_id, selectedPartnerSlug] as const,
    queryFn: ({ queryKey: [, , , slug] }) => getPartnerBySlug(supabase, slug),
    enabled: Boolean(selectedPartnerSlug),
  });
  const defaultDirection =
    partnerDetail.data?.id === selectedPartner?.id
      ? (partnerDetail.data?.planning_instructions ?? "")
      : "";
  const activeDraft =
    directionDraft?.scope === directionScope ? directionDraft : null;
  const periodDirection = activeDraft?.period ?? defaultDirection;
  const themeDirection = activeDraft?.theme ?? defaultDirection;
  const changeDirection = (mode: "period" | "theme", value: string) =>
    setDirectionDraft((previous) => ({
      ...(previous?.scope === directionScope ? previous : null),
      scope: directionScope,
      [mode]: value,
    }));

  // Planejamento atual e lista de propostas canônicas no banco (T02)
  const [openedPlan, setCurrentPlan] = useState<SocialPlan | null>(null);
  const [isSavedPlansOpen, setIsSavedPlansOpen] = useState(false);
  const currentPlan =
    openedPlan?.partner_slug === selectedPartnerSlug ? openedPlan : null;
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [suggestionFilterChoice, setSuggestionFilter] =
    useState<SuggestionFilter>("all");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [editingSuggestion, setEditingSuggestion] =
    useState<PlanSuggestion | null>(null);
  const [isSavingSuggestions, setIsSavingSuggestions] = useState(false);
  const savingSuggestions = useRef(false);
  const [suggestionSaveError, setSuggestionSaveError] = useState<string | null>(
    null,
  );

  // Validação estrita do período (C02, T03)
  const periodValidation = useMemo(() => {
    return validatePeriodInput({
      startDate,
      endDate,
      postsPerWeek,
      selectedDays,
    });
  }, [startDate, endDate, postsPerWeek, selectedDays]);

  const total =
    mode === "period"
      ? periodValidation.calculatedSlots.length
      : Number.isInteger(themeCount) && themeCount > 0 && themeCount <= 30
        ? themeCount
        : 0;
  const formatMode: "manual" | "auto" = manualFormats ? "manual" : "auto";
  const formatCounts = normalizePlanningFormats(total, manualFormats);
  const regularFormats = sequencePlanningFormats(formatCounts);
  const slots =
    mode === "period" && periodValidation.isValid
      ? buildPlanningPeriodSlots(
          {
            slots: periodValidation.calculatedSlots,
            celebrations: periodCelebrations,
            selectedCelebrationIds: considerHolidays
              ? selectedCelebrationIds
              : [],
            startDate,
            endDate,
          },
          formatCounts,
        )
      : [];
  const formats: PlanFormat[] =
    mode === "period" ? slots.map((slot) => slot.format) : regularFormats;
  const extraCount = slots.filter((slot) => slot.isExtra).length;
  const itemsByDate = new Map<string, PlanFormat[]>();
  for (const slot of slots) {
    const items = itemsByDate.get(slot.date) ?? [];
    items.push(slot.format);
    itemsByDate.set(slot.date, items);
  }

  const direction = (
    mode === "period" ? periodDirection : themeDirection
  ).trim();
  const isFormInvalid = !total || !direction;

  const changeFormatQuantity = (index: 0 | 1 | 2, quantity: number) => {
    const direction = Math.sign(quantity - formatCounts[index]);
    if (!direction) return;
    const edit = formatEdit.current;
    const baseline =
      edit?.index === index &&
      edit.direction === direction &&
      edit.total === total
        ? edit.baseline
        : formatCounts;
    formatEdit.current = { index, direction, total, baseline };
    setManualFormats(redistributePlanningFormats(baseline, index, quantity));
  };

  const {
    data: savedPlans = [],
    isError: savedPlansError,
    isLoading: savedPlansLoading,
    isFetching: savedPlansFetching,
    refetch: refetchSavedPlans,
  } = useQuery({
    queryKey: QUERY_KEYS.socialPlans(person.user_id, selectedPartnerSlug),
    queryFn: () => listSocialPlansByPartner(supabase, selectedPartnerSlug),
    enabled: Boolean(selectedPartnerSlug),
    retry: false,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: changing partners invalidates the open plan and its feedback.
  useEffect(() => {
    setCurrentPlan(null);
    setIsSavedPlansOpen(false);
    setEditingSuggestion(null);
    setSuggestionSaveError(null);
    setDirectionDraft(null);
    formatEdit.current = null;
  }, [directionScope]);

  // Reabertura canônica de proposta anterior com restauração completa (C06)
  const handleOpenPlan = (plan: SocialPlan) => {
    if (!selectedPartner || plan.partner_slug !== selectedPartner.slug) {
      toast.error("Esta proposta não pertence ao parceiro selecionado.");
      return;
    }
    formatEdit.current = null;
    setSuggestionSaveError(null);
    setEditingSuggestion(null);
    setCurrentPlan(plan);

    if (plan.mode) setMode(plan.mode);
    const input = plan.input || {};
    if (typeof input.startDate === "string") setStartDate(input.startDate);
    if (typeof input.endDate === "string") setEndDate(input.endDate);
    if (typeof input.postsPerWeek === "number")
      setPostsPerWeek(input.postsPerWeek);
    if (Array.isArray(input.selectedDays))
      setSelectedDays(input.selectedDays as string[]);
    if (typeof input.themeCount === "number") setThemeCount(input.themeCount);
    setDirectionDraft({
      scope: directionScope,
      period:
        typeof input.periodDirection === "string"
          ? input.periodDirection
          : undefined,
      theme:
        typeof input.themeDirection === "string"
          ? input.themeDirection
          : undefined,
    });
    const savedCounts = [
      input.staticCount,
      input.carouselCount,
      input.reelsCount,
    ].map((count) =>
      typeof count === "number" && Number.isSafeInteger(count) && count >= 0
        ? count
        : 0,
    );
    setManualFormats(
      input.formatMode === "manual"
        ? [savedCounts[0], savedCounts[1], savedCounts[2]]
        : null,
    );

    if (typeof input.considerHolidays === "boolean")
      setConsiderHolidays(input.considerHolidays);
    if (Array.isArray(input.selectedCelebrationIds))
      setSelectedCelebrationIds(input.selectedCelebrationIds as string[]);
  };

  const openGeneratedPlan = (proposal: SocialPlan) => {
    handleOpenPlan(proposal);
    setViewMode(proposal.mode === "period" ? "calendar" : "list");
    void refetchSavedPlans();
  };

  const verifyPlanningProposal = () => {
    if (!planningGeneration.requestId || savingSuggestions.current) return;
    void planningGeneration.run(
      {
        intent: "resume",
        partner: selectedPartnerSlug,
        requestId: planningGeneration.requestId,
      },
      openGeneratedPlan,
    );
  };

  const handleGenerate = () => {
    if (
      !selectedPartner ||
      isFormInvalid ||
      savingSuggestions.current ||
      planningGeneration.requestId
    )
      return;
    setSuggestionSaveError(null);

    const shared = {
      requestId: crypto.randomUUID(),
      partner: selectedPartnerSlug,
      model: planningModel,
      formatMode,
      direction,
    };
    void planningGeneration.run(
      mode === "theme"
        ? { ...shared, intent: "start", formats }
        : {
            ...shared,
            intent: "start-period",
            startDate,
            endDate,
            postsPerWeek,
            selectedDays,
            formatCounts,
            considerHolidays,
            selectedCelebrationIds,
            expectedSlots: slots,
          },
      openGeneratedPlan,
    );
  };

  const saveSuggestions = async (
    plan: SocialPlan,
    suggestions: PlanSuggestion[],
  ): Promise<string | null> => {
    if (savingSuggestions.current || isFinalizing) {
      return "Aguarde o salvamento em andamento.";
    }
    savingSuggestions.current = true;
    setIsSavingSuggestions(true);
    setSuggestionSaveError(null);
    try {
      const result = await updateSocialPlanClient(
        supabase,
        plan.id,
        plan.version ?? 1,
        { suggestions },
      );
      if (result.success && result.plan) {
        const savedPlan = result.plan;
        setCurrentPlan((opened) =>
          opened?.id === plan.id ? savedPlan : opened,
        );
        void refetchSavedPlans();
        return null;
      }
      if (result.conflict) {
        void refetchSavedPlans();
        return "A proposta mudou em outra sessão. Reabra em Propostas salvas antes de tentar novamente.";
      }
      return "Não foi possível salvar as alterações. Tente novamente.";
    } catch {
      return "Não foi possível salvar as alterações. Tente novamente.";
    } finally {
      savingSuggestions.current = false;
      setIsSavingSuggestions(false);
    }
  };

  const handleUpdateSuggestion = async (
    id: string,
    patch: Partial<PlanSuggestion>,
  ) => {
    if (!currentPlan) return "Abra uma proposta para editar a sugestão.";
    return saveSuggestions(
      currentPlan,
      currentPlan.suggestions.map((suggestion) =>
        suggestion.id === id ? { ...suggestion, ...patch } : suggestion,
      ),
    );
  };

  const changeSuggestionStatus = async (
    id: string,
    status: PlanSuggestionStatus,
  ) => {
    setSuggestionSaveError(await handleUpdateSuggestion(id, { status }));
  };

  const moveSuggestion = async (id: string, date: string) => {
    setSuggestionSaveError(
      await handleUpdateSuggestion(id, { scheduled_date: date }),
    );
  };

  const handleApproveAllPending = async () => {
    if (!currentPlan) return;
    setSuggestionSaveError(
      await saveSuggestions(
        currentPlan,
        currentPlan.suggestions.map((suggestion) =>
          suggestion.status === "pending"
            ? { ...suggestion, status: "approved" }
            : suggestion,
        ),
      ),
    );
  };

  // Approved suggestions become actions in one database transaction (T09).
  const queryClient = useQueryClient();
  const handleFinalize = async () => {
    if (!currentPlan || savingSuggestions.current) return;
    const plan = currentPlan;
    setIsFinalizing(true);
    setSuggestionSaveError(null);
    try {
      const result = await finalizeSocialPlanClient(
        supabase,
        plan.id,
        plan.version ?? 1,
      );
      if (result.status === "success") {
        setCurrentPlan((opened) =>
          opened?.id === plan.id ? result.plan : opened,
        );
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.actions.all(),
        });
        const count = result.created.length;
        if (count === 0) {
          toast.info(
            "Nenhuma ação nova: as sugestões aprovadas já tinham virado ações.",
          );
        } else {
          toast.success(
            `${count} ${count === 1 ? "ação criada" : "ações criadas"} na fase Fazer.`,
          );
        }
      } else if (result.status === "conflict") {
        setSuggestionSaveError(
          "A proposta mudou em outra sessão. Reabra em Propostas salvas antes de finalizar.",
        );
      } else {
        setSuggestionSaveError(result.message);
      }
    } finally {
      void refetchSavedPlans();
      setIsFinalizing(false);
    }
  };

  // Frees a finalized suggestion; its action stays as it is.
  const handleRelease = async (suggestionId: string) => {
    if (!currentPlan || savingSuggestions.current) return;
    const plan = currentPlan;
    setIsFinalizing(true);
    setSuggestionSaveError(null);
    try {
      const result = await releaseSocialPlanSuggestionClient(
        supabase,
        plan.id,
        suggestionId,
        plan.version ?? 1,
      );
      if (result.status === "success") {
        setCurrentPlan((opened) =>
          opened?.id === plan.id ? result.plan : opened,
        );
        toast.success(
          "Sugestão liberada. Ela voltou a Aprovada e pode ser finalizada de novo; a ação anterior não foi alterada.",
        );
      } else if (result.status === "conflict") {
        setSuggestionSaveError(
          "A proposta mudou em outra sessão. Reabra em Propostas salvas antes de liberar.",
        );
      } else {
        setSuggestionSaveError(result.message);
      }
    } finally {
      void refetchSavedPlans();
      setIsFinalizing(false);
    }
  };

  const suggestionCounts = countSuggestions(currentPlan?.suggestions ?? []);
  const suggestionFilter = resolveSuggestionFilter(
    suggestionFilterChoice,
    suggestionCounts,
  );
  const openPlanId = currentPlan?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: a different proposal starts on "Todas".
  useEffect(() => {
    setSuggestionFilter("all");
  }, [openPlanId]);

  const isGenerationBusy = planningGeneration.isBusy;
  const generationMessage = planningGeneration.message;
  const generationIsError = planningGeneration.isError;
  // Generation outcomes are reported as toasts, not as a banner bar.
  useEffect(() => {
    if (!generationMessage || isGenerationBusy) return;
    if (generationIsError) toast.error(generationMessage);
    else toast(generationMessage);
  }, [generationMessage, generationIsError, isGenerationBusy]);
  const headerRef = useRef<HTMLElement>(null);
  const wasGenerationBusy = useRef(false);
  // While the Mesa is locked its controls are inert, so focus would fall to
  // the page. When the lock lifts, send it to the main header action.
  useEffect(() => {
    if (wasGenerationBusy.current && !isGenerationBusy) {
      headerRef.current
        ?.querySelector<HTMLElement>("[data-planning-primary]")
        ?.focus();
    }
    wasGenerationBusy.current = isGenerationBusy;
  }, [isGenerationBusy]);
  const generationTotal = planningGeneration.total;
  const generationDone = planningGeneration.progress ?? 0;
  const generationText = !generationTotal
    ? "Gerando sugestões…"
    : planningGeneration.progress !== undefined
      ? generationDone > 0
        ? `Gerando ${generationTotal} sugestões: ${generationDone} de ${generationTotal} prontas`
        : `Gerando ${generationTotal} sugestões`
      : `Gerando ${generationTotal} ${generationTotal === 1 ? "ideia" : "ideias"} para ${selectedPartner?.title ?? "o parceiro"}…`;
  const generationDurationMs =
    planningGeneration.progress !== undefined && generationTotal
      ? Math.ceil(generationTotal / PLANNING_PERIOD_BATCH_SIZE) * 30000
      : undefined;
  const showGenerate =
    !planningGeneration.requestId || planningGeneration.isBusy;
  const generateButton = (
    <PrismButton
      data-planning-primary
      isDisabled={
        !selectedPartner ||
        isGenerationBusy ||
        isFormInvalid ||
        isSavingSuggestions
      }
      onPress={handleGenerate}
    >
      {isGenerationBusy ? "Gerando sugestões…" : "Gerar planejamento"}
      <SparklesIcon data-icon="inline-end" />
    </PrismButton>
  );

  return (
    <div
      ref={pageRef}
      className="relative mx-2 flex min-h-0 flex-col overflow-hidden border-x lg:mx-8"
    >
      <header
        aria-busy={isGenerationBusy}
        className={cn(
          "flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 lg:px-8",
          isGenerationBusy && "opacity-50",
        )}
        inert={isGenerationBusy}
        ref={headerRef}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="truncate text-2xl font-semibold text-foreground">
            Planejamento
          </h1>
          <UPartnersCombobox
            disabled={isSavingSuggestions}
            selectedPartners={selectedPartner ? [selectedPartner.slug] : []}
            selectionMode="single"
            showText
            size="sm"
            onSelect={async ([partner]) => {
              if (partner === partnerSlug || !(await leaveOpenActions()))
                return;
              await navigate({ search: { partner } });
            }}
          />
          {currentPlan && (
            <PrismBadge variant="secondary">
              {currentPlan.mode === "period" ? "Por período" : "Por tema"}
            </PrismBadge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Only offer saved proposals when there is one, or when the list
              failed to load so the dialog can retry. */}
          {(savedPlans.length > 0 || savedPlansError || currentPlan) && (
            <PrismButtonGroup aria-label="Propostas">
              {(savedPlans.length > 0 || savedPlansError) && (
                <PrismDialogTrigger
                  isOpen={isSavedPlansOpen}
                  onOpenChange={setIsSavedPlansOpen}
                >
                  <PrismButton
                    isDisabled={
                      !selectedPartner ||
                      isSavingSuggestions ||
                      planningGeneration.isBusy
                    }
                    variant="outline"
                  >
                    <FolderOpenIcon data-icon="inline-start" />
                    Propostas salvas
                  </PrismButton>
                  <PrismDialog>
                    <PrismDialogHeader>
                      <PrismDialogTitle>Propostas salvas</PrismDialogTitle>
                      <PrismDialogDescription>
                        {selectedPartner?.title}
                      </PrismDialogDescription>
                    </PrismDialogHeader>
                    <PrismDialogBody className="pb-4">
                      {savedPlansError ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base text-error" role="alert">
                            Não foi possível carregar as propostas.
                          </p>
                          <PrismButton
                            isDisabled={savedPlansFetching}
                            onPress={() => void refetchSavedPlans()}
                            size="sm"
                            variant="secondary"
                          >
                            Tentar novamente
                          </PrismButton>
                        </div>
                      ) : savedPlansLoading ? (
                        <p className="text-secondary-foreground" role="status">
                          Carregando propostas…
                        </p>
                      ) : (
                        savedPlans.length === 0 && (
                          <p className="text-secondary-foreground">
                            Nenhuma proposta salva para este parceiro.
                          </p>
                        )
                      )}
                      {savedPlans.length > 0 && (
                        <ul className="divide-y divide-border">
                          {savedPlans.map((plan) => {
                            const modeLabel =
                              plan.mode === "period"
                                ? "Por período"
                                : "Por tema";
                            const savedAt = format(
                              new Date(plan.updated_at || plan.created_at),
                              "dd/MM/yyyy HH:mm",
                            );

                            return (
                              <li
                                className="flex items-center justify-between gap-3 py-2"
                                key={plan.id}
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">
                                      {modeLabel}
                                    </span>
                                    {plan.status === "finalized" && (
                                      <PrismBadge variant="success">
                                        Finalizado
                                      </PrismBadge>
                                    )}
                                  </div>
                                  <p className="text-sm text-secondary-foreground">
                                    {plan.suggestions.length}{" "}
                                    {plan.suggestions.length === 1
                                      ? "sugestão"
                                      : "sugestões"}{" "}
                                    · {savedAt}
                                  </p>
                                </div>
                                <PrismButton
                                  aria-label={`Abrir proposta ${modeLabel.toLowerCase()} de ${savedAt}`}
                                  onPress={() => {
                                    handleOpenPlan(plan);
                                    setIsSavedPlansOpen(false);
                                  }}
                                  size="sm"
                                  variant="ghost"
                                >
                                  Abrir
                                  <ArrowRightIcon data-icon="inline-end" />
                                </PrismButton>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </PrismDialogBody>
                  </PrismDialog>
                </PrismDialogTrigger>
              )}
              {currentPlan && (
                <PrismButton
                  isDisabled={isSavingSuggestions || planningGeneration.isBusy}
                  onClick={() => {
                    setCurrentPlan(null);
                    setSuggestionSaveError(null);
                    setDirectionDraft(null);
                  }}
                  variant="outline"
                >
                  Nova proposta
                  <RotateCcwIcon className="size-4" />
                </PrismButton>
              )}
            </PrismButtonGroup>
          )}
          {planningGeneration.requestId && !planningGeneration.isBusy && (
            <PrismButton
              data-planning-primary
              isDisabled={!selectedPartner || isSavingSuggestions}
              onPress={verifyPlanningProposal}
            >
              Verificar proposta
            </PrismButton>
          )}
          {showGenerate && (
            <PrismButtonGroup aria-label="Gerar proposta">
              {generateButton}
              <UAIModelSelect
                models={planningModels}
                value={planningModel}
                onChange={(id) => {
                  if (isActionAIModelId(id)) setSelectedPlanningModel(id);
                }}
                isDisabled={isGenerationBusy || isSavingSuggestions}
              />
            </PrismButtonGroup>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <p className="m-4 text-base text-secondary-foreground lg:hidden">
          O planejamento está disponível em telas amplas.
        </p>
        <div className="hidden h-full min-h-0 lg:grid lg:grid-cols-[minmax(21rem,0.85fr)_minmax(0,1.55fr)]">
          <section
            aria-busy={isGenerationBusy}
            aria-label="Configuração do planejamento"
            className={cn(
              "min-h-0 overflow-y-auto overscroll-contain px-6 py-6 xl:px-8",
              isGenerationBusy && "opacity-50",
            )}
            inert={isGenerationBusy}
          >
            <div className="grid gap-8">
              {partnerSlug && !selectedPartner && (
                <p className="text-base text-secondary-foreground">
                  Esse parceiro não está disponível para sua conta. Escolha
                  outro parceiro autorizado no cabeçalho.
                </p>
              )}
              {selectedPartner &&
                (partnerDetail.isPending || partnerDetail.isLoadingError) && (
                  <p
                    role="status"
                    className="text-base text-secondary-foreground"
                  >
                    {partnerDetail.isPending
                      ? "Carregando o direcionamento do parceiro…"
                      : "O direcionamento padrão não pôde ser carregado. Você pode preenchê-lo nesta proposta."}
                  </p>
                )}

              {/* Modo de planejamento */}
              <div className="grid gap-3">
                <PrismTabs
                  isDisabled={planningGeneration.isBusy}
                  className="w-full"
                  onSelectionChange={(key) => {
                    formatEdit.current = null;
                    setMode(String(key));
                  }}
                  selectedKey={mode}
                >
                  <PrismTabList
                    aria-label="Modo de planejamento"
                    className="w-full"
                  >
                    <PrismTab id="period">Por período</PrismTab>
                    <PrismTab id="theme">Por tema</PrismTab>
                  </PrismTabList>

                  {/* Painel: Por período */}
                  <PrismTabPanel
                    className="grid gap-6 pt-6"
                    id="period"
                    shouldForceMount
                  >
                    <Field id="planning-period" label="Período">
                      <PrismDateRangePicker
                        id="planning-period"
                        maxRangeDays={MAX_PLANNING_PERIOD_DAYS}
                        onChange={(range) => {
                          formatEdit.current = null;
                          setStartDate(range.startDateString);
                          setEndDate(range.endDateString);
                        }}
                        value={{
                          start: startDate,
                          end: endDate,
                        }}
                      />
                    </Field>

                    {/* Slider Conteúdos por semana */}
                    <div className="grid gap-2.5">
                      <div className="flex items-center justify-between gap-4">
                        <PrismLabel htmlFor="planning-frequency-slider">
                          Conteúdos por semana
                        </PrismLabel>
                        <span className="text-sm font-medium text-foreground">
                          {postsPerWeek}{" "}
                          {postsPerWeek === 1 ? "conteúdo" : "conteúdos"}/semana
                        </span>
                      </div>
                      <PrismSlider
                        aria-label="Conteúdos por semana"
                        id="planning-frequency-slider"
                        maxValue={7}
                        minValue={1}
                        onChange={(val) => {
                          if (typeof val !== "number") return;
                          formatEdit.current = null;
                          setPostsPerWeek(val);
                        }}
                        value={postsPerWeek}
                      >
                        <PrismSliderTrack>
                          <PrismSliderFill />
                          <PrismSliderThumb />
                        </PrismSliderTrack>
                      </PrismSlider>
                    </div>

                    {/* Dias da semana (começando no Domingo) */}
                    <div className="grid gap-2.5">
                      <span className="text-sm font-medium text-foreground">
                        Dias preferidos da semana
                      </span>
                      <div
                        aria-label="Dias da semana para publicação"
                        className="flex flex-wrap gap-2"
                        role="group"
                      >
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = selectedDays.includes(day.id);
                          return (
                            <PrismToggle
                              aria-label={day.full}
                              className="h-10 min-w-10 flex-1 px-2 text-sm font-semibold data-selected:bg-primary data-selected:text-primary-foreground"
                              isSelected={isSelected}
                              key={day.id}
                              onChange={() => {
                                formatEdit.current = null;
                                setSelectedDays((prev) =>
                                  prev.includes(day.id)
                                    ? prev.filter((d) => d !== day.id)
                                    : [...prev, day.id],
                                );
                              }}
                              size="sm"
                              variant="secondary"
                            >
                              {day.label}
                            </PrismToggle>
                          );
                        })}
                      </div>
                      {/* Resumo de slots calculados / validação (C02) */}
                      {periodValidation.isValid ? (
                        <p className="text-sm text-secondary-foreground">
                          <strong className="font-semibold text-foreground">
                            {periodValidation.calculatedSlots.length}{" "}
                            {periodValidation.calculatedSlots.length === 1
                              ? "publicação regular prevista"
                              : "publicações regulares previstas"}
                          </strong>{" "}
                          no período selecionado.
                        </p>
                      ) : (
                        <p className="text-base font-medium text-error">
                          {periodValidation.error}
                        </p>
                      )}
                    </div>

                    {/* Direcionamento explícito (período) */}
                    <Field
                      id="planning-period-direction"
                      label="Direcionamento (obrigatório)"
                    >
                      <PrismTextarea
                        className="min-h-24"
                        id="planning-period-direction"
                        required
                        onChange={(e) =>
                          changeDirection("period", e.target.value)
                        }
                        placeholder="Orientações estratégicas, foco do período ou campanhas a enfatizar"
                        value={periodDirection}
                      />
                    </Field>
                  </PrismTabPanel>

                  {/* Painel: Por tema */}
                  <PrismTabPanel
                    className="grid gap-6 pt-6"
                    id="theme"
                    shouldForceMount
                  >
                    <div className="grid gap-2.5">
                      <div className="flex items-center justify-between gap-4">
                        <PrismLabel htmlFor="planning-theme-count">
                          Quantidade de conteúdos
                        </PrismLabel>
                        <span className="text-sm font-medium text-foreground">
                          {themeCount}{" "}
                          {themeCount === 1 ? "conteúdo" : "conteúdos"}
                        </span>
                      </div>
                      <PrismSlider
                        aria-label="Quantidade de conteúdos"
                        id="planning-theme-count"
                        maxValue={30}
                        minValue={1}
                        onChange={(val) => {
                          if (typeof val !== "number") return;
                          formatEdit.current = null;
                          setThemeCount(val);
                        }}
                        value={themeCount}
                      >
                        <PrismSliderTrack>
                          <PrismSliderFill />
                          <PrismSliderThumb />
                        </PrismSliderTrack>
                      </PrismSlider>
                    </div>

                    <Field
                      id="planning-theme-direction"
                      label="Tema e direcionamento (obrigatório)"
                    >
                      <PrismTextarea
                        className="min-h-28"
                        id="planning-theme-direction"
                        required
                        onChange={(e) =>
                          changeDirection("theme", e.target.value)
                        }
                        placeholder="Descreva o tema, campanha ou assuntos a abordar neste lote de propostas"
                        value={themeDirection}
                      />
                    </Field>
                  </PrismTabPanel>
                </PrismTabs>
              </div>

              {/* Formatos de conteúdo */}
              <div className="grid gap-4">
                <h2 className="text-base font-semibold text-foreground">
                  Formatos de conteúdo
                </h2>
                <PrismRadioGroup
                  aria-label="Distribuição de formatos"
                  className="flex flex-row flex-wrap gap-5 text-sm"
                  onChange={(val) => {
                    formatEdit.current = null;
                    setManualFormats(val === "manual" ? formatCounts : null);
                  }}
                  value={formatMode}
                >
                  <PrismRadio value="auto">Distribuição automática</PrismRadio>
                  <PrismRadio value="manual">Definir quantidades</PrismRadio>
                </PrismRadioGroup>

                {formatMode === "manual" && (
                  <div className="grid gap-2">
                    {PLANNING_FORMATS.map((item, index) => {
                      const sliderIndex = index as 0 | 1 | 2;
                      const label = PLANNING_FORMAT_LABELS[item];
                      return (
                        <PrismSlider
                          key={item}
                          aria-label={label}
                          isDisabled={!total}
                          maxValue={total || 1}
                          minValue={0}
                          onChange={(value) => {
                            if (typeof value === "number")
                              changeFormatQuantity(sliderIndex, value);
                          }}
                          value={formatCounts[sliderIndex]}
                        >
                          <div className="flex justify-between gap-2 text-sm">
                            <PrismLabel>{label}</PrismLabel>
                            <span className="tabular-nums">
                              {formatCounts[sliderIndex]}
                            </span>
                          </div>
                          <PrismSliderTrack>
                            <PrismSliderFill />
                            <PrismSliderThumb />
                          </PrismSliderTrack>
                        </PrismSlider>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Datas e ocasiões */}
              <div className="grid gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  Datas e ocasiões
                </h2>
                <PrismCheckbox
                  isDisabled={mode !== "period"}
                  isSelected={considerHolidays}
                  onChange={setConsiderHolidays}
                >
                  Considerar datas comemorativas
                </PrismCheckbox>

                {mode === "period" ? (
                  considerHolidays ? (
                    <div className="grid gap-3 pt-1">
                      <p className="text-base text-secondary-foreground">
                        Selecione as datas comemorativas do período que deseja
                        incluir:
                      </p>
                      {selectedCelebrationIds.length > 0 && (
                        <p className="text-sm text-secondary-foreground">
                          {extraCount > 0 && (
                            <>
                              {periodValidation.calculatedSlots.length}{" "}
                              regulares + {extraCount}{" "}
                              {extraCount === 1
                                ? "carrossel extra"
                                : "carrosséis extras"}
                              {" · "}
                            </>
                          )}
                          <strong className="font-semibold text-foreground">
                            {slots.length} publicações no total
                          </strong>
                        </p>
                      )}
                      {periodCelebrations.length > 0 ? (
                        <div className="grid gap-2.5">
                          {periodCelebrations.map((celebration) => {
                            const isChecked = selectedCelebrationIds.includes(
                              celebration.id,
                            );
                            const dayFormatted = format(
                              parseU(celebration.date),
                              "dd/MM",
                            );
                            return (
                              <PrismCheckbox
                                isSelected={isChecked}
                                key={celebration.id}
                                onChange={(checked) => {
                                  setSelectedCelebrationIds((prev) =>
                                    checked
                                      ? [...prev, celebration.id]
                                      : prev.filter(
                                          (id) => id !== celebration.id,
                                        ),
                                  );
                                }}
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {celebration.title}
                                </span>
                                <span className="text-sm text-secondary-foreground">
                                  ({dayFormatted})
                                </span>
                              </PrismCheckbox>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-base text-secondary-foreground">
                          Nenhuma data comemorativa cadastrada para este mês.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-base text-secondary-foreground">
                      Marque para exibir e escolher as datas comemorativas do
                      mês.
                    </p>
                  )
                ) : (
                  <p className="text-base text-secondary-foreground">
                    Disponível no modo por período.
                  </p>
                )}
              </div>

              {/* Referência ao contexto e tom */}
              <div>
                <p className="text-base text-secondary-foreground">
                  {selectedPartner
                    ? `Contexto e tom de voz definidos no perfil de ${selectedPartner.title} serão considerados na criação.`
                    : "Selecione um parceiro para carregar contexto e tom de voz personalizados."}
                </p>
              </div>
            </div>
            <AppBarSpacer />
          </section>

          <section
            aria-label="Prévia do planejamento"
            className="flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-border"
          >
            {/* Barra única: visualização, filtros (só na lista) e Finalizar */}
            {currentPlan && !isGenerationBusy && (
              <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-3">
                <PrismToggleGroup
                  aria-label="Visualização das sugestões"
                  disallowEmptySelection
                  onSelectionChange={(keys) =>
                    setViewMode(keys.has("calendar") ? "calendar" : "list")
                  }
                  selectedKeys={[viewMode]}
                  selectionMode="single"
                  size="icon-sm"
                  variant="ghost"
                >
                  <PrismToggleGroupItem aria-label="Lista" id="list">
                    <ListIcon />
                  </PrismToggleGroupItem>
                  <PrismToggleGroupItem aria-label="Calendário" id="calendar">
                    <CalendarIcon />
                  </PrismToggleGroupItem>
                </PrismToggleGroup>

                {viewMode === "list" ? (
                  <PlanningFilterTabs
                    counts={suggestionCounts}
                    filter={suggestionFilter}
                    onChange={setSuggestionFilter}
                  />
                ) : (
                  <div className="flex-1" />
                )}

                {suggestionCounts.approved > 0 && (
                  <PlanningFinalizeDialog
                    isDisabled={isSavingSuggestions || isFinalizing}
                    isFinalizing={isFinalizing}
                    onConfirm={handleFinalize}
                    partnerTitle={selectedPartner?.title}
                    suggestions={currentPlan.suggestions}
                  />
                )}
              </div>
            )}

            {suggestionSaveError && (
              <p
                className="border-b border-border px-6 py-2 text-base text-error"
                role="alert"
              >
                {suggestionSaveError}
              </p>
            )}

            {/* Conteúdo rolável */}
            <div className="flex min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
              <div className="flex min-h-full min-w-full flex-col">
                {isGenerationBusy ? (
                  <div
                    className="grid gap-3 px-6 py-8"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-base font-medium text-foreground">
                      {generationText}
                    </p>
                    <UAIProgressBar
                      durationMs={generationDurationMs}
                      isGenerating
                    />
                    <p className="text-sm text-secondary-foreground">
                      Você pode sair desta página: a geração continua e a
                      proposta pode ser recuperada em Verificar proposta.
                    </p>
                  </div>
                ) : currentPlan ? (
                  viewMode === "list" ? (
                    <PlanningSuggestionsList
                      filter={suggestionFilter}
                      isFinalizing={isFinalizing}
                      isSaving={isSavingSuggestions}
                      key={currentPlan.id}
                      onApproveAllPending={handleApproveAllPending}
                      onChangeStatus={changeSuggestionStatus}
                      onEditSuggestion={setEditingSuggestion}
                      onRelease={handleRelease}
                      suggestions={currentPlan.suggestions}
                    />
                  ) : (
                    <PlanningCalendarView
                      endDate={
                        typeof currentPlan.input?.endDate === "string"
                          ? currentPlan.input.endDate
                          : undefined
                      }
                      isSaving={isSavingSuggestions || isFinalizing}
                      key={currentPlan.id}
                      onChangeStatus={changeSuggestionStatus}
                      onEditSuggestion={setEditingSuggestion}
                      onMoveSuggestion={moveSuggestion}
                      startDate={
                        typeof currentPlan.input?.startDate === "string"
                          ? currentPlan.input.startDate
                          : undefined
                      }
                      suggestions={currentPlan.suggestions}
                    />
                  )
                ) : (
                  <PlanningPreview
                    formats={formats}
                    itemsByDate={itemsByDate}
                    period={
                      mode === "period"
                        ? { start: startDate, end: endDate }
                        : null
                    }
                  />
                )}
                <AppBarSpacer />
              </div>
            </div>
          </section>
        </div>
      </div>
      {currentPlan && editingSuggestion && (
        <PlanningSuggestionEditor
          key={editingSuggestion.id}
          onClose={() => setEditingSuggestion(null)}
          onSave={handleUpdateSuggestion}
          suggestion={editingSuggestion}
        />
      )}
    </div>
  );
}

function Field({
  children,
  id,
  label,
}: {
  children: ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <PrismLabel htmlFor={id}>{label}</PrismLabel>
      {children}
    </div>
  );
}
