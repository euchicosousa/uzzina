import { CelebrationDialog } from "~/components/features/CelebrationDialog";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { useAppContext } from "~/contexts/AppContext";
import { CalendarDate } from "@internationalized/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Celebration } from "~/types";
import { PrismButton, PrismCalendar, PrismInput } from "~/components/prism";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  createCelebration,
  deleteCelebration,
  getAllCelebrations,
} from "~/models/celebrations";
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
  const { person } = useAppContext();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const [editingCelebration, setEditingCelebration] =
    useState<Celebration | null>(null);
  const { data: celebrations = [] } = useQuery({
    queryKey: ["celebrations", "team", person.user_id],
    queryFn: () => getAllCelebrations(supabase),
  });
  const createMutation = useMutation({
    mutationFn: async ({ title, date }: { title: string; date: string }) => {
      await createCelebration(supabase, title, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["celebrations"],
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteCelebration(supabase, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["celebrations"],
      });
    },
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [title, setTitle] = useState("");
  const isSubmitting = createMutation.isPending || deleteMutation.isPending;
  const isAdding = createMutation.isPending;
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedDate) return;
    await createMutation.mutateAsync({
      title,
      date: format(selectedDate, "yyyy-MM-dd"),
    });
    setTitle("");
  };
  return (
    <div className="page-height mx-auto flex w-full max-w-7xl flex-col overflow-y-auto md:flex-row md:overflow-hidden">
      {/* Coluna da Esquerda: Adicionar Novo */}
      <div className="flex h-full w-full shrink-0 flex-col gap-4 p-8 md:w-96">
        <div>
          <h1 className="pb-2 text-3xl font-bold">Datas Comemorativas</h1>
          <p className="text-muted-foreground">
            Gerencie feriados e datas importantes que aparecerão no
            planejamento.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <PrismCalendar
            className="w-full"
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

          <form className="flex w-full flex-col gap-4" onSubmit={handleCreate}>
            <div className="flex w-full items-center gap-2">
              <PrismInput
                disabled={!selectedDate || isSubmitting}
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do feriado/data"
                required
                value={title}
              />
              <PrismButton
                className="shrink-0 rounded-2xl squircle"
                isDisabled={!selectedDate || isSubmitting}
                size="icon"
                type="submit"
              >
                {isAdding ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <PlusIcon />
                )}
              </PrismButton>
            </div>
          </form>
        </div>
      </div>

      <CelebrationsList
        celebrations={celebrations}
        isSubmitting={isSubmitting}
        onDelete={(id) => deleteMutation.mutate(id)}
        onEdit={setEditingCelebration}
      />
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

  useEffect(() => {
    const list = listRef.current;
    if (!list || hasScrolled.current || celebrations.length === 0) return;
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
  }, [celebrations]);

  return (
    <div
      ref={listRef}
      className="flex h-full w-full shrink-0 flex-col gap-4 overflow-y-auto p-8 md:w-full md:shrink"
    >
      {celebrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
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
                    className="group flex items-center justify-between gap-4 rounded-xl px-3 py-2 transition-colors hover:bg-card"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="w-6 shrink-0 text-center text-sm font-medium text-muted-foreground">
                        {format(new Date(`${celebration.date}T00:00:00`), "dd")}
                      </span>
                      <span className="truncate font-medium tracking-tight">
                        {celebration.title}
                      </span>
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
                        variant="destructive"
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
