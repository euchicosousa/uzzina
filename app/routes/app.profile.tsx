import {
  ImageIcon,
  LaptopIcon,
  LayoutGridIcon,
  ListIcon,
  MoonIcon,
  SaveIcon,
  SunIcon,
  UploadIcon,
  PipetteIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Form,
  data,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Theme, useTheme } from "remix-themes";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { PreferenceSwitch } from "~/components/uzzina/PreferenceSwitch";
import { SegmentedSelector } from "~/components/uzzina/SegmentedSelector";
import { PALLETE } from "~/lib/CONSTANTS";
import { getUserPreferences, type CustomTheme } from "~/lib/preferences";
import { cn } from "~/lib/utils";
import { getPersonByUserId } from "~/models/people.server";
import { getUserId } from "~/services/auth.server";
import { themeSessionResolver } from "~/sessions.server";
import { useAppTheme } from "~/hooks/useAppTheme";
import {
  deriveAccentFg,
  deriveDarkAccent,
  deriveDarkBg,
  deriveDarkFg,
} from "~/utils/color";

export const runtime = "edge";

export const meta: MetaFunction = () => {
  return [{ title: "Minha Conta | Uzzina" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);
  const person = await getPersonByUserId(supabase, user_id);

  // Cloudinary credentials (publicly accessible)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!;

  return {
    person,
    cloudName,
    uploadPreset,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const initials = formData.get("initials") as string;
  const short = formData.get("short") as string;
  const image = (formData.get("image") as string) || null;

  // Preferences parsing
  const theme = formData.get("theme") as string;
  const themeColorIndex = Number(formData.get("themeColorIndex"));
  const followPartnerColor = formData.get("followPartnerColor") === "true";
  const defaultViewVariant = formData.get("defaultViewVariant") as string;
  const showInstagramSidebar = formData.get("showInstagramSidebar") === "true";

  // Custom theme colors (optional hexes)
  let customTheme = null;
  if (themeColorIndex === -1) {
    const lightPrimaryHex = formData.get("custom_light_primary") as string;
    const lightPrimaryFgHex = formData.get("custom_light_primary_fg") as string;
    const lightBgHex = formData.get("custom_light_bg") as string;
    const lightFgHex = formData.get("custom_light_fg") as string;
    const darkPrimaryHex = formData.get("custom_dark_primary") as string;
    const darkPrimaryFgHex = formData.get("custom_dark_primary_fg") as string;
    const darkBgHex = formData.get("custom_dark_bg") as string;
    const darkFgHex = formData.get("custom_dark_fg") as string;

    if (
      lightPrimaryHex &&
      lightPrimaryFgHex &&
      lightBgHex &&
      lightFgHex &&
      darkPrimaryHex &&
      darkPrimaryFgHex &&
      darkBgHex &&
      darkFgHex
    ) {
      customTheme = {
        light: {
          primaryHex: lightPrimaryHex,
          primaryFgHex: lightPrimaryFgHex,
          bgHex: lightBgHex,
          fgHex: lightFgHex,
        },
        dark: {
          primaryHex: darkPrimaryHex,
          primaryFgHex: darkPrimaryFgHex,
          bgHex: darkBgHex,
          fgHex: darkFgHex,
        },
      };
    }
  }

  const preferences = {
    theme,
    themeColorIndex,
    followPartnerColor,
    defaultViewVariant,
    showInstagramSidebar,
    customTheme,
  };

  const { error } = await supabase
    .from("people")
    .update({
      name,
      surname,
      initials,
      short: short || name,
      image,
      preferences,
    })
    .eq("user_id", user_id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  // Sync theme session cookie with remix-themes
  const resolver = await themeSessionResolver(request);
  resolver.setTheme(theme as Theme);

  return data(
    { success: true, error: null },
    {
      headers: {
        "Set-Cookie": await resolver.commit(),
      },
    },
  );
};

export default function ProfilePage() {
  const { person, cloudName, uploadPreset } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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

  // Trigger Toast Notification on success/error
  useEffect(() => {
    if (actionData?.success) {
      toast.success("Perfil e preferências salvos com sucesso!");
      localStorage.setItem(
        "uzzina-accent-color-index",
        String(selectedThemeColor),
      );
      localStorage.setItem(
        "uzzina-follow-partner-color",
        String(selectedFollowPartnerColor),
      );
      if (selectedThemeColor === -1) {
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
    } else if (actionData?.error) {
      toast.error(`Erro ao salvar configurações: ${actionData.error}`);
    }
  }, [actionData]);

  // Lista estendida contendo o Sentinel personalizado
  const paletteOptions = [
    ...PALLETE.map((p, idx) => {
      const currentColors = theme === Theme.DARK ? p.dark : p.light;
      const ColorDot = ({ className }: { className?: string }) => (
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
      );
      return {
        value: idx,
        label: p.label,
        icon: ColorDot,
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

      <Form method="post" className="flex flex-col gap-8">
        {/* Hidden inputs to capture state changes */}
        <input type="hidden" name="image" value={imageUrl || ""} />
        <input type="hidden" name="theme" value={selectedTheme} />
        <input
          type="hidden"
          name="themeColorIndex"
          value={selectedThemeColor}
        />
        <input
          type="hidden"
          name="followPartnerColor"
          value={String(selectedFollowPartnerColor)}
        />
        <input
          type="hidden"
          name="defaultViewVariant"
          value={selectedVariant}
        />
        <input
          type="hidden"
          name="showInstagramSidebar"
          value={String(showInstagramSidebar)}
        />

        {selectedThemeColor === -1 && (
          <>
            <input
              type="hidden"
              name="custom_light_primary"
              value={lightPrimary}
            />
            <input
              type="hidden"
              name="custom_light_primary_fg"
              value={lightPrimaryFg}
            />
            <input type="hidden" name="custom_light_bg" value={lightBg} />
            <input type="hidden" name="custom_light_fg" value={lightFg} />
            <input
              type="hidden"
              name="custom_dark_primary"
              value={darkPrimary}
            />
            <input
              type="hidden"
              name="custom_dark_primary_fg"
              value={darkPrimaryFg}
            />
            <input type="hidden" name="custom_dark_bg" value={darkBg} />
            <input type="hidden" name="custom_dark_fg" value={darkFg} />
          </>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1.8fr]">
          {/* Left Column: Personal Info */}
          <div className="flex flex-col gap-6 py-6">
            <h2 className="text-lg font-bold">Informações Pessoais</h2>

            {/* Profile Avatar Upload */}
            <div className="flex items-center gap-4">
              <CloudinaryUpload
                cloudName={cloudName}
                uploadPreset={uploadPreset}
                folder="uzzina/people"
                square
                outputWidth={400}
                onUpload={(url) => setImageUrl(url)}
                className="group relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-full transition hover:opacity-90"
              >
                <UAvatar
                  key={imageUrl ?? "empty"}
                  image={imageUrl}
                  fallback={person.initials || "?"}
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
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="mt-0.5 text-left text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={person.name}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="surname">Sobrenome</Label>
                <Input
                  id="surname"
                  name="surname"
                  defaultValue={person.surname}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="initials">Iniciais</Label>
                  <Input
                    id="initials"
                    name="initials"
                    defaultValue={person.initials}
                    required
                    maxLength={2}
                    placeholder="AB"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="short">Nome Curto</Label>
                  <Input
                    id="short"
                    name="short"
                    defaultValue={person.short}
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
                options={[
                  { value: "light", label: "Claro", icon: SunIcon },
                  { value: "dark", label: "Escuro", icon: MoonIcon },
                  { value: "system", label: "Sistema", icon: LaptopIcon },
                ]}
                value={selectedTheme}
                onChange={(val) => handleThemeChange(val as any)}
                columns={3}
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
                options={paletteOptions}
                value={selectedThemeColor}
                onChange={handleColorChange}
                columnsClassName="grid-cols-5 sm:grid-cols-9 gap-2"
                hideLabelText
                selectedClassName="border-primary bg-primary/20 scale-[1.02] shadow-sm"
                unselectedClassName="border-border bg-transparent hover:bg-card/40"
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
                        <Label className="text-xs text-muted-foreground">
                          Destaque (Accent)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: lightPrimary }}
                          />
                          <input
                            type="color"
                            value={lightPrimary}
                            onChange={(e) =>
                              handleLightPrimaryChange(e.target.value)
                            }
                            className="sr-only"
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {lightPrimary}
                          </span>
                        </label>
                      </div>

                      {/* Texto no Destaque (Accent Fg) */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Texto no Destaque (Accent Fg)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: lightPrimaryFg }}
                          />
                          <input
                            type="color"
                            value={lightPrimaryFg}
                            onChange={(e) =>
                              handleLightPrimaryFgChange(e.target.value)
                            }
                            className="sr-only"
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {lightPrimaryFg}
                          </span>
                        </label>
                      </div>

                      {/* Fundo (Background) */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Fundo (Background)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: lightBg }}
                          />
                          <input
                            type="color"
                            value={lightBg}
                            onChange={(e) =>
                              handleLightBgChange(e.target.value)
                            }
                            className="sr-only"
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {lightBg}
                          </span>
                        </label>
                      </div>

                      {/* Texto (Foreground) */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Texto (Foreground)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: lightFg }}
                          />
                          <input
                            type="color"
                            value={lightFg}
                            onChange={(e) =>
                              handleLightFgChange(e.target.value)
                            }
                            className="sr-only"
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
                        <Label className="text-xs text-muted-foreground">
                          Destaque (Accent)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: darkPrimary }}
                          />
                          <input
                            type="color"
                            value={darkPrimary}
                            onChange={(e) =>
                              handleDarkPrimaryChange(e.target.value)
                            }
                            className="sr-only"
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {darkPrimary}
                          </span>
                        </label>
                      </div>

                      {/* Texto no Destaque (Accent Fg) */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Texto no Destaque (Accent Fg)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: darkPrimaryFg }}
                          />
                          <input
                            type="color"
                            value={darkPrimaryFg}
                            onChange={(e) =>
                              handleDarkPrimaryFgChange(e.target.value)
                            }
                            className="sr-only"
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {darkPrimaryFg}
                          </span>
                        </label>
                      </div>

                      {/* Fundo (Background) */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Fundo (Background)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: darkBg }}
                          />
                          <input
                            type="color"
                            value={darkBg}
                            onChange={(e) => handleDarkBgChange(e.target.value)}
                            className="sr-only"
                          />
                          <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                            {darkBg}
                          </span>
                        </label>
                      </div>

                      {/* Texto (Foreground) */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Texto (Foreground)
                        </Label>
                        <label className="group flex cursor-pointer items-center gap-2">
                          <div
                            className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                            style={{ backgroundColor: darkFg }}
                          />
                          <input
                            type="color"
                            value={darkFg}
                            onChange={(e) => handleDarkFgChange(e.target.value)}
                            className="sr-only"
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
              id="followPartnerColor"
              label="Usar Cores dos Clientes"
              description="Substitui as cores do tema do aplicativo pelas cores da marca do cliente ativo."
              checked={selectedFollowPartnerColor}
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
                options={[
                  { value: "line", label: "Linha", icon: ListIcon },
                  { value: "block", label: "Bloco", icon: LayoutGridIcon },
                  { value: "content", label: "Conteúdo", icon: ImageIcon },
                ]}
                value={selectedVariant}
                onChange={(val) => setSelectedVariant(val as any)}
              />
            </div>

            {/* Show Instagram Sidebar by Default Toggle */}
            <PreferenceSwitch
              id="showInstagramSidebar"
              label="Sidebar do Instagram por Padrão"
              description="Decida se o painel do feed do Instagram inicia aberto nas páginas dos clientes."
              checked={showInstagramSidebar}
              onCheckedChange={setShowInstagramSidebar}
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex justify-end gap-4 border-t pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="squircle h-11 rounded-2xl px-6 text-sm font-semibold"
          >
            <SaveIcon className="mr-2 size-4" />
            {isSubmitting ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
