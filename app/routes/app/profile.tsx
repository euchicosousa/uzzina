import { createFileRoute } from "@tanstack/react-router";
import {
  ImageIcon,
  LaptopIcon,
  LayoutGridIcon,
  ListIcon,
  MoonIcon,
  PipetteIcon,
  SunIcon,
  UploadIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Theme, useTheme } from "~/components/theme-provider";
import { PrismButton, PrismInput, PrismLabel } from "~/components/prism";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { PreferenceSwitch } from "~/components/uzzina/PreferenceSwitch";
import { SegmentedSelector } from "~/components/uzzina/SegmentedSelector";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { useAppContext } from "~/contexts/AppContext";
import { useAppTheme } from "~/hooks/useAppTheme";
import { PALLETE } from "~/lib/CONSTANTS";
import { getUserPreferences } from "~/lib/preferences";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { cn } from "cnfast";
import {
  deriveAccentFg,
  deriveDarkAccent,
  deriveDarkBg,
  deriveDarkFg,
} from "~/utils/color";
import { IconCloud } from "@tabler/icons-react";
export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});
export const runtime = "edge";
function ProfilePage() {
  const { person, cloudName, uploadPreset } = useAppContext();
  const preferences = getUserPreferences(person);
  const [theme, setTheme] = useTheme();
  const { previewColorIndex, previewCustomTheme, setCustomTheme } =
    useAppTheme();
  const [imageUrl, setImageUrl] = useState<string | null>(person.image || null);
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >(preferences.theme);
  const [selectedThemeColor, setSelectedThemeColor] = useState<number>(
    preferences.themeColorIndex,
  );
  const [selectedFollowPartnerColor, setSelectedFollowPartnerColor] =
    useState<boolean>(preferences.followPartnerColor);
  const [selectedVariant, setSelectedVariant] = useState<
    "line" | "block" | "content"
  >(preferences.defaultViewVariant);
  const [showInstagramSidebar, setShowInstagramSidebar] = useState<boolean>(
    preferences.showInstagramSidebar,
  );

  // Estados locais para o tema personalizado
  const [lightPrimary, setLightPrimary] = useState(
    preferences.customTheme?.light.primaryHex || "#2640A0",
  );
  const [lightPrimaryFg, setLightPrimaryFg] = useState(
    preferences.customTheme?.light.primaryFgHex || "#FFFFFF",
  );
  const [lightBg, setLightBg] = useState(
    preferences.customTheme?.light.bgHex || "#FFFFFF",
  );
  const [lightFg, setLightFg] = useState(
    preferences.customTheme?.light.fgHex || "#000000",
  );
  const [darkPrimary, setDarkPrimary] = useState(
    preferences.customTheme?.dark.primaryHex || "#3558DE",
  );
  const [darkPrimaryFg, setDarkPrimaryFg] = useState(
    preferences.customTheme?.dark.primaryFgHex || "#FFFFFF",
  );
  const [darkBg, setDarkBg] = useState(
    preferences.customTheme?.dark.bgHex || "#141414",
  );
  const [darkFg, setDarkFg] = useState(
    preferences.customTheme?.dark.fgHex || "#FFFFFF",
  );

  // Aplica preview do tema na UI quando o usuário apenas seleciona
  const handleThemeChange = (val: "light" | "dark" | "system") => {
    setSelectedTheme(val);
    if (val === "system") {
      setTheme(Theme.LIGHT); // ou deixa remix-themes lidar com o do sistema
    } else {
      setTheme(val as Theme);
    }
  };

  // Aplica preview da cor na UI quando o usuário apenas seleciona
  const handleColorChange = (idx: number) => {
    setSelectedThemeColor(idx);
    if (idx === -1) {
      previewCustomTheme({
        light: {
          primaryHex: lightPrimary,
          primaryFgHex: lightPrimaryFg,
          bgHex: lightBg,
          fgHex: lightFg,
        },
        dark: {
          primaryHex: darkPrimary,
          primaryFgHex: darkPrimaryFg,
          bgHex: darkBg,
          fgHex: darkFg,
        },
      });
    } else {
      previewColorIndex(idx);
    }
  };
  const handleLightPrimaryChange = (val: string) => {
    setLightPrimary(val);
    const derivedAccent = deriveDarkAccent(val);
    setDarkPrimary(derivedAccent);
    const derivedLightFg = deriveAccentFg(val);
    setLightPrimaryFg(derivedLightFg);
    const derivedDarkFg = deriveAccentFg(derivedAccent);
    setDarkPrimaryFg(derivedDarkFg);
    previewCustomTheme({
      light: {
        primaryHex: val,
        primaryFgHex: derivedLightFg,
        bgHex: lightBg,
        fgHex: lightFg,
      },
      dark: {
        primaryHex: derivedAccent,
        primaryFgHex: derivedDarkFg,
        bgHex: darkBg,
        fgHex: darkFg,
      },
    });
  };
  const handleLightPrimaryFgChange = (val: string) => {
    setLightPrimaryFg(val);
    previewCustomTheme({
      light: {
        primaryHex: lightPrimary,
        primaryFgHex: val,
        bgHex: lightBg,
        fgHex: lightFg,
      },
      dark: {
        primaryHex: darkPrimary,
        primaryFgHex: darkPrimaryFg,
        bgHex: darkBg,
        fgHex: darkFg,
      },
    });
  };
  const handleLightBgChange = (val: string) => {
    setLightBg(val);
    const derived = deriveDarkBg(val);
    setDarkBg(derived);
    previewCustomTheme({
      light: {
        primaryHex: lightPrimary,
        primaryFgHex: lightPrimaryFg,
        bgHex: val,
        fgHex: lightFg,
      },
      dark: {
        primaryHex: darkPrimary,
        primaryFgHex: darkPrimaryFg,
        bgHex: derived,
        fgHex: darkFg,
      },
    });
  };
  const handleLightFgChange = (val: string) => {
    setLightFg(val);
    const derived = deriveDarkFg(val);
    setDarkFg(derived);
    previewCustomTheme({
      light: {
        primaryHex: lightPrimary,
        primaryFgHex: lightPrimaryFg,
        bgHex: lightBg,
        fgHex: val,
      },
      dark: {
        primaryHex: darkPrimary,
        primaryFgHex: darkPrimaryFg,
        bgHex: darkBg,
        fgHex: derived,
      },
    });
  };
  const handleDarkPrimaryChange = (val: string) => {
    setDarkPrimary(val);
    const derivedDarkFg = deriveAccentFg(val);
    setDarkPrimaryFg(derivedDarkFg);
    previewCustomTheme({
      light: {
        primaryHex: lightPrimary,
        primaryFgHex: lightPrimaryFg,
        bgHex: lightBg,
        fgHex: lightFg,
      },
      dark: {
        primaryHex: val,
        primaryFgHex: derivedDarkFg,
        bgHex: darkBg,
        fgHex: darkFg,
      },
    });
  };
  const handleDarkPrimaryFgChange = (val: string) => {
    setDarkPrimaryFg(val);
    previewCustomTheme({
      light: {
        primaryHex: lightPrimary,
        primaryFgHex: lightPrimaryFg,
        bgHex: lightBg,
        fgHex: lightFg,
      },
      dark: {
        primaryHex: darkPrimary,
        primaryFgHex: val,
        bgHex: darkBg,
        fgHex: darkFg,
      },
    });
  };
  const handleDarkBgChange = (val: string) => {
    setDarkBg(val);
    previewCustomTheme({
      light: {
        primaryHex: lightPrimary,
        primaryFgHex: lightPrimaryFg,
        bgHex: lightBg,
        fgHex: lightFg,
      },
      dark: {
        primaryHex: darkPrimary,
        primaryFgHex: darkPrimaryFg,
        bgHex: val,
        fgHex: darkFg,
      },
    });
  };
  const handleDarkFgChange = (val: string) => {
    setDarkFg(val);
    previewCustomTheme({
      light: {
        primaryHex: lightPrimary,
        primaryFgHex: lightPrimaryFg,
        bgHex: lightBg,
        fgHex: lightFg,
      },
      dark: {
        primaryHex: darkPrimary,
        primaryFgHex: darkPrimaryFg,
        bgHex: darkBg,
        fgHex: val,
      },
    });
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const surname = formData.get("surname") as string;
      const initials = formData.get("initials") as string;
      const short = formData.get("short") as string;
      const image = (formData.get("image") as string) || null;
      const themeColorIndexVal = Number(formData.get("themeColorIndex"));
      let customTheme = null;
      if (themeColorIndexVal === -1) {
        if (
          lightPrimary &&
          lightPrimaryFg &&
          lightBg &&
          lightFg &&
          darkPrimary &&
          darkPrimaryFg &&
          darkBg &&
          darkFg
        ) {
          customTheme = {
            light: {
              primaryHex: lightPrimary,
              primaryFgHex: lightPrimaryFg,
              bgHex: lightBg,
              fgHex: lightFg,
            },
            dark: {
              primaryHex: darkPrimary,
              primaryFgHex: darkPrimaryFg,
              bgHex: darkBg,
              fgHex: darkFg,
            },
          };
        }
      }
      const newPreferences = {
        theme: selectedTheme,
        themeColorIndex: themeColorIndexVal,
        followPartnerColor: selectedFollowPartnerColor,
        defaultViewVariant: selectedVariant,
        showInstagramSidebar,
        customTheme,
      };
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("people")
        .update({
          name,
          surname,
          initials,
          short: short || name,
          image,
          preferences: newPreferences,
        })
        .eq("user_id", person.user_id);
      if (error) throw error;

      // Sync local preferences to storage / context
      localStorage.setItem(
        "uzzina-accent-color-index",
        String(themeColorIndexVal),
      );
      localStorage.setItem(
        "uzzina-follow-partner-color",
        String(selectedFollowPartnerColor),
      );
      if (themeColorIndexVal === -1) {
        setCustomTheme({
          light: {
            primaryHex: lightPrimary,
            primaryFgHex: lightPrimaryFg,
            bgHex: lightBg,
            fgHex: lightFg,
          },
          dark: {
            primaryHex: darkPrimary,
            primaryFgHex: darkPrimaryFg,
            bgHex: darkBg,
            fgHex: darkFg,
          },
        });
      }
      window.dispatchEvent(new Event("uzzina-storage-update"));
      toast.success("Perfil e preferências salvos com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar configurações.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lista estendida contendo o Sentinel personalizado
  const paletteOptions = [
    ...PALLETE.map((p, idx) => {
      const currentColors = theme === Theme.DARK ? p.dark : p.light;
      return {
        value: idx,
        label: p.label,
        icon: ({ className }: { className?: string }) => (
          <div
            className={cn(
              "size-4 shrink-0 rounded-lg transition-transform duration-200",
              className,
            )}
            style={{
              backgroundColor: `oklch(${currentColors.primary.l} ${currentColors.primary.c} ${currentColors.primary.h})`,
              border:
                theme === Theme.DARK
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "1px solid rgba(0,0,0,0.1)",
            }}
          />
        ),
      };
    }),
    {
      value: -1,
      label: "Personalizado",
      icon: ({ className }: { className?: string }) => (
        <div
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-zinc-200 text-zinc-600 transition-transform duration-200 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400",
            className,
          )}
        >
          <PipetteIcon className="size-2.5" />
        </div>
      ),
    },
  ];
  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-6 sm:p-8">
      <div className="flex items-center justify-between border-b pb-6">
        <h1 className="p-0 text-2xl font-bold tracking-tight text-foreground">
          Minha Conta
        </h1>
        <div className="text-sm text-muted-foreground">
          Gerencie os detalhes do seu perfil e as configurações do espaço de
          trabalho.
        </div>
      </div>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        {/* Hidden inputs to capture state changes */}
        <input name="image" type="hidden" value={imageUrl || ""} />
        <input
          name="followPartnerColor"
          type="hidden"
          value={String(selectedFollowPartnerColor)}
        />
        <input
          name="showInstagramSidebar"
          type="hidden"
          value={String(showInstagramSidebar)}
        />

        {selectedThemeColor === -1 && (
          <>
            <input
              name="custom_light_primary"
              type="hidden"
              value={lightPrimary}
            />
            <input
              name="custom_light_primary_fg"
              type="hidden"
              value={lightPrimaryFg}
            />
            <input name="custom_light_bg" type="hidden" value={lightBg} />
            <input name="custom_light_fg" type="hidden" value={lightFg} />
            <input
              name="custom_dark_primary"
              type="hidden"
              value={darkPrimary}
            />
            <input
              name="custom_dark_primary_fg"
              type="hidden"
              value={darkPrimaryFg}
            />
            <input name="custom_dark_bg" type="hidden" value={darkBg} />
            <input name="custom_dark_fg" type="hidden" value={darkFg} />
          </>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
          {/* Left Column: Personal Info */}
          <div className="flex flex-col gap-6 py-6">
            <h2 className="text-lg font-bold">Informações Pessoais</h2>

            {/* Profile Avatar Upload */}
            <div className="flex items-center gap-4">
              <CloudinaryUpload
                className="group relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-full transition hover:opacity-90"
                cloudName={cloudName}
                folder="uzzina/people"
                onUpload={(url) => setImageUrl(url)}
                outputWidth={400}
                square
                uploadPreset={uploadPreset}
              >
                <UAvatar
                  key={imageUrl ?? "empty"}
                  fallback={person.initials || "?"}
                  image={imageUrl}
                  size="xl"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <UploadIcon className="size-5 text-white" />
                </div>
              </CloudinaryUpload>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Foto de Perfil</span>
                <span className="text-xs text-muted-foreground">
                  Clique na imagem para enviar uma nova
                </span>
                {imageUrl && (
                  <button
                    className="mt-0.5 text-left text-xs text-muted-foreground underline hover:text-foreground"
                    onClick={() => setImageUrl(null)}
                    type="button"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <PrismLabel htmlFor="name">Nome</PrismLabel>
                <PrismInput
                  defaultValue={person.name}
                  id="name"
                  name="name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <PrismLabel htmlFor="surname">Sobrenome</PrismLabel>
                <PrismInput
                  defaultValue={person.surname}
                  id="surname"
                  name="surname"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <PrismLabel htmlFor="initials">Iniciais</PrismLabel>
                  <PrismInput
                    defaultValue={person.initials}
                    id="initials"
                    maxLength={2}
                    name="initials"
                    placeholder="AB"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <PrismLabel htmlFor="short">Nome Curto</PrismLabel>
                  <PrismInput
                    defaultValue={person.short}
                    id="short"
                    name="short"
                    placeholder="Nome de exibição preferido"
                  />
                </div>
              </div>

              <div className="grid gap-2 border-t pt-4">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  E-mail da Conta
                </span>
                <span className="text-sm font-medium text-foreground/80">
                  {person.email || "Nenhum e-mail associado"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Nota: O endereço de e-mail é gerenciado pelo administrador do
                  espaço de trabalho.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Preferences */}
          <div className="flex flex-col gap-6 py-6">
            <h2 className="text-lg font-bold">Preferências</h2>

            {/* Theme Preference Selection */}
            <div className="grid gap-3">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Tema do App
              </span>
              <SegmentedSelector
                columns={3}
                name="theme"
                onChange={(val) =>
                  handleThemeChange(val as "light" | "dark" | "system")
                }
                options={[
                  {
                    value: "light",
                    label: "Claro",
                    icon: SunIcon,
                  },
                  {
                    value: "dark",
                    label: "Escuro",
                    icon: MoonIcon,
                  },
                  {
                    value: "system",
                    label: "Sistema",
                    icon: LaptopIcon,
                  },
                ]}
                value={selectedTheme}
              />
            </div>

            {/* Accent Theme Color Selection */}
            <div className="grid gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Cor de Destaque
                </span>
                <span className="text-xs text-muted-foreground">
                  Selecione a paleta de cores primárias para a interface do
                  aplicativo.
                </span>
              </div>
              <SegmentedSelector
                columns={6}
                columnsClassName="grid-cols-5 sm:grid-cols-9 gap-2"
                hideLabelText
                name="themeColorIndex"
                onChange={(val) => handleColorChange(val as number)}
                options={paletteOptions}
                value={selectedThemeColor}
              />
            </div>

            {/* Painel Customizado */}
            {selectedThemeColor === -1 && (
              <div className="grid gap-4 rounded-xl border bg-zinc-50/50 p-4 dark:bg-zinc-950/20">
                <div className="flex items-center gap-2 border-b pb-2">
                  <PipetteIcon className="size-4 text-primary" />
                  <span className="text-sm font-semibold">
                    Editar Tema Personalizado
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {/* Coluna Light */}
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Modo Claro
                    </span>
                    <div className="grid gap-3">
                      {/* Destaque (Accent) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Destaque (Accent)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: lightPrimary,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) =>
                              handleLightPrimaryChange(e.target.value)
                            }
                            type="color"
                            value={lightPrimary}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {lightPrimary}
                          </span>
                        </label>
                      </div>

                      {/* Texto no Destaque (Accent Fg) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Texto no Destaque (Accent Fg)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: lightPrimaryFg,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) =>
                              handleLightPrimaryFgChange(e.target.value)
                            }
                            type="color"
                            value={lightPrimaryFg}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {lightPrimaryFg}
                          </span>
                        </label>
                      </div>

                      {/* Fundo (Background) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Fundo (Background)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: lightBg,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) =>
                              handleLightBgChange(e.target.value)
                            }
                            type="color"
                            value={lightBg}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {lightBg}
                          </span>
                        </label>
                      </div>

                      {/* Texto (Foreground) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Texto (Foreground)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: lightFg,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) =>
                              handleLightFgChange(e.target.value)
                            }
                            type="color"
                            value={lightFg}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {lightFg}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Dark */}
                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Modo Escuro
                    </span>
                    <div className="grid gap-3">
                      {/* Destaque (Accent) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Destaque (Accent)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: darkPrimary,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) =>
                              handleDarkPrimaryChange(e.target.value)
                            }
                            type="color"
                            value={darkPrimary}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {darkPrimary}
                          </span>
                        </label>
                      </div>

                      {/* Texto no Destaque (Accent Fg) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Texto no Destaque (Accent Fg)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: darkPrimaryFg,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) =>
                              handleDarkPrimaryFgChange(e.target.value)
                            }
                            type="color"
                            value={darkPrimaryFg}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {darkPrimaryFg}
                          </span>
                        </label>
                      </div>

                      {/* Fundo (Background) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Fundo (Background)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: darkBg,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) => handleDarkBgChange(e.target.value)}
                            type="color"
                            value={darkBg}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {darkBg}
                          </span>
                        </label>
                      </div>

                      {/* Texto (Foreground) */}
                      <div className="flex flex-col gap-1.5">
                        <PrismLabel className="text-xs text-muted-foreground">
                          Texto (Foreground)
                        </PrismLabel>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{
                              backgroundColor: darkFg,
                            }}
                          />
                          <input
                            className="sr-only"
                            onChange={(e) => handleDarkFgChange(e.target.value)}
                            type="color"
                            value={darkFg}
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {darkFg}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de Previsão Visual dos Elementos Derivados */}
                <div className="mt-2 border-t pt-3">
                  <span className="mb-2 block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Pré-visualização de Elementos Derivados
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col justify-between rounded-lg border bg-primary p-3 text-primary-foreground">
                      <span className="text-xs font-semibold">
                        Botão Destaque
                      </span>
                      <span className="text-[9px] opacity-80">
                        Usa o Accent Fg
                      </span>
                    </div>
                    <div className="rounded-lg border bg-card p-3 text-card-foreground">
                      <span className="block text-xs font-semibold">
                        Card & Popover
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        Fundo & texto derivados.
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-muted p-3 text-muted-foreground">
                      <span className="text-xs font-semibold">Muted</span>
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[9px] text-foreground">
                        Borda
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Follow Partner Color Toggle */}
            <PreferenceSwitch
              checked={selectedFollowPartnerColor}
              description="Substitui as cores do tema do aplicativo pelas cores da marca do cliente ativo."
              id="followPartnerColor"
              label="Usar Cores dos Clientes"
              onCheckedChange={setSelectedFollowPartnerColor}
            />

            {/* Default Calendar Layout Preference */}
            <div className="grid gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Visualização Padrão
                </span>
                <span className="text-xs text-muted-foreground">
                  Escolha o layout de visualização inicial especificamente para
                  os painéis de clientes.
                </span>
              </div>
              <SegmentedSelector
                name="defaultViewVariant"
                onChange={(val) =>
                  setSelectedVariant(val as "line" | "block" | "content")
                }
                options={[
                  {
                    value: "line",
                    label: "Linha",
                    icon: ListIcon,
                  },
                  {
                    value: "block",
                    label: "Bloco",
                    icon: LayoutGridIcon,
                  },
                  {
                    value: "content",
                    label: "Conteúdo",
                    icon: ImageIcon,
                  },
                ]}
                value={selectedVariant}
              />
            </div>

            {/* Show Instagram Sidebar by Default Toggle */}
            <PreferenceSwitch
              checked={showInstagramSidebar}
              description="Decida se o painel do feed do Instagram inicia aberto nas páginas dos clientes."
              id="showInstagramSidebar"
              label="Sidebar do Instagram por Padrão"
              onCheckedChange={setShowInstagramSidebar}
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex justify-end pt-4">
          <PrismButton
            className="rounded-2xl squircle"
            isDisabled={isSubmitting}
            type="submit"
          >
            <IconCloud />
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </PrismButton>
        </div>
      </form>
    </div>
  );
}
