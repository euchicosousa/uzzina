import { useState } from "react";
import { data, useLoaderData, type LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant";
import { CATEGORIES } from "~/lib/CONSTANTS";
import { Icons } from "~/components/uzzina/UIIcons";
import { cn } from "~/lib/utils";
import { getOpenActionsByPartner } from "~/models/actions.server";
import { getPartnerBySlug } from "~/models/partners.server";
import { getUserId } from "~/services/auth.server";
import { getPersonByUserId } from "~/models/people.server";

export const runtime = "edge";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const person = await getPersonByUserId(supabase, user_id);
  invariant(person);

  const [partner, actions] = await Promise.all([
    getPartnerBySlug(supabase, params.slug!),
    getOpenActionsByPartner(supabase, params.slug!, user_id, person.admin),
  ]);

  invariant(partner);

  return data(
    { partner, actions },
    { headers: { "Cache-Control": "no-store" } },
  );
};

const INSTAGRAM_CATEGORIES = ["post", "reels", "carousel"];

const FILTER_OPTIONS = [
  { slug: "all", title: "Todas", color: "#888888" },
  { slug: "instagram", title: "Feed do Instagram", color: "#C13584" },
  ...Object.values(CATEGORIES),
];

export default function PrintPartnerPage() {
  const { partner, actions } = useLoaderData<typeof loader>();
  const [filterCategory, setFilterCategory] = useState<string[]>(["all"]);

  const filteredActions = actions.filter((action) => {
    if (filterCategory.includes("all")) return true;
    return filterCategory.includes(action.category);
  });

  const primaryColor = partner.colors?.[0] ?? "#333333";
  const foregroundColor = partner.colors?.[1] ?? "#ffffff";

  const handleFilterClick = (slug: string) => {
    if (slug === "all") {
      setFilterCategory(["all"]);
      return;
    }
    if (slug === "instagram") {
      setFilterCategory(INSTAGRAM_CATEGORIES);
      return;
    }

    let current = filterCategory.includes("all") ? [] : [...filterCategory];

    if (current.includes(slug)) {
      current = current.filter((s) => s !== slug);
    } else {
      current = [...current, slug];
    }

    setFilterCategory(current.length === 0 ? ["all"] : current);
  };

  const isActive = (slug: string) => {
    if (slug === "all") return filterCategory.includes("all");
    if (slug === "instagram") {
      return INSTAGRAM_CATEGORIES.every((s) => filterCategory.includes(s));
    }
    return filterCategory.includes(slug);
  };

  return (
    <div className="mx-auto max-w-2xl min-h-screen px-6 py-8 bg-background text-foreground">
      {/* ── Cabeçalho do Parceiro ── */}
      <div className="flex items-center gap-4 mb-7 pb-5 border-b">
        <div
          className="size-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
          style={{ backgroundColor: primaryColor, color: foregroundColor }}
        >
          {partner.short}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
            Parceiro
          </p>
          <h1 className="text-2xl font-bold leading-tight truncate">
            {partner.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredActions.length === actions.length
              ? `${actions.length} ação${actions.length !== 1 ? "ões" : ""} em aberto`
              : `${filteredActions.length} de ${actions.length} ação${actions.length !== 1 ? "ões" : ""} em aberto`}
          </p>
        </div>
      </div>

      {/* ── Filtro de Categoria ── */}
      <div className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2.5">
          Filtrar por categoria
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((cat) => {
            const active = isActive(cat.slug);

            return (
              <button
                key={cat.slug}
                onClick={() => handleFilterClick(cat.slug)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                  active
                    ? "border-transparent bg-secondary text-secondary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:bg-secondary/50",
                )}
                style={
                  active
                    ? {
                        borderColor: cat.color,
                        backgroundColor: cat.color + "22",
                        color: cat.color,
                      }
                    : undefined
                }
              >
                <Icons slug={cat.slug} color={active ? cat.color : undefined} className="size-3" />
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Lista de Ações ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Ações em aberto
        </p>

        {filteredActions.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground text-sm">
            Nenhuma ação encontrada.
          </p>
        ) : (
          <div className="flex flex-col">
            {filteredActions.map((action) => {
              const cat =
                CATEGORIES[action.category as keyof typeof CATEGORIES];
              const catColor = cat?.color ?? "#cccccc";
              const catTag = cat?.tag ?? action.category?.toUpperCase() ?? "—";

              return (
                <div
                  key={action.id}
                  className="flex items-center gap-2.5 py-2.5 border-b border-border/50 last:border-0"
                >
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: catColor }}
                  />
                  <span className="flex-1 text-sm leading-snug">
                    {action.title || (
                      <em className="text-muted-foreground">Sem título</em>
                    )}
                  </span>
                  <span
                    className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      color: catColor,
                      backgroundColor: catColor + "18",
                    }}
                  >
                    {catTag}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
