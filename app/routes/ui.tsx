import { createFileRoute } from "@tanstack/react-router";
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
  ViewOptionsSection,
  UzzinaPartnersComboboxSection,
  UzzinaCategoriesComboboxSection,
  UzzinaPhaseComboboxSection,
  UzzinaIconsSection,
  UzzinaAvatarSection,
  SelectSection,
  CalendarSection,
  AccordionSection,
  SkeletonSection,
  RichTextEditorSection,
} from "~/components/ui-sections";

interface GallerySidebarItem {
  id: string;
  label: string;
  section: "tokens" | "components" | "uzzina";
  approved?: boolean;
  keywords?: string[];
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
  },
  {
    id: "tokens-icons",
    label: "Ícones",
    section: "tokens",
    keywords: ["icones", "ícones", "icon", "lucide", "glifo"],
  },

  // Uzzina
  {
    id: "uzzina-categories-combobox",
    label: "CategoriesCombobox",
    section: "uzzina",
    keywords: ["categorias", "categories", "combobox", "filtro"],
  },
  {
    id: "uzzina-icons",
    label: "Icons",
    section: "uzzina",
    keywords: ["icones", "ícones", "icons", "categoria", "fase"],
  },
  {
    id: "uzzina-partners-combobox",
    label: "PartnersCombobox",
    section: "uzzina",
    keywords: ["parceiros", "partners", "combobox", "filtro", "playground"],
  },
  {
    id: "uzzina-phase-combobox",
    label: "PhaseCombobox",
    section: "uzzina",
    keywords: ["fase", "phase", "combobox", "progresso"],
  },
  {
    id: "uzzina-rich-text-editor",
    label: "RichTextEditor",
    section: "uzzina",
    keywords: ["editor", "tiptap", "texto", "rico", "rich", "markdown"],
  },
  {
    id: "uzzina-avatar",
    label: "UAvatar e UAvatarGroup",
    section: "uzzina",
    keywords: ["avatar", "uavatar", "grupo", "imagem"],
  },
  {
    id: "uzzina-view-options",
    label: "ViewOptionsComponent",
    section: "uzzina",
    keywords: ["visualizacao", "view", "options", "ordenacao", "colunas"],
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
    keywords: ["avatar", "imagem", "foto", "grupo", "badge"],
  },
  {
    id: "prism-badge",
    label: "Badge",
    section: "components",
    approved: true,
    keywords: ["tag", "etiqueta", "selo"],
  },
  {
    id: "prism-button",
    label: "Button",
    section: "components",
    approved: true,
    keywords: ["botao", "acao", "clique"],
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
  },
  {
    id: "prism-combobox",
    label: "Combobox",
    section: "components",
    approved: true,
    keywords: ["autocomplete", "select", "busca", "pesquisa"],
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
  },
];

export const Route = createFileRoute("/ui")({
  component: UIPage,
});

function UIPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<
    "tokens" | "components" | "uzzina"
  >("tokens");
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSectionChange = (section: "tokens" | "components" | "uzzina") => {
    setActiveSection(section);
    setActiveAnchor("");
    setSearchQuery("");
    mainRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
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
        return item.keywords.some((kw) => {
          const normKw = kw
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          return normKw.includes(normQuery);
        });
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
    setActiveAnchor(item.id);

    const scrollToTarget = () => {
      const element = document.getElementById(item.id);
      if (!element) return;
      const scrollParent = element.closest("main");
      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        const elemRect = element.getBoundingClientRect();
        const targetTop =
          elemRect.top - parentRect.top + scrollParent.scrollTop - 64;
        scrollParent.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "smooth",
        });
      }
    };

    if (item.section !== activeSection) {
      setActiveSection(item.section);
      setTimeout(scrollToTarget, 60);
    } else {
      scrollToTarget();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const targets = SIDEBAR_ITEMS.filter(
      (item) => item.section === activeSection,
    ).map((item) => item.id);

    if (!targets.includes(activeAnchor)) {
      setActiveAnchor(targets[0]);
    }

    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      if (mainElement.scrollTop < 80) {
        setActiveAnchor(targets[0]);
        return;
      }
      let currentActive = targets[0];
      const mainRect = mainElement.getBoundingClientRect();
      for (const id of targets) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top - mainRect.top <= 120) {
            currentActive = id;
          }
        }
      }
      setActiveAnchor(currentActive);
    };
    mainElement.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [activeSection, activeAnchor]);

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
                      {group.items.map((item) => (
                        <SidebarAnchorLink
                          active={activeAnchor === item.id}
                          approved={item.approved}
                          key={item.id}
                          label={item.label}
                          onClick={() => handleItemClick(item)}
                          targetId={item.id}
                        />
                      ))}
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
                  {currentSectionItems.map((item) => (
                    <SidebarAnchorLink
                      active={activeAnchor === item.id}
                      approved={item.approved}
                      key={item.id}
                      label={item.label}
                      onClick={() => handleItemClick(item)}
                      targetId={item.id}
                    />
                  ))}
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
              <UzzinaCategoriesComboboxSection />
              <UzzinaIconsSection />
              <UzzinaPartnersComboboxSection />
              <UzzinaPhaseComboboxSection />
              <RichTextEditorSection />
              <UzzinaAvatarSection />
              <ViewOptionsSection />
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
