import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { fetchReviewActions, fetchPartnerBySlug } from "~/lib/supabase.queries";
import { CATEGORIES } from "~/lib/CONSTANTS";
import type { CATEGORY } from "~/lib/CONSTANTS";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { cn } from "cnfast";

const reviewSearchSchema = z.object({
  ids: z.string().optional(),
});

export const Route = createFileRoute("/dash/review/$slug")({
  validateSearch: reviewSearchSchema,
  component: ReviewPage,
});

function ReviewPage() {
  const { slug } = Route.useParams();
  const { ids } = Route.useSearch();

  const actionIds = ids
    ? ids.split(",").filter((id) => id.trim().length > 0)
    : [];

  const { data: partner, isLoading: isPartnerLoading } = useQuery({
    queryKey: ["reviewPartner", slug],
    queryFn: () => fetchPartnerBySlug(slug),
    enabled: !!slug,
  });

  const { data: actions = [], isLoading: isActionsLoading } = useQuery({
    queryKey: ["reviewActions", ids],
    queryFn: () => fetchReviewActions(actionIds),
    enabled: actionIds.length > 0,
  });

  const isLoading = isPartnerLoading || isActionsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Parceiro não encontrado.</p>
      </div>
    );
  }

  if (actionIds.length === 0 || actions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Nenhum conteúdo para revisar.</p>
      </div>
    );
  }

  const todayFormatted = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-background">
      {/* Document header */}
      <header className="mx-auto max-w-3xl px-6 pb-8 pt-16">
        <div className="mb-8 flex items-center gap-4">
          <UAvatar
            backgroundColor={partner.colors?.[0]}
            color={partner.colors?.[1]}
            fallback={partner.short ?? partner.title}
            image={partner.image ?? undefined}
            size="md"
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Validação de Conteúdo
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {partner.title}
            </h1>
          </div>
        </div>

        <div className="border-b pb-6">
          <p className="text-sm text-muted-foreground">
            {actions.length} {actions.length === 1 ? "conteúdo" : "conteúdos"} para aprovação
            {" · "}
            <span className="capitalize">{todayFormatted}</span>
          </p>
        </div>
      </header>

      {/* Actions list */}
      <main className="mx-auto max-w-3xl px-6 pb-24">
        <div className="divide-y">
          {actions.map((action, index) => {
            const category = CATEGORIES[action.category as CATEGORY];
            const hasContentDescription =
              action.content_description && action.content_description.trim().length > 0;
            const hasCaption =
              action.instagram_caption && action.instagram_caption.trim().length > 0;

            let publishDate: string | null = null;
            try {
              publishDate = action.date
                ? format(parseISO(action.date.replace(" ", "T")), "d MMM yyyy", { locale: ptBR })
                : null;
            } catch {
              publishDate = null;
            }

            return (
              <article
                key={action.id}
                className="py-10"
              >
                {/* Action header */}
                <div className="mb-5 flex flex-wrap items-start gap-3">
                  {/* Index */}
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/8 text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>

                  <div className="flex-1">
                    {/* Meta: category + date */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {category && (
                        <span
                          className="rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                          }}
                        >
                          {category.title}
                        </span>
                      )}
                      {publishDate && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {publishDate}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-semibold leading-snug">
                      {action.title}
                    </h2>
                  </div>
                </div>

                {/* Content description (Tiptap HTML) */}
                {hasContentDescription && (
                  <section className="mb-6">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Conteúdo
                    </h3>
                    <div
                      className={cn(
                        "prose prose-sm max-w-none",
                        "text-foreground",
                        // Tiptap HTML prose overrides
                        "[&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold",
                        "[&_p]:leading-relaxed [&_p]:mb-2",
                        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
                        "[&_li]:mb-1",
                        "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
                        "[&_hr]:border-border",
                        "[&_strong]:font-semibold",
                        "[&_em]:italic",
                        "[&_table]:w-full [&_table]:border-collapse",
                        "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-muted",
                        "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",
                        "[&_mark]:bg-yellow-200/60 [&_mark]:dark:bg-yellow-700/40",
                        "[&_a]:text-primary [&_a]:underline",
                      )}
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML vem do editor Tiptap interno da plataforma
                      dangerouslySetInnerHTML={{ __html: action.content_description ?? "" }}
                    />
                  </section>
                )}

                {/* Instagram caption */}
                {hasCaption && (
                  <section>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Legenda
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                      {action.instagram_caption}
                    </p>
                  </section>
                )}

                {/* Empty state */}
                {!hasContentDescription && !hasCaption && (
                  <p className="text-sm italic text-muted-foreground">
                    Nenhum conteúdo preenchido para este item.
                  </p>
                )}
              </article>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Documento gerado pelo CNVT® · {partner.title}
          </p>
        </div>
      </main>
    </div>
  );
}
