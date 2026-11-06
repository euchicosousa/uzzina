import { UzzinaAIModelSelectSection } from "~/components/ui-sections/UzzinaAIModelSelectSection";
import { UzzinaAIAllowanceMeterSection } from "~/components/ui-sections/UzzinaAIAllowanceMeterSection";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import {
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupButton,
  PrismInputGroupInput,
  PrismTabs,
  PrismTabList,
  PrismTab,
} from "~/components/prism";
import {
  SidebarAnchorLink,
  SidebarSubsectionLink,
  TokensColorsSection,
  TokensSpacingSection,
  TokensFocusSection,
  TokensIconsSection,
  ButtonSection,
  InputSection,
  TextareaSection,
  AlertSection,
  AvatarSection,
  BadgeSection,
  ToggleSection,
  TabsSection,
  SliderSection,
  DateRangePickerSection,
  CheckboxSection,
  RadioGroupSection,
  PopoverSection,
  MenuSection,
  DialogSection,
  ComboboxSection,
  CommandSection,
  ToasterSection,
  SeparatorSection,
  SheetSection,
  UzzinaViewOptionsSection,
  UzzinaPartnersComboboxSection,
  UzzinaCategoriesComboboxSection,
  UzzinaPhaseComboboxSection,
  UzzinaIconsSection,
  UzzinaAvatarSection,
  UzzinaComboboxTriggerSection,
  UzzinaPeopleComboboxSection,
  UzzinaPhaseIconSection,
  UzzinaColorPickerDropdownSection,
  UzzinaActionDatePickerSection,
  UzzinaCalendarToolbarSection,
  UzzinaPaletteEditorSection,
  UzzinaPartnerCelebrationsSelectorSection,
  UzzinaAdminItemCardSection,
  UzzinaAvatarSelectorSection,
  UzzinaLoaderSection,
  UzzinaPreferenceSwitchSection,
  UzzinaToggleInputSection,
  SelectSection,
  CalendarSection,
  AccordionSection,
  SkeletonSection,
  RichTextEditorSection,
} from "~/components/ui-sections";

export interface GallerySubsection {
  id: string;
  label: string;
  keywords?: string[];
}

interface GallerySidebarItem {
  id: string;
  label: string;
  section: "tokens" | "components" | "uzzina";
  approved?: boolean;
  keywords?: string[];
  subsections?: GallerySubsection[];
}

const SECTION_LABELS: Record<"tokens" | "components" | "uzzina", string> = {
  tokens: "Tokens de Design",
  components: "Componentes de UI",
  uzzina: "Componentes Uzzina",
};

