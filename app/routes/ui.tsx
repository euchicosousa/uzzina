import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PaletteIcon, LayoutGridIcon } from "lucide-react";
import {
  SidebarTabButton,
  SidebarAnchorLink,
  TokensColorsSection,
  TokensSpacingSection,
  ButtonSection,
  InputSection,
  TextareaSection,
  AlertSection,
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
  ViewOptionsSection,
  UzzinaComponentsSection,
  SelectSection,
  CalendarSection,
  AccordionSection,
  SkeletonSection,
  RichTextEditorSection,
} from "~/components/ui-sections";
export const Route = createFileRoute("/ui")({
  component: UIPage,
});
function UIPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<
    "tokens" | "components" | "uzzina"
  >("tokens");
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  const handleSectionChange = (section: "tokens" | "components" | "uzzina") => {
    setActiveSection(section);
    setActiveAnchor("");
    mainRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const targets =
      activeSection === "tokens"
        ? ["colors", "spacing"]
        : activeSection === "uzzina"
          ? [
              "uzzina-view-options",
              "uzzina-components",
              "uzzina-rich-text-editor",
            ]
          : [
              "prism-accordion",
              "prism-alert",
              "prism-badge",
              "prism-button",
              "prism-calendar",
              "prism-checkbox",
              "prism-combobox",
              "prism-command",
              "prism-date-range-picker",
              "prism-dialog",
              "prism-menu",
              "prism-input",
              "prism-popover",
              "prism-radio-group",
              "prism-select",
              "prism-separator",
              "prism-skeleton",
              "prism-slider",
              "prism-tabs",
              "prism-textarea",
              "prism-toaster",
              "prism-toggle",
            ];
    setActiveAnchor(targets[0]);

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
  }, [activeSection]);
  return (
    <div className="fixed inset-0 overflow-hidden bg-background font-sans text-foreground">
      {/* Top Header Fixado */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-18 items-center justify-between border-b bg-background/80 px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground">
            P
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Prism</h1>
            <p className="text-xs text-muted-foreground">
              Uzzina Design System & UI Documentation
            </p>
          </div>
        </div>

        {/* Alternador de Abas Principais */}
        <div className="flex min-w-0 gap-1 overflow-x-auto">
          <SidebarTabButton
            activeIcon={<PaletteIcon className="size-4 text-primary" />}
            inactiveIcon={<PaletteIcon className="size-4" />}
            isActive={activeSection === "tokens"}
            label="Design Tokens"
            onClick={() => handleSectionChange("tokens")}
          />
          <SidebarTabButton
            activeIcon={<LayoutGridIcon className="size-4 text-primary" />}
            inactiveIcon={<LayoutGridIcon className="size-4" />}
            isActive={activeSection === "components"}
            label="Componentes de UI"
            onClick={() => handleSectionChange("components")}
          />
          <SidebarTabButton
            activeIcon={<LayoutGridIcon className="size-4 text-primary" />}
            inactiveIcon={<LayoutGridIcon className="size-4" />}
            isActive={activeSection === "uzzina"}
            label="Componentes Uzzina"
            onClick={() => handleSectionChange("uzzina")}
          />
        </div>
      </header>

      <div className="flex h-full min-w-0 overflow-hidden">
        {/* Sidebar com rolagem independente */}
        <aside className="h-full w-[280px] shrink-0 overflow-y-auto border-r bg-background p-6 pt-24">
          <nav className="flex flex-col gap-6">
            <span className="px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {activeSection === "tokens"
                ? "Tokens de Design"
                : activeSection === "uzzina"
                  ? "Componentes Uzzina"
                  : "Componentes de UI"}
            </span>

            {activeSection === "tokens" && (
              <div className="ml-4 flex flex-col text-sm">
                <SidebarAnchorLink
                  active={activeAnchor === "colors"}
                  label="Cores Semânticas"
                  targetId="colors"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "spacing"}
                  label="Escala de Espaçamento"
                  targetId="spacing"
                />
              </div>
            )}

            {activeSection === "uzzina" && (
              <div className="ml-4 flex flex-col text-sm">
                <SidebarAnchorLink
                  active={activeAnchor === "uzzina-view-options"}
                  label="ViewOptionsComponent"
                  targetId="uzzina-view-options"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "uzzina-components"}
                  label="Icons & UAvatar"
                  targetId="uzzina-components"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "uzzina-rich-text-editor"}
                  label="RichTextEditor"
                  targetId="uzzina-rich-text-editor"
                />
              </div>
            )}

            {activeSection === "components" && (
              <div className="ml-4 flex flex-col text-sm">
                <SidebarAnchorLink
                  active={activeAnchor === "prism-accordion"}
                  approved
                  label="Accordion"
                  targetId="prism-accordion"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-alert"}
                  approved
                  label="Alert"
                  targetId="prism-alert"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-badge"}
                  approved
                  label="Badge"
                  targetId="prism-badge"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-button"}
                  approved
                  label="Button"
                  targetId="prism-button"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-calendar"}
                  approved
                  label="Calendar"
                  targetId="prism-calendar"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-checkbox"}
                  approved
                  label="Checkbox"
                  targetId="prism-checkbox"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-combobox"}
                  approved
                  label="Combobox"
                  targetId="prism-combobox"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-command"}
                  approved
                  label="Command"
                  targetId="prism-command"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-date-range-picker"}
                  approved
                  label="DateRangePicker"
                  targetId="prism-date-range-picker"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-dialog"}
                  approved
                  label="Dialog"
                  targetId="prism-dialog"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-menu"}
                  approved
                  label="Dropdown Menu"
                  targetId="prism-menu"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-input"}
                  approved
                  label="Input"
                  targetId="prism-input"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-popover"}
                  approved
                  label="Popover"
                  targetId="prism-popover"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-radio-group"}
                  approved
                  label="Radio Group"
                  targetId="prism-radio-group"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-select"}
                  approved
                  label="Select"
                  targetId="prism-select"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-separator"}
                  approved
                  label="Separator"
                  targetId="prism-separator"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-skeleton"}
                  approved
                  label="Skeleton"
                  targetId="prism-skeleton"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-slider"}
                  approved
                  label="Slider"
                  targetId="prism-slider"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-tabs"}
                  approved
                  label="Tabs"
                  targetId="prism-tabs"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-textarea"}
                  approved
                  label="Textarea"
                  targetId="prism-textarea"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-toaster"}
                  approved
                  label="Toaster"
                  targetId="prism-toaster"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-toggle"}
                  approved
                  label="Toggle & ToggleGroup"
                  targetId="prism-toggle"
                />
              </div>
            )}
          </nav>
        </aside>

        {/* Visualizador Principal com rolagem independente */}
        <main
          ref={mainRef}
          className="h-full min-w-0 flex-1 scroll-pt-18 overflow-x-hidden overflow-y-auto scroll-smooth pt-18"
        >
          {activeSection === "tokens" ? (
            <div className="flex w-full max-w-full min-w-0 flex-col">
              <TokensColorsSection />
              <TokensSpacingSection />
            </div>
          ) : activeSection === "uzzina" ? (
            <div className="flex w-full max-w-full min-w-0 flex-col">
              <ViewOptionsSection />
              <UzzinaComponentsSection />
              <RichTextEditorSection />
            </div>
          ) : (
            <div className="flex w-full max-w-full min-w-0 flex-col">
              <AccordionSection />
              <AlertSection />
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
