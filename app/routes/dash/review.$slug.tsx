import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { CATEGORIES } from "~/lib/CONSTANTS";
import type { CATEGORY } from "~/lib/CONSTANTS";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { cn } from "cnfast";
import { sanitizeHtml } from "~/utils/sanitize";
import type { PublicReviewActionDto, PublicReviewPartnerDto } from "~/../api/review";

const reviewSearchSchema = z.object({
  r: z.string().optional(),
  ids: z.string().optional(),
});

export const Route = createFileRoute("/dash/review/$slug")({
  validateSearch: reviewSearchSchema,
  component: ReviewPage,
});

async function fetchPublicReview(slug: string, token: string) {
  const res = await fetch(`/api/review?slug=${encodeURIComponent(slug)}&r=${encodeURIComponent(token)}`);
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error("SERVER_ERROR");
  }
  return res.json() as Promise<{
    partner: PublicReviewPartnerDto;
    actions: PublicReviewActionDto[];
  }>;
}

function ReviewPage() {
  const { slug } = Route.useParams();
  const { r: token, ids } = Route.useSearch();

  const isLegacyLink = !token && !!ids;

  const { data, isLoading, error } = useQuery({
    queryKey: ["review", token, slug],
    queryFn: () => (token ? fetchPublicReview(slug, token) : Promise.reject(new Error("MISSING_TOKEN"))),
    enabled: !!slug && !!token,
    retry: false,
  });

  if (isLegacyLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Link Descontinuado</h2>
          <p className="text-sm text-muted-foreground">
            Este link de revisão utiliza um formato antigo que foi descontinuado por motivos de segurança.
            Por favor, solicite à equipe um novo link seguro de revisão.
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Link Inválido</h2>
          <p className="text-sm text-muted-foreground">
            Nenhuma chave de autorização foi fornecida para acessar esta revisão.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
          <p className="text-sm text-muted-foreground">Carregando revisão...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isNotFound = error instanceof Error && error.message === "NOT_FOUND";
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Acesso Não Disponível</h2>
          <p className="text-sm text-muted-foreground">
            {isNotFound
              ? "Este link de revisão expirou, foi revogado ou é inválido."
              : "Falha ao carregar a revisão. Tente novamente mais tarde."}
          </p>
        </div>
      </div>
    );
  }

  const { partner, actions: validActions } = data;

  if (validActions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Nenhum conteúdo deste parceiro encontrado para revisão.</p>
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
              Revisão de Conteúdo
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {partner.title}
            </h1>
          </div>
        </div>

        <div className="border-b pb-6">
          <p className="text-sm text-muted-foreground">
            {validActions.length} {validActions.length === 1 ? "conteúdo compartilhado" : "conteúdos compartilhados"} para revisão
            {" · "}
            <span className="capitalize">{todayFormatted}</span>
          </p>
        </div>
      </header>

      {/* Actions list */}
      <main className="mx-auto max-w-3xl px-6 pb-24">
        <div className="divide-y">
          {validActions.map((action, index) => {
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
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML sanitizado pelo utilitário central
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(action.content_description) }}
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
