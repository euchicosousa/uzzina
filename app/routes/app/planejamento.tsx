import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ListIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { z } from "zod";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { PlanningCalendarView } from "~/components/planning/PlanningCalendarView";
import { PlanningSuggestionsList } from "~/components/planning/PlanningSuggestionsList";
import {
  PrismBadge,
  PrismButton,
  PrismCheckbox,
  PrismDateRangePicker,
  PrismInput,
  PrismLabel,
  PrismRadio,
  PrismRadioGroup,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
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
import { useAppContext, useLeaveOpenActions } from "~/contexts/AppContext";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { QUERY_KEYS } from "~/lib/query-keys";
import { finalizeSocialPlan } from "~/lib/social-planning/finalizer";
import { generateSocialPlan } from "~/lib/social-planning/generator";
import {
  distributeFormats,
  mergeCommemorativeSlots,
  validateFormatDistribution,
  validatePeriodInput,
} from "~/lib/social-planning/slot-calculator";
import type { PlanSuggestion, SocialPlan } from "~/lib/social-planning/types";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { fetchCelebrations } from "~/lib/supabase.queries";
import {
  createSocialPlanClient,
  listSocialPlansByPartner,
  updateSocialPlanClient,
} from "~/models/social_plans";
import { getMonthCalendarPeriod, parseU } from "~/utils";

export const Route = createFileRoute("/app/planejamento")({
  validateSearch: z.object({ partner: z.string().optional() }),
  component: PlanningPage,
});

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
  const [periodDirection, setPeriodDirection] = useState("");

  const [themeCount, setThemeCount] = useState(6);
  const [themeDirection, setThemeDirection] = useState("");

  const [formatMode, setFormatMode] = useState<string>("auto");
  const [reelsCount, setReelsCount] = useState(2);
  const [staticCount, setStaticCount] = useState(2);
  const [carouselCount, setCarouselCount] = useState(2);

  const [considerHolidays, setConsiderHolidays] = useState(false);
  const [selectedCelebrationIds, setSelectedCelebrationIds] = useState<
    string[]
  >([]);

  // Query celebrations
  const { data: celebrations = [] } = useQuery({
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
      setSelectedCelebrationIds([]);
      return;
    }
    const validIds = new Set(periodCelebrations.map((c) => c.id));
    setSelectedCelebrationIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [periodCelebrations, considerHolidays]);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Planejamento atual e lista de propostas canônicas no banco (T02)
  const [currentPlan, setCurrentPlan] = useState<SocialPlan | null>(null);
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

  // Validação estrita de formatos (C04, T03)
  const formatValidation = useMemo(() => {
    const regularTarget =
      mode === "period" ? periodValidation.calculatedSlots.length : themeCount;
    return validateFormatDistribution({
      formatMode: formatMode as "auto" | "manual",
      targetCount: regularTarget,
      reelsCount,
      staticCount,
      carouselCount,
    });
  }, [
    mode,
    periodValidation.calculatedSlots.length,
    themeCount,
    formatMode,
    reelsCount,
    staticCount,
    carouselCount,
  ]);

  const isFormInvalid =
    mode === "period"
      ? !periodValidation.isValid || !formatValidation.isValid
      : !themeCount || themeCount <= 0 || !formatValidation.isValid;

  // Propostas salvas no Supabase com autorização real por parceiro (T02)
  const { data: savedPlans = [], refetch: refetchSavedPlans } = useQuery({
    queryKey: QUERY_KEYS.socialPlans(
      person.user_id,
      selectedPartner?.slug || "",
    ),
    queryFn: async () => {
      if (!selectedPartner?.slug) return [];
      try {
        return await listSocialPlansByPartner(supabase, selectedPartner.slug);
      } catch (err) {
        console.warn("Falha ao carregar propostas do banco:", err);
        return [];
      }
    },
    enabled: Boolean(selectedPartner?.slug),
  });

  // Limpa estado da proposta aberta ao trocar de parceiro (C06)
  useEffect(() => {
    setCurrentPlan(null);
    setFeedbackMessage(null);
  }, [selectedPartner?.slug]);

  // Reabertura canônica de proposta anterior com restauração completa (C06)
  const handleOpenPlan = (plan: SocialPlan) => {
    if (!selectedPartner || plan.partner_slug !== selectedPartner.slug) {
      setFeedbackMessage("Esta proposta não pertence ao parceiro selecionado.");
      return;
    }
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
    if (typeof input.periodDirection === "string")
      setPeriodDirection(input.periodDirection);
    if (typeof input.themeCount === "number") setThemeCount(input.themeCount);
    if (typeof input.themeDirection === "string")
      setThemeDirection(input.themeDirection);
    if (typeof input.formatMode === "string") setFormatMode(input.formatMode);
    if (typeof input.reelsCount === "number") setReelsCount(input.reelsCount);
    if (typeof input.staticCount === "number")
      setStaticCount(input.staticCount);
    if (typeof input.carouselCount === "number")
      setCarouselCount(input.carouselCount);
    if (typeof input.considerHolidays === "boolean")
      setConsiderHolidays(input.considerHolidays);
    if (Array.isArray(input.selectedCelebrationIds))
      setSelectedCelebrationIds(input.selectedCelebrationIds as string[]);
  };

  // Manipulador de geração
  const handleGenerate = async () => {
    if (!selectedPartner) return;
    setFeedbackMessage(null);

    try {
      if (mode === "period") {
        const validation = validatePeriodInput({
          startDate,
          endDate,
          postsPerWeek,
          selectedDays,
        });

        if (!validation.isValid) {
          setFeedbackMessage(
            validation.error || "Configuração de período inválida.",
          );
          return;
        }

        if (!formatValidation.isValid) {
          setFeedbackMessage(
            formatValidation.error || "Distribuição de formatos inválida.",
          );
          return;
        }

        setIsGenerating(true);
        const rawSlots = validation.calculatedSlots;

        const slots = considerHolidays
          ? mergeCommemorativeSlots({
              slots: rawSlots,
              celebrations: periodCelebrations,
              selectedCelebrationIds,
              startDate,
              endDate,
            })
          : rawSlots.map((d) => ({ date: d }));

        const formats = distributeFormats({
          totalCount: slots.length,
          formatMode: formatMode as "auto" | "manual",
          reelsCount,
          staticCount,
          carouselCount,
        });

        const inputPayload = {
          startDate,
          endDate,
          postsPerWeek,
          selectedDays,
          periodDirection,
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
        const formats = distributeFormats({
          totalCount: themeCount,
          formatMode: formatMode as "auto" | "manual",
          reelsCount,
          staticCount,
          carouselCount,
        });

        const inputPayload = {
          themeCount,
          themeDirection,
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
        <div className="flex items-center gap-3">
          <h1 className="truncate text-2xl font-semibold text-foreground">
            Planejamento
          </h1>
          {currentPlan && (
            <PrismBadge variant="secondary">
              {currentPlan.mode === "period" ? "Por período" : "Por tema"}
            </PrismBadge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentPlan && (
            <PrismButton
              onClick={() => setCurrentPlan(null)}
              size="sm"
              variant="outline"
            >
              <RotateCcwIcon className="size-4" />
              Novo / Trocar proposta
            </PrismButton>
          )}
          <PrismButton
            isDisabled={!selectedPartner || isGenerating || isFormInvalid}
            onClick={handleGenerate}
          >
            <SparklesIcon className="size-4" />
            {isGenerating ? "Gerando sugestões..." : "Gerar planejamento"}
          </PrismButton>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <p className="m-4 text-sm text-muted-foreground lg:hidden">
          O planejamento está disponível em telas amplas.
        </p>
        <div className="hidden h-full min-h-0 lg:grid lg:grid-cols-[minmax(21rem,0.85fr)_minmax(0,1.55fr)]">
          <section
            aria-label="Configuração do planejamento"
            className="min-h-0 overflow-y-auto overscroll-contain px-6 py-6 xl:px-8"
          >
            <div className="grid gap-8">
              {/* Parceiro */}
              <div className="grid gap-2.5">
                <PrismLabel htmlFor="planning-partner">Parceiro</PrismLabel>
                <PrismSelect
                  aria-label="Parceiro do planejamento"
                  className="w-full min-w-0"
                  onSelectionChange={async (key) => {
                    if (!(await leaveOpenActions())) return;
                    await navigate({
                      search: key
                        ? { partner: String(key) }
                        : { partner: undefined },
                    });
                  }}
                  selectedKey={selectedPartner?.slug ?? null}
                >
                  <PrismSelectTrigger className="w-full" id="planning-partner">
                    <PrismSelectValue>
                      {({ selectedItems, selectedText }) =>
                        selectedItems.length > 0
                          ? selectedText
                          : "Escolha um parceiro"
                      }
                    </PrismSelectValue>
                  </PrismSelectTrigger>
                  <PrismSelectContent>
                    {partners.map((partner) => (
                      <PrismSelectItem key={partner.slug} id={partner.slug}>
                        {partner.title}
                      </PrismSelectItem>
                    ))}
                  </PrismSelectContent>
                </PrismSelect>
                {partnerSlug && !selectedPartner && (
                  <p className="text-sm text-muted-foreground">
                    Esse parceiro não está disponível para sua conta. Escolha
                    outro parceiro autorizado.
                  </p>
                )}
              </div>

              {/* Modo de planejamento */}
              <div className="grid gap-3">
                <PrismTabs
                  className="w-full"
                  onSelectionChange={(key) => setMode(String(key))}
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
                        onChange={(range) => {
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
                          if (typeof val === "number") setPostsPerWeek(val);
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
                        <p className="text-xs text-muted-foreground">
                          <strong className="font-semibold text-foreground">
                            {periodValidation.calculatedSlots.length}{" "}
                            {periodValidation.calculatedSlots.length === 1
                              ? "publicação regular prevista"
                              : "publicações regulares previstas"}
                          </strong>{" "}
                          no período selecionado.
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-destructive">
                          {periodValidation.error}
                        </p>
                      )}
                    </div>

                    {/* Direcionamento explícito (período) */}
                    <Field
                      id="planning-period-direction"
                      label="Direcionamento (opcional)"
                    >
                      <PrismTextarea
                        className="min-h-24"
                        id="planning-period-direction"
                        onChange={(e) => setPeriodDirection(e.target.value)}
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
                        onChange={(e) =>
                          setThemeCount(Number(e.target.value) || 1)
                        }
                        type="number"
                        value={themeCount}
                      />
                    </Field>

                    <Field
                      id="planning-theme-direction"
                      label="Tema e direcionamento"
                    >
                      <PrismTextarea
                        className="min-h-28"
                        id="planning-theme-direction"
                        onChange={(e) => setThemeDirection(e.target.value)}
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
                  onChange={(val) => setFormatMode(String(val))}
                  value={formatMode}
                >
                  <PrismRadio value="auto">Distribuição automática</PrismRadio>
                  <PrismRadio value="manual">Definir quantidades</PrismRadio>
                </PrismRadioGroup>

                {formatMode === "manual" && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <Field id="format-reels" label="Reels">
                      <PrismInput
                        id="format-reels"
                        min={0}
                        onChange={(e) =>
                          setReelsCount(Number(e.target.value) || 0)
                        }
                        type="number"
                        value={reelsCount}
                      />
                    </Field>
                    <Field id="format-static" label="Estáticos">
                      <PrismInput
                        id="format-static"
                        min={0}
                        onChange={(e) =>
                          setStaticCount(Number(e.target.value) || 0)
                        }
                        type="number"
                        value={staticCount}
                      />
                    </Field>
                    <Field id="format-carousel" label="Carrosséis">
                      <PrismInput
                        id="format-carousel"
                        min={0}
                        onChange={(e) =>
                          setCarouselCount(Number(e.target.value) || 0)
                        }
                        type="number"
                        value={carouselCount}
                      />
                    </Field>
                  </div>
                )}
                {formatMode === "manual" && !formatValidation.isValid && (
                  <p className="text-xs font-medium text-destructive">
                    {formatValidation.error}
                  </p>
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
                      <p className="text-sm text-muted-foreground">
                        Selecione as datas comemorativas do mês que deseja
                        incluir:
                      </p>
                      {/* Resumo de regulares + extras (C03) */}
                      {selectedCelebrationIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
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
                                <span className="text-sm text-muted-foreground">
                                  ({dayFormatted})
                                </span>
                              </PrismCheckbox>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma data comemorativa cadastrada para este mês.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Marque para exibir e escolher as datas comemorativas do
                      mês.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Disponível no modo por período.
                  </p>
                )}
              </div>

              {/* Referência ao contexto e tom */}
              <div>
                <p className="text-sm text-muted-foreground">
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
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Visualização:
                  </span>
                  <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5 squircle">
                    <button
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors squircle ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setViewMode("list")}
                      type="button"
                    >
                      <ListIcon className="size-3.5" />
                      Lista
                    </button>
                    <button
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors squircle ${
                        viewMode === "calendar"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setViewMode("calendar")}
                      type="button"
                    >
                      <CalendarIcon className="size-3.5" />
                      Calendário
                    </button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  {currentPlan.suggestions.length}{" "}
                  {currentPlan.suggestions.length === 1
                    ? "sugestão"
                    : "sugestões"}
                </div>
              </div>
            )}

            {/* Mensagem de feedback (ex: ações criadas) */}
            {feedbackMessage && (
              <div className="flex items-center gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-6 py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
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
                  <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="max-w-md">
                      <h2 className="text-base font-semibold text-foreground">
                        Mesa de Planejamento
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Defina as configurações na coluna à esquerda e clique em{" "}
                        <strong className="text-foreground">
                          Gerar planejamento
                        </strong>{" "}
                        para criar sugestões inteligentes.
                      </p>

                      {/* Lista de propostas salvas para reabertura (Ticket 01) */}
                      {savedPlans.length > 0 && (
                        <div className="mt-8 border-t border-border pt-6 text-left">
                          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Propostas anteriores salvas
                          </h3>
                          <div className="mt-3 grid gap-2">
                            {savedPlans.slice(0, 5).map((plan) => (
                              <button
                                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors squircle hover:border-primary/50 hover:bg-muted/30"
                                key={plan.id}
                                onClick={() => handleOpenPlan(plan)}
                                type="button"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-foreground">
                                      {plan.mode === "period"
                                        ? "Planejamento por período"
                                        : "Planejamento por tema"}
                                    </span>
                                    {plan.status === "finalized" && (
                                      <PrismBadge variant="success">
                                        Finalizado
                                      </PrismBadge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {plan.suggestions.length} sugestões • Salvo
                                    em{" "}
                                    {format(
                                      new Date(
                                        plan.updated_at || plan.created_at,
                                      ),
                                      "dd/MM/yyyy HH:mm",
                                    )}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-primary hover:underline">
                                  Abrir proposta →
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
