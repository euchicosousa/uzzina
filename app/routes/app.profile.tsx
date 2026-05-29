import {
  ImageIcon,
  LaptopIcon,
  LayoutGridIcon,
  ListIcon,
  MoonIcon,
  SaveIcon,
  SunIcon,
  UploadIcon,
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
import { getUserPreferences } from "~/lib/preferences";
import { cn } from "~/lib/utils";
import { getPersonByUserId } from "~/models/people.server";
import { getUserId } from "~/services/auth.server";
import { themeSessionResolver } from "~/sessions.server";
import { useAppTheme } from "~/hooks/useAppTheme";

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

  const preferences = {
    theme,
    themeColorIndex,
    followPartnerColor,
    defaultViewVariant,
    showInstagramSidebar,
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
  const { previewColorIndex } = useAppTheme();
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
    previewColorIndex(idx);
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
      window.dispatchEvent(new Event("uzzina-storage-update"));
    } else if (actionData?.error) {
      toast.error(`Erro ao salvar configurações: ${actionData.error}`);
    }
  }, [actionData]);

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
                options={PALLETE.map((p, idx) => {
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
                })}
                value={selectedThemeColor}
                onChange={handleColorChange}
                columnsClassName="grid-cols-5 sm:grid-cols-9 gap-2"
                hideLabelText
                selectedClassName="border-primary bg-primary/20 scale-[1.02] shadow-sm"
                unselectedClassName="border-border bg-transparent hover:bg-card/40"
              />
            </div>

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
