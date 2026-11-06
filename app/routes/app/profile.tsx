import { UAIAllowanceMeter } from "~/components/uzzina/UAIAllowanceMeter";
import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { createFileRoute } from "@tanstack/react-router";
import {
  BlocksIcon,
  Grid3x3Icon,
  HeartHandshakeIcon,
  KanbanIcon,
  ImageIcon,
  LaptopIcon,
  LayoutGridIcon,
  ListIcon,
  MoonIcon,
  PipetteIcon,
  SunIcon,
  UploadIcon,
  SparklesIcon,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { preferenceRecord } from "~/lib/preference-persistence";
import { toast } from "sonner";
import { Theme, useAppThemeContext } from "~/hooks/useAppTheme";
import { QUERY_KEYS } from "~/lib/query-keys";
import { getMyAIAllowance } from "~/models/ai-usage";
import {
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
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
import {
  getUserPreferences,
  isTodayViewMode,
  type TodayViewMode,
} from "~/lib/preferences";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { updateMyPreferences, updateOwnProfile } from "~/models/people";
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

// Text-labelled choices need more horizontal room than the icon-sized Prism toggle default.
const PROFILE_CHOICE_CLASS_NAME =
  "max-w-full px-4 whitespace-normal [overflow-wrap:anywhere]";

/**
 * Decorative accent sample. Colors come from the same PALLETE data as the
 * header menu; without a color it renders the neutral custom-theme chip.
 */
function PaletteSwatch({
  color,
  isDark,
}: {
  color?: { l: number; c: number; h: number };
  isDark: boolean;
}) {
  if (!color) {
    return (
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-zinc-200 text-zinc-600 squircle dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400"
        data-palette-swatch="custom"
      >
        <PipetteIcon className="size-2.5" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="size-4 shrink-0 rounded-lg squircle"
      data-palette-swatch="color"
      style={{
        backgroundColor: `oklch(${color.l} ${color.c} ${color.h})`,
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
      }}
    />
  );
}
function ProfilePage() {
  const { person, cloudName, uploadPreset } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);
  useFillScrollViewport(pageRef);
  const isDesktop = useIsDesktop();
  const [mobileSection, setMobileSection] = useState("preferences");
  const queryClient = useQueryClient();
  const generation = useRef(getQuerySessionGeneration(queryClient)).current;
  const isCurrentSession = () =>
    getQuerySessionGeneration(queryClient) === generation;
  const preferences = getUserPreferences(person);
  const {
    theme,
    setTheme,
    previewColorIndex,
    previewCustomTheme,
    setCustomTheme,
  } = useAppThemeContext();
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
  const [selectedTodayView, setSelectedTodayView] = useState<TodayViewMode>(
    preferences.defaultTodayView,
  );
  const [showInstagramSidebar, setShowInstagramSidebar] = useState<boolean>(
    preferences.showInstagramSidebar,
  );

  const [customThemeDraft, setCustomThemeDraft] = useState(() =>
    createCustomThemeDraft(preferences.customTheme),
  );

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const {
    data: aiUsage,
    isLoading: isLoadingAIUsage,
    isError: isAIUsageError,
    refetch: refetchAIUsage,
  } = useQuery({
    queryKey: QUERY_KEYS.aiUsage(person.user_id),
    queryFn: () => getMyAIAllowance(supabase),
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Aplica preview do tema na UI quando o usuário apenas seleciona
  const handleThemeChange = (val: "light" | "dark" | "system") => {
    setSelectedTheme(val);
    setTheme(val);
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
    if (!isCurrentSession() || isSubmitting) return;
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
        ...(selectedTodayView !== preferences.defaultTodayView ||
        Object.hasOwn(preferenceRecord(person.preferences), "defaultTodayView")
          ? { defaultTodayView: selectedTodayView }
          : {}),
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
      const savedPreferences = await updateMyPreferences(
        supabase,
        newPreferences,
      );
      if (!isCurrentSession()) return;
      person.preferences = savedPreferences;

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

  return (
    <PrismTabs
      ref={pageRef}
      selectedKey={mobileSection}
      onSelectionChange={(key) => {
        if (key === "personal" || key === "preferences") setMobileSection(key);
      }}
      className="mx-auto flex min-h-0 w-full max-w-5xl flex-col overflow-hidden px-3 pt-3 lg:px-8 lg:pt-8"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b pb-3 lg:gap-8 lg:pb-6">
        <h1 className="p-0 text-2xl font-bold tracking-tight text-foreground">
          Minha Conta
        </h1>
        <PrismButton
          className="h-auto min-h-11 max-w-full rounded-2xl px-3 py-2 squircle lg:h-10 lg:min-h-10 lg:px-5 lg:py-0"
          form="profile-form"
          isDisabled={isSubmitting}
          type="submit"
        >
          <CloudIcon />
          <span className="min-w-0 whitespace-normal">
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </span>
        </PrismButton>
      </div>

      <PrismTabList aria-label="Seção da conta" className="shrink-0 lg:hidden">
        <PrismTab id="personal" className="[overflow-wrap:anywhere]">
          Informações pessoais
        </PrismTab>
        <PrismTab id="preferences">Preferências</PrismTab>
      </PrismTabList>
      <form
        id="profile-form"
        className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] gap-x-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]"
        onSubmit={handleSubmit}
        onInvalidCapture={(event) => {
          // Reveal invalid personal fields before native validation moves focus.
          if (
            event.target instanceof HTMLElement &&
            event.target.closest('[aria-label="Informações pessoais"]')
          ) {
            flushSync(() => setMobileSection("personal"));
          }
        }}
      >
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

        {/* Left Column: Personal Info */}
        <PrismTabPanel
          id="personal"
          shouldForceMount
          isAlwaysVisible={isDesktop}
          aria-label="Informações pessoais"
          className={cn(
            "min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain py-3 lg:flex lg:gap-6 lg:py-6",
            "flex",
          )}
        >
          <h2 className="text-lg font-bold">Informações Pessoais</h2>

          {/* Profile Avatar Upload */}
          <div className="flex items-center gap-4 pl-1">
            <CloudinaryUpload
              variant="ghost"
              className="group relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-full p-0 transition no-squircle! hover:opacity-90"
              cloudName={cloudName}
              folder="uzzina/people"
              onUpload={(url) => setImageUrl(url)}
              outputWidth={400}
              square
              uploadPreset={uploadPreset}
            >
              <UAvatar
                key={imageUrl ?? "empty"}
                className="size-full"
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
                <PrismButton
                  className="mt-0.5 h-auto p-0 text-left text-xs text-muted-foreground hover:text-foreground"
                  onPress={() => setImageUrl(null)}
                  size="xs"
                  variant="link"
                >
                  Remover foto
                </PrismButton>
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
          <AppBarSpacer />
        </PrismTabPanel>

        {/* Right Column: Preferences */}
        <PrismTabPanel
          id="preferences"
          shouldForceMount
          isAlwaysVisible={isDesktop}
          aria-label="Preferências"
          className={cn(
            "min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain py-3 lg:col-start-2 lg:row-start-1 lg:flex lg:gap-6 lg:py-6",
            "flex",
          )}
        >
          <h2 className="text-lg font-bold">Preferências</h2>

          {/* Theme Preference Selection */}
          <div className="grid gap-3">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tema do App
            </span>
            <PrismToggleGroup
              className="max-w-full flex-wrap"
              aria-label="Tema do App"
              selectedKeys={[selectedTheme]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as "light" | "dark" | "system";
                if (val) handleThemeChange(val);
              }}
            >
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="light"
              >
                <SunIcon />
                Claro
              </PrismToggleGroupItem>
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="dark"
              >
                <MoonIcon />
                Escuro
              </PrismToggleGroupItem>
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="system"
              >
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
              className="max-w-full flex-wrap"
              selectedKeys={[String(selectedThemeColor)]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                if (val !== undefined) handleColorChange(Number(val));
              }}
            >
              {PALLETE.map((palette, idx) => (
                <PrismToggleGroupItem
                  className={PROFILE_CHOICE_CLASS_NAME}
                  id={String(idx)}
                  key={palette.id}
                >
                  <PaletteSwatch
                    color={
                      theme === Theme.DARK
                        ? palette.dark.primary
                        : palette.light.primary
                    }
                    isDark={theme === Theme.DARK}
                  />
                  {palette.label}
                </PrismToggleGroupItem>
              ))}
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="-1"
              >
                <PaletteSwatch isDark={theme === Theme.DARK} />
                Personalizado
              </PrismToggleGroupItem>
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
            className="max-lg:flex-wrap max-lg:gap-3 max-lg:[&>div]:min-w-0 max-lg:[&>div]:flex-1 max-lg:[&>div]:basis-40"
            checked={selectedFollowPartnerColor}
            description="Substitui as cores do tema do aplicativo pelas cores da marca do cliente ativo."
            id="followPartnerColor"
            label="Usar Cores dos Clientes"
            onCheckedChange={setSelectedFollowPartnerColor}
          />

          {/* Default View Selection */}
          <div className="grid gap-3 border-t pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Layout Padrão
              </span>
              <span className="text-xs text-muted-foreground">
                Escolha o layout de visualização inicial especificamente para os
                painéis de clientes.
              </span>
            </div>
            <PrismToggleGroup
              className="max-w-full flex-wrap"
              aria-label="Layout padrão"
              selectedKeys={[selectedVariant]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as "line" | "block" | "content";
                if (val) setSelectedVariant(val);
              }}
            >
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="line"
              >
                <ListIcon />
                Linha
              </PrismToggleGroupItem>
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="block"
              >
                <LayoutGridIcon />
                Bloco
              </PrismToggleGroupItem>
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="content"
              >
                <ImageIcon />
                Conteúdo
              </PrismToggleGroupItem>
            </PrismToggleGroup>
          </div>

          <div className="grid gap-3 border-t pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Visualização inicial do Hoje
              </span>
              <span className="text-xs text-muted-foreground">
                Escolha como abrir o Hoje na Home e na página Hoje. As trocas de
                visualização durante o uso continuam temporárias.
              </span>
            </div>
            <PrismToggleGroup
              aria-label="Visualização inicial do Hoje"
              className="max-w-full flex-wrap"
              selectedKeys={[selectedTodayView]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                if (isTodayViewMode(value)) setSelectedTodayView(value);
              }}
            >
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="kanban"
              >
                <KanbanIcon />
                Kanban
              </PrismToggleGroupItem>
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="categories"
              >
                <Grid3x3Icon />
                Categorias
              </PrismToggleGroupItem>
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="feed"
              >
                <BlocksIcon />
                Feed
              </PrismToggleGroupItem>
              <PrismToggleGroupItem
                className={PROFILE_CHOICE_CLASS_NAME}
                id="partners"
              >
                <HeartHandshakeIcon />
                Parceiros
              </PrismToggleGroupItem>
            </PrismToggleGroup>
          </div>

          {/* Show Instagram Sidebar by Default Toggle */}
          <UPreferenceSwitch
            className="max-lg:flex-wrap max-lg:gap-3 max-lg:[&>div]:min-w-0 max-lg:[&>div]:flex-1 max-lg:[&>div]:basis-40"
            checked={showInstagramSidebar}
            description="Decida se o painel do feed do Instagram inicia aberto nas páginas dos clientes."
            id="showInstagramSidebar"
            label="Sidebar do Instagram por Padrão"
            onCheckedChange={setShowInstagramSidebar}
          />

          {/* Personal monthly AI allowance */}
          <div className="grid gap-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <SparklesIcon className="size-3.5 text-primary" />
                Meu uso de IA
              </span>
              {aiUsage?.period && (
                <span className="text-xs font-medium text-muted-foreground">
                  {aiUsage.period}
                </span>
              )}
            </div>

            {isLoadingAIUsage ? (
              <div className="h-20 w-full animate-pulse rounded-2xl bg-muted/40 squircle" />
            ) : isAIUsageError ? (
              <div
                className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
                role="status"
              >
                <span>Não foi possível consultar o consumo de IA.</span>
                <PrismButton
                  size="xs"
                  variant="ghost"
                  onPress={() => void refetchAIUsage()}
                >
                  Tentar novamente
                </PrismButton>
              </div>
            ) : aiUsage ? (
              <UAIAllowanceMeter percentage={aiUsage.percentage}>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {aiUsage.total_generations}{" "}
                    {aiUsage.total_generations === 1
                      ? "geração registrada"
                      : "gerações registradas"}
                  </span>
                  <span>Renova às 00h UTC no dia 1</span>
                </div>
                {aiUsage.has_pending && (
                  <p className="text-xs text-muted-foreground" role="status">
                    Há gerações com saldo reservado aguardando conciliação.
                  </p>
                )}
                {aiUsage.incomplete_generations > 0 && (
                  <p className="text-xs text-muted-foreground" role="status">
                    {aiUsage.incomplete_generations} geração(ões) sem dados
                    completos de consumo.
                  </p>
                )}
              </UAIAllowanceMeter>
            ) : (
              <div className="rounded-2xl border border-border/40 bg-muted/10 p-4 text-xs text-muted-foreground squircle">
                Consumo de IA ainda não medido neste mês.
              </div>
            )}
          </div>
          <AppBarSpacer />
        </PrismTabPanel>
      </form>
    </PrismTabs>
  );
}
