import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { Button } from "~/components/ui/button";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { SIZE } from "~/lib/CONSTANTS";
import type { LoaderFunctionArgs } from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { useLoaderData } from "react-router";
import { Icons } from "~/lib/helpers";
import Color from "color";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createSupabaseClient(request);

  const { data: categories } = await supabase.from("categories").select("*");

  return {
    categories,
  };
};

export const meta = () => {
  return [
    {
      title: "UI UZZINA",
    },
  ];
};

export default function UITestingPage() {
  const { categories } = useLoaderData<typeof loader>();
  const [theme, setTheme] = useTheme();
  return (
    <div className="container mx-auto px-8">
      {/* Header */}
      <div className="border_after flex items-center justify-between py-8">
        <h1 className="p-0">UI Testing Page</h1>

        <div className="flex items-center gap-1">
          <Button
            onClick={() => setTheme(Theme.LIGHT)}
            variant={Theme.LIGHT === theme ? "outline" : "ghost"}
          >
            <SunIcon />
          </Button>
          <Button
            onClick={() => setTheme(Theme.DARK)}
            variant={Theme.DARK === theme ? "outline" : "ghost"}
          >
            <MoonIcon />
          </Button>
          <Button
            onClick={() => setTheme(null)}
            variant={
              ![Theme.DARK, Theme.LIGHT].find((t) => t === theme)
                ? "outline"
                : "ghost"
            }
          >
            <ComputerIcon />
          </Button>

          {/* <ToggleGroup
            type="single"
            onValueChange={(value) => {
              if (value === "system") {
                setTheme(null);
              } else {
                setTheme(value as Theme);
              }
            }}
          >
            <ToggleGroupItem value={Theme.LIGHT}>
              <SunIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value={Theme.DARK}>
              <MoonIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value={"system"}>
              <ComputerIcon />
            </ToggleGroupItem>
          </ToggleGroup> */}
        </div>
      </div>
      {/* Headings */}
      <div className="border_after py-8">
        <div className="">
          <h2>Headings</h2>
        </div>
        <div>
          <h1>h1 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
          <h2>h2 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h2>
          <h3>h3 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h3>
          <h4>h4 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h4>
          <h5>h5 – Lorem ipsum dolor sit amet consectetur adipisicing elit.</h5>
        </div>
      </div>
      <div className="border_after py-8">
        <h2>Colors</h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            {
              background: "bg-background",
              text: "text-foreground",
            },
            {
              background: "bg-card",
              text: "text-card-foreground",
            },
            {
              background: "bg-popover",
              text: "text-popover-foreground",
            },
            {
              background: "bg-primary",
              text: "text-primary-foreground",
            },
            {
              background: "bg-secondary",
              text: "text-secondary-foreground",
            },
            {
              background: "bg-muted",
              text: "text-muted-foreground",
            },
            {
              background: "bg-accent",
              text: "text-accent-foreground",
            },
            {
              background: "bg-input",
              text: "text-foreground",
            },
            {
              background: "bg-error-background",
              text: "text-error",
            },
            {
              background: "bg-warning-background",
              text: "text-warning",
            },
            {
              background: "bg-success-background",
              text: "text-success",
            },
            {
              background: "bg-info-background",
              text: "text-info",
            },
            {
              background: "bg-error",
              text: "text-error-background",
            },
            {
              background: "bg-warning",
              text: "text-warning-background",
            },
            {
              background: "bg-success",
              text: "text-success-background",
            },
            {
              background: "bg-info",
              text: "text-info-background",
            },
          ].map((colors) => (
            <div
              className={`${colors.background} ${colors.text} flex flex-col gap-2 border p-8`}
            >
              <code>.{colors.background}</code>
              <code>.{colors.text}</code>
            </div>
          ))}
        </div>
      </div>
      {/* Badges */}
      <div className="border_after py-8">
        <div>
          <h2>Badges</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-wrap items-center gap-4">
            <h5 className="w-full">Badge comum</h5>
            <UBadge size={SIZE.sm} value={12} />
            <UBadge size={SIZE.md} value={17} />
            <UBadge size={SIZE.lg} value={22} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <h5 className="w-full">Badge dinâmico</h5>
            <UBadge size={SIZE.sm} value={2} isDynamic />
            <UBadge size={SIZE.md} value={6} isDynamic />
            <UBadge size={SIZE.lg} value={22998.8} isDynamic />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <h5 className="w-full">Badge arredondado</h5>

            <UBadge size={SIZE.sm} value={3} isRounded />
            <UBadge size={SIZE.md} value={6} isRounded />
            <UBadge size={SIZE.lg} value={22} isRounded />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <h5 className="w-full">Badge pers. com sufixo e prefixo</h5>

            <UBadge
              size={SIZE.sm}
              value={3}
              prefix="+"
              suffix="pts"
              className="bg-success text-success-foreground"
            />
            <UBadge
              size={SIZE.md}
              value={36}
              suffix="º"
              className="rounded-none bg-pink-400 text-pink-200"
            />
            <UBadge
              size={SIZE.lg}
              value={221.39}
              prefix="R$ "
              className="border border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
            />
          </div>
        </div>
      </div>
      {/* Avatars */}
      <div className="border_after py-8">
        <div>
          <h2>Avatars</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Avatar com fallback 2</h5>
            <UAvatar fallback="cs" size={SIZE.xs} />
            <UAvatar fallback="cs" size={SIZE.sm} />
            <UAvatar fallback="cs" size={SIZE.md} />
            <UAvatar fallback="cs" size={SIZE.lg} />
            <UAvatar fallback="cs" size={SIZE.xl} />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Avatar com fallback 2+</h5>
            <UAvatar fallback="chico" size={SIZE.xs} />
            <UAvatar fallback="smart" size={SIZE.sm} />
            <UAvatar fallback="cnvt" size={SIZE.md} />
            <UAvatar fallback="ana" size={SIZE.lg} />
            <UAvatar fallback="videre" size={SIZE.xl} />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Avatar com Imagens</h5>
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZE.xs}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZE.sm}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZE.md}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZE.lg}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZE.xl}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares xs</h5>
            <UAvatarGroup
              size={SIZE.xs}
              avatars={[
                {
                  fallback: "AC",
                },
                {
                  fallback: "CSS",
                },
                {
                  fallback: "CNVT",
                },
                {
                  fallback: "CS",
                },
                {
                  fallback: "CN",
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares sm</h5>
            <UAvatarGroup
              size={SIZE.sm}
              avatars={[
                {
                  fallback: "AC",
                },
                {
                  fallback: "CSS",
                },
                {
                  fallback: "CNVT",
                },
                {
                  fallback: "CS",
                },
                {
                  fallback: "CN",
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares md</h5>
            <UAvatarGroup
              avatars={[
                {
                  fallback: "AC",
                },
                {
                  fallback: "CSS",
                },
                {
                  fallback: "CNVT",
                },
                {
                  fallback: "CS",
                },
                {
                  fallback: "CN",
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares lg</h5>
            <UAvatarGroup
              size={SIZE.lg}
              avatars={[
                {
                  fallback: "AC",
                },
                {
                  fallback: "CSS",
                },
                {
                  fallback: "CNVT",
                },
                {
                  fallback: "CS",
                },
                {
                  fallback: "CN",
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares xl</h5>
            <UAvatarGroup
              size={SIZE.xl}
              avatars={[
                {
                  fallback: "AC",
                },
                {
                  fallback: "CSS",
                },
                {
                  fallback: "CNVT",
                },
                {
                  fallback: "CS",
                },
                {
                  fallback: "CN",
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
        </div>
      </div>
      <div className="border_after py-8">
        <div>
          <h2>Ícones das Categorias</h2>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories?.map((category) => (
            <div key={category.id} className="p-4 text-center">
              <div className="mb-2 font-medium">{category.title}</div>
              <div className="flex items-center justify-center gap-2">
                <Icons
                  slug={category.slug}
                  className="size-4"
                  color={category.color}
                />
                <Icons
                  slug={category.slug}
                  className="size-6"
                  color={category.color}
                />
                <Icons
                  slug={category.slug}
                  className="size-8"
                  color={category.color}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
