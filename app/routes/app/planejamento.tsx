import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
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
import { PlanningSuggestionsList } from "~/components/planning/PlanningSuggestionsList";
import {
  PrismBadge,
  PrismButton,
  PrismCheckbox,
  PrismDateRangePicker,
  PrismDialog,
  PrismDialogBody,
  PrismDialogDescription,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismDialogTrigger,
  PrismInput,
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
} from "~/components/prism";
import { UPartnersCombobox } from "~/components/uzzina/UPartnersCombobox";
import { useAppContext, useLeaveOpenActions } from "~/contexts/AppContext";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { QUERY_KEYS } from "~/lib/query-keys";
import { finalizeSocialPlan } from "~/lib/social-planning/finalizer";
import { generateSocialPlan } from "~/lib/social-planning/generator";
import {
  MAX_PLANNING_PERIOD_DAYS,
  mergeCommemorativeSlots,
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
  SocialPlan,
} from "~/lib/social-planning/types";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { fetchCelebrations } from "~/lib/supabase.queries";
import { getPartnerBySlug } from "~/models/partners";
import {
  createSocialPlanClient,
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
  const { partner: partnerSlug } = Route.useSearch();
  const selectedPartner = partners.find(
    (partner) => partner.slug === partnerSlug,
  );
  const selectedPartnerSlug = selectedPartner?.slug ?? "";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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
  const formatMode = manualFormats ? "manual" : "auto";
  const formatCounts = normalizePlanningFormats(total, manualFormats);
  const regularFormats = sequencePlanningFormats(formatCounts);
  const slots =
    mode === "period" && periodValidation.isValid
      ? mergeCommemorativeSlots({
          slots: periodValidation.calculatedSlots,
          celebrations: periodCelebrations,
          selectedCelebrationIds: considerHolidays
            ? selectedCelebrationIds
            : [],
          startDate,
          endDate,
        })
      : [];
  let regularIndex = 0;
  const formats: PlanFormat[] =
    mode === "period"
      ? slots.map((slot) =>
          slot.isExtra ? "carousel" : regularFormats[regularIndex++],
        )
      : regularFormats;
  const itemsByDate = new Map<string, PlanFormat[]>();
  slots.forEach((slot, index) => {
    const items = itemsByDate.get(slot.date) ?? [];
    items.push(formats[index]);
    itemsByDate.set(slot.date, items);
  });

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
    setFeedbackMessage(null);
    setDirectionDraft(null);
    formatEdit.current = null;
  }, [directionScope]);

  // Reabertura canônica de proposta anterior com restauração completa (C06)
  const handleOpenPlan = (plan: SocialPlan) => {
    if (!selectedPartner || plan.partner_slug !== selectedPartner.slug) {
      setFeedbackMessage("Esta proposta não pertence ao parceiro selecionado.");
      return;
    }
    formatEdit.current = null;
    setFeedbackMessage(null);
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

  // Manipulador de geração
  const handleGenerate = async () => {
    if (!selectedPartner || isFormInvalid) return;
    setFeedbackMessage(null);

    try {
      setIsGenerating(true);
      const [staticCount, carouselCount, reelsCount] = formatCounts;
      if (mode === "period") {
        const inputPayload = {
          startDate,
          endDate,
          postsPerWeek,
          selectedDays,
          periodDirection: direction,
          formatMode,
          reelsCount,
          staticCount,
          carouselCount,
          considerHolidays,
          selectedCelebrationIds,
        };

        const plan = generateSocialPlan({
          partner: {
            slug: selectedPartner.slug,
            title: selectedPartner.title,
            context: selectedPartner.context ?? undefined,
            voice: selectedPartner.voice ?? undefined,
          },
          mode: "period",
          input: inputPayload,
          slots,
          formats,
        });

        // Persistência canônica via Supabase (T02)
        const createdPlan = await createSocialPlanClient(supabase, {
          partner_slug: selectedPartner.slug,
          partner_title: selectedPartner.title,
          mode: "period",
          input: inputPayload,
          suggestions: plan.suggestions,
          user_id: person.user_id,
        });

        setCurrentPlan(createdPlan);
        refetchSavedPlans();
      } else {
        const inputPayload = {
          themeCount,
          themeDirection: direction,
          formatMode,
          reelsCount,
          staticCount,
          carouselCount,
        };

        const plan = generateSocialPlan({
          partner: {
            slug: selectedPartner.slug,
            title: selectedPartner.title,
            context: selectedPartner.context ?? undefined,
            voice: selectedPartner.voice ?? undefined,
          },
          mode: "theme",
          input: inputPayload,
          formats,
        });

        // Persistência canônica via Supabase (T02)
        const createdPlan = await createSocialPlanClient(supabase, {
          partner_slug: selectedPartner.slug,
          partner_title: selectedPartner.title,
          mode: "theme",
          input: inputPayload,
          suggestions: plan.suggestions,
          user_id: person.user_id,
        });

        setCurrentPlan(createdPlan);
        refetchSavedPlans();
      }
    } catch (err) {
      console.error("Erro ao gerar planejamento:", err);
      setFeedbackMessage(
        err instanceof Error ? err.message : "Falha ao gerar planejamento.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Atualização de sugestão individual com Compare-And-Swap (T02)
  const handleUpdateSuggestion = async (
    id: string,
    patch: Partial<PlanSuggestion>,
  ) => {
    if (!currentPlan) return;
    const updatedSuggestions = currentPlan.suggestions.map((s) =>
      s.id === id ? { ...s, ...patch } : s,
    );

    try {
      const res = await updateSocialPlanClient(
        supabase,
        currentPlan.id,
        currentPlan.version || 1,
        { suggestions: updatedSuggestions },
      );

      if (res.success && res.plan) {
        setCurrentPlan(res.plan);
        refetchSavedPlans();
      } else if (res.conflict) {
        setFeedbackMessage(
          res.error || "Conflito de versão detectado. Recarregue a proposta.",
        );
        refetchSavedPlans();
      } else {
        setFeedbackMessage(
          res.error || "Não foi possível atualizar a sugestão.",
        );
      }
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : "Erro ao atualizar sugestão.",
      );
    }
  };

  // Aprovar todas as pendentes com Compare-And-Swap (T02)
  const handleApproveAllPending = async () => {
    if (!currentPlan) return;
    const updatedSuggestions = currentPlan.suggestions.map((s) =>
      s.status === "pending" ? { ...s, status: "approved" as const } : s,
    );

    try {
      const res = await updateSocialPlanClient(
        supabase,
        currentPlan.id,
        currentPlan.version || 1,
        { suggestions: updatedSuggestions },
      );

      if (res.success && res.plan) {
        setCurrentPlan(res.plan);
        refetchSavedPlans();
      } else if (res.conflict) {
        setFeedbackMessage(
          res.error || "Conflito de versão ao salvar aprovações.",
        );
        refetchSavedPlans();
      } else {
        setFeedbackMessage(res.error || "Erro ao salvar aprovações.");
      }
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : "Erro ao aprovar sugestões.",
      );
    }
  };

  // Finalizar sugestões aprovadas em ações reais (C09)
  const handleFinalize = async () => {
    if (!currentPlan) return;
    setIsFinalizing(true);
    setFeedbackMessage(null);
    try {
      const res = await finalizeSocialPlan({
        plan: currentPlan,
        userId: person.user_id,
      });
      if (res.alreadyFinalized) {
        setFeedbackMessage("Esta proposta já foi finalizada anteriormente.");
      } else if (res.errorCount > 0) {
        setFeedbackMessage(
          `${res.createdCount} ${res.createdCount === 1 ? "ação criada" : "ações criadas"}, mas ${res.errorCount} falharam. Erros: ${res.errors.join("; ")}`,
        );
      } else {
        setFeedbackMessage(
          `${res.createdCount} ${res.createdCount === 1 ? "ação criada" : "ações criadas"} com sucesso no UZZINA na fase de Ideia!`,
        );
      }
      refetchSavedPlans();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao finalizar ações.";
      setFeedbackMessage(msg);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className="relative mx-2 flex min-h-0 flex-col overflow-hidden border-x lg:mx-8"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 lg:px-8">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="truncate text-2xl font-semibold text-foreground">
            Planejamento
          </h1>
          <UPartnersCombobox
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
          <PrismDialogTrigger
            isOpen={isSavedPlansOpen}
            onOpenChange={setIsSavedPlansOpen}
          >
            <PrismButton isDisabled={!selectedPartner} variant="outline">
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
                    <p className="text-sm text-error" role="alert">
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
                        plan.mode === "period" ? "Por período" : "Por tema";
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
                              <span className="font-medium">{modeLabel}</span>
                              {plan.status === "finalized" && (
                                <PrismBadge variant="success">
                                  Finalizado
                                </PrismBadge>
                              )}
                            </div>
                            <p className="text-xs text-secondary-foreground">
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
          {currentPlan && (
            <PrismButton
              onClick={() => {
                setCurrentPlan(null);
                setDirectionDraft(null);
              }}
              size="sm"
              variant="secondary"
            >
              Nova proposta
              <RotateCcwIcon className="size-4" />
            </PrismButton>
          )}
          <PrismButton
            isDisabled={!selectedPartner || isGenerating || isFormInvalid}
            onClick={handleGenerate}
          >
            {isGenerating ? "Gerando sugestões..." : "Gerar planejamento"}
            <SparklesIcon className="size-4" />
          </PrismButton>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <p className="m-4 text-sm text-secondary-foreground lg:hidden">
          O planejamento está disponível em telas amplas.
        </p>
        <div className="hidden h-full min-h-0 lg:grid lg:grid-cols-[minmax(21rem,0.85fr)_minmax(0,1.55fr)]">
          <section
            aria-label="Configuração do planejamento"
            className="min-h-0 overflow-y-auto overscroll-contain px-6 py-6 xl:px-8"
          >
            <div className="grid gap-8">
              {partnerSlug && !selectedPartner && (
                <p className="text-sm text-secondary-foreground">
                  Esse parceiro não está disponível para sua conta. Escolha
                  outro parceiro autorizado no cabeçalho.
                </p>
              )}
              {selectedPartner &&
                (partnerDetail.isPending || partnerDetail.isLoadingError) && (
                  <p
                    role="status"
                    className="text-sm text-secondary-foreground"
                  >
                    {partnerDetail.isPending
                      ? "Carregando o direcionamento do parceiro…"
                      : "O direcionamento padrão não pôde ser carregado. Você pode preenchê-lo nesta proposta."}
                  </p>
                )}

              {/* Modo de planejamento */}
              <div className="grid gap-3">
                <PrismTabs
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
                        <p className="text-xs text-secondary-foreground">
                          <strong className="font-semibold text-foreground">
                            {periodValidation.calculatedSlots.length}{" "}
                            {periodValidation.calculatedSlots.length === 1
                              ? "publicação regular prevista"
                              : "publicações regulares previstas"}
                          </strong>{" "}
                          no período selecionado.
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-error">
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
                    <Field
                      id="planning-theme-count"
                      label="Quantidade de conteúdos"
                    >
                      <PrismInput
                        id="planning-theme-count"
                        max={30}
                        min={1}
                        onChange={(e) => {
                          formatEdit.current = null;
                          setThemeCount(Number(e.target.value) || 1);
                        }}
                        type="number"
                        value={themeCount}
                      />
                    </Field>

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
                      <p className="text-sm text-secondary-foreground">
                        Selecione as datas comemorativas do mês que deseja
                        incluir:
                      </p>
                      {/* Resumo de regulares + extras (C03) */}
                      {selectedCelebrationIds.length > 0 && (
                        <p className="text-xs text-secondary-foreground">
                          <strong className="font-medium text-foreground">
                            {periodValidation.calculatedSlots.length} regulares
                          </strong>{" "}
                          +{" "}
                          <strong className="font-medium text-foreground">
                            {selectedCelebrationIds.length}{" "}
                            {selectedCelebrationIds.length === 1
                              ? "extra comemorativa"
                              : "extras comemorativas"}
                          </strong>{" "}
                          ={" "}
                          <strong className="font-semibold text-foreground">
                            {periodValidation.calculatedSlots.length +
                              selectedCelebrationIds.length}{" "}
                            publicações totais
                          </strong>
                          .
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
                        <p className="text-sm text-secondary-foreground">
                          Nenhuma data comemorativa cadastrada para este mês.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary-foreground">
                      Marque para exibir e escolher as datas comemorativas do
                      mês.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-secondary-foreground">
                    Disponível no modo por período.
                  </p>
                )}
              </div>

              {/* Referência ao contexto e tom */}
              <div>
                <p className="text-sm text-secondary-foreground">
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
            {/* Barra de controle da visualização quando há proposta ativa */}
            {currentPlan && (
              <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/60 px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-wider text-secondary-foreground uppercase">
                    Visualização:
                  </span>
                  <div className="flex items-center rounded-lg border border-border bg-secondary p-0.5 squircle">
                    <button
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors squircle ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-secondary-foreground hover:text-foreground"
                      }`}
                      onClick={() => setViewMode("list")}
                      type="button"
                    >
                      Lista
                      <ListIcon className="size-3.5" />
                    </button>
                    <button
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors squircle ${
                        viewMode === "calendar"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-secondary-foreground hover:text-foreground"
                      }`}
                      onClick={() => setViewMode("calendar")}
                      type="button"
                    >
                      Calendário
                      <CalendarIcon className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-secondary-foreground">
                  {currentPlan.suggestions.length}{" "}
                  {currentPlan.suggestions.length === 1
                    ? "sugestão"
                    : "sugestões"}
                </div>
              </div>
            )}

            {/* Mensagem de feedback (ex: ações criadas) */}
            {feedbackMessage && (
              <div className="flex items-center gap-2 border-b border-success bg-success-background px-6 py-2.5 text-xs font-medium text-success">
                <CheckCircle2Icon className="size-4 shrink-0 text-success" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Conteúdo rolável */}
            <div className="flex min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
              <div className="flex min-h-full min-w-full flex-col">
                {currentPlan ? (
                  viewMode === "list" ? (
                    <PlanningSuggestionsList
                      isFinalizing={isFinalizing}
                      onApproveAllPending={handleApproveAllPending}
                      onFinalize={handleFinalize}
                      onUpdateSuggestion={handleUpdateSuggestion}
                      suggestions={currentPlan.suggestions}
                    />
                  ) : (
                    <PlanningCalendarView
                      endDate={endDate}
                      onUpdateSuggestion={handleUpdateSuggestion}
                      startDate={startDate}
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
