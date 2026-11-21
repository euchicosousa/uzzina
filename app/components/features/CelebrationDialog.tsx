import { CalendarDate, parseDate } from "@internationalized/date";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { I18nProvider } from "react-aria";
import { toast } from "sonner";
import {
  PrismButton,
  PrismCalendar,
  PrismCheckbox,
  PrismDialog,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismInput,
} from "~/components/prism";
import { UCelebrationPartnersSelector } from "~/components/uzzina/UCelebrationPartnersSelector";
import { useAppContext } from "~/contexts/AppContext";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  createCelebration,
  getCelebrationPartnerIds,
  syncCelebrationActivePartners,
  updateCelebration,
} from "~/models/celebrations";
import type { Celebration } from "~/types";

function hasSameIdSet(left: string[], right: string[]): boolean {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  if (leftSet.size !== rightSet.size) return false;
  for (const id of leftSet) {
    if (!rightSet.has(id)) return false;
  }
  return true;
}

export function CelebrationDialog({
  celebration,
  onClose,
}: {
  celebration?: Celebration;
  onClose: () => void;
}) {
  const { person, partners } = useAppContext();
  const client = useQueryClient();
  const titleId = useId();
  const titleErrorId = useId();
  const formId = useId();

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
  const activePartnerIdSet = useMemo(
    () => new Set(activePartnerIds),
    [activePartnerIds],
  );

  const [title, setTitle] = useState(celebration?.title ?? "");
  const [date, setDate] = useState<CalendarDate | null>(() => {
    if (celebration) return parseDate(celebration.date);
    const now = new Date();
    return new CalendarDate(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );
  });
  const [isHoliday, setIsHoliday] = useState(celebration?.is_holiday ?? false);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const saving = useRef(false);
  const mounted = useRef(true);
  const persistedCelebrationRef = useRef<Celebration | null>(
    celebration ?? null,
  );
  const initializedPartnersRef = useRef(false);
  const initialSelectedActivePartnersRef = useRef<string[]>([]);
  const identity = useRef(person);
  identity.current = person;
  const generation = useRef(getQuerySessionGeneration(client)).current;
  const userId = person.user_id;

  const isCurrent = () =>
    mounted.current &&
    identity.current.user_id === userId &&
    identity.current.admin &&
    getQuerySessionGeneration(client) === generation;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const {
    data: loadedPartnerIds,
    isLoading: isLoadingPartners,
    isError: isPartnersError,
    refetch: refetchPartners,
  } = useQuery({
    queryKey: QUERY_KEYS.celebrationPartners(celebration?.id ?? ""),
    queryFn: async () => {
      if (!celebration) return [];
      const supabase = createSupabaseBrowserClient();
      return getCelebrationPartnerIds(supabase, celebration.id);
    },
    enabled: Boolean(celebration) && person.admin,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!celebration || !loadedPartnerIds || initializedPartnersRef.current) {
      return;
    }
    initializedPartnersRef.current = true;
    const activeLinked = loadedPartnerIds.filter((id) =>
      activePartnerIdSet.has(id),
    );
    initialSelectedActivePartnersRef.current = activeLinked;
    setSelectedPartnerIds(activeLinked);
  }, [celebration, loadedPartnerIds, activePartnerIdSet]);

  const isSubmitBlocked =
    pending || (Boolean(celebration) && (isLoadingPartners || isPartnersError));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving.current || isSubmitBlocked || !isCurrent()) return;
    if (!title.trim()) {
      setTitleError("Informe um título para a data.");
      event.currentTarget
        .querySelector<HTMLInputElement>('input[name="title"]')
        ?.focus();
      return;
    }
    if (!date) {
      setError("Selecione uma data no calendário.");
      return;
    }
    saving.current = true;
    setPending(true);
    setError(null);
    const existing = persistedCelebrationRef.current;
    try {
      const supabase = createSupabaseBrowserClient();
      const saved = existing
        ? await updateCelebration(
            supabase,
            existing.id,
            title.trim(),
            date.toString(),
            isHoliday,
          )
        : await createCelebration(
            supabase,
            title.trim(),
            date.toString(),
            isHoliday,
          );
      persistedCelebrationRef.current = saved;
      if (!isCurrent()) return;

      const key = QUERY_KEYS.celebrations(userId);
      client.setQueryData<Celebration[]>(key, (current) =>
        current
          ? [...current.filter((item) => item.id !== saved.id), saved].sort(
              (a, b) => a.date.localeCompare(b.date),
            )
          : undefined,
      );

      const partnersChanged = celebration
        ? !hasSameIdSet(
            selectedPartnerIds,
            initialSelectedActivePartnersRef.current,
          )
        : existing !== null || selectedPartnerIds.length > 0;

      if (partnersChanged) {
        const syncResult = await syncCelebrationActivePartners(
          supabase,
          saved.id,
          activePartnerIds,
          selectedPartnerIds,
        );
        if (!isCurrent()) return;
        initialSelectedActivePartnersRef.current = syncResult.linkedActiveIds;
        void client.invalidateQueries({
          queryKey: QUERY_KEYS.celebrationPartners(saved.id),
        });
        for (const partnerId of [...syncResult.added, ...syncResult.removed]) {
          void client.invalidateQueries({
            queryKey: QUERY_KEYS.partnerHolidays(partnerId),
          });
        }
      }

      void client.invalidateQueries({ queryKey: key });
      toast.success(
        celebration
          ? "Data comemorativa atualizada."
          : "Data comemorativa criada.",
      );
      onClose();
    } catch (err: unknown) {
      if (isCurrent()) {
        const pgError = err as { code?: string; message?: string };
        if (pgError?.code === "23503") {
          setError(
            "Não é possível desclassificar este feriado pois ele está associado a uma ou mais marcas. Remova a associação na gestão do parceiro primeiro.",
          );
        } else if (!celebration && persistedCelebrationRef.current) {
          setError(
            "A data foi salva, mas não foi possível vincular os parceiros. Tente novamente.",
          );
        } else {
          setError(
            celebration
              ? "Não foi possível atualizar a data comemorativa. Tente novamente."
              : "Não foi possível criar a data comemorativa. Tente novamente.",
          );
        }
      }
    } finally {
      if (isCurrent()) {
        saving.current = false;
        setPending(false);
      }
    }
  };

  if (!person.admin) return null;

  return (
    <PrismDialog
      className="flex flex-col overflow-hidden"
      size="xl"
      isOpen
      isDismissable={!pending}
      isKeyboardDismissDisabled={pending}
      onOpenChange={(open) => {
        if (!open && !saving.current) onClose();
      }}
      showCloseButton={false}
    >
      <div className="flex min-h-0 flex-col">
        <PrismDialogHeader className="shrink-0">
          <PrismDialogTitle>
            {celebration
              ? "Editar data comemorativa"
              : "Criar data comemorativa"}
          </PrismDialogTitle>
        </PrismDialogHeader>
        {/* Only the title lives in the form: the calendar renders a visually
            hidden button without a type, which would otherwise become the
            default button and move the month when Enter submits. */}

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-5 py-1 md:grid-cols-[minmax(0,19.5rem)_minmax(0,1fr)]">
            <div className="flex flex-col gap-4">
              <form
                id={formId}
                className="grid gap-2"
                noValidate
                onSubmit={submit}
              >
                <PrismInput
                  aria-label="Título"
                  autoFocus
                  id={titleId}
                  name="title"
                  required
                  disabled={pending}
                  value={title}
                  aria-invalid={titleError ? true : undefined}
                  aria-describedby={titleError ? titleErrorId : undefined}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setTitleError(null);
                  }}
                />
                {titleError && (
                  <p
                    id={titleErrorId}
                    role="alert"
                    className="text-base text-error"
                  >
                    {titleError}
                  </p>
                )}
              </form>
              <div className="pt-1">
                <PrismCheckbox
                  isSelected={isHoliday}
                  onChange={setIsHoliday}
                  isDisabled={pending}
                >
                  <span className="text-sm font-medium">É feriado</span>
                </PrismCheckbox>
              </div>
              <div className="grid gap-2">
                {/* The grid spans the dialog width while each day keeps a fixed
                    square, so the calendar fills the space without oversized
                    rows; today gets a dot so it stays distinct from the
                    selected day, and days of other months (not selectable)
                    are hidden while keeping their space. */}
                <I18nProvider locale="pt-BR">
                  <PrismCalendar
                    aria-label="Data"
                    captionLayout="dropdown"
                    className="w-full bg-transparent **:data-outside-month:invisible [&_[data-today]>div]:after:absolute [&_[data-today]>div]:after:bottom-1 [&_[data-today]>div]:after:size-1 [&_[data-today]>div]:after:rounded-full [&_[data-today]>div]:after:bg-current [&_td>div]:aspect-auto [&_td>div>div]:mx-auto [&_td>div>div]:size-(--cell-size)"
                    value={date}
                    onChange={setDate}
                    isDisabled={pending}
                  />
                </I18nProvider>
              </div>
            </div>

            <div className="flex min-h-0 flex-col border-t border-border pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
              <UCelebrationPartnersSelector
                partners={activePartners}
                selectedIds={selectedPartnerIds}
                onChange={setSelectedPartnerIds}
                isLoading={Boolean(celebration) && isLoadingPartners}
                loadError={
                  celebration && isPartnersError
                    ? "Não foi possível carregar os parceiros vinculados."
                    : null
                }
                onRetryLoad={() => void refetchPartners()}
                isDisabled={pending}
                listClassName="md:max-h-[340px] md:overflow-y-auto"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="shrink-0 px-5 pt-2 text-base text-error">
              {error}
            </p>
          )}

          <PrismDialogFooter className="shrink-0 flex-row justify-end py-3">
            <PrismButton
              type="button"
              variant="ghost"
              isDisabled={pending}
              onClick={onClose}
            >
              Cancelar
            </PrismButton>
            <PrismButton
              type="submit"
              form={formId}
              isDisabled={isSubmitBlocked}
            >
              {pending
                ? celebration
                  ? "Salvando..."
                  : "Criando..."
                : celebration
                  ? "Salvar alterações"
                  : "Criar data"}
            </PrismButton>
          </PrismDialogFooter>
        </div>
      </div>
    </PrismDialog>
  );
}
