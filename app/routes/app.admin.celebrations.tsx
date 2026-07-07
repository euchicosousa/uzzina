import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import type { MetaFunction } from "react-router";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  createCelebration,
  deleteCelebration,
  getAllCelebrations,
} from "~/models/celebrations";
export const meta: MetaFunction = () => {
  return [
    {
      title: "Admin | Datas Comemorativas",
    },
  ];
};
export default function AdminCelebrationsPage() {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const { data: celebrations = [] } = useQuery({
    queryKey: ["celebrations"],
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
          <Calendar
            className="w-full"
            locale={ptBR}
            mode="single"
            onSelect={setSelectedDate}
            selected={selectedDate}
          />

          <form className="flex w-full flex-col gap-4" onSubmit={handleCreate}>
            <div className="flex w-full items-center gap-2">
              <Input
                disabled={!selectedDate || isSubmitting}
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do feriado/data"
                required
                value={title}
                variant="inset"
              />
              <Button
                className="squircle shrink-0 rounded-2xl"
                disabled={!selectedDate || isSubmitting}
                size="icon"
                type="submit"
              >
                {isAdding ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <PlusIcon />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Coluna da Direita: Lista */}
      <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-8 md:w-full">
        {/* <div className="flex justify-between border-b md:grid-cols-6">
          {eachMonthOfInterval({
            start: startOfYear(new Date()),
            end: endOfYear(new Date()),
          }).map((month) => (
            <a
              key={month.toISOString()}
              href={`#${format(month, "MMM", { locale: ptBR })}`}
              className="p-2 text-sm font-semibold tracking-wide uppercase"
            >
              {format(month, "MMM", { locale: ptBR })}
            </a>
          ))}
         </div> */}

        {celebrations.length === 0 ? (
          <div className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center">
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
                id={`#${format(month, "MMM", {
                  locale: ptBR,
                })}`}
              >
                <h3 className="mb-3 pb-2 text-2xl first-letter:capitalize">
                  {month}
                </h3>
                <div className="flex flex-col gap-1">
                  {monthCelebrations.map((celebration) => (
                    <div
                      key={celebration.id}
                      className="group flex relative items-center justify-between rounded-xl py-2 px-3 transition-colors hover:bg-card"
                    >
                      <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 absolute h-full top-1 left-1">
                        <Button
                          disabled={isSubmitting}
                          onClick={() => deleteMutation.mutate(celebration.id)}
                          size="icon-sm"
                          variant="destructive"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 overflow-hidden">
                        <span className="text-muted-foreground w-6 text-center text-sm font-medium group-hover:opacity-0 transition-opacity">
                          {format(
                            new Date(`${celebration.date}T00:00:00`),
                            "dd",
                          )}
                        </span>

                        <span className="truncate font-medium tracking-tight">
                          {celebration.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
