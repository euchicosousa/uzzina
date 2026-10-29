import { I18nProvider } from "react-aria";
import { CalendarDate, parseDate } from "@internationalized/date";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
  PrismButton,
  PrismCalendar,
  PrismDialog,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismInput,
  PrismLabel,
} from "~/components/prism";
import { useAppContext } from "~/contexts/AppContext";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { createCelebration, updateCelebration } from "~/models/celebrations";
import type { Celebration } from "~/types";

export function CelebrationDialog({
  celebration,
  onClose,
}: {
  celebration?: Celebration;
  onClose: () => void;
}) {
  const { person } = useAppContext();
  const client = useQueryClient();
  const titleId = useId();
  const dateLabelId = useId();
  const titleErrorId = useId();
  const formId = useId();
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const saving = useRef(false);
  const mounted = useRef(true);
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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving.current || !isCurrent()) return;
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
    try {
      const supabase = createSupabaseBrowserClient();
      const created = celebration
        ? await updateCelebration(
            supabase,
            celebration.id,
            title.trim(),
            date.toString(),
          )
        : await createCelebration(supabase, title.trim(), date.toString());
      if (!isCurrent()) return;
      const key = QUERY_KEYS.celebrations(userId);
      client.setQueryData<Celebration[]>(key, (current) =>
        current
          ? [...current.filter((item) => item.id !== created.id), created].sort(
              (a, b) => a.date.localeCompare(b.date),
            )
          : undefined,
      );
      void client.invalidateQueries({ queryKey: key });
      toast.success(
        celebration
          ? "Data comemorativa atualizada."
          : "Data comemorativa criada.",
      );
      onClose();
    } catch {
      if (isCurrent())
        setError(
          celebration
            ? "Não foi possível atualizar a data comemorativa. Tente novamente."
            : "Não foi possível criar a data comemorativa. Tente novamente.",
        );
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
      className="overflow-hidden sm:max-w-sm"
      isOpen
      isDismissable={!pending}
      isKeyboardDismissDisabled={pending}
      onOpenChange={(open) => {
        if (!open && !saving.current) onClose();
      }}
      showCloseButton={false}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
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
          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 pb-2">
            <form
              id={formId}
              className="grid gap-2"
              noValidate
              onSubmit={submit}
            >
              <PrismLabel htmlFor={titleId}>Título</PrismLabel>
              <PrismInput
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
                  className="text-sm text-error"
                >
                  {titleError}
                </p>
              )}
            </form>
            <div className="grid gap-2">
              <PrismLabel elementType="span" id={dateLabelId}>
                Data
              </PrismLabel>
              {/* The grid spans the dialog width while each day keeps a fixed
                  square, so the calendar fills the space without oversized
                  rows; today gets a dot so it stays distinct from the
                  selected day, and days of other months (not selectable)
                  are hidden while keeping their space. */}
              <I18nProvider locale="pt-BR">
                <PrismCalendar
                  aria-labelledby={dateLabelId}
                  captionLayout="dropdown"
                  className="w-full bg-transparent [--cell-size:--spacing(9)] [&_[data-outside-month]]:invisible [&_[data-today]>div]:after:absolute [&_[data-today]>div]:after:bottom-1 [&_[data-today]>div]:after:size-1 [&_[data-today]>div]:after:rounded-full [&_[data-today]>div]:after:bg-current [&_td>div]:aspect-auto [&_td>div>div]:mx-auto [&_td>div>div]:size-(--cell-size)"
                  value={date}
                  onChange={setDate}
                  isDisabled={pending}
                />
              </I18nProvider>
            </div>
            {error && (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            )}
          </div>
          <PrismDialogFooter className="shrink-0 flex-row justify-end py-3">
            <PrismButton
              type="button"
              variant="ghost"
              isDisabled={pending}
              onClick={onClose}
            >
              Cancelar
            </PrismButton>
            <PrismButton type="submit" form={formId} isDisabled={pending}>
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
