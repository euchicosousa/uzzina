import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme, Theme } from "~/components/theme-provider";
import { PhaseIcon } from "~/components/features/PhaseIcon";
import { Button } from "~/components/ui/button";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { CATEGORIES, SIZE, PHASES } from "~/lib/CONSTANTS";
import { Icons } from "~/lib/helpers";
export default function UITestingPage() {
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
            <MonitorIcon />
          </Button>
        </div>
      </div>
      <div className="border_after flex items-center gap-8 py-4 *:underline-offset-2 *:hover:underline">
        <a href="#headings">Headings</a>
        <a href="#colors">Colors</a>
        <a href="#badges">Badges</a>
        <a href="#avatars">Avatars</a>
        <a href="#categories">Categories</a>
        <a href="#phases">Phases</a>
      </div>

      {/* Headings */}
      <div className="border_after py-8" id="headings">
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
      {/* Cores */}
      <div className="border_after py-8" id="colors">
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
          ].map((colors) => (
            <div
              key={colors.background}
              className={`${colors.background} ${colors.text} flex flex-col gap-2 border p-8`}
            >
              <code>.{colors.background}</code>
              <code>.{colors.text}</code>
            </div>
          ))}
        </div>
      </div>
      {/* Badges */}
      <div className="border_after py-8" id="badges">
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
            <UBadge isDynamic size={SIZE.sm} value={2} />
            <UBadge isDynamic size={SIZE.md} value={6} />
            <UBadge isDynamic size={SIZE.lg} value={22998.8} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <h5 className="w-full">Badge arredondado</h5>

            <UBadge isRounded size={SIZE.sm} value={3} />
            <UBadge isRounded size={SIZE.md} value={6} />
            <UBadge isRounded size={SIZE.lg} value={22} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <h5 className="w-full">Badge pers. com sufixo e prefixo</h5>

            <UBadge
              className="bg-success text-success-foreground"
              prefix="+"
              size={SIZE.sm}
              suffix="pts"
              value={3}
            />
            <UBadge
              className="rounded-none bg-pink-400 text-pink-200"
              size={SIZE.md}
              suffix="º"
              value={36}
            />
            <UBadge
              className="border border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
              prefix="R$ "
              size={SIZE.lg}
              value={221.39}
            />
          </div>
        </div>
      </div>
      {/* Avatars */}
      <div className="border_after py-8" id="avatars">
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
            <h5 className="w-full">Avatar Squircle</h5>
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
            <h5 className="w-full">Grupo de Avatares Squircle</h5>
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
              size={SIZE.xs}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares sm</h5>
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
              size={SIZE.sm}
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
              size={SIZE.lg}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares xl</h5>
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
              size={SIZE.xl}
            />
          </div>
        </div>
      </div>
      {/* Categorias */}
      <div className="border_after py-8" id="categories">
        <div>
          <h2>Ícones das Categorias</h2>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Object.values(CATEGORIES).map((category) => (
            <div key={category.slug} className="p-4 text-center">
              <div className="mb-2 font-medium">{category.title}</div>
              <div className="flex items-center justify-center gap-2">
                <Icons
                  className="size-4"
                  color={category.color}
                  slug={category.slug}
                />
                <Icons
                  className="size-6"
                  color={category.color}
                  slug={category.slug}
                />
                <Icons
                  className="size-8"
                  color={category.color}
                  slug={category.slug}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Phases */}
      <div className="border_after py-8" id="phases">
        <div>
          <h2>Phases</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 font-medium">Tamanho {SIZE.xs}</div>
            <div className="flex gap-4">
              {Object.values(PHASES).map((phase, _index) => (
                <PhaseIcon
                  key={phase.slug}
                  phase={phase}
                  size={SIZE.xs}
                  variant="icon"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 font-medium">Tamanho {SIZE.sm}</div>
            <div className="flex gap-4">
              {Object.values(PHASES).map((phase, _index) => (
                <PhaseIcon
                  key={phase.slug}
                  phase={phase}
                  size={SIZE.sm}
                  variant="icon"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 font-medium">Tamanho {SIZE.md}</div>
            <div className="flex gap-4">
              {Object.values(PHASES).map((phase, _index) => (
                <PhaseIcon
                  key={phase.slug}
                  phase={phase}
                  size={SIZE.md}
                  variant="icon"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 font-medium">Tamanho {SIZE.lg}</div>
            <div className="flex gap-4">
              {Object.values(PHASES).map((phase, _index) => (
                <PhaseIcon
                  key={phase.slug}
                  phase={phase}
                  size={SIZE.lg}
                  variant="icon"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 font-medium">Tamanho {SIZE.xl}</div>
            <div className="flex gap-4">
              {Object.values(PHASES).map((phase, _index) => (
                <PhaseIcon
                  key={phase.slug}
                  phase={phase}
                  size={SIZE.xl}
                  variant="icon"
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-4 font-medium">Tamanho {SIZE["2xl"]}</div>
            <div className="flex gap-4">
              {Object.values(PHASES).map((phase, _index) => (
                <PhaseIcon
                  key={phase.slug}
                  phase={phase}
                  size={SIZE["2xl"]}
                  variant="icon"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <div id="font-sizes" className="border_after py-8">
        <div>
          <h2>Font-sizes</h2>
        </div>
        <div className="mb-12 grid grid-cols-2 gap-8">
          {webFontSizes.map((fs, i) => {
            return (
              <div className="text-muted-foreground grid grid-cols-2 gap-4">
                <div key={i}>
                  <div className="text-foreground mb-2 text-xs font-medium">
                    WEB
                  </div>
                  <div>Font-size: {fs.fontSize}px</div>
                  <div>Line-height: {fs.lineHeight}px</div>
                </div>
                <div key={i}>
                  <div className="text-foreground mb-2 text-xs font-medium">
                    SOCIAL
                  </div>
                  <div>Font-size: {fontSizes[i].fontSize}px</div>
                  <div>Line-height: {fontSizes[i].lineHeight}px</div>
                </div>
              </div>
            );
          })}
        </div>
        {webFontSizes.map((fs, i) => {
          return (
            <div key={i} className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between gap-2 opacity-50">
                  <p className="text-[12px]">Font-size: {fs.fontSize}px</p>
                  <p className="text-[12px]">Line-height: {fs.lineHeight}px</p>
                </div>
                <div
                  style={{
                    fontSize: `${fs.fontSize}px`,
                    lineHeight: `${fs.lineHeight}px`,
                  }}
                >
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eum
                  enim unde soluta eaque assumenda quae doloremque deleniti
                  recusandae, ad voluptates ut, consequatur sunt dolor.
                  Voluptatum officia laudantium porro. Odio, laborum.
                </div>
              </div>
              <div>
                <div className="flex justify-between gap-2 opacity-50">
                  <p className="text-[12px]">
                    Font-size: {fontSizes[i].fontSize}px
                  </p>
                  <p className="text-[12px]">
                    Line-height: {fontSizes[i].lineHeight}px
                  </p>
                </div>
                <div
                  style={{
                    fontSize: `${fontSizes[i].fontSize}px`,
                    lineHeight: `${fontSizes[i].lineHeight}px`,
                  }}
                  className="line-clamp-3"
                >
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eum
                  enim unde soluta eaque assumenda quae doloremque deleniti
                  recusandae, ad voluptates ut, consequatur sunt dolor.
                  Voluptatum officia laudantium porro. Odio, laborum.
                </div>
              </div>
            </div>
          );
        })}
       </div> */}
    </div>
  );
}
