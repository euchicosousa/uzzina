import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  IconPalette,
  IconPaletteFilled,
  IconCategory,
  IconCategoryFilled,
  IconApps,
  IconAppsFilled,
} from "@tabler/icons-react";
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
} from "~/components/ui-sections";
export const Route = createFileRoute("/ui")({
  component: UIPage,
});
function UIPage() {
  const [activeSection, setActiveSection] = useState<
    "tokens" | "components" | "uzzina"
  >("tokens");
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  const handleSectionChange = (section: "tokens" | "components" | "uzzina") => {
    setActiveSection(section);
    setActiveAnchor("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const targets =
      activeSection === "tokens"
        ? ["colors", "spacing"]
        : activeSection === "uzzina"
          ? ["uzzina-view-options"]
          : [
              "prism-button",
              "prism-input",
              "prism-textarea",
              "prism-badge",
              "prism-toggle",
              "prism-alert",
              "prism-popover",
              "prism-menu",
              "prism-dialog",
              "prism-combobox",
              "prism-command",
              "prism-toaster",
              "prism-separator",
            ];
    setActiveAnchor(targets[0]);
    const handleScroll = () => {
      if (window.scrollY < 80) {
        setActiveAnchor(targets[0]);
        return;
      }
      let currentActive = targets[0];
      for (const id of targets) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120) {
            currentActive = id;
          }
        }
      }
      setActiveAnchor(currentActive);
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Header Fixado */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
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
        <div className="flex gap-1">
          <SidebarTabButton
            activeIcon={<IconPaletteFilled className="size-4 text-primary" />}
            inactiveIcon={<IconPalette className="size-4" />}
            isActive={activeSection === "tokens"}
            label="Design Tokens"
            onClick={() => handleSectionChange("tokens")}
          />
          <SidebarTabButton
            activeIcon={<IconCategoryFilled className="size-4 text-primary" />}
            inactiveIcon={<IconCategory className="size-4" />}
            isActive={activeSection === "components"}
            label="Componentes de UI"
            onClick={() => handleSectionChange("components")}
          />
          <SidebarTabButton
            activeIcon={<IconAppsFilled className="size-4 text-primary" />}
            inactiveIcon={<IconApps className="size-4" />}
            isActive={activeSection === "uzzina"}
            label="Componentes Uzzina"
            onClick={() => handleSectionChange("uzzina")}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] flex-1 lg:h-[calc(100vh-65px)]">
        {/* Sidebar Sticky */}
        <aside className="p-6 border-b lg:border-b-0 lg:border-r bg-background lg:sticky lg:top-19 lg:h-[calc(100vh-78px)] lg:overflow-y-auto">
          <nav className="flex flex-col gap-6">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase px-4">
              {activeSection === "tokens"
                ? "Tokens de Design"
                : activeSection === "uzzina"
                  ? "Componentes Uzzina"
                  : "Componentes de UI"}
            </span>

            {activeSection === "tokens" && (
              <div className="flex flex-col text-sm ml-4">
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
              <div className="flex flex-col text-sm ml-4">
                <SidebarAnchorLink
                  active={activeAnchor === "uzzina-view-options"}
                  label="ViewOptionsComponent"
                  targetId="uzzina-view-options"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "uzzina-categories-combobox"}
                  label="CategoriesCombobox"
                  targetId="uzzina-categories-combobox"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "uzzina-phase-combobox"}
                  label="PhaseCombobox"
                  targetId="uzzina-phase-combobox"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "uzzina-station-combobox"}
                  label="StationCombobox"
                  targetId="uzzina-station-combobox"
                />
              </div>
            )}

            {activeSection === "components" && (
              <div className="flex flex-col text-sm ml-4">
                <SidebarAnchorLink
                  active={activeAnchor === "prism-button"}
                  label="PrismButton"
                  targetId="prism-button"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-input"}
                  label="PrismInput"
                  targetId="prism-input"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-textarea"}
                  label="PrismTextarea"
                  targetId="prism-textarea"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-badge"}
                  label="PrismBadge"
                  targetId="prism-badge"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-toggle"}
                  label="PrismToggle"
                  targetId="prism-toggle"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-checkbox"}
                  label="PrismCheckbox"
                  targetId="prism-checkbox"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-radio-group"}
                  label="PrismRadioGroup"
                  targetId="prism-radio-group"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-alert"}
                  label="PrismAlert"
                  targetId="prism-alert"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-popover"}
                  label="PrismPopover"
                  targetId="prism-popover"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-menu"}
                  label="PrismMenu"
                  targetId="prism-menu"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-dialog"}
                  label="PrismDialog"
                  targetId="prism-dialog"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-combobox"}
                  label="PrismCombobox"
                  targetId="prism-combobox"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-command"}
                  label="PrismCommand"
                  targetId="prism-command"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-toaster"}
                  label="PrismToaster"
                  targetId="prism-toaster"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-separator"}
                  label="PrismSeparator"
                  targetId="prism-separator"
                />
              </div>
            )}
          </nav>
        </aside>

        {/* Visualizador Principal */}
        <main className="min-w-0">
          {activeSection === "tokens" ? (
            <div className="flex flex-col">
              <TokensColorsSection />
              <TokensSpacingSection />
            </div>
          ) : activeSection === "uzzina" ? (
            <div className="flex flex-col">
              <ViewOptionsSection />
            </div>
          ) : (
            <div className="flex flex-col">
              <ButtonSection />
              <InputSection />
              <TextareaSection />
              <BadgeSection />
              <ToggleSection />
              <CheckboxSection />
              <RadioGroupSection />
              <AlertSection />
              <PopoverSection />
              <MenuSection />
              <DialogSection />
              <ComboboxSection />
              <CommandSection />
              <ToasterSection />
              <SeparatorSection />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
