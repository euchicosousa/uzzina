import { I18nProvider } from "react-aria";
import { CelebrationDialog } from "~/components/features/CelebrationDialog";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { UCelebrationPartnersSelector } from "~/components/uzzina/UCelebrationPartnersSelector";
import { ULoader } from "~/components/uzzina/ULoader";
import { useAppContext } from "~/contexts/AppContext";
import { CalendarDate } from "@internationalized/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Celebration } from "~/types";
import {
  PrismBadge,
  PrismButton,
  PrismCalendar,
  PrismCheckbox,
  PrismInput,
} from "~/components/prism";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  createCelebration,
  deleteCelebration,
  getAllCelebrations,
  syncCelebrationActivePartners,
  updateCelebration,
} from "~/models/celebrations";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { AdminGuard } from "~/components/features/AdminGuard";

export const Route = createFileRoute("/app/admin/celebrations")({
  component: AdminCelebrationsPageWrapper,
});

function AdminCelebrationsPageWrapper() {
  return (
    <AdminGuard>
      <AdminCelebrationsPage />
    </AdminGuard>
  );
}

function AdminCelebrationsPage() {
  const { person, partners } = useAppContext();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const createFormId = useId();
  const [editingCelebration, setEditingCelebration] =
    useState<Celebration | null>(null);

  const activePartners = useMemo(
    () =>
      partners
        .filter((partner) => !partner.archived)
        .sort((a, b) => a.title.localeCompare(b.title, "pt-BR")),
    [partners],
  );
  const activePartnerIds = useMemo(
    () => activePartners.map((partner) => partner.id),
    [activePartners],
  );

  const {
    data: celebrations = [],
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.celebrations(person.user_id),
    queryFn: () => getAllCelebrations(supabase),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteCelebration(supabase, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["celebrations"],
      });
    },
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date(),
  );
  const [title, setTitle] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const savingRef = useRef(false);
  const persistedCelebrationRef = useRef<Celebration | null>(null);

  const isSubmitting = isCreating || deleteMutation.isPending;
  const hasDraftChanges =
    title.trim().length > 0 ||
    isHoliday ||
    selectedPartnerIds.length > 0 ||
    createError !== null ||
    persistedCelebrationRef.current !== null;

  const resetCreateForm = () => {
    setTitle("");
    setIsHoliday(false);
    setSelectedPartnerIds([]);
    setCreateError(null);
    setSelectedDate(new Date());
    persistedCelebrationRef.current = null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current || !title.trim() || !selectedDate) return;

    savingRef.current = true;
    setIsCreating(true);
    setCreateError(null);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const existing = persistedCelebrationRef.current;

    try {
      const saved = existing
        ? await updateCelebration(
            supabase,
            existing.id,
            title.trim(),
            formattedDate,
            isHoliday,
          )
        : await createCelebration(
            supabase,
            title.trim(),
            formattedDate,
            isHoliday,
          );
      persistedCelebrationRef.current = saved;

      const celebrationsKey = QUERY_KEYS.celebrations(person.user_id);
      queryClient.setQueryData<Celebration[]>(celebrationsKey, (current) =>
        current
          ? [...current.filter((item) => item.id !== saved.id), saved].sort(
              (a, b) => a.date.localeCompare(b.date),
            )
          : undefined,
      );

      if (existing !== null || selectedPartnerIds.length > 0) {
        const syncResult = await syncCelebrationActivePartners(
          supabase,
          saved.id,
          activePartnerIds,
          selectedPartnerIds,
        );
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.celebrationPartners(saved.id),
        });
        for (const partnerId of [...syncResult.added, ...syncResult.removed]) {
          void queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.partnerHolidays(partnerId),
          });
        }
      }

      void queryClient.invalidateQueries({ queryKey: ["celebrations"] });
      toast.success("Data comemorativa criada.");
      resetCreateForm();
    } catch {
      if (persistedCelebrationRef.current) {
        setCreateError(
          "A data foi salva, mas não foi possível vincular os parceiros. Tente novamente.",
        );
      } else {
        setCreateError(
          "Não foi possível criar a data comemorativa. Tente novamente.",
        );
      }
    } finally {
      savingRef.current = false;
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl shrink-0 flex-col md:h-[calc(100vh-68px)] md:flex-row md:overflow-hidden">
      {/* Coluna da Esquerda: Adicionar Novo */}
      <div className="flex w-full shrink-0 flex-col gap-5 p-8 md:h-full md:w-96 md:overflow-y-auto">
        <div>
          <h1 className="pb-2 text-3xl font-bold">Datas Comemorativas</h1>
          <p className="text-base text-secondary-foreground">
            Gerencie feriados e datas importantes que aparecerão no
            planejamento.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <I18nProvider locale="pt-BR">
              <PrismCalendar
                aria-label="Data"
                captionLayout="dropdown"
                className="w-full bg-transparent **:data-outside-month:invisible [&_[data-today]>div]:after:absolute [&_[data-today]>div]:after:bottom-1 [&_[data-today]>div]:after:size-1 [&_[data-today]>div]:after:rounded-full [&_[data-today]>div]:after:bg-current [&_td>div]:aspect-auto [&_td>div>div]:mx-auto [&_td>div>div]:size-(--cell-size)"
                isDisabled={isSubmitting}
                onChange={(day) => {
                  if (day)
                    setSelectedDate(new Date(day.year, day.month - 1, day.day));
                }}
                value={
                  selectedDate
                    ? new CalendarDate(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                        selectedDate.getDate(),
                      )
                    : undefined
                }
              />
            </I18nProvider>

            <form
              id={createFormId}
              className="flex w-full flex-col gap-3"
              onSubmit={handleCreate}
            >
              <PrismInput
                aria-label="Nome do feriado/data"
                disabled={!selectedDate || isSubmitting}
                name="title"
                onChange={(e) => {
                  setTitle(e.target.value);
                  setCreateError(null);
                }}
                placeholder="Nome do feriado/data"
                required
                value={title}
              />
              <div className="flex items-center justify-between px-1">
                <PrismCheckbox
                  isSelected={isHoliday}
                  onChange={setIsHoliday}
                  isDisabled={!selectedDate || isSubmitting}
                >
                  <span className="text-sm font-medium">É feriado</span>
                </PrismCheckbox>
              </div>
              {createError && (
                <p role="alert" className="text-base text-error">
                  {createError}
                </p>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                {hasDraftChanges && (
                  <PrismButton
                    type="button"
                    variant="ghost"
                    isDisabled={isSubmitting}
                    onPress={resetCreateForm}
                  >
                    Cancelar
                  </PrismButton>
                )}
                <PrismButton
                  isDisabled={!selectedDate || isSubmitting || !title.trim()}
                  type="submit"
                >
                  {isCreating ? (
                    <>
                      Adicionando...
                      <ULoader size="sm" inheritColor />
                    </>
                  ) : (
                    <>
                      Adicionar data
                      <PlusIcon />
                    </>
                  )}
                </PrismButton>
              </div>
            </form>
          </div>

          <div className="flex flex-col border-t border-border pt-4">
            <UCelebrationPartnersSelector
              partners={activePartners}
              selectedIds={selectedPartnerIds}
              onChange={setSelectedPartnerIds}
              isDisabled={isSubmitting}
            />
          </div>
        </div>
        <AppBarSpacer className="hidden md:block" />
      </div>

      {isLoading ? (
        <p
          className="p-8 text-center text-sm text-secondary-foreground"
          role="status"
        >
          Carregando datas comemorativas…
        </p>
      ) : isError ? (
        <div
          className="flex w-full flex-col items-center justify-center gap-3 p-8"
          role="alert"
        >
          <p className="text-base text-error">
            Não foi possível carregar as datas comemorativas.
          </p>
          <PrismButton onPress={() => void refetch()} size="sm">
            Tentar novamente
          </PrismButton>
        </div>
      ) : isSuccess ? (
        <CelebrationsList
          celebrations={celebrations}
          isSubmitting={isSubmitting}
          onDelete={(id) => deleteMutation.mutate(id)}
          onEdit={setEditingCelebration}
        />
      ) : null}
      {editingCelebration && (
        <CelebrationDialog
          key={editingCelebration.id}
          celebration={editingCelebration}
          onClose={() => setEditingCelebration(null)}
        />
      )}
    </div>
  );
}

export function CelebrationsList({
  celebrations,
  isSubmitting,
  onDelete,
  onEdit,
}: {
  celebrations: Celebration[];
  isSubmitting: boolean;
  onDelete: (id: string) => void;
  onEdit: (celebration: Celebration) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const isDesktop = useIsDesktop(768);

  useEffect(() => {
    const list = listRef.current;
    if (!isDesktop || !list || hasScrolled.current || celebrations.length === 0)
      return;
    const currentMonth = format(new Date(), "yyyy-MM");
    const month = list.querySelector<HTMLElement>(
      `[data-month="${currentMonth}"]`,
    );
    hasScrolled.current = true;
    if (!month) return;
    const padding = Number.parseFloat(getComputedStyle(list).paddingTop) || 0;
    list.scrollTop +=
      month.getBoundingClientRect().top -
      list.getBoundingClientRect().top -
      padding;
  }, [celebrations, isDesktop]);

  return (
    <div
      ref={listRef}
      className="flex w-full shrink-0 flex-col gap-4 p-8 md:h-full md:shrink md:overflow-y-auto"
    >
      {celebrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-secondary-foreground squircle">
          Nenhuma data comemorativa cadastrada ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(
            celebrations.reduce(
              (acc, celebration) => {
                const date = new Date(`${celebration.date}T00:00:00`);
                const month = format(date, "MMMM 'de' yyyy", {
                  locale: ptBR,
                });
                if (!acc[month]) acc[month] = [];
                acc[month].push(celebration);
                return acc;
              },
              {} as Record<string, typeof celebrations>,
            ),
          ).map(([month, monthCelebrations]) => (
            <div
              key={month}
              className="flex flex-col"
              data-month={monthCelebrations[0]?.date.slice(0, 7)}
            >
              <h3 className="mb-3 pb-2 text-2xl first-letter:capitalize">
                {month}
              </h3>
              <div className="flex flex-col gap-1">
                {monthCelebrations.map((celebration) => (
                  <div
                    key={celebration.id}
                    data-celebration-id={celebration.id}
                    className="group flex items-center justify-between gap-4 rounded-xl px-3 py-2 transition-colors squircle hover:bg-secondary"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-6 shrink-0 text-center text-sm font-medium text-secondary-foreground">
                        {format(new Date(`${celebration.date}T00:00:00`), "dd")}
                      </span>
                      <span className="truncate font-medium tracking-tight">
                        {celebration.title}
                      </span>
                      {celebration.is_holiday && (
                        <PrismBadge variant="warning">Feriado</PrismBadge>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:[@media(hover:hover)_and_(pointer:fine)]:opacity-0 md:[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100 md:[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100">
                      <PrismButton
                        aria-label={`Editar ${celebration.title}`}
                        isDisabled={isSubmitting}
                        onClick={() => onEdit(celebration)}
                        size="icon-xs"
                        variant="ghost"
                      >
                        <PencilIcon />
                      </PrismButton>
                      <PrismButton
                        aria-label={`Apagar ${celebration.title}`}
                        isDisabled={isSubmitting}
                        onClick={() => onDelete(celebration.id)}
                        size="icon-xs"
                        variant="error"
                      >
                        <TrashIcon />
                      </PrismButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <AppBarSpacer />
    </div>
  );
}
