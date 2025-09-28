import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { UAvatar, UAvatarGroup } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { SIZES } from "~/lib/CONSTANTS";

export default function UITestingPage() {
  const [, setTheme] = useTheme();
  return (
    <div className="container mx-auto  px-8">
      {/* Header */}
      <div className="border_after  py-8 flex items-center justify-between">
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
      <div className="py-8 border_after ">
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
      {/* Badges */}
      <div className="py-8 border_after ">
        <div>
          <h2>Badges</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex gap-4 items-center flex-wrap">
            <h5 className="w-full">Badge comum</h5>
            <UBadge size={SIZES.sm} value={12} />
            <UBadge size={SIZES.md} value={17} />
            <UBadge size={SIZES.lg} value={22} />
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <h5 className="w-full">Badge dinâmico</h5>
            <UBadge size={SIZES.sm} value={2} isDynamic />
            <UBadge size={SIZES.md} value={6} isDynamic />
            <UBadge size={SIZES.lg} value={22998.8} isDynamic />
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <h5 className="w-full">Badge arredondado</h5>

            <UBadge size={SIZES.sm} value={3} isRounded />
            <UBadge size={SIZES.md} value={6} isRounded />
            <UBadge size={SIZES.lg} value={22} isRounded />
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <h5 className="w-full">Badge pers. com sufixo e prefixo</h5>

            <UBadge
              size={SIZES.sm}
              value={3}
              prefix="+"
              suffix="pts"
              className="bg-success text-success-foreground"
            />
            <UBadge
              size={SIZES.md}
              value={36}
              suffix="º"
              className="bg-pink-400 rounded-none text-pink-200"
            />
            <UBadge
              size={SIZES.lg}
              value={221.39}
              prefix="R$ "
              className=" bg-amber-100 border border-amber-200 text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
            />
          </div>
        </div>
      </div>
      {/* Avatars */}
      <div className="py-8 border_after ">
        <div>
          <h2>Avatars</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Avatar com fallback 2</h5>
            <UAvatar fallback="cs" size={SIZES.xs} />
            <UAvatar fallback="cs" size={SIZES.sm} />
            <UAvatar fallback="cs" size={SIZES.md} />
            <UAvatar fallback="cs" size={SIZES.lg} />
            <UAvatar fallback="cs" size={SIZES.xl} />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Avatar com fallback 2+</h5>
            <UAvatar fallback="chico" size={SIZES.xs} />
            <UAvatar fallback="smart" size={SIZES.sm} />
            <UAvatar fallback="cnvt" size={SIZES.md} />
            <UAvatar fallback="ana" size={SIZES.lg} />
            <UAvatar fallback="videre" size={SIZES.xl} />
          </div>
          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Avatar com Imagens</h5>
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZES.xs}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZES.sm}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZES.md}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZES.lg}
            />
            <UAvatar
              fallback="CN"
              image="https://github.com/shadcn.png"
              size={SIZES.xl}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <h5 className="w-full">Grupo de Avatares xs</h5>
            <UAvatarGroup
              avatars={[
                {
                  fallback: "AC",
                  size: SIZES.xs,
                },
                {
                  fallback: "CN",
                  size: SIZES.xs,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CN",
                  size: SIZES.xs,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZES.xs,
                },
                {
                  fallback: "CN",
                  size: SIZES.xs,
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
                  size: SIZES.sm,
                },
                {
                  fallback: "CN",
                  size: SIZES.sm,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CN",
                  size: SIZES.sm,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZES.sm,
                },
                {
                  fallback: "CN",
                  size: SIZES.sm,
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
                  size: SIZES.lg,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "AC",
                  size: SIZES.lg,
                },
                {
                  fallback: "CN",
                  size: SIZES.lg,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZES.lg,
                },
                {
                  fallback: "CN",
                  size: SIZES.lg,
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
                  size: SIZES.xl,
                },
                {
                  fallback: "CN",
                  size: SIZES.xl,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CN",
                  size: SIZES.xl,
                  image: "https://github.com/shadcn.png",
                },
                {
                  fallback: "CS",
                  size: SIZES.xl,
                },
                {
                  fallback: "CN",
                  size: SIZES.xl,
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