const SIDEBAR_ITEMS: GallerySidebarItem[] = [
  // Tokens
  {
    id: "colors",
    label: "Cores Semânticas",
    section: "tokens",
    keywords: ["cores", "paleta", "palette", "tokens", "theme"],
    subsections: [
      { id: "tokens-colors-palettes", label: "Paletas de Marca" },
      { id: "tokens-colors-semantics", label: "Camadas Semânticas" },
      { id: "tokens-colors-real-world", label: "Aplicação no Mundo Real" },
      { id: "tokens-colors-feedback", label: "Feedbacks Semânticos" },
    ],
  },
  {
    id: "spacing",
    label: "Escala de Espaçamento",
    section: "tokens",
    keywords: ["espacamento", "gap", "padding", "margin", "escala"],
  },
  {
    id: "tokens-focus",
    label: "Foco",
    section: "tokens",
    keywords: ["foco", "focus", "ring", "anel", "outline", "teclado", "tab"],
    subsections: [
      { id: "focus-outer", label: "Anel externo (padrão)" },
      { id: "focus-inset", label: "Anel por dentro (ring-inset)" },
      { id: "focus-background", label: "Foco por fundo" },
      { id: "focus-none", label: "Sem anel de propósito" },
      { id: "focus-selection", label: "Estados de seleção" },
      { id: "focus-global", label: "Fallback global (outline)" },
    ],
  },
  {
    id: "tokens-icons",
    label: "Ícones",
    section: "tokens",
    keywords: ["icones", "ícones", "icon", "lucide", "glifo"],
    subsections: [
      { id: "tokens-icons-actions", label: "1. Ações e edição" },
      { id: "tokens-icons-feedback", label: "2. Estados e feedback" },
      { id: "tokens-icons-navigation", label: "3. Navegação e layout" },
      { id: "tokens-icons-entities", label: "4. Entidades" },
      { id: "tokens-icons-text", label: "5. Texto" },
      { id: "tokens-icons-custom", label: "6. Customizados" },
    ],
  },

  // Uzzina
  {
    id: "uzzina-action-date-picker",
    label: "UActionDatePicker",
    section: "uzzina",
    keywords: ["data", "hora", "acao", "gaveta", "calendario"],
    approved: true,
  },
  {
    id: "uzzina-calendar-toolbar",
    label: "UCalendarToolbar",
    section: "uzzina",
    keywords: ["calendario", "data", "dia", "navegacao", "toolbar"],
    approved: true,
  },
  {
    id: "uzzina-categories-combobox",
    label: "UCategoriesCombobox",
    section: "uzzina",
    keywords: ["categorias", "categories", "combobox", "filtro"],
    approved: true,
  },
  {
    id: "uzzina-combobox-trigger",
    label: "UComboboxTrigger",
    section: "uzzina",
    keywords: ["gatilho", "trigger", "combobox", "botao", "avatar"],
    approved: true,
  },
  {
    id: "uzzina-icons",
    label: "UIcons",
    section: "uzzina",
    keywords: ["icones", "ícones", "icons", "categoria", "fase"],
    subsections: [
      { id: "uzzina-icons-curated", label: "UIcons" },
      { id: "uzzina-icons-all", label: "Todos os Ícones" },
    ],
    approved: true,
  },
  {
    id: "uzzina-partner-celebrations-selector",
    approved: true,
    label: "UPartnerCelebrationsSelector",
    section: "uzzina",
    keywords: ["datas", "comemorativas", "feriados", "parceiro", "selecao"],
  },
  {
    id: "uzzina-partners-combobox",
    label: "UPartnersCombobox",
    section: "uzzina",
    keywords: ["parceiros", "partners", "combobox", "filtro", "playground"],
    approved: true,
  },
  {
    id: "uzzina-phase-combobox",
    label: "UPhaseCombobox",
    section: "uzzina",
    keywords: ["fase", "phase", "combobox", "progresso"],
    approved: true,
  },
  {
    id: "uzzina-phase-icon",
    label: "UPhaseIcon",
    section: "uzzina",
    keywords: ["fase", "phase", "icone", "progresso", "status"],
    approved: true,
  },
  {
    id: "uzzina-people-combobox",
    approved: true,
    label: "UPeopleCombobox",
    section: "uzzina",
    keywords: [
      "pessoas",
      "responsaveis",
      "sprint",
      "combobox",
      "equipe",
      "people",
      "responsiblescombobox",
      "sprintcombobox",
    ],
    subsections: [
      { id: "uzzina-people-responsibles", label: "Responsáveis" },
      { id: "uzzina-people-sprint", label: "Sprint" },
    ],
  },
  {
    id: "uzzina-rich-text-editor",
    approved: true,
    label: "RichTextEditor",
    section: "uzzina",
    keywords: ["editor", "tiptap", "texto", "rico", "rich", "markdown"],
  },
  {
    id: "uzzina-admin-item-card",
    approved: true,
    label: "UAdminItemCard",
    section: "uzzina",
    keywords: ["admin", "cartao", "lista", "item", "parceiro"],
  },
  {
    id: "uzzina-avatar",
    label: "UAvatar e UAvatarGroup",
    section: "uzzina",
    keywords: ["avatar", "uavatar", "grupo", "imagem"],
    subsections: [
      { id: "uzzina-avatar-uavatar", label: "UAvatar" },
      { id: "uzzina-avatar-uavatargroup", label: "UAvatarGroup" },
    ],
    approved: true,
  },
  {
    id: "uzzina-avatar-selector",
    approved: true,
    label: "UAvatarSelector",
    section: "uzzina",
    keywords: ["avatar", "selecao", "pessoas", "parceiros", "grade"],
  },
  {
    id: "uzzina-color-picker-dropdown",
    approved: true,
    label: "UColorPickerDropdown",
    section: "uzzina",
    keywords: [
      "cor",
      "acao",
      "gaveta",
      "paleta",
      "colorpicker",
      "picker",
      "dropdown",
      "actioncolordropdown",
    ],
  },
  {
    id: "uzzina-ai-model-select",
    approved: true,
    label: "UAIModelSelect",
    section: "uzzina",
    keywords: ["modelo", "ia", "openai", "claude", "anthropic"],
  },
  {
    id: "uzzina-ai-allowance-meter",
    approved: true,
    label: "UAIAllowanceMeter",
    section: "uzzina",
    keywords: ["franquia", "consumo", "medição"],
  },
  {
    id: "uzzina-loader",
    approved: true,
    label: "ULoader",
    section: "uzzina",
    keywords: ["loader", "carregando", "spinner", "loading"],
  },
  {
    id: "uzzina-palette-editor",
    approved: true,
    label: "UPaletteEditor",
    section: "uzzina",
    keywords: [
      "cores",
      "paleta",
      "lista",
      "reordenar",
      "parceiro",
      "palette",
      "editor",
      "colorlisteditor",
    ],
  },
  {
    id: "uzzina-preference-switch",
    approved: true,
    label: "UPreferenceSwitch",
    section: "uzzina",
    keywords: ["preferencia", "switch", "alternar", "ativo", "inativo"],
  },
  {
    id: "uzzina-toggle-input",
    approved: true,
    label: "UToggleInput",
    section: "uzzina",
    keywords: ["toggle", "checkbox", "arquivado", "formulario", "input"],
  },
  {
    id: "uzzina-view-options",
    label: "UViewOptions",
    section: "uzzina",
    keywords: ["visualizacao", "view", "options", "ordenacao", "colunas"],
    approved: true,
  },

  // Components
  {
    id: "prism-accordion",
    label: "Accordion",
    section: "components",
    approved: true,
    keywords: ["sanfona", "colapsavel", "collapse"],
  },
  {
    id: "prism-alert",
    label: "Alert",
    section: "components",
    approved: true,
    keywords: ["alerta", "aviso", "notificacao"],
  },
  {
    id: "prism-avatar",
    label: "Avatar",
    section: "components",
    approved: true,
    keywords: ["avatar", "imagem", "foto", "grupo", "badge"],
    subsections: [
      { id: "prism-avatar-single", label: "Avatar" },
      { id: "prism-avatar-group", label: "AvatarGroup" },
    ],
  },
  {
    id: "prism-badge",
    label: "Badge",
    section: "components",
    approved: true,
    keywords: ["tag", "etiqueta", "selo"],
    subsections: [
      { id: "prism-badge-badge", label: "Badge" },
      { id: "prism-badge-kbd", label: "Kbd" },
    ],
  },
  {
    id: "prism-button",
    label: "Button",
    section: "components",
    approved: true,
    keywords: ["botao", "acao", "clique"],
    subsections: [
      { id: "prism-button-button", label: "Button" },
      { id: "prism-button-group", label: "ButtonGroup" },
    ],
  },
  {
    id: "prism-calendar",
    label: "Calendar",
    section: "components",
    approved: true,
    keywords: ["calendario", "data", "mes", "dia"],
  },
  {
    id: "prism-checkbox",
    label: "Checkbox",
    section: "components",
    approved: true,
    keywords: ["selecao", "marcar", "check"],
    subsections: [
      { id: "prism-checkbox-single", label: "Checkbox" },
      { id: "prism-checkbox-group", label: "CheckboxGroup" },
    ],
  },
  {
    id: "prism-combobox",
    label: "Combobox",
    section: "components",
    approved: true,
    keywords: ["autocomplete", "select", "busca", "pesquisa"],
    subsections: [
      { id: "prism-combobox-single", label: "Combobox" },
      { id: "prism-combobox-chips", label: "ComboboxChips" },
    ],
  },
  {
    id: "prism-command",
    label: "Command",
    section: "components",
    approved: true,
    keywords: ["paleta", "atalho", "cmdk", "busca"],
  },
  {
    id: "prism-date-range-picker",
    label: "DateRangePicker",
    section: "components",
    approved: true,
    keywords: ["data", "periodo", "intervalo", "calendario"],
  },
  {
    id: "prism-dialog",
    label: "Dialog",
    section: "components",
    approved: true,
    keywords: ["modal", "popup", "janela"],
  },
  {
    id: "prism-menu",
    label: "Dropdown Menu",
    section: "components",
    approved: true,
    keywords: ["menu", "dropdown", "context"],
  },
  {
    id: "prism-input",
    label: "Input",
    section: "components",
    approved: true,
    keywords: ["campo", "texto", "inputgroup", "entrada"],
    subsections: [
      { id: "prism-input-single", label: "Input" },
      { id: "prism-input-group", label: "InputGroup" },
      { id: "prism-input-timefield", label: "TimeField" },
      { id: "prism-input-colorfield", label: "ColorField" },
      { id: "prism-input-colorarea", label: "ColorArea e ColorSlider" },
    ],
  },
  {
    id: "prism-popover",
    label: "Popover",
    section: "components",
    approved: true,
    keywords: ["balao", "popup", "flutuante"],
  },
  {
    id: "prism-radio-group",
    label: "Radio Group",
    section: "components",
    approved: true,
    keywords: ["radio", "opcao", "selecao"],
  },
  {
    id: "prism-select",
    label: "Select",
    section: "components",
    approved: true,
    keywords: ["dropdown", "seletor", "escolha"],
  },
  {
    id: "prism-separator",
    label: "Separator",
    section: "components",
    approved: true,
    keywords: ["divisor", "linha", "divider"],
  },
  {
    id: "prism-sheet",
    label: "Sheet",
    section: "components",
    approved: true,
    keywords: ["sheet", "painel", "lateral", "drawer", "gaveta"],
  },
  {
    id: "prism-skeleton",
    label: "Skeleton",
    section: "components",
    approved: true,
    keywords: ["carregamento", "placeholder", "loading"],
  },
  {
    id: "prism-slider",
    label: "Slider",
    section: "components",
    approved: true,
    keywords: ["deslizante", "faixa", "range"],
  },
  {
    id: "prism-tabs",
    label: "Tabs",
    section: "components",
    approved: true,
    keywords: ["abas", "guias", "navegacao"],
  },
  {
    id: "prism-textarea",
    label: "Textarea",
    section: "components",
    approved: true,
    keywords: ["texto", "multiline", "area", "campo"],
  },
  {
    id: "prism-toaster",
    label: "Toaster",
    section: "components",
    approved: true,
    keywords: ["toast", "notificacao", "alerta", "mensagem"],
  },
  {
    id: "prism-toggle",
    label: "Toggle & ToggleGroup",
    section: "components",
    approved: true,
    keywords: ["switch", "alternador", "toggle group"],
    subsections: [
      { id: "prism-toggle-single", label: "Toggle" },
      { id: "prism-toggle-group", label: "ToggleGroup" },
    ],
  },
];

