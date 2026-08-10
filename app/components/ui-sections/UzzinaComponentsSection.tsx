import { Icons } from "~/components/uzzina/UIcons";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";

// Categorias de ícones extraídos do UIIcons.tsx
const ICON_CATEGORIES = [
  {
    name: "Categorias de Ação",
    slugs: [
      {
        slug: "ads",
        name: "Anúncio",
      },
      {
        slug: "capture",
        name: "Captação",
      },
      {
        slug: "carousel",
        name: "Carrossel",
      },
      {
        slug: "design",
        name: "Design",
      },
      {
        slug: "dev",
        name: "Dev",
      },
      {
        slug: "finance",
        name: "Financeiro",
      },
      {
        slug: "meeting",
        name: "Reunião",
      },
      {
        slug: "post",
        name: "Post",
      },
      {
        slug: "print",
        name: "Impressão",
      },
      {
        slug: "reels",
        name: "Reels",
      },
      {
        slug: "sm",
        name: "Social Media",
      },
      {
        slug: "stories",
        name: "Stories",
      },
      {
        slug: "todo",
        name: "A Fazer",
      },
      {
        slug: "sprint",
        name: "Sprint",
      },
    ],
  },
  {
    name: "Fases da Ação",
    slugs: [
      {
        slug: "idea",
        name: "Ideia",
      },
      {
        slug: "active",
        name: "Em Execução",
      },
      {
        slug: "done",
        name: "Concluído",
      },
    ],
  },

  {
    name: "Utilitários & Plataforma",
    slugs: [
      {
        slug: "categories",
        name: "Visão Categorias",
      },
      {
        slug: "filter",
        name: "Filtros",
      },
      {
        slug: "instagram",
        name: "Instagram",
      },
    ],
  },
];
const SIZES = [
  {
    key: SIZE.xs,
    label: "xs (16px)",
  },
  {
    key: SIZE.sm,
    label: "sm (24px)",
  },
  {
    key: SIZE.md,
    label: "md (32px)",
  },
  {
    key: SIZE.lg,
    label: "lg (48px)",
  },
  {
    key: SIZE.xl,
    label: "xl (72px)",
  },
  {
    key: SIZE["2xl"],
    label: "2xl (96px)",
  },
];
const SAMPLE_AVATARS = [
  {
    fallback: "CNVT",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  {
    fallback: "UZ",
    backgroundColor: "#ec4899",
    color: "#ffffff",
  },
  {
    fallback: "AI",
    backgroundColor: "#8b5cf6",
    color: "#ffffff",
  },
  {
    fallback: "JS",
    backgroundColor: "#eab308",
    color: "#000000",
  },
  {
    fallback: "TS",
    backgroundColor: "#06b6d4",
    color: "#ffffff",
  },
];
export function UzzinaComponentsSection() {
  return (
    <div id="uzzina-components">
      <GallerySection>
        <GallerySectionHeader
          description="Iconografia proprietária categorizada e sistema de avatares individuais/em grupo em todos os tamanhos suportados."
          title="Icons & UAvatar System"
        />

        <GallerySectionContent className="flex flex-col gap-10">
          {/* UIIcons por Categoria */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Ícones da Plataforma (UIIcons por Categoria)
            </h4>
            {ICON_CATEGORIES.map((cat) => (
              <GalleryItem key={cat.name} label={cat.name}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                  {cat.slugs.map((item) => (
                    <div
                      key={item.slug}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-surface p-3 text-center transition-colors hover:border-border"
                    >
                      <Icons
                        className="size-5 text-foreground"
                        slug={item.slug}
                      />
                      <span className="text-[11px] font-medium text-foreground">
                        {item.name}
                      </span>
                      <code className="text-[9px] text-muted-foreground">
                        {item.slug}
                      </code>
                    </div>
                  ))}
                </div>
              </GalleryItem>
            ))}
          </div>

          {/* UAvatar - Todos os tamanhos */}
          <GalleryItem label="UAvatar (Todos os Tamanhos)">
            <div className="flex flex-wrap items-end gap-6 rounded-xl border border-border/40 bg-surface p-6">
              {SIZES.map((s) => (
                <div key={s.key} className="flex flex-col items-center gap-2">
                  <UAvatar
                    backgroundColor="#3b82f6"
                    color="#ffffff"
                    fallback="CNVT"
                    size={s.key}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </GalleryItem>

          {/* UAvatarGroup - Grupos em Diferentes Tamanhos */}
          <GalleryItem label="UAvatarGroup (Agrupamento e Clamping)">
            <div className="flex flex-col gap-6 rounded-xl border border-border/40 bg-surface p-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Grupo Médio (md) — Padrão
                </span>
                <UAvatarGroup avatars={SAMPLE_AVATARS} size={SIZE.md} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Grupo Pequeno (sm)
                </span>
                <UAvatarGroup avatars={SAMPLE_AVATARS} size={SIZE.sm} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Grupo Extra Pequeno (xs)
                </span>
                <UAvatarGroup avatars={SAMPLE_AVATARS} size={SIZE.xs} />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Com Limite Visual (clampAt = 3)
                </span>
                <UAvatarGroup
                  avatars={SAMPLE_AVATARS}
                  clampAt={3}
                  size={SIZE.md}
                />
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
