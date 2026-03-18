import { eachMonthOfInterval, endOfYear, format, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  Form,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  createCelebration,
  deleteCelebration,
  getAllCelebrations,
  type Celebration,
} from "~/models/celebrations.server";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Admin | Datas Comemorativas" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const celebrations = await getAllCelebrations(supabase);

  invariant(celebrations, "Celebrations not found");

  return { celebrations };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;

    if (title && date) {
      await createCelebration(supabase, title, date);
    }
  } else if (intent === "delete") {
    const id = formData.get("id") as string;
    if (id) {
      await deleteCelebration(supabase, id);
    }
  }

  return { success: true };
};

export default function AdminCelebrationsPage() {
  const { celebrations } = useLoaderData<typeof loader>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const isAdding =
    isSubmitting && navigation.formData?.get("intent") === "create";

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
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            locale={ptBR}
          />

          <Form method="post" className="flex w-full flex-col gap-4">
            <input type="hidden" name="intent" value="create" />
            <input
              type="hidden"
              name="date"
              value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            />

            <div className="flex w-full items-center gap-2">
              <Input
                name="title"
                placeholder="Nome do feriado/data"
                required
                disabled={!selectedDate || isSubmitting}
                className="squircle rounded-2xl"
              />
              <Button
                type="submit"
                disabled={!selectedDate || isSubmitting}
                className="squircle shrink-0 rounded-2xl"
                size="icon"
              >
                {isAdding ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <PlusIcon />
                )}
              </Button>
            </div>
          </Form>
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
                  const date = new Date(celebration.date + "T00:00:00");
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
                id={`#${format(month, "MMM", { locale: ptBR })}`}
              >
                <h3 className="mb-3 pb-2 text-2xl first-letter:capitalize">
                  {month}
                </h3>
                <div className="flex flex-col gap-1">
                  {monthCelebrations.map((celebration) => (
                    <div
                      key={celebration.id}
                      className="group hover:bg-muted/50 flex items-center justify-between rounded-xl p-2 px-3 transition-colors"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <span className="text-muted-foreground w-6 text-center text-sm font-medium">
                          {format(
                            new Date(celebration.date + "T00:00:00"),
                            "dd",
                          )}
                        </span>
                        <span className="truncate font-medium tracking-tight">
                          {celebration.title}
                        </span>
                      </div>

                      <Form
                        method="post"
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                      >
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={celebration.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8 rounded-full"
                          disabled={isSubmitting}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </Form>
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