export const Route = createFileRoute("/ui")({
  component: UIPage,
});

function UIPage() {
  const navigate = useNavigate({ from: "/ui" });
  const mainRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<{
    id: string;
    section: string;
    offset: number;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<
    "tokens" | "components" | "uzzina"
  >("tokens");
  const [activeAnchor, setActiveAnchor] = useState<string>("colors");
  const [expandedItemId, setExpandedItemId] = useState<string>("colors");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [navigationRequest, setNavigationRequest] = useState<{
    id: string;
    section: string;
    offset: number;
  } | null>(null);

  const handleSectionChange = (section: "tokens" | "components" | "uzzina") => {
    navigationRef.current = null;
    setActiveSection(section);
    const firstItem = SIDEBAR_ITEMS.find((item) => item.section === section);
    const firstId = firstItem ? firstItem.id : "";
    setActiveAnchor(firstId);
    setExpandedItemId(firstId);
    setSearchQuery("");
    mainRef.current?.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  const isSearching = searchQuery.trim().length > 0;

  const currentSectionItems = useMemo(
    () => SIDEBAR_ITEMS.filter((item) => item.section === activeSection),
    [activeSection],
  );

  const filteredItems = useMemo(() => {
    if (!isSearching) return [];
    const normQuery = searchQuery
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return SIDEBAR_ITEMS.filter((item) => {
      const normLabel = item.label
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const normId = item.id.toLowerCase();
      if (normLabel.includes(normQuery) || normId.includes(normQuery)) {
        return true;
      }
      if (item.keywords) {
        const kwMatch = item.keywords.some((kw) => {
          const normKw = kw
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          return normKw.includes(normQuery);
        });
        if (kwMatch) return true;
      }
      if (item.subsections) {
        const subMatch = item.subsections.some((sub) => {
          const normSubLabel = sub.label
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          const normSubId = sub.id.toLowerCase();
          if (
            normSubLabel.includes(normQuery) ||
            normSubId.includes(normQuery)
          ) {
            return true;
          }
          if (sub.keywords) {
            return sub.keywords.some((skw) => {
              const normSkw = skw
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
              return normSkw.includes(normQuery);
            });
          }
          return false;
        });
        if (subMatch) return true;
      }
      return false;
    });
  }, [searchQuery, isSearching]);

  const sectionsWithMatches = useMemo(() => {
    if (!isSearching) return [];
    return (["tokens", "components", "uzzina"] as const)
      .map((sec) => ({
        section: sec,
        label: SECTION_LABELS[sec],
        items: filteredItems.filter((item) => item.section === sec),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredItems, isSearching]);

  const handleItemClick = (item: GallerySidebarItem) => {
    const firstSubsection = item.subsections?.[0];
    const targetId = firstSubsection?.id ?? item.id;
    setActiveAnchor(targetId);
    setExpandedItemId(item.id);

    // The gallery owns scrolling; router hash scrolling would cancel it.
    void navigate({
      hash: targetId,
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
    });

    const request = {
      id: targetId,
      section: item.section,
      offset: 64,
    };
    navigationRef.current = request;
    setNavigationRequest(request);
    setActiveSection(item.section);
  };

  const handleSubsectionClick = (
    parentItem: GallerySidebarItem,
    sub: GallerySubsection,
  ) => {
    setActiveAnchor(sub.id);
    setExpandedItemId(parentItem.id);

    // The gallery owns scrolling; router hash scrolling would cancel it.
    void navigate({
      hash: sub.id,
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
    });

    const request = {
      id: sub.id,
      section: parentItem.section,
      offset: 72,
    };
    navigationRef.current = request;
    setNavigationRequest(request);
    setActiveSection(parentItem.section);
  };

  useEffect(() => {
    const initialHash =
      typeof window !== "undefined"
        ? window.location.hash.replace(/^#/, "")
        : "";
    const rawHash =
      initialHash === "uzzina-color-list-editor"
        ? "uzzina-palette-editor"
        : initialHash === "uzzina-action-color-dropdown"
          ? "uzzina-color-picker-dropdown"
          : initialHash === "uzzina-responsibles-combobox"
            ? "uzzina-people-responsibles"
            : initialHash === "uzzina-sprint-combobox"
              ? "uzzina-people-sprint"
              : initialHash;
    if (!rawHash) return;

    for (const item of SIDEBAR_ITEMS) {
      if (item.id === rawHash) {
        setActiveSection(item.section);
        setExpandedItemId(item.id);
        const targetId = item.subsections?.[0]?.id ?? item.id;
        setActiveAnchor(targetId);
        void navigate({
          hash: targetId,
          replace: true,
          resetScroll: false,
          hashScrollIntoView: false,
        });
        const request = {
          id: targetId,
          section: item.section,
          offset: 64,
        };
        navigationRef.current = request;
        setNavigationRequest(request);
        return;
      }
      if (item.subsections) {
        const sub = item.subsections.find((s) => s.id === rawHash);
        if (sub) {
          setActiveSection(item.section);
          setExpandedItemId(item.id);
          setActiveAnchor(sub.id);
          void navigate({
            hash: sub.id,
            replace: true,
            resetScroll: false,
            hashScrollIntoView: false,
          });
          const request = {
            id: sub.id,
            section: item.section,
            offset: 72,
          };
          navigationRef.current = request;
          setNavigationRequest(request);
          return;
        }
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (!navigationRequest || navigationRequest.section !== activeSection)
      return;
    // Wait for the expanded sidebar and native focus scrolling to settle.
    const frame = window.requestAnimationFrame(() => {
      if (navigationRef.current !== navigationRequest) return;
      const element = document.getElementById(navigationRequest.id);
      const main = mainRef.current;
      if (!element || !main) return;
      const top = Math.max(
        0,
        element.getBoundingClientRect().top -
          main.getBoundingClientRect().top +
          main.scrollTop -
          navigationRequest.offset,
      );
      main.scrollTo({
        top,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeSection, navigationRequest]);

  useEffect(() => {
    const targets: Array<{ id: string; parentId: string; isSub: boolean }> = [];
    for (const item of currentSectionItems) {
      targets.push({ id: item.id, parentId: item.id, isSub: false });
      if (item.subsections) {
        for (const sub of item.subsections) {
          targets.push({ id: sub.id, parentId: item.id, isSub: true });
        }
      }
    }

    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const navigation = navigationRef.current;
      if (navigation?.section === activeSection) {
        return;
      }
      if (mainElement.scrollTop < 80) {
        if (targets[0]) {
          setActiveAnchor(targets[0].id);
          setExpandedItemId(targets[0].parentId);
        }
        return;
      }
      let currentTarget = targets[0];
      const mainRect = mainElement.getBoundingClientRect();
      for (const target of targets) {
        const element = document.getElementById(target.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top - mainRect.top <= 120) {
            currentTarget = target;
          }
        }
      }
      if (currentTarget) {
        setActiveAnchor(currentTarget.id);
        if (currentTarget.parentId !== expandedItemId) {
          setExpandedItemId(currentTarget.parentId);
        }
      }
    };

    mainElement.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [currentSectionItems, expandedItemId, activeSection]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const interrupt = () => {
      navigationRef.current = null;
    };
    main.addEventListener("wheel", interrupt, { passive: true });
    main.addEventListener("touchstart", interrupt, { passive: true });
    main.addEventListener("pointerdown", interrupt, { passive: true });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      ) {
        interrupt();
      }
    };
    main.addEventListener("keydown", handleKeyDown);
    return () => {
      main.removeEventListener("wheel", interrupt);
      main.removeEventListener("touchstart", interrupt);
      main.removeEventListener("pointerdown", interrupt);
      main.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-clip bg-background font-sans text-foreground">
      {/* Top Header Fixado */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-medium">PRISM</div>
            <p className="mb-0 hidden text-xs font-medium tracking-wider text-muted-foreground uppercase md:block">
              Uzzina Design System & UI Documentation
            </p>
          </div>
        </div>

        {/* Alternador de Abas Principais */}
        <PrismTabs
          onSelectionChange={(key) =>
            handleSectionChange(key as "tokens" | "components" | "uzzina")
          }
          selectedKey={activeSection}
        >
          <PrismTabList aria-label="Seções do Prism" className="h-16">
            <PrismTab id="tokens">Design Tokens</PrismTab>
            <PrismTab id="components">Componentes de UI</PrismTab>
            <PrismTab id="uzzina">Componentes Uzzina</PrismTab>
          </PrismTabList>
        </PrismTabs>
      </header>

      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-clip lg:flex-row">
        {/* Sidebar com rolagem independente */}
        <aside className="shrink-0 border-b bg-background px-4 pt-16 lg:flex lg:h-full lg:w-70 lg:flex-col lg:border-r lg:border-b-0 lg:p-0 lg:pt-16">
          {/* Filtro de texto no topo da barra lateral */}
          <div className="p-6">
            <PrismInputGroup>
              <PrismInputGroupAddon>
                <SearchIcon />
              </PrismInputGroupAddon>
              <PrismInputGroupInput
                aria-label="Filtrar itens da UI"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                  } else if (e.key === "Enter" && filteredItems.length > 0) {
                    handleItemClick(filteredItems[0]);
                  }
                }}
                placeholder="Filtrar itens..."
                value={searchQuery}
              />
              {searchQuery && (
                <PrismInputGroupAddon align="inline-end">
                  <PrismInputGroupButton
                    aria-label="Limpar filtro"
                    onClick={() => setSearchQuery("")}
                  >
                    <XIcon />
                  </PrismInputGroupButton>
                </PrismInputGroupAddon>
              )}
            </PrismInputGroup>
          </div>

          <nav className="flex flex-col pb-3 lg:flex-1 lg:gap-6 lg:overflow-y-auto lg:px-6 lg:pb-6">
            {isSearching ? (
              sectionsWithMatches.length > 0 ? (
                sectionsWithMatches.map((group) => (
                  <div className="flex flex-col gap-2" key={group.section}>
                    <span className="hidden px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase lg:block">
                      {group.label} ({group.items.length})
                    </span>
                    <div className="flex overflow-x-auto text-sm whitespace-nowrap lg:ml-4 lg:flex-col lg:overflow-visible lg:whitespace-normal [&>a]:gap-2">
                      {group.items.map((item) => {
                        const isExpanded = expandedItemId === item.id;
                        const isParentActive =
                          activeAnchor === item.id ||
                          (item.subsections?.some(
                            (sub) => sub.id === activeAnchor,
                          ) ??
                            false);

                        return (
                          <div
                            className="flex shrink-0 flex-col lg:w-full"
                            key={item.id}
                          >
                            <SidebarAnchorLink
                              active={isParentActive}
                              approved={item.approved}
                              label={item.label}
                              onClick={() => handleItemClick(item)}
                              targetId={item.id}
                            />
                            {isExpanded &&
                              item.subsections &&
                              item.subsections.length > 0 && (
                                <div
                                  aria-label={`Subseções de ${item.label}`}
                                  className="flex flex-row overflow-x-auto text-xs lg:flex-col lg:overflow-visible"
                                  role="group"
                                >
                                  {item.subsections.map((sub) => (
                                    <SidebarSubsectionLink
                                      active={activeAnchor === sub.id}
                                      key={sub.id}
                                      label={sub.label}
                                      onClick={() =>
                                        handleSubsectionClick(item, sub)
                                      }
                                      targetId={sub.id}
                                    />
                                  ))}
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Nenhum item encontrado para &ldquo;{searchQuery}&rdquo;.
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <span className="hidden px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase lg:block">
                  {SECTION_LABELS[activeSection]}
                </span>
                <div className="flex overflow-x-auto text-sm whitespace-nowrap lg:ml-4 lg:flex-col lg:overflow-visible lg:whitespace-normal [&>a]:gap-2">
                  {currentSectionItems.map((item) => {
                    const isExpanded = expandedItemId === item.id;
                    const isParentActive =
                      activeAnchor === item.id ||
                      (item.subsections?.some(
                        (sub) => sub.id === activeAnchor,
                      ) ??
                        false);

                    return (
                      <div
                        className="flex shrink-0 flex-col lg:w-full"
                        key={item.id}
                      >
                        <SidebarAnchorLink
                          active={isParentActive}
                          approved={item.approved}
                          label={item.label}
                          onClick={() => handleItemClick(item)}
                          targetId={item.id}
                        />
                        {isExpanded &&
                          item.subsections &&
                          item.subsections.length > 0 && (
                            <div
                              aria-label={`Subseções de ${item.label}`}
                              className="flex flex-row overflow-x-auto text-xs lg:flex-col lg:overflow-visible"
                              role="group"
                            >
                              {item.subsections.map((sub) => (
                                <SidebarSubsectionLink
                                  active={activeAnchor === sub.id}
                                  key={sub.id}
                                  label={sub.label}
                                  onClick={() =>
                                    handleSubsectionClick(item, sub)
                                  }
                                  targetId={sub.id}
                                />
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* Visualizador Principal com rolagem independente */}
        <main
          ref={mainRef}
          className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth lg:h-full lg:scroll-pt-16 lg:pt-16"
        >
          {activeSection === "tokens" ? (
            <div className="flex w-full max-w-full min-w-0 flex-col">
              <TokensColorsSection />
              <TokensSpacingSection />
              <TokensFocusSection />
              <TokensIconsSection />
            </div>
          ) : activeSection === "uzzina" ? (
            <div className="flex w-full max-w-full min-w-0 flex-col">
              <UzzinaActionDatePickerSection />
              <UzzinaCalendarToolbarSection />
              <UzzinaCategoriesComboboxSection />
              <UzzinaComboboxTriggerSection />
              <UzzinaIconsSection />
              <UzzinaPartnerCelebrationsSelectorSection />
              <UzzinaPartnersComboboxSection />
              <UzzinaPhaseComboboxSection />
              <UzzinaPhaseIconSection />
              <UzzinaPeopleComboboxSection />
              <RichTextEditorSection />
              <UzzinaAdminItemCardSection />
              <UzzinaAvatarSection />
              <UzzinaAvatarSelectorSection />
              <UzzinaColorPickerDropdownSection />
              <UzzinaAIModelSelectSection />
              <UzzinaAIAllowanceMeterSection />
              <UzzinaLoaderSection />
              <UzzinaPaletteEditorSection />
              <UzzinaPreferenceSwitchSection />
              <UzzinaToggleInputSection />
              <UzzinaViewOptionsSection />
            </div>
          ) : (
            <div className="flex w-full max-w-full min-w-0 flex-col">
              <AccordionSection />
              <AlertSection />
              <AvatarSection />
              <BadgeSection />
              <ButtonSection />
              <CalendarSection />
              <CheckboxSection />
              <ComboboxSection />
              <CommandSection />
              <DateRangePickerSection />
              <DialogSection />
              <MenuSection />
              <InputSection />
              <PopoverSection />
              <RadioGroupSection />
              <SelectSection />
              <SeparatorSection />
              <SheetSection />
              <SkeletonSection />
              <SliderSection />
              <TabsSection />
              <TextareaSection />
              <ToasterSection />
              <ToggleSection />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
