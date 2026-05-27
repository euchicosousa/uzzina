import { CheckIcon } from "lucide-react";
import { Fragment, useState } from "react";
import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => [
  { title: "Programação Semanal | Uzzina" },
];

// Domingo = 0, Segunda = 1, ..., Sábado = 6
const diaKeyOrder = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
const realTodayKey = diaKeyOrder[new Date().getDay()];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);

  const { data: partners } = await supabase
    .from("partners")
    .select("id, title, slug")
    .eq("archived", false)
    .order("title", { ascending: true });

  return { partners: partners ?? [] };
};

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Dia = {
  key: string;
  label: string;
  /** slugs dos parceiros presentes neste dia */
  presenca: string[];
};

// ─── Dados fictícios (slugs) ─────────────────────────────────────────────────

const semana: Dia[] = [
  {
    key: "dom",
    label: "Dom",
    presenca: [
      "blushfitt",
      "cali.pizza.holiday",
      "toroburgerandbeer",
      "parksobral",
    ],
  },
  {
    key: "seg",
    label: "Seg",
    presenca: [
      "blushfitt",
      "agenciacnvt",
      "euchicosousa",
      "brendavasconcelos",
      "clinicadengo",
      "clinicaunivetsobral",
      "dramargaridacarneiro",
      "draiaratomaz",
      "lumatorremarques",
      "hospitaldrthomazcorrea",
      "smartmed_massape",
      "videresaude",
    ],
  },
  {
    key: "ter",
    label: "Ter",
    presenca: [
      "blushfitt",
      "cali.pizza.holiday",
      "toroburgerandbeer",
      "parksobral",
      "draanaliarocha",
    ],
  },
  {
    key: "qua",
    label: "Qua",
    presenca: [
      "blushfitt",
      "cali.pizza.holiday",
      "toroburgerandbeer",
      "parksobral",
      "agenciacnvt",
      "euchicosousa",
      "brendavasconcelos",
      "clinicadengo",
      "clinicaunivetsobral",
      "dramargaridacarneiro",
      "draiaratomaz",
      "lumatorremarques",
      "hospitaldrthomazcorrea",
      "smartmed_massape",
      "videresaude",
    ],
  },
  {
    key: "qui",
    label: "Qui",
    presenca: [
      "blushfitt",
      "cali.pizza.holiday",
      "toroburgerandbeer",
      "parksobral",
      "draanaliarocha",
    ],
  },
  {
    key: "sex",
    label: "Sex",
    presenca: [
      "blushfitt",
      "cali.pizza.holiday",
      "toroburgerandbeer",
      "parksobral",
      "agenciacnvt",
      "euchicosousa",
      "brendavasconcelos",
      "clinicadengo",
      "clinicaunivetsobral",
      "dramargaridacarneiro",
      "draiaratomaz",
      "lumatorremarques",
      "hospitaldrthomazcorrea",
      "smartmed_massape",
      "videresaude",
    ],
  },
  {
    key: "sab",
    label: "Sáb",
    presenca: [
      "blushfitt",
      "cali.pizza.holiday",
      "toroburgerandbeer",
      "parksobral",
      "draanaliarocha",
    ],
  },
];

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ProgramacaoPage() {
  const { partners } = useLoaderData<typeof loader>();

  // dia selecionado — começa com o dia real, mas pode ser trocado
  const [selectedKey, setSelectedKey] = useState(realTodayKey);

  // toggles[partnerSlug-diaKey] = true → verde, false/ausente → amarelo
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const toggle = (partnerSlug: string, diaKey: string) => {
    const k = `${partnerSlug}-${diaKey}`;
    setToggles((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  return (
    <div className="min-h-screen overflow-x-auto p-8">
      <div className="flex justify-between">
        <h1 className="mb-6 text-2xl font-bold">Programação Semanal</h1>
        <Link to="/app" className="font-bold underline">
          APP
        </Link>
      </div>

      <div
        className="inline-grid w-full"
        style={{ gridTemplateColumns: `220px repeat(7, 1fr)` }}
      >
        {/* Cabeçalho */}
        <div className="text-muted-foreground border-border border-b px-3 py-2 text-xs font-semibold tracking-widest uppercase">
          Parceiro
        </div>
        {semana.map((dia) => {
          const isToday = dia.key === selectedKey;
          return (
            <button
              key={dia.key}
              type="button"
              onClick={() => setSelectedKey(dia.key)}
              className={[
                "border-border hover:text-foreground cursor-pointer border-b px-3 py-2 text-center text-xs font-semibold tracking-widest uppercase transition-colors",
                isToday
                  ? "bg-card/50 text-foreground"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              {dia.label}
            </button>
          );
        })}

        {/* Linhas por parceiro */}
        {partners.map((partner) => (
          <Fragment key={partner.slug}>
            <div
              key={`name-${partner.slug}`}
              className="border-border text-foreground truncate border-b px-3 py-2.5 text-sm font-medium"
            >
              {partner.title}
            </div>

            {semana.map((dia) => {
              const isToday = dia.key === selectedKey;
              const presente = dia.presenca.includes(partner.slug);
              const k = `${partner.slug}-${dia.key}`;
              const isDone = toggles[k] ?? false;

              return (
                <div
                  key={k}
                  className={[
                    "border-border flex items-center justify-center border-b py-2.5",
                    isToday ? "bg-card/50" : "",
                  ].join(" ")}
                >
                  {presente ? (
                    isToday ? (
                      <button
                        type="button"
                        onClick={() => toggle(partner.slug, dia.key)}
                        className={[
                          "flex size-6 cursor-pointer items-center justify-center rounded-full transition-colors",
                          isDone
                            ? "bg-emerald-500 text-emerald-100"
                            : "bg-yellow-200 text-yellow-700",
                        ].join(" ")}
                      >
                        <CheckIcon className="size-3.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full">
                        <CheckIcon className="size-3.5 stroke-[2.5]" />
                      </span>
                    )
                  ) : null}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
