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
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { toast } from "sonner";
import {
  Theme,
  useAppThemeContext,
} from "~/hooks/useAppTheme";
import {
  PrismButton,
  PrismInput,
  PrismLabel,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { UPreferenceSwitch } from "~/components/uzzina/UPreferenceSwitch";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { useAppContext } from "~/contexts/AppContext";
import { PALLETE } from "~/lib/palettes";
import { getUserPreferences } from "~/lib/preferences";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { updateOwnProfile } from "~/models/people";
import { cn } from "cnfast";
import { CloudIcon } from "lucide-react";
import { CustomThemePanel } from "~/components/features/profile/CustomThemePanel";
import {
  applyCustomThemeChange,
  createCustomThemeDraft,
  isCompleteCustomTheme,
  type ThemeColorKey,
  type ThemeMode,
} from "~/lib/custom-theme";
export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});
export const runtime = "edge";
function ProfilePage() {
  const { person, cloudName, uploadPreset } = useAppContext();
  const queryClient = useQueryClient();
  const generation = useRef(getQuerySessionGeneration(queryClient)).current;
  const isCurrentSession = () => getQuerySessionGeneration(queryClient) === generation;
  const preferences = getUserPreferences(person);
  const { theme, setTheme, previewColorIndex, previewCustomTheme, setCustomTheme } =
    useAppThemeContext();
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

  const [customThemeDraft, setCustomThemeDraft] = useState(() =>
    createCustomThemeDraft(preferences.customTheme),
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
      previewCustomTheme(customThemeDraft);
    } else {
      previewColorIndex(idx);
    }
  };
  const handleCustomThemeChange = (
    mode: ThemeMode,
    key: ThemeColorKey,
    value: string,
  ) => {
    const next = applyCustomThemeChange(customThemeDraft, mode, key, value);
    setCustomThemeDraft(next);
    previewCustomTheme(next);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isCurrentSession()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const surname = formData.get("surname") as string;
      const initials = formData.get("initials") as string;
      const short = formData.get("short") as string;
      const image = (formData.get("image") as string) || null;
      const themeColorIndexVal = Number(formData.get("themeColorIndex"));
      const customThemeToSave =
        themeColorIndexVal === -1 && isCompleteCustomTheme(customThemeDraft)
          ? customThemeDraft
          : null;
      const newPreferences = {
        theme: selectedTheme,
        themeColorIndex: themeColorIndexVal,
        followPartnerColor: selectedFollowPartnerColor,
        defaultViewVariant: selectedVariant,
        showInstagramSidebar,
        customTheme: customThemeToSave,
      };
      const supabase = createSupabaseBrowserClient();
      await updateOwnProfile(supabase, person.user_id, {
        name,
        surname,
        initials,
        short: short || name,
        image,
      });

      if (!isCurrentSession()) return;
      const preferenceResult = await supabase.rpc("update_my_preferences", {p_patch: newPreferences});
      if (!isCurrentSession()) return;
      if (preferenceResult.error) throw preferenceResult.error;
      if (!preferenceResult.data || typeof preferenceResult.data !== "object" || Array.isArray(preferenceResult.data)) {
        throw new Error("Invalid preferences confirmation");
      }
      person.preferences = preferenceResult.data;

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
        setCustomTheme(customThemeDraft);
      }
      window.dispatchEvent(new Event("uzzina-storage-update"));
      toast.success("Perfil e preferências salvos com sucesso!");
    } catch (err) {
      if (!isCurrentSession()) return;
      console.error(err);
      toast.error("Erro ao salvar configurações.");
    } finally {
      if (isCurrentSession()) setIsSubmitting(false);
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
              <PrismToggleGroup
                aria-label="Tema do App"
                selectedKeys={[selectedTheme]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as "light" | "dark" | "system";
                  if (val) handleThemeChange(val);
                }}
              >
                <PrismToggleGroupItem id="light">
                  <SunIcon />
                  Claro
                </PrismToggleGroupItem>
                <PrismToggleGroupItem id="dark">
                  <MoonIcon />
                  Escuro
                </PrismToggleGroupItem>
                <PrismToggleGroupItem id="system">
                  <LaptopIcon />
                  Sistema
                </PrismToggleGroupItem>
              </PrismToggleGroup>
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
              <PrismToggleGroup
                aria-label="Cor de Destaque"
                selectedKeys={[String(selectedThemeColor)]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0];
                  if (val !== undefined) handleColorChange(Number(val));
                }}
              >
                {paletteOptions.map((opt) => (
                  <PrismToggleGroupItem id={String(opt.value)} key={opt.value}>
                    {opt.label}
                  </PrismToggleGroupItem>
                ))}
              </PrismToggleGroup>
            </div>

            {selectedThemeColor === -1 && (
              <CustomThemePanel
                onChange={handleCustomThemeChange}
                theme={customThemeDraft}
              />
            )}

            {/* Follow Partner Color Toggle */}
            <UPreferenceSwitch
              checked={selectedFollowPartnerColor}
              description="Substitui as cores do tema do aplicativo pelas cores da marca do cliente ativo."
              id="followPartnerColor"
              label="Usar Cores dos Clientes"
              onCheckedChange={setSelectedFollowPartnerColor}
            />

            {/* Default View Selection */}
            <div className="grid gap-3 pt-4 border-t">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Layout Padrão
                </span>
                <span className="text-xs text-muted-foreground">
                  Escolha o layout de visualização inicial especificamente para
                  os painéis de clientes.
                </span>
              </div>
              <PrismToggleGroup
                aria-label="Layout padrão"
                selectedKeys={[selectedVariant]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0] as "line" | "block" | "content";
                  if (val) setSelectedVariant(val);
                }}
              >
                <PrismToggleGroupItem id="line">
                  <ListIcon />
                  Linha
                </PrismToggleGroupItem>
                <PrismToggleGroupItem id="block">
                  <LayoutGridIcon />
                  Bloco
                </PrismToggleGroupItem>
                <PrismToggleGroupItem id="content">
                  <ImageIcon />
                  Conteúdo
                </PrismToggleGroupItem>
              </PrismToggleGroup>
            </div>

            {/* Show Instagram Sidebar by Default Toggle */}
            <UPreferenceSwitch
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
            <CloudIcon />
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </PrismButton>
        </div>
      </form>
    </div>
  );
}
