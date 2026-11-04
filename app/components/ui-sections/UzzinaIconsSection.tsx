import { useState } from "react";
import { Icons } from "~/components/uzzina/UIcons";
import { cn } from "~/lib/utils";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundRadio,
  PlaygroundBoolean,
} from "./PropsPlayground";

interface IconItem {
  slug: string;
  name: string;
}

interface IconCategoryGroup {
  name: string;
  slugs: readonly IconItem[];
}

export const ICON_CATEGORIES: readonly IconCategoryGroup[] = [
  {
    name: "Categorias de Ação",
    slugs: [
      { slug: "ads", name: "Anúncio" },
      { slug: "capture", name: "Captação" },
      { slug: "carousel", name: "Carrossel" },
      { slug: "design", name: "Design" },
      { slug: "dev", name: "Dev" },
      { slug: "finance", name: "Financeiro" },
      { slug: "meeting", name: "Reunião" },
      { slug: "post", name: "Post" },
      { slug: "print", name: "Impressão" },
      { slug: "reels", name: "Reels" },
      { slug: "sm", name: "Social Media" },
      { slug: "stories", name: "Stories" },
      { slug: "todo", name: "A Fazer" },
      { slug: "sprint", name: "Sprint" },
    ],
  },
  {
    name: "Fases da Ação",
    slugs: [
      { slug: "idea", name: "Ideia" },
      { slug: "active", name: "Em Execução" },
      { slug: "done", name: "Concluído" },
    ],
  },
  {
    name: "Utilitários & Plataforma",
    slugs: [
      { slug: "categories", name: "Visão Categorias" },
      { slug: "filter", name: "Filtros" },
      { slug: "instagram", name: "Instagram" },
    ],
  },
];

const ALL_ICON_ITEMS: readonly IconItem[] = ICON_CATEGORIES.flatMap(
  (cat) => cat.slugs,
);
const ALL_SLUGS: readonly string[] = ALL_ICON_ITEMS.map((item) => item.slug);
const SLUG_LABELS: Record<string, string> = Object.fromEntries(
  ALL_ICON_ITEMS.map((item) => [item.slug, `${item.name} (${item.slug})`]),
);

const ICON_SIZES = ["size-4", "size-5", "size-6", "size-8"] as const;
type IconSizeClass = (typeof ICON_SIZES)[number];

function IconsPlayground() {
  const [slug, setSlug] = useState<string>("post");
  const [sizeClass, setSizeClass] = useState<IconSizeClass>("size-6");
  const [useColor, setUseColor] = useState(false);

  const selectedColor = useColor ? "#7c3aed" : undefined;

  return (
    <PropsPlayground
      caption={`slug="${slug}" · ${sizeClass}${useColor ? ' · color="#7c3aed"' : ""}`}
      preview={
        <div className="flex items-center justify-center p-6">
          <Icons
            className={cn(sizeClass, "text-foreground")}
            color={selectedColor}
            slug={slug}
          />
        </div>
      }
      title="Icons"
    >
      <PlaygroundSelect
        label="Ícone"
        onChange={setSlug}
        optionLabels={SLUG_LABELS}
        options={ALL_SLUGS}
        prop="slug"
        value={slug}
      />
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSizeClass}
        options={ICON_SIZES}
        prop="className"
        value={sizeClass}
      />
      <PlaygroundBoolean
        label="Cor"
        onChange={setUseColor}
        prop="color"
        value={useColor}
      />
    </PropsPlayground>
  );
}

export function UzzinaIconsSection() {
  return (
    <div id="uzzina-icons">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Ícones customizados da UZZINA (categorias, fases e estações), em UIcons.tsx."
          title="Icons"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Icons">
            <IconsPlayground />
          </GalleryItem>

          <GalleryItem label="Todos os Ícones (Referência Visual)">
            <div className="space-y-6">
              {ICON_CATEGORIES.map((cat) => (
                <div className="space-y-3" key={cat.name}>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {cat.name}
                  </span>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
                    {cat.slugs.map((item) => (
                      <div
                        className="flex flex-col items-center justify-center gap-1.5 py-2 text-center"
                        key={item.slug}
                      >
                        <Icons
                          className="size-5 text-foreground"
                          slug={item.slug}
                        />
                        <span className="text-xs font-medium text-foreground">
                          {item.name}
                        </span>
                        <code className="font-mono text-[10px] text-muted-foreground">
                          {item.slug}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
