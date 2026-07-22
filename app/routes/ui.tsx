import { createFileRoute } from "@tanstack/react-router";
import {
  PrismCombobox,
  PrismComboboxInput,
  PrismComboboxItem,
} from "~/components/prism";
import { useState, useEffect } from "react";
import {
  IconSend,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconPalette,
  IconPaletteFilled,
  IconCategory,
  IconCategoryFilled,
  IconCheckFilled,
  IconEye,
  IconLock,
  IconAt,
} from "@tabler/icons-react";
import cn from "cnfast";
import { TextField, Label, type Selection } from "react-aria-components";
import {
  PrismButton,
  PrismInput,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
  PrismPopover,
  PrismPopoverTrigger,
  PrismMenu,
  PrismMenuContent,
  PrismMenuItem,
  PrismMenuSeparator,
  PrismMenuSub,
  PrismMenuSubTrigger,
  PrismMenuSubContent,
  PrismMenuShortcut,
  PrismMenuLabel,
  PrismDialog,
  PrismDialogTrigger,
  PrismDialogHeader,
  PrismDialogFooter,
  PrismDialogTitle,
  PrismDialogDescription,
  PrismDialogClose,
  PrismComboboxContent,
  PrismComboboxList,
  PrismCommand,
  PrismCommandDialog,
  PrismCommandInput,
  PrismCommandList,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandItem,
  PrismCommandSeparator,
  PrismCommandShortcut,
  PrismToggle,
  PrismBadge,
  toast,
} from "~/components/prism";
import {
  IconSettings,
  IconUser,
  IconLogout,
  IconKeyboard,
  IconSun,
  IconMoon,
  IconDeviceLaptop,
  IconSearch,
  IconFilter,
  IconHeartHandshake,
  IconCalendar,
} from "@tabler/icons-react";
export const Route = createFileRoute("/ui")({
  component: UIPage,
});
function UIPage() {
  const [inputValue, setInputValue] = useState("");
  const [notificationKeys, setNotificationKeys] = useState<Selection>(
    new Set(["notifications"]),
  );
  const [themeKeys, setThemeKeys] = useState<Selection>(new Set(["system"]));
  const [activeSection, setActiveSection] = useState<"tokens" | "components">(
    "tokens",
  );
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  const handleSectionChange = (section: "tokens" | "components") => {
    setActiveSection(section);
    setActiveAnchor("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Monitora a rolagem para destacar dinamicamente o link âncora ativo
  useEffect(() => {
    const targets =
      activeSection === "tokens"
        ? ["colors", "spacing"]
        : [
            "prism-button",
            "prism-input",
            "prism-alert",
            "prism-popover",
            "prism-menu",
            "prism-dialog",
            "prism-combobox",
            "prism-command",
            "prism-toaster",
          ];
    setActiveAnchor(targets[0]);
    const handleScroll = () => {
      // Se estiver muito próximo do topo da página, ativa o primeiro item de forma garantida
      if (window.scrollY < 80) {
        setActiveAnchor(targets[0]);
        return;
      }
      let currentActive = targets[0];
      for (const id of targets) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Se o topo da seção passou ou está perto da linha de cabeçalho
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
    // Executa uma vez para sincronizar o estado
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);
  return (
    <div className="min-h-screen">
      {/* Grid Principal com Sidebar Stick */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] items-start">
        {/* Sidebar Sticky de Navegação */}
        <aside className="lg:sticky flex top-0 flex-col gap-6 lg:border-r lg:p-4 h-auto lg:min-h-screen">
          <div className="flex flex-col gap-2 p-4 pb-0">
            <h1 className="text-5xl font-bold tracking-[-4px]">Prism</h1>
            <p className="text-sm text-muted-foreground">
              Design System proprietário do Uzzina (React Aria + OKLCH).
            </p>
          </div>

          <nav className="flex flex-row lg:flex-col gap-2 border-b lg:border-b-0 p-4 pt-0 lg:p-0 overflow-x-auto lg:overflow-x-visible">
            <SidebarTabButton
              activeIcon={<IconPaletteFilled className="size-5 opacity-60" />}
              inactiveIcon={<IconPalette className="size-5 opacity-60" />}
              isActive={activeSection === "tokens"}
              label="Tokens de Design"
              onClick={() => handleSectionChange("tokens")}
            />
            {activeSection === "tokens" && (
              <div className="flex flex-col text-sm ml-4">
                <SidebarAnchorLink
                  active={activeAnchor === "colors"}
                  label="Cores Semânticas"
                  targetId="colors"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "spacing"}
                  label="Espaçamento"
                  targetId="spacing"
                />
              </div>
            )}

            <SidebarTabButton
              activeIcon={<IconCategoryFilled className="size-5 opacity-60" />}
              inactiveIcon={<IconCategory className="size-5 opacity-60" />}
              isActive={activeSection === "components"}
              label="Componentes de UI"
              onClick={() => handleSectionChange("components")}
            />
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
              </div>
            )}
          </nav>
        </aside>

        {/* Visualizador Principal */}
        <main className="min-w-0">
          {activeSection === "tokens" ? (
            <div className="flex flex-col">
              {/* Seção: Cores Semânticas OK              {/* Seção: Cores Semânticas OKLCH */}
              <div id="colors">
                <GallerySection>
                  <GallerySectionHeader
                    description="Mapeamento das variáveis de cores ativas e corrigidas no tailwind.css."
                    title="Cores Semânticas OKLCH"
                  />
                  <GallerySectionContent className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
                    {[
                      {
                        id: "background",
                        label: "Base Surfaces",
                        title: "Background",
                        code: "bg-background text-foreground",
                      },
                      {
                        id: "card",
                        label: "Base Surfaces",
                        title: "Card",
                        code: "bg-card text-foreground border",
                      },
                      {
                        id: "popover",
                        label: "Base Surfaces",
                        title: "Popover",
                        code: "bg-popover text-foreground border",
                      },
                      {
                        id: "primary",
                        label: "Base Surfaces",
                        title: "Primary (Accent Knob)",
                        code: "bg-primary text-primary-foreground",
                      },
                      {
                        id: "secondary",
                        label: "Base Surfaces",
                        title: "Secondary",
                        code: "bg-secondary text-secondary-foreground border",
                      },
                      {
                        id: "muted",
                        label: "Base Surfaces",
                        title: "Muted",
                        code: "bg-muted text-muted-foreground",
                      },
                      {
                        id: "accent",
                        label: "Base Surfaces",
                        title: "Accent",
                        code: "bg-accent text-accent-foreground border",
                      },
                      {
                        id: "border",
                        label: "Aero Borders & Controls",
                        title: "Border Color",
                        code: "border-border text-foreground border",
                      },
                      {
                        id: "input",
                        label: "Aero Borders & Controls",
                        title: "Input Background",
                        code: "bg-input text-foreground border",
                      },
                      {
                        id: "action",
                        label: "Uzzina Workflows",
                        title: "Action State",
                        code: "bg-action text-foreground border",
                      },
                      {
                        id: "late",
                        label: "Uzzina Workflows",
                        title: "Late State (Atrasado)",
                        code: "bg-late text-destructive border",
                      },
                    ].map((item) => (
                      <GalleryItem key={item.id} label={item.label}>
                        <div className="flex items-top gap-3">
                          <div
                            className={cn(
                              "size-8 rounded-lg border",
                              item.code,
                            )}
                          />
                          <div className="space-y-1">
                            <div
                              className={cn(
                                "text-sm font-medium",
                                item.code.split(" ")[1],
                              )}
                            >
                              {item.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {item.code.split(" ").map((className) => {
                                return <div key={className}>{className}</div>;
                              })}
                            </div>
                          </div>
                        </div>
                      </GalleryItem>
                    ))}
                    {/* Feedback Semântico */}
                    {[
                      {
                        id: "error",
                        label: "Feedback Colors",
                        title: "Error",
                        code: "bg-error-background text-error border-error/20",
                      },
                      {
                        id: "success",
                        label: "Feedback Colors",
                        title: "Success",
                        code: "bg-success-background text-success border-success/20",
                      },
                      {
                        id: "warning",
                        label: "Feedback Colors",
                        title: "Warning",
                        code: "bg-warning-background text-warning border-warning/20",
                      },
                      {
                        id: "info",
                        label: "Feedback Colors",
                        title: "Info",
                        code: "bg-info-background text-info border-info/20",
                      },
                    ].map((item) => (
                      <GalleryItem key={item.id} label={item.label}>
                        <div className="flex items-top gap-3">
                          <div
                            className={cn(
                              "size-8 rounded-lg border",
                              item.code,
                            )}
                          />
                          <div className="space-y-1">
                            <div
                              className={cn(
                                "text-sm font-medium",
                                item.code.split(" ")[1],
                              )}
                            >
                              {item.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {item.code.split(" ").map((className) => {
                                return <div key={className}>{className}</div>;
                              })}
                            </div>
                          </div>
                        </div>
                      </GalleryItem>
                    ))}
                  </GallerySectionContent>
                </GallerySection>
              </div>

              {/* Seção: Escala de Espaçamento */}
              <div id="spacing">
                <GallerySection>
                  <GallerySectionHeader
                    description="Garante que os layouts dobrem as margens a cada nível da escala para manter a fluidez visual."
                    title="Espaçamento Exponencial"
                  />
                  <GallerySectionContent>
                    <GalleryItem
                      className="w-full max-w-md space-y-4"
                      label="Escala Modular"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">4px (xs)</span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "4px",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">8px (sm)</span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "8px",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">
                          16px (md)
                        </span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "16px",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">
                          32px (lg)
                        </span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "32px",
                          }}
                        />
                      </div>
                    </GalleryItem>
                  </GallerySectionContent>
                </GallerySection>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Seção: PrismButton */}
              <div id="prism-button">
                <GallerySection>
                  <GallerySectionHeader
                    description="Componente de botão baseado no React Aria Components com suporte a estados nativos e ícones do Tabler."
                    title="PrismButton"
                  />
                  <GallerySectionContent className="grid gap-6">
                    <GalleryItem label="Variants (default, secondary, outline, ghost, destructive, link)">
                      <div className="flex flex-wrap gap-3">
                        <PrismButton variant="default">Default</PrismButton>
                        <PrismButton variant="secondary">Secondary</PrismButton>
                        <PrismButton variant="outline">Outline</PrismButton>
                        <PrismButton variant="ghost">Ghost</PrismButton>
                        <PrismButton variant="destructive">
                          Destructive
                        </PrismButton>
                        <PrismButton variant="link">Link</PrismButton>
                      </div>
                    </GalleryItem>

                    <GalleryItem label="Sizes (xs, sm, default, lg)">
                      <div className="flex items-center flex-wrap gap-3">
                        <PrismButton size="xs">Extra Small (xs)</PrismButton>
                        <PrismButton size="sm">Small (sm)</PrismButton>
                        <PrismButton size="default">Default</PrismButton>
                        <PrismButton size="lg">Large (lg)</PrismButton>
                      </div>
                    </GalleryItem>

                    <GalleryItem label="Icon Buttons & Disabled States">
                      <div className="flex flex-wrap items-center gap-3">
                        <PrismButton variant="default">
                          <IconSend className="size-5" />
                          Enviar
                        </PrismButton>
                        <PrismButton
                          aria-label="Excluir item"
                          size="icon"
                          variant="ghost"
                        >
                          <IconTrash className="size-5 text-destructive" />
                        </PrismButton>
                        <PrismButton
                          aria-label="Confirmar"
                          size="icon-sm"
                          variant="secondary"
                        >
                          <IconCheckFilled className="size-5" />
                        </PrismButton>
                        <PrismButton isDisabled variant="default">
                          Disabled
                        </PrismButton>
                      </div>
                    </GalleryItem>
                  </GallerySectionContent>
                </GallerySection>

                {/* Seção: PrismInput */}
                <div id="prism-input">
                  <GallerySection>
                    <GallerySectionHeader
                      description="TextField acoplado com suporte a labels acessíveis e estilos visuais do Uzzina."
                      title="PrismInput"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Default Input (Simple)">
                        <TextField onChange={setInputValue} value={inputValue}>
                          <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                            Nome do Usuário
                          </Label>
                          <PrismInput placeholder="Ex: Francisco Sousa" />
                        </TextField>
                      </GalleryItem>

                      <GalleryItem label="Input Group (With Prefix @)">
                        <TextField>
                          <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                            Recuperar Usuário
                          </Label>
                          <PrismInputGroup>
                            <PrismInputGroupAddon
                              align="inline-start"
                              className="[&_svg]:text-foreground/40 pl-4 pr-1"
                            >
                              <IconAt className="size-5" />
                            </PrismInputGroupAddon>
                            <PrismInputGroupInput
                              className="px-3 h-full"
                              placeholder="seu-username"
                            />
                          </PrismInputGroup>
                        </TextField>
                      </GalleryItem>

                      <GalleryItem label="Input Group (Password Toggle)">
                        <TextField>
                          <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                            Senha Secreta
                          </Label>
                          <PrismInputGroup>
                            <PrismInputGroupAddon
                              align="inline-start"
                              className="[&_svg]:text-foreground/40 pl-4 pr-1"
                            >
                              <IconLock className="size-5" />
                            </PrismInputGroupAddon>
                            <PrismInputGroupInput
                              className="px-3 h-full"
                              placeholder="••••••••"
                              type="password"
                            />
                            <PrismInputGroupAddon
                              align="inline-end"
                              className="pr-2 pl-1"
                            >
                              <PrismButton size="icon-sm" variant="ghost">
                                <IconEye className="size-4" />
                              </PrismButton>
                            </PrismInputGroupAddon>
                          </PrismInputGroup>
                        </TextField>
                      </GalleryItem>

                      <GalleryItem
                        className="md:col-span-3"
                        label="Disabled States"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <TextField isDisabled value="contato@cnvt.com.br">
                            <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                              E-mail (Desabilitado)
                            </Label>
                            <PrismInput />
                          </TextField>
                        </div>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismAlert */}
                <div id="prism-alert">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Componentes de notificação semântica utilizando a paleta de cores corrigida no OKLCH."
                      title="PrismAlert"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Default">
                        <PrismAlert>
                          <IconInfoCircle />
                          <PrismAlertTitle>Informações Gerais</PrismAlertTitle>
                          <PrismAlertDescription>
                            Este alerta usa o tema padrão neutro do card.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Error">
                        <PrismAlert variant="error">
                          <IconAlertTriangle />
                          <PrismAlertTitle>Acesso Recusado</PrismAlertTitle>
                          <PrismAlertDescription>
                            Suas credenciais de login não são válidas no
                            sistema.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Sucess">
                        <PrismAlert variant="success">
                          <IconCheck />
                          <PrismAlertTitle>Senha Redefinida</PrismAlertTitle>
                          <PrismAlertDescription>
                            Sua senha foi atualizada com sucesso.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Warning">
                        <PrismAlert variant="warning">
                          <IconAlertCircle />
                          <PrismAlertTitle>Aviso de Sessão</PrismAlertTitle>
                          <PrismAlertDescription>
                            Sua conexão irá expirar em breve por inatividade.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Info">
                        <PrismAlert variant="info">
                          <IconInfoCircle />
                          <PrismAlertTitle>
                            Atualização Disponível
                          </PrismAlertTitle>
                          <PrismAlertDescription>
                            Uma nova versão do Prism foi implementada.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismPopover */}
                <div id="prism-popover">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Popover contextual construído sobre o React Aria Components com posicionamento automático e transições suaves."
                      title="PrismPopover"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Default Popover">
                        <PrismPopoverTrigger>
                          <PrismButton variant="default">
                            Abrir Popover
                          </PrismButton>
                          <PrismPopover>
                            <div className="flex flex-col gap-2 w-48">
                              <span className="font-semibold text-sm">
                                Opções Rápidas
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Este é o conteúdo do popover de exemplo.
                              </p>
                            </div>
                          </PrismPopover>
                        </PrismPopoverTrigger>
                      </GalleryItem>

                      <GalleryItem label="Popover alinhado no Topo">
                        <PrismPopoverTrigger>
                          <PrismButton variant="ghost">
                            Ver Notificação
                          </PrismButton>
                          <PrismPopover placement="top">
                            <div className="flex flex-col gap-1 w-64">
                              <span className="font-semibold text-xs text-primary">
                                NOVO AVISO
                              </span>
                              <p className="text-xs">
                                O PrismPopover se alinha perfeitamente com
                                qualquer gatilho.
                              </p>
                            </div>
                          </PrismPopover>
                        </PrismPopoverTrigger>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismMenu */}
                <div id="prism-menu">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Menu suspenso avançado contendo agrupamentos, atalhos, itens de seleção múltipla (checkbox), itens destrutivos e submenus aninhados."
                      title="PrismMenu"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Menu de Ações Completo">
                        <div className="flex gap-4 items-center">
                          <PrismMenu>
                            <PrismButton variant="default">
                              Abrir Menu Avançado
                            </PrismButton>
                            <PrismMenuContent
                              className="w-64"
                              placement="bottom start"
                            >
                              <PrismMenuLabel>Minha Conta</PrismMenuLabel>
                              <PrismMenuItem onAction={() => alert("Perfil")}>
                                <IconUser className="size-4 mr-2 text-muted-foreground" />
                                <span>Meu Perfil</span>
                                <PrismMenuShortcut>⌘P</PrismMenuShortcut>
                              </PrismMenuItem>
                              <PrismMenuItem
                                onAction={() => alert("Configurações")}
                              >
                                <IconSettings className="size-4 mr-2 text-muted-foreground" />
                                <span>Configurações</span>
                                <PrismMenuShortcut>⌘S</PrismMenuShortcut>
                              </PrismMenuItem>

                              <PrismMenuSeparator />

                              <PrismMenuSub>
                                <PrismMenuSubTrigger>
                                  <IconKeyboard className="size-4 mr-2 text-muted-foreground" />
                                  <span>Preferências</span>
                                </PrismMenuSubTrigger>
                                <PrismMenuSubContent className="w-48">
                                  <PrismMenuItem
                                    onAction={() => alert("Tema Escuro")}
                                  >
                                    Tema Escuro
                                  </PrismMenuItem>
                                  <PrismMenuItem
                                    onAction={() => alert("Tema Claro")}
                                  >
                                    Tema Claro
                                  </PrismMenuItem>
                                </PrismMenuSubContent>
                              </PrismMenuSub>

                              <PrismMenuSeparator />

                              <PrismMenuItem
                                className="text-destructive"
                                onAction={() => alert("Sair")}
                                variant="destructive"
                              >
                                <IconLogout className="size-4 mr-2" />
                                <span>Sair da Conta</span>
                                <PrismMenuShortcut>⇧⌘Q</PrismMenuShortcut>
                              </PrismMenuItem>
                            </PrismMenuContent>
                          </PrismMenu>
                        </div>
                      </GalleryItem>

                      <GalleryItem label="Menu com Checkbox (Seleção Múltipla)">
                        <div className="flex gap-4 items-center">
                          <PrismMenu>
                            <PrismButton variant="secondary">
                              Opções de Notificação
                            </PrismButton>
                            <PrismMenuContent
                              className="w-56"
                              onSelectionChange={setNotificationKeys}
                              placement="bottom start"
                              selectedKeys={notificationKeys}
                              selectionMode="multiple"
                            >
                              <PrismMenuLabel>Notificações</PrismMenuLabel>
                              <PrismMenuItem id="notifications">
                                Ativar Notificações
                              </PrismMenuItem>
                              <PrismMenuItem id="sounds">
                                Efeitos Sonoros
                              </PrismMenuItem>
                            </PrismMenuContent>
                          </PrismMenu>
                        </div>
                      </GalleryItem>

                      <GalleryItem label="Menu com Radio (Seleção Única)">
                        <div className="flex gap-4 items-center">
                          <PrismMenu>
                            <PrismButton
                              aria-label="Seletor de Tema"
                              className="rounded-full"
                              size="icon"
                              variant="ghost"
                            >
                              {themeKeys !== "all" &&
                                themeKeys.has("light") && (
                                  <IconSun className="size-5" />
                                )}
                              {themeKeys !== "all" && themeKeys.has("dark") && (
                                <IconMoon className="size-5" />
                              )}
                              {themeKeys !== "all" &&
                                themeKeys.has("system") && (
                                  <IconDeviceLaptop className="size-5" />
                                )}
                            </PrismButton>
                            <PrismMenuContent
                              onSelectionChange={setThemeKeys}
                              placement="bottom start"
                              selectedKeys={themeKeys}
                              selectionMode="single"
                            >
                              <PrismMenuLabel>Tema do Sistema</PrismMenuLabel>
                              <PrismMenuItem id="light">
                                <IconSun className="size-4 mr-2 text-muted-foreground shrink-0" />
                                <span className="truncate">Claro</span>
                              </PrismMenuItem>
                              <PrismMenuItem id="dark">
                                <IconMoon className="size-4 mr-2 text-muted-foreground shrink-0" />
                                <span className="truncate">Escuro</span>
                              </PrismMenuItem>
                              <PrismMenuItem id="system">
                                <IconDeviceLaptop className="size-4 mr-2 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                  Padrão do Sistema
                                </span>
                              </PrismMenuItem>
                            </PrismMenuContent>
                          </PrismMenu>
                        </div>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismDialog */}
                <div id="prism-dialog">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Modais de caixa de diálogo com tratamento nativo de foco, acessibilidade e escurecimento do fundo."
                      title="PrismDialog"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Modal Simples">
                        <PrismDialogTrigger>
                          <PrismButton variant="default">
                            Abrir Modal
                          </PrismButton>
                          <PrismDialog>
                            <PrismDialogHeader>
                              <PrismDialogTitle>
                                Título do Modal
                              </PrismDialogTitle>
                              <PrismDialogDescription>
                                Este é um modal simples construído com o design
                                system Prism do Uzzina.
                              </PrismDialogDescription>
                            </PrismDialogHeader>
                            <div className="flex flex-col gap-2 py-4">
                              <p className="text-sm text-foreground">
                                Conteúdo dinâmico do modal. Suporta inputs,
                                tabelas e botões adicionais de ação.
                              </p>
                            </div>
                            <PrismDialogFooter>
                              <PrismDialogClose variant="outline">
                                Cancelar
                              </PrismDialogClose>
                              <PrismButton
                                onPress={() => alert("Confirmado!")}
                                variant="default"
                              >
                                Confirmar Ação
                              </PrismButton>
                            </PrismDialogFooter>
                          </PrismDialog>
                        </PrismDialogTrigger>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismCombobox */}
                <div id="prism-combobox">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Inputs de seleção com preenchimento automático filtrado (Combobox/Autocomplete)."
                      title="PrismCombobox"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Combobox Simples">
                        <PrismCombobox className="w-64">
                          <PrismComboboxInput placeholder="Selecione um animal..." />
                          <PrismComboboxContent>
                            <PrismComboboxList>
                              <PrismComboboxItem id="cat">
                                🐱 Gato
                              </PrismComboboxItem>
                              <PrismComboboxItem id="dog">
                                🐶 Cachorro
                              </PrismComboboxItem>
                              <PrismComboboxItem id="lion">
                                🦁 Leão
                              </PrismComboboxItem>
                            </PrismComboboxList>
                          </PrismComboboxContent>
                        </PrismCombobox>
                      </GalleryItem>
                      <GalleryItem label="Combobox Múltiplo (Tags/Frutas)">
                        <FruitsMultiSelect />
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismCommand */}
                <div id="prism-command">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Barra de busca e menu de comandos para atalhos do teclado, navegação ou filtros."
                      title="PrismCommand"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Command em Popover (Filtro Inline / AppBar)">
                        <CommandPopoverDemo />
                      </GalleryItem>
                      <GalleryItem label="Command em Dialog (Busca Global ⌘K)">
                        <CommandDialogDemo />
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismToaster */}
                <div id="prism-toaster">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Notificações flutuantes (Toasts) acionadas por eventos ou ações da aplicação."
                      title="PrismToaster"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Disparar Toasts">
                        <ToasterDemo />
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
function FruitsMultiSelect() {
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const fruitItems = [
    {
      id: "apple",
      label: "🍎 Maçã",
    },
    {
      id: "banana",
      label: "🍌 Banana",
    },
    {
      id: "grape",
      label: "🍇 Uva",
    },
    {
      id: "strawberry",
      label: "🍓 Morango",
    },
    {
      id: "watermelon",
      label: "🍉 Melancia",
    },
  ];
  const filteredItems = fruitItems.filter(
    (item) =>
      !selectedFruits.includes(item.id) &&
      item.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="flex flex-col gap-2 w-80">
      {/* Selected tags */}

      <PrismCombobox
        inputValue={query}
        onInputChange={setQuery}
        onSelectionChange={(key) => {
          if (key) {
            setSelectedFruits([...selectedFruits, key as string]);
            setQuery("");
          }
        }}
      >
        <PrismComboboxInput placeholder="Selecione frutas..." />
        <PrismComboboxContent>
          <PrismComboboxList>
            {filteredItems.map((item) => (
              <PrismComboboxItem key={item.id} id={item.id}>
                {item.label}
              </PrismComboboxItem>
            ))}
          </PrismComboboxList>
        </PrismComboboxContent>
      </PrismCombobox>

      {selectedFruits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-1 bg-muted/20 border rounded-xl squircle">
          {selectedFruits.map((fruitId) => {
            const fruit = fruitItems.find((f) => f.id === fruitId);
            return (
              <button
                key={fruitId}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors border"
                onClick={() =>
                  setSelectedFruits(
                    selectedFruits.filter((id) => id !== fruitId),
                  )
                }
                type="button"
              >
                <span>{fruit?.label}</span>
                <span className="text-muted-foreground hover:text-foreground">
                  ×
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function CommandPopoverDemo() {
  const [partnerFilters, setPartnerFilters] = useState<string[]>([]);
  const [isFilterMode, setIsFilterMode] = useState(false);
  const partners = [
    {
      slug: "cnvt",
      title: "CNVT Creative",
      short: "CNVT",
    },
    {
      slug: "uzzina",
      title: "Uzzina Tech",
      short: "UZZ",
    },
    {
      slug: "acme",
      title: "Acme Corp",
      short: "ACM",
    },
  ];
  return (
    <PrismPopoverTrigger>
      <PrismButton className="relative" size="icon" variant="ghost">
        {partnerFilters.length > 0 ? (
          <PrismBadge variant="info">{partnerFilters.length}</PrismBadge>
        ) : (
          <IconHeartHandshake />
        )}
      </PrismButton>
      <PrismPopover className="p-0 rounded-[32px]">
        <PrismCommand className="p-0 w-72">
          <div className="flex items-center border-b px-1">
            <PrismCommandInput placeholder="Parceiro..." />
            <PrismToggle
              className={"mr-2"}
              isSelected={isFilterMode}
              onChange={(selected) => {
                if (!selected) {
                  setPartnerFilters([]);
                }
                setIsFilterMode(selected);
              }}
              size={"sm"}
            >
              <IconFilter />
            </PrismToggle>
          </div>
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum parceiro encontrado.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {partners.map((partner) => {
                const isSelected = partnerFilters.includes(partner.slug);
                return (
                  <PrismCommandItem
                    key={partner.slug}
                    className={isSelected ? "bg-secondary" : ""}
                    data-checked={isSelected}
                    id={partner.slug}
                    onPress={() => {
                      if (isFilterMode) {
                        if (isSelected) {
                          setPartnerFilters(
                            partnerFilters.filter((s) => s !== partner.slug),
                          );
                        } else {
                          setPartnerFilters([...partnerFilters, partner.slug]);
                        }
                      } else {
                        toast.info(`Navegar para ${partner.title}`);
                      }
                    }}
                    textValue={partner.title}
                  >
                    <span>{partner.title}</span>
                  </PrismCommandItem>
                );
              })}
            </PrismCommandGroup>
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
function CommandDialogDemo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const items = [
    {
      id: "cal",
      title: "Ver Calendário",
      group: "Ações Rápidas",
      icon: <IconCalendar className="size-4" />,
    },
    {
      id: "user",
      title: "Perfil do Usuário",
      group: "Ações Rápidas",
      icon: <IconUser className="size-4" />,
    },
    {
      id: "settings",
      title: "Configurações da Conta",
      group: "Sistema",
      icon: <IconSettings className="size-4" />,
      shortcut: "⌘S",
    },
  ];
  const filtered =
    query.trim() === ""
      ? items
      : items.filter((i) =>
          i.title.toLowerCase().includes(query.toLowerCase()),
        );
  const actions = filtered.filter((i) => i.group === "Ações Rápidas");
  const system = filtered.filter((i) => i.group === "Sistema");
  return (
    <div className="flex flex-col gap-3">
      <PrismButton
        className="w-72 justify-between border bg-input/50"
        onClick={() => setOpen(true)}
        variant="ghost"
      >
        <span className="flex items-center gap-2 text-muted-foreground text-sm">
          <IconSearch className="size-4" />
          Faça sua busca...
        </span>
        <kbd className="px-2 py-0.5 text-xs bg-muted rounded border text-muted-foreground">
          ⌘K
        </kbd>
      </PrismButton>

      <PrismCommandDialog onOpenChange={setOpen} open={open}>
        <PrismCommand
          className="p-1"
          inputValue={query}
          onInputChange={setQuery}
        >
          <PrismCommandInput placeholder="Faça sua busca..." />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum item foi encontrado.</PrismCommandEmpty>
            )}
          >
            {actions.length > 0 && (
              <PrismCommandGroup heading="Ações Rápidas">
                {actions.map((item) => (
                  <PrismCommandItem
                    key={item.id}
                    id={item.id}
                    onPress={() => {
                      toast.success(`Executou: ${item.title}`);
                      setOpen(false);
                    }}
                    textValue={item.title}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </PrismCommandItem>
                ))}
              </PrismCommandGroup>
            )}

            {actions.length > 0 && system.length > 0 && (
              <PrismCommandSeparator />
            )}

            {system.length > 0 && (
              <PrismCommandGroup heading="Sistema">
                {system.map((item) => (
                  <PrismCommandItem
                    key={item.id}
                    id={item.id}
                    onPress={() => {
                      toast.success(`Executou: ${item.title}`);
                      setOpen(false);
                    }}
                    textValue={item.title}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {item.shortcut && (
                      <PrismCommandShortcut>
                        {item.shortcut}
                      </PrismCommandShortcut>
                    )}
                  </PrismCommandItem>
                ))}
              </PrismCommandGroup>
            )}
          </PrismCommandList>
        </PrismCommand>
      </PrismCommandDialog>
    </div>
  );
}

function ToasterDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <PrismButton
        variant="ghost"
        onClick={() => toast.success("Operação realizada com sucesso!")}
      >
        Success Toast
      </PrismButton>
      <PrismButton
        variant="ghost"
        onClick={() => toast.error("Ocorreu um erro ao salvar.")}
      >
        Error Toast
      </PrismButton>
      <PrismButton
        variant="ghost"
        onClick={() => toast.info("Nova atualização disponível.")}
      >
        Info Toast
      </PrismButton>
      <PrismButton
        variant="ghost"
        onClick={() => toast.warning("Atenção aos campos obrigatórios.")}
      >
        Warning Toast
      </PrismButton>
    </div>
  );
}

// Componentes auxiliares de exibição da Galeria
interface GallerySectionProps {
  children: React.ReactNode;
}
function GallerySection({ children }: GallerySectionProps) {
  return (
    <section className={`space-y-6 px-8 py-12 border-b`}>{children}</section>
  );
}
interface GallerySectionHeaderProps {
  title: string;
  description: string;
}
function GallerySectionHeader({
  title,
  description,
}: GallerySectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3>{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
interface GallerySectionContentProps {
  children: React.ReactNode;
  className?: string;
}
function GallerySectionContent({
  children,
  className,
}: GallerySectionContentProps) {
  return <div className={className || "flex flex-wrap gap-8"}>{children}</div>;
}
interface GalleryItemProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}
function GalleryItem({ children, label, className = "" }: GalleryItemProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
interface SidebarAnchorLinkProps {
  targetId: string;
  label: string;
  active?: boolean;
}
function SidebarAnchorLink({
  targetId,
  label,
  active,
}: SidebarAnchorLinkProps) {
  return (
    <a
      className={`text-muted-foreground hover:text-foreground py-2 pl-4 transition-colors border-l ${active ? "border-foreground" : ""}`}
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      {label}
    </a>
  );
}
interface SidebarTabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
}
function SidebarTabButton({
  isActive,
  onClick,
  label,
  activeIcon,
  inactiveIcon,
}: SidebarTabButtonProps) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all rounded-xl cursor-pointer shrink-0 hover:bg-card ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      onClick={onClick}
    >
      {isActive ? activeIcon : inactiveIcon}
      {label}
    </button>
  );
}
