import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { SIZE } from "~/lib/CONSTANTS";

export default function UITestingPage() {
  const [, setTheme] = useTheme();
  return (
    <div className="container mx-auto px-8">
      {/* Header */}
      <div className="border_after flex items-center justify-between py-8">
        <h1 className="p-0">UI Testing Page</h1>

        <div>
          <ToggleGroup
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
          </ToggleGroup>
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
              avatars={[
                {
                  fallback: "AC",
                  size: SIZE.xs,
                },
                {
                  fallback: "CN",
                  size: SIZE.xs,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CN",
                  size: SIZE.xs,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZE.xs,
                },
                {
                  fallback: "CN",
                  size: SIZE.xs,
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares sm</h5>
            <UAvatarGroup
              avatars={[
                {
                  fallback: "AC",
                  size: SIZE.sm,
                },
                {
                  fallback: "CN",
                  size: SIZE.sm,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CN",
                  size: SIZE.sm,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZE.sm,
                },
                {
                  fallback: "CN",
                  size: SIZE.sm,
                  image: "https://github.com/shadcn.png",
                },
              ]}
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
                  fallback: "CN",
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CN",
                  image: "https://github.com/shadcn.png",
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
                  fallback: "CN",
                  size: SIZE.lg,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "AC",
                  size: SIZE.lg,
                },
                {
                  fallback: "CN",
                  size: SIZE.lg,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZE.lg,
                },
                {
                  fallback: "CN",
                  size: SIZE.lg,
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares xl</h5>
            <UAvatarGroup
              avatars={[
                {
                  fallback: "AC",
                  size: SIZE.xl,
                },
                {
                  fallback: "CN",
                  size: SIZE.xl,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CN",
                  size: SIZE.xl,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZE.xl,
                },
                {
                  fallback: "CN",
                  size: SIZE.xl,
                  image: "https://github.com/shadcn.png",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
