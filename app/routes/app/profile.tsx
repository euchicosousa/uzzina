import {
  AIModelIcon,
  UAIModelSelect,
} from "~/components/uzzina/UAIModelSelect";
import {
  actionAIModels,
  getAvailableAIModels,
  isActionAIModelId,
  lunaModelId,
  type ActionAIModelId,
} from "~/lib/action-ai-models";
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
  RefreshCwIcon,
  SunIcon,
} from "lucide-react";
import {
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { useFillScrollViewport } from "~/hooks/useFillScrollViewport";
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
  PrismBadge,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
  PrismInput,
  PrismLabel,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { UPreferenceSwitch } from "~/components/uzzina/UPreferenceSwitch";
import { UAvatarUpload } from "~/components/uzzina/UAvatarUpload";
import { useAppContext } from "~/contexts/AppContext";
import { PALLETE } from "~/lib/palettes";
import {
  getUserPreferences,
  isTodayViewMode,
  type CustomTheme,
  type TodayViewMode,
} from "~/lib/preferences";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { updateMyPreferences, updateOwnProfile } from "~/models/people";
import { CloudIcon } from "lucide-react";
import { CustomThemePanel } from "~/components/features/profile/CustomThemePanel";
import {
  applyCustomThemeChange,
  applyCustomThemeOption,
  createCustomThemeDraft,
  isCompleteCustomTheme,
  type CustomThemeOptionKey,
  type ThemeColorKey,
  type ThemeMode,
} from "~/lib/custom-theme";
import { z } from "zod";
import cn from "cnfast";

const profileSearchSchema = z.object({
  tab: z.enum(["personal", "appearance", "behavior", "ai"]).optional(),
});

export const Route = createFileRoute("/app/profile")({
  validateSearch: profileSearchSchema,
  component: ProfilePage,
});
export const runtime = "edge";

const PROFILE_TABS = [
  { id: "personal", label: "Informações pessoais" },
  { id: "appearance", label: "Aparência" },
  { id: "behavior", label: "Funcionamento" },
  { id: "ai", label: "Uso de IA" },
] as const;
type ProfileTab = (typeof PROFILE_TABS)[number]["id"];
const isProfileTab = (value: unknown): value is ProfileTab =>
  PROFILE_TABS.some((tab) => tab.id === value);

// Text-labelled choices need more horizontal room than the icon-sized Prism toggle default.
const PROFILE_CHOICE_CLASS_NAME =
  "max-w-full px-4 whitespace-normal [overflow-wrap:anywhere]";
// Contain visually hidden color inputs and leave room for focus rings and shadows.
const PROFILE_PANEL_CLASS_NAME =
  "relative grid min-h-0 flex-1 content-start gap-8 overflow-y-auto overscroll-y-contain p-4 md:px-2";

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

interface ProfileSettingProps {
  title: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

function ProfileSetting({
  title,
  badge,
  description,
  children,
  className,
}: ProfileSettingProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {typeof title === "string" ? <h5>{title}</h5> : title}
          {badge &&
            (isValidElement(badge) ? badge : <PrismBadge>{badge}</PrismBadge>)}
        </div>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function PartnerPageMockup({ showSidebar }: { showSidebar: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-60 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card/40 text-muted-foreground select-none"
    >
      {/* Top Header Bar */}
      <div className="flex h-7 w-full shrink-0 items-center justify-between border-b border-border/50 px-3">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-xs border border-border/80" />
          <div className="h-1.5 w-10 rounded-full border border-border/60" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 rounded-full border border-border/40" />
          <div className="h-1 w-8 rounded-full border border-border/40" />
        </div>
        <div className="size-3 rounded-full border border-border/70" />
      </div>

      {/* Subheader / Partner & Filter Controls */}
      <div className="flex h-7 w-full shrink-0 items-center justify-between border-b border-border/40 bg-muted/10 px-3">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full border border-border/70" />
          <div className="h-1.5 w-14 rounded-full border border-border/60" />
        </div>
        <div className="flex items-center gap-1 rounded-sm border border-border/40 px-1.5 py-0.5">
          <div className="h-1 w-10 rounded-full border border-border/50" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-12 rounded-full border border-border/40" />
          <div
            className={cn(
              "size-3 rounded-xs border transition-colors",
              showSidebar ? "border-primary bg-primary/20" : "border-border/60",
            )}
          />
        </div>
      </div>

      {/* Main Area: Calendar Grid + Animated Instagram Sidebar */}
      <div className="relative flex min-h-0 flex-1">
        {/* Calendar Grid */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Days of Week Row */}
          <div className="grid h-4 w-full grid-cols-7 border-b border-border/40">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center border-r border-border/20 last:border-r-0"
              >
                <div className="h-1 w-3 rounded-full border border-border/40" />
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid flex-1 grid-cols-7 grid-rows-4">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="border-r border-b border-border/20 p-1 last:border-r-0"
              >
                {(i === 2 || i === 8 || i === 11 || i === 19 || i === 24) && (
                  <div className="h-1.5 w-full rounded-xs border border-border/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instagram Sidebar (Animated) */}
        <div
          className={cn(
            "flex h-full flex-col border-primary bg-primary/20 transition-all duration-300 ease-in-out",
            showSidebar
              ? "w-[40%] border-t border-l opacity-100"
              : "pointer-events-none w-0 overflow-hidden border-l-0 opacity-0",
          )}
        >
          {/* Sidebar Partner Header */}
          <div className="flex h-6 w-full shrink-0 items-center gap-1.5 border-b border-primary/40 px-2">
            <div className="size-2 rounded-full border border-primary/60" />
            <div className="h-1.5 w-12 rounded-full border border-primary/60" />
          </div>

          {/* 3-Column Feed Grid */}
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-1 p-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xs border border-primary/50"
              />
            ))}
          </div>
        </div>

        {/* Floating Bottom App Bar (+ Nova Ação) */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-primary/60 bg-background/95 px-2.5 py-1 shadow-sm">
          <div className="size-2 rounded-full border border-primary/60" />
          <div className="h-1.5 w-10 rounded-full border border-primary/80" />
        </div>
      </div>
    </div>
  );
}

function getInitialProfileTab(): ProfileTab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return isProfileTab(tab) ? tab : "personal";
}

function ProfilePage() {
  const { person, cloudName, uploadPreset } = useAppContext();
  const pageRef = useRef<HTMLDivElement>(null);
  useFillScrollViewport(pageRef);
  const [section, setSection] = useState<ProfileTab>(getInitialProfileTab);

  useEffect(() => {
    const syncTab = () => setSection(getInitialProfileTab());
    window.addEventListener("popstate", syncTab);
    window.addEventListener("uzzina-profile-tab", syncTab);
    return () => {
      window.removeEventListener("popstate", syncTab);
      window.removeEventListener("uzzina-profile-tab", syncTab);
    };
  }, []);
  const queryClient = useQueryClient();
  const generation = useRef(getQuerySessionGeneration(queryClient)).current;
  const isCurrentSession = () =>
    getQuerySessionGeneration(queryClient) === generation;
  const preferences = getUserPreferences(person);
  const [strategyModelDraft, setStrategyModelDraft] =
    useState<ActionAIModelId>();
  const [contentModelDraft, setContentModelDraft] = useState<ActionAIModelId>();
  const [captionModelDraft, setCaptionModelDraft] = useState<ActionAIModelId>();
  const [strategyModelsDraft, setStrategyModelsDraft] =
    useState<ActionAIModelId[]>();
  const [contentModelsDraft, setContentModelsDraft] =
    useState<ActionAIModelId[]>();
  const [captionModelsDraft, setCaptionModelsDraft] =
    useState<ActionAIModelId[]>();
  const {
    theme,
    setTheme,
    previewColorIndex,
    previewCustomTheme,
    setCustomTheme,
  } = useAppThemeContext();
  const [imageUrl, setImageUrl] = useState<string | null>(person.image || null);
  const [nameDraft, setNameDraft] = useState(person.name || "");
  const [surnameDraft, setSurnameDraft] = useState(person.surname || "");
  const [initialsDraft, setInitialsDraft] = useState(person.initials || "");
  const [shortDraft, setShortDraft] = useState(person.short || "");
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >(preferences.theme);
  const [selectedThemeColor, setSelectedThemeColor] = useState<number>(
    preferences.themeColorIndex,
  );
  const [selectedVariant, setSelectedVariant] = useState<
    "line" | "block" | "content"
  >(preferences.defaultViewVariant);
  const [selectedTodayView, setSelectedTodayView] = useState<TodayViewMode>(
    preferences.defaultTodayView,
  );
  const [showInstagramSidebar, setShowInstagramSidebar] = useState<boolean>(
    preferences.showInstagramSidebar,
  );

  // Values loaded at mount; the submit sends only fields changed from these.
  const initialRef = useRef({
    name: person.name || "",
    surname: person.surname || "",
    initials: person.initials || "",
    short: person.short || "",
    image: person.image || null,
    ...preferences,
    customThemeKey: JSON.stringify(
      createCustomThemeDraft(preferences.customTheme),
    ),
  });

  const [customThemeDraft, setCustomThemeDraft] = useState(() =>
    createCustomThemeDraft(preferences.customTheme),
  );

  const isPersonalDirty =
    (imageUrl ?? null) !== (initialRef.current.image ?? null) ||
    nameDraft !== initialRef.current.name ||
    surnameDraft !== initialRef.current.surname ||
    initialsDraft !== initialRef.current.initials ||
    shortDraft !== initialRef.current.short;

  const isAppearanceDirty =
    selectedTheme !== initialRef.current.theme ||
    selectedThemeColor !== initialRef.current.themeColorIndex ||
    (selectedThemeColor === -1 &&
      JSON.stringify(customThemeDraft) !== initialRef.current.customThemeKey);

  const isBehaviorDirty =
    selectedVariant !== initialRef.current.defaultViewVariant ||
    selectedTodayView !== initialRef.current.defaultTodayView ||
    showInstagramSidebar !== initialRef.current.showInstagramSidebar;

  const isAIDirty =
    (strategyModelDraft !== undefined &&
      strategyModelDraft !==
        (initialRef.current.defaultStrategyModel ?? lunaModelId)) ||
    (contentModelDraft !== undefined &&
      contentModelDraft !==
        (initialRef.current.defaultContentModel ?? lunaModelId)) ||
    (captionModelDraft !== undefined &&
      captionModelDraft !==
        (initialRef.current.defaultCaptionModel ?? lunaModelId)) ||
    (strategyModelsDraft !== undefined &&
      JSON.stringify(strategyModelsDraft) !==
        JSON.stringify(initialRef.current.strategyModels)) ||
    (contentModelsDraft !== undefined &&
      JSON.stringify(contentModelsDraft) !==
        JSON.stringify(initialRef.current.contentModels)) ||
    (captionModelsDraft !== undefined &&
      JSON.stringify(captionModelsDraft) !==
        JSON.stringify(initialRef.current.captionModels));

  const dirtyMap: Record<ProfileTab, boolean> = {
    personal: isPersonalDirty,
    appearance: isAppearanceDirty,
    behavior: isBehaviorDirty,
    ai: isAIDirty,
  };

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [authEmail, setAuthEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth?.getSession?.().then(({ data }) => {
      if (active && data?.session?.user?.email) {
        setAuthEmail(data.session.user.email);
      }
    });
    return () => {
      active = false;
    };
  }, [supabase]);
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
  const handleCustomThemeOptionChange = <K extends CustomThemeOptionKey>(
    key: K,
    value: CustomTheme[K],
  ) => {
    const next = applyCustomThemeOption(customThemeDraft, key, value);
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
      const initial = initialRef.current;
      const colorChanged = selectedThemeColor !== initial.themeColorIndex;
      const customChanged =
        JSON.stringify(customThemeDraft) !== initial.customThemeKey;
      const newPreferences: Record<string, unknown> = {
        ...(selectedTheme !== initial.theme ? { theme: selectedTheme } : {}),
        ...(colorChanged ? { themeColorIndex: selectedThemeColor } : {}),
        ...(selectedVariant !== initial.defaultViewVariant
          ? { defaultViewVariant: selectedVariant }
          : {}),
        ...(selectedTodayView !== initial.defaultTodayView
          ? { defaultTodayView: selectedTodayView }
          : {}),
        ...(showInstagramSidebar !== initial.showInstagramSidebar
          ? { showInstagramSidebar }
          : {}),
        ...(strategyModelsDraft !== undefined &&
        JSON.stringify(strategyModelsDraft) !==
          JSON.stringify(initial.strategyModels)
          ? { strategyModels: strategyModelsDraft }
          : {}),
        ...(contentModelsDraft !== undefined &&
        JSON.stringify(contentModelsDraft) !==
          JSON.stringify(initial.contentModels)
          ? { contentModels: contentModelsDraft }
          : {}),
        ...(captionModelsDraft !== undefined &&
        JSON.stringify(captionModelsDraft) !==
          JSON.stringify(initial.captionModels)
          ? { captionModels: captionModelsDraft }
          : {}),
        ...(strategyModelDraft !== undefined &&
        strategyModelDraft !== (initial.defaultStrategyModel ?? lunaModelId)
          ? { defaultStrategyModel: strategyModelDraft }
          : {}),
        ...(contentModelDraft !== undefined &&
        contentModelDraft !== (initial.defaultContentModel ?? lunaModelId)
          ? { defaultContentModel: contentModelDraft }
          : {}),
        ...(captionModelDraft !== undefined &&
        captionModelDraft !== (initial.defaultCaptionModel ?? lunaModelId)
          ? { defaultCaptionModel: captionModelDraft }
          : {}),
        ...(selectedThemeColor !== -1
          ? colorChanged
            ? { customTheme: null }
            : {}
          : (colorChanged || customChanged) &&
              isCompleteCustomTheme(customThemeDraft)
            ? { customTheme: customThemeDraft }
            : colorChanged
              ? { customTheme: null }
              : {}),
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
      const sentKeys = Object.keys(newPreferences);
      if (sentKeys.length > 0) {
        const savedPreferences = await updateMyPreferences(
          supabase,
          newPreferences,
        );
        if (!isCurrentSession()) return;
        // Merge only the fields sent, keeping values saved by other surfaces.
        const merged = { ...preferenceRecord(person.preferences) };
        for (const key of sentKeys) merged[key] = savedPreferences[key];
        person.preferences = merged;
      }
      if (!isCurrentSession()) return;
      person.name = name;
      person.surname = surname;
      person.initials = initials;
      person.short = short;
      person.image = image;
      initialRef.current = {
        name,
        surname,
        initials,
        short,
        image,
        ...getUserPreferences(person),
        customThemeKey: JSON.stringify(customThemeDraft),
      };
      setStrategyModelDraft(undefined);
      setContentModelDraft(undefined);
      setCaptionModelDraft(undefined);
      setStrategyModelsDraft(undefined);
      setContentModelsDraft(undefined);
      setCaptionModelsDraft(undefined);

      // Sync local preferences to storage / context
      if ("themeColorIndex" in newPreferences) {
        localStorage.setItem(
          "uzzina-accent-color-index",
          String(selectedThemeColor),
        );
      }
      if (newPreferences.customTheme) setCustomTheme(customThemeDraft);
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

  const handleToggleTaskModel = (
    taskId: "strategy" | "content" | "caption",
    modelId: ActionAIModelId,
    checked: boolean,
  ) => {
    const currentList =
      taskId === "strategy"
        ? (strategyModelsDraft ?? preferences.strategyModels)
        : taskId === "content"
          ? (contentModelsDraft ?? preferences.contentModels)
          : (captionModelsDraft ?? preferences.captionModels);

    let nextList: ActionAIModelId[];
    if (checked) {
      nextList = currentList.includes(modelId)
        ? currentList
        : [...currentList, modelId];
    } else {
      nextList = currentList.filter((id) => id !== modelId);
      if (nextList.length === 0) {
        nextList = [lunaModelId];
      }
    }

    const currentDefault =
      taskId === "strategy"
        ? (strategyModelDraft ??
          preferences.defaultStrategyModel ??
          lunaModelId)
        : taskId === "content"
          ? (contentModelDraft ??
            preferences.defaultContentModel ??
            lunaModelId)
          : (captionModelDraft ??
            preferences.defaultCaptionModel ??
            lunaModelId);

    let nextDefault = currentDefault;
    if (!nextList.includes(currentDefault)) {
      nextDefault = nextList.includes(lunaModelId)
        ? lunaModelId
        : (nextList[0] ?? lunaModelId);
    }

    if (taskId === "strategy") {
      setStrategyModelsDraft(nextList);
      if (nextDefault !== currentDefault) {
        setStrategyModelDraft(nextDefault);
      }
    } else if (taskId === "content") {
      setContentModelsDraft(nextList);
      if (nextDefault !== currentDefault) {
        setContentModelDraft(nextDefault);
      }
    } else {
      setCaptionModelsDraft(nextList);
      if (nextDefault !== currentDefault) {
        setCaptionModelDraft(nextDefault);
      }
    }
  };

  const handleResetTaskDefault = (
    taskId: "strategy" | "content" | "caption",
  ) => {
    if (taskId === "strategy") {
      setStrategyModelDraft(lunaModelId);
      const current = strategyModelsDraft ?? preferences.strategyModels;
      if (!current.includes(lunaModelId)) {
        setStrategyModelsDraft([...current, lunaModelId]);
      }
    } else if (taskId === "content") {
      setContentModelDraft(lunaModelId);
      const current = contentModelsDraft ?? preferences.contentModels;
      if (!current.includes(lunaModelId)) {
        setContentModelsDraft([...current, lunaModelId]);
      }
    } else {
      setCaptionModelDraft(lunaModelId);
      const current = captionModelsDraft ?? preferences.captionModels;
      if (!current.includes(lunaModelId)) {
        setCaptionModelsDraft([...current, lunaModelId]);
      }
    }
  };

  const handleSelectTaskDefault = (
    taskId: "strategy" | "content" | "caption",
    id: ActionAIModelId,
  ) => {
    if (taskId === "strategy") {
      setStrategyModelDraft(id);
    } else if (taskId === "content") {
      setContentModelDraft(id);
    } else {
      setCaptionModelDraft(id);
    }
  };

  return (
    <PrismTabs
      ref={pageRef}
      selectedKey={section}
      onSelectionChange={(key) => {
        if (isProfileTab(key)) setSection(key);
      }}
      className="mx-auto flex min-h-0 w-full flex-col overflow-hidden md:max-w-2xl"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b p-4 md:px-2">
        <h1 className="p-0 text-2xl font-bold tracking-tight text-foreground">
          Minha Conta
        </h1>
        <PrismButton
          form="profile-form"
          isDisabled={isSubmitting}
          type="submit"
        >
          <span className="min-w-0 whitespace-normal">
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </span>
          <CloudIcon />
        </PrismButton>
      </div>

      <PrismTabList
        aria-label="Seção da conta"
        className="h-12 shrink-0 scrollbar-none overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {PROFILE_TABS.map((tab) => {
          const isDirty = dirtyMap[tab.id];
          return (
            <PrismTab
              className="shrink-0 whitespace-nowrap"
              data-dirty={isDirty ? "true" : undefined}
              id={tab.id}
              key={tab.id}
            >
              <span>{tab.label}</span>
              {isDirty && (
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-primary"
                  data-slot="unsaved-indicator"
                  title="Alterações não salvas"
                />
              )}
            </PrismTab>
          );
        })}
      </PrismTabList>
      <form
        id="profile-form"
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit}
        onInvalidCapture={(event) => {
          // Reveal the tab of an invalid field before native validation moves focus.
          if (!(event.target instanceof HTMLElement)) return;
          const id = event.target
            .closest("[data-tab-id]")
            ?.getAttribute("data-tab-id");
          if (isProfileTab(id)) flushSync(() => setSection(id));
        }}
      >
        {/* Hidden inputs to capture state changes */}
        <input name="image" type="hidden" value={imageUrl || ""} />
        <input
          name="showInstagramSidebar"
          type="hidden"
          value={String(showInstagramSidebar)}
        />

        <PrismTabPanel
          id="personal"
          shouldForceMount
          data-tab-id="personal"
          className={PROFILE_PANEL_CLASS_NAME}
        >
          <div className="flex w-full flex-col gap-8">
            {/* Profile Avatar Upload */}
            <div className="flex items-center gap-4 pl-1">
              <UAvatarUpload
                aria-label="Alterar foto"
                cloudName={cloudName}
                fallback={person.initials || "?"}
                folder="uzzina/people"
                image={imageUrl}
                onUpload={setImageUrl}
                uploadPreset={uploadPreset}
              />

              <div className="grid gap-1">
                <h5>Foto de Perfil</h5>
                <span className="text-sm text-muted-foreground">
                  Clique na imagem para enviar uma nova
                </span>
                {imageUrl && (
                  <PrismButton
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
                  id="name"
                  name="name"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <PrismLabel htmlFor="surname">Sobrenome</PrismLabel>
                <PrismInput
                  id="surname"
                  name="surname"
                  value={surnameDraft}
                  onChange={(e) => setSurnameDraft(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <PrismLabel htmlFor="initials">Iniciais</PrismLabel>
                  <PrismInput
                    id="initials"
                    maxLength={2}
                    name="initials"
                    placeholder="AB"
                    value={initialsDraft}
                    onChange={(e) => setInitialsDraft(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <PrismLabel htmlFor="short">Nome Curto</PrismLabel>
                  <PrismInput
                    id="short"
                    name="short"
                    placeholder="Nome de exibição preferido"
                    value={shortDraft}
                    onChange={(e) => setShortDraft(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <ProfileSetting
              title="E-mail da Conta"
              description="Nota: O endereço de e-mail é gerenciado pelo administrador do espaço de trabalho."
            >
              <span className="text-sm font-medium text-foreground/80">
                {authEmail || person.email || "Nenhum e-mail associado"}
              </span>
            </ProfileSetting>
            <AppBarSpacer />
          </div>
        </PrismTabPanel>

        <PrismTabPanel
          id="appearance"
          shouldForceMount
          data-tab-id="appearance"
          className={PROFILE_PANEL_CLASS_NAME}
        >
          {/* Theme Preference Selection */}
          <ProfileSetting title="Tema do App">
            <PrismToggleGroup
              fullWidth
              attached
              aria-label="Tema do App"
              selectedKeys={[selectedTheme]}
              variant={"outline"}
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
          </ProfileSetting>

          {/* Accent Theme Color Selection */}
          <ProfileSetting
            title="Cor de Destaque"
            description="Selecione a paleta de cores primárias para a interface do
                  aplicativo."
          >
            <PrismToggleGroup
              aria-label="Cor de Destaque"
              className="grid w-full grid-cols-2 md:grid-cols-3"
              selectedKeys={[String(selectedThemeColor)]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                if (val !== undefined) handleColorChange(Number(val));
              }}
            >
              {PALLETE.map((palette, idx) => (
                <PrismToggleGroupItem
                  className={cn(PROFILE_CHOICE_CLASS_NAME, "justify-start")}
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
                className={cn(PROFILE_CHOICE_CLASS_NAME, "justify-start")}
                id="-1"
              >
                <PaletteSwatch isDark={theme === Theme.DARK} />
                Personalizado
              </PrismToggleGroupItem>
            </PrismToggleGroup>
            {selectedThemeColor === -1 && (
              <CustomThemePanel
                onChange={handleCustomThemeChange}
                onOptionChange={handleCustomThemeOptionChange}
                theme={customThemeDraft}
              />
            )}
          </ProfileSetting>
          <AppBarSpacer />
        </PrismTabPanel>

        <PrismTabPanel
          id="behavior"
          shouldForceMount
          data-tab-id="behavior"
          className={PROFILE_PANEL_CLASS_NAME}
        >
          {/* Default View Selection */}
          <ProfileSetting
            title="Layout Padrão"
            description="Escolha o layout de visualização inicial especificamente para os painéis de clientes."
          >
            <PrismToggleGroup
              fullWidth
              attached
              variant={"outline"}
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
          </ProfileSetting>

          <ProfileSetting
            title="Visualização inicial do Hoje"
            description="Escolha como abrir o Hoje na Home e na página Hoje. As trocas de visualização durante o uso continuam temporárias."
          >
            <PrismToggleGroup
              aria-label="Visualização inicial do Hoje"
              fullWidth
              attached
              variant={"outline"}
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
                <div className="truncate">Categorias</div>
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
                <div className="truncate">Parceiros</div>
              </PrismToggleGroupItem>
            </PrismToggleGroup>
          </ProfileSetting>

          {/* Show Instagram Sidebar by Default Toggle */}
          <ProfileSetting
            title="Sidebar do Instagram por Padrão"
            description="Decida se o painel do feed do Instagram inicia aberto nas páginas dos clientes."
          >
            <div className="flex flex-col gap-4">
              <PrismToggleGroup
                aria-label="Sidebar do Instagram por padrão"
                fullWidth
                attached
                variant="outline"
                selectedKeys={[showInstagramSidebar ? "show" : "hide"]}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys)[0];
                  if (val !== undefined)
                    setShowInstagramSidebar(val === "show");
                }}
              >
                <PrismToggleGroupItem
                  className={PROFILE_CHOICE_CLASS_NAME}
                  id="hide"
                >
                  Não mostrar sidebar do Instagram
                </PrismToggleGroupItem>
                <PrismToggleGroupItem
                  className={PROFILE_CHOICE_CLASS_NAME}
                  id="show"
                >
                  Mostrar sidebar do Instagram
                </PrismToggleGroupItem>
              </PrismToggleGroup>

              <PartnerPageMockup showSidebar={showInstagramSidebar} />
            </div>
          </ProfileSetting>
          <AppBarSpacer />
        </PrismTabPanel>

        <PrismTabPanel
          id="ai"
          shouldForceMount
          data-tab-id="ai"
          className={PROFILE_PANEL_CLASS_NAME}
        >
          <div className="flex w-full flex-col gap-4 md:max-w-2xl lg:gap-6">
            <h2 className="sr-only">Uso de IA</h2>
            {/* Personal monthly AI allowance */}
            <ProfileSetting
              title="Meu uso de IA"
              badge={aiUsage?.period ? aiUsage.period : null}
              description="O seu uso individual faz parte da franquia mensal de IA
                  compartilhada pela agência."
            >
              <div className="grid gap-3 pt-2">
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
                      <p
                        className="text-xs text-muted-foreground"
                        role="status"
                      >
                        Há gerações com saldo reservado aguardando conciliação.
                      </p>
                    )}
                    {aiUsage.incomplete_generations > 0 && (
                      <p
                        className="text-xs text-muted-foreground"
                        role="status"
                      >
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
            </ProfileSetting>

            <ProfileSetting
              title="Modelos de IA por tarefa"
              description="Defina quais modelos ficam disponíveis para cada tarefa e escolha o modelo padrão. Na gaveta da ação, somente os modelos selecionados aparecerão."
            >
              <div className="grid gap-4">
                <div
                  aria-hidden="true"
                  className="hidden text-xs font-medium text-muted-foreground lg:grid lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-3"
                >
                  <span>Função</span>
                  <span>Modelos disponíveis</span>
                  <span>Modelo padrão</span>
                </div>
                {(
                  [
                    {
                      id: "strategy" as const,
                      label: "Criar estratégia",
                      name: "estratégia",
                      models: strategyModelsDraft ?? preferences.strategyModels,
                      value:
                        strategyModelDraft ??
                        preferences.defaultStrategyModel ??
                        lunaModelId,
                    },
                    {
                      id: "content" as const,
                      label: "Gerar conteúdo",
                      name: "conteúdo",
                      models: contentModelsDraft ?? preferences.contentModels,
                      value:
                        contentModelDraft ??
                        preferences.defaultContentModel ??
                        lunaModelId,
                    },
                    {
                      id: "caption" as const,
                      label: "Gerar legenda",
                      name: "legenda",
                      models: captionModelsDraft ?? preferences.captionModels,
                      value:
                        captionModelDraft ??
                        preferences.defaultCaptionModel ??
                        lunaModelId,
                    },
                  ] as const
                ).map((task) => {
                  const availableOptions = getAvailableAIModels(task.models);
                  const selectedOptions = actionAIModels.filter((model) =>
                    task.models.includes(model.id),
                  );
                  return (
                    <div
                      key={task.id}
                      className="grid gap-2 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-3"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {task.label}
                      </span>
                      <PrismSelect<(typeof actionAIModels)[number], "multiple">
                        aria-label={`Modelos disponíveis para ${task.name}`}
                        className="w-full min-w-0"
                        selectionMode="multiple"
                        value={task.models}
                        isDisabled={isSubmitting}
                        onChange={(keys) => {
                          const next = new Set(keys.map(String));
                          for (const model of actionAIModels) {
                            const was = task.models.includes(model.id);
                            const now = next.has(model.id);
                            if (was !== now) {
                              handleToggleTaskModel(task.id, model.id, now);
                            }
                          }
                        }}
                      >
                        <PrismSelectTrigger size="sm" className="bg-secondary">
                          <PrismSelectValue>
                            {() => (
                              <span
                                className="flex min-w-0 items-center gap-2"
                                title={selectedOptions
                                  .map((model) => model.name)
                                  .join(", ")}
                              >
                                <span className="flex shrink-0 -space-x-1.5">
                                  {selectedOptions.slice(0, 3).map((model) => (
                                    <span
                                      key={model.id}
                                      className="rounded-full bg-secondary"
                                    >
                                      <AIModelIcon model={model} compact />
                                    </span>
                                  ))}
                                </span>
                                <span className="truncate">
                                  {selectedOptions.length === 1
                                    ? selectedOptions[0]?.name
                                    : `${selectedOptions.length} modelos`}
                                </span>
                              </span>
                            )}
                          </PrismSelectValue>
                        </PrismSelectTrigger>
                        <PrismSelectContent>
                          {actionAIModels.map((model) => (
                            <PrismSelectItem
                              key={model.id}
                              id={model.id}
                              textValue={model.name}
                            >
                              <AIModelIcon model={model} compact />
                              <span>{model.name}</span>
                            </PrismSelectItem>
                          ))}
                        </PrismSelectContent>
                      </PrismSelect>
                      <div className="flex min-w-0 items-center gap-1">
                        <UAIModelSelect
                          ariaLabel={`Modelo padrão para ${task.label.toLowerCase()}`}
                          models={availableOptions}
                          value={task.value}
                          onChange={(id) => {
                            if (isActionAIModelId(id)) {
                              handleSelectTaskDefault(task.id, id);
                            }
                          }}
                          showText
                          size="sm"
                          variant="secondary"
                          className="min-w-0 flex-1 justify-start"
                          isDisabled={isSubmitting}
                        />
                        {task.value !== lunaModelId && (
                          <PrismButton
                            aria-label={`Voltar ao modelo padrão de ${task.name}`}
                            variant="ghost"
                            size="icon-sm"
                            isDisabled={isSubmitting}
                            onClick={() => handleResetTaskDefault(task.id)}
                          >
                            <RefreshCwIcon />
                          </PrismButton>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="grid gap-2 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Planejamento
                  </span>
                  <PrismSelect<(typeof actionAIModels)[number], "multiple">
                    aria-label="Modelos disponíveis para planejamento (em breve)"
                    className="w-full min-w-0"
                    selectionMode="multiple"
                    value={[]}
                    isDisabled
                  >
                    <PrismSelectTrigger size="sm" className="bg-secondary">
                      <PrismSelectValue>{() => "Em breve"}</PrismSelectValue>
                    </PrismSelectTrigger>
                    <PrismSelectContent>
                      {actionAIModels.map((model) => (
                        <PrismSelectItem
                          key={model.id}
                          id={model.id}
                          textValue={model.name}
                        >
                          <AIModelIcon model={model} compact />
                          <span>{model.name}</span>
                        </PrismSelectItem>
                      ))}
                    </PrismSelectContent>
                  </PrismSelect>
                  <UAIModelSelect
                    ariaLabel="Modelo padrão para planejamento (em breve)"
                    models={actionAIModels}
                    value={lunaModelId}
                    onChange={() => {}}
                    showText
                    size="sm"
                    variant="secondary"
                    className="min-w-0 justify-start"
                    isDisabled
                  />
                </div>
              </div>
            </ProfileSetting>

            <AppBarSpacer />
          </div>
        </PrismTabPanel>
      </form>
    </PrismTabs>
  );
}
