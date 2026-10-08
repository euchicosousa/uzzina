import { useQuery } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { useAppContext } from "~/contexts/AppContext";
import { CATEGORIES, PHASES, PRIORITIES } from "~/lib/CONSTANTS";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
import type { Action, Partner, Person } from "~/types";
import { parseU } from "~/utils/date";
import { parseStrategies } from "~/utils/format";
import { sanitizeHtml } from "~/utils/sanitize";

const FIELD_LABELS: Record<string, string> = {
  title: "Título",
  date: "Data",
  description: "Descrição",
  content_description: "Conteúdo",
  instagram_caption: "Legenda",
  partners: "Parceiros",
  responsibles: "Responsáveis",
  phase: "Estado",
  category: "Tipo",
  priority: "Prioridade",
  strategies: "Estratégias",
  sprints: "Foco",
  content_files: "Arquivos do conteúdo",
  work_files: "Arquivos de trabalho",
  color: "Cor",
  time: "Tempo",
  archived: "Arquivamento",
};
type ComparisonNames = {
  partners?: Pick<Partner, "slug" | "title">[];
  people?: Pick<Person, "user_id" | "name" | "surname">[];
};
export function formatConflictValue(
  field: string,
  value: unknown,
  names: ComparisonNames = {},
): string {
  if (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
    return "Vazio";
  if (field === "date" && typeof value === "string") {
    const date = parseU(value);
    return isValid(date)
      ? format(date, "dd/MM/yyyy 'às' HH'h'mm")
      : "Data inválida";
  }
  const labels =
    field === "phase"
      ? PHASES
      : field === "category"
        ? CATEGORIES
        : field === "priority"
          ? PRIORITIES
          : null;
  if (labels && typeof value === "string") {
    return (
      Object.values(labels).find((item) => item.slug === value)?.title ?? value
    );
  }
  if (field === "archived" && typeof value === "boolean")
    return value ? "Sim" : "Não";
  if (field === "time" && typeof value === "number")
    return `${value} ${value === 1 ? "minuto" : "minutos"}`;
  if (field === "strategies") {
    return (
      parseStrategies(value)
        .map((item) =>
          [
            `${item.selected ? "Selecionada: " : ""}${item.headline}`,
            item.angulo,
            `Racional: ${item.racional}`,
            `Direcionamento: ${item.direcionamento}`,
          ].join("\n"),
        )
        .join("\n\n") || "Vazio"
    );
  }
  if (Array.isArray(value))
    return value
      .map((item) => {
        if (typeof item !== "string") return String(item);
        if (field === "partners")
          return (
            names.partners?.find((partner) => partner.slug === item)?.title ??
            item
          );
        if (field === "responsibles" || field === "sprints") {
          const person = names.people?.find(
            (person) => person.user_id === item,
          );
          return person
            ? [person.name, person.surname].filter(Boolean).join(" ")
            : `Pessoa indisponível: ${item}`;
        }
        if (field === "content_files" || field === "work_files") {
          try {
            return decodeURIComponent(
              new URL(item).pathname.split("/").pop() || item,
            );
          } catch {
            return item;
          }
        }
        return item;
      })
      .join("\n");
  return typeof value === "string" ? value : (JSON.stringify(value) ?? "Vazio");
}

export function ConflictComparison({
  latest,
  pending,
}: {
  latest: Action;
  pending: Record<string, unknown>;
}) {
  const { person, partners } = useAppContext();
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(person.user_id),
    queryFn: fetchPeople,
    staleTime: 30 * 60 * 1000,
  });
  const fields = Object.keys(pending);
  const current = latest as unknown as Record<string, unknown>;
  return (
    <div
      className="grid grid-cols-2 gap-2 px-5 sm:gap-4"
      data-testid="conflict-comparison"
    >
      {[
        { title: "Versão atual", values: current },
        { title: "Sua edição", values: pending },
      ].map((column) => (
        <section
          aria-label={column.title}
          className="min-w-0 rounded-xl border border-border"
          key={column.title}
        >
          <h3 className="border-b border-border px-3 py-3 text-sm font-semibold sm:text-base">
            {column.title}
          </h3>
          <div
            className="max-h-[48dvh] overflow-y-auto overscroll-contain px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
            tabIndex={0}
            aria-label={`Campos de ${column.title.toLowerCase()}`}
          >
            <dl className="divide-y divide-border">
              {fields.map((field) => {
                const value = column.values[field];
                const richText =
                  ["description", "content_description"].includes(field) &&
                  typeof value === "string" &&
                  /<\/?[a-z][^>]*>/i.test(value);
                return (
                  <div className="py-3" key={field}>
                    <dt className="mb-2 text-xs font-medium text-muted-foreground">
                      {FIELD_LABELS[field] || "Campo alterado"}
                    </dt>
                    <dd className="m-0 text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap">
                      {richText ? (
                        <div
                          className="overflow-x-auto [&_h1]:text-base [&_h2]:text-base [&_h3]:text-base [&_h4]:text-base [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-4"
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with the existing central sanitizer.
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(value),
                          }}
                        />
                      ) : (
                        formatConflictValue(field, value, { partners, people })
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
      ))}
    </div>
  );
}
